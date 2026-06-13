import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getClerkUserIdentity, checkProjectAccess } from "@/lib/project-access";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // 1. Authenticate user and verify access
  const { userId, emails } = await getClerkUserIdentity();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasAccess = await checkProjectAccess(projectId, userId, emails);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Parse request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nodes, edges } = body;
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    return Response.json({ error: "nodes and edges must be arrays" }, { status: 400 });
  }

  try {
    // 3. Upload JSON to Vercel Blob
    const jsonString = JSON.stringify({ nodes, edges });
    const blob = await put(`canvas/${projectId}.json`, jsonString, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });

    // 4. Update the project's canvasJsonPath in Prisma
    await prisma.project.update({
      where: { id: projectId },
      data: {
        canvasJsonPath: blob.url,
      },
    });

    return Response.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error("Failed to save canvas state:", error);
    return Response.json({ error: error.message || "Failed to save canvas" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // 1. Authenticate user and verify access
  const { userId, emails } = await getClerkUserIdentity();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasAccess = await checkProjectAccess(projectId, userId, emails);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 2. Read the project's saved blob URL from Prisma
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { canvasJsonPath: true },
    });

    if (!project || !project.canvasJsonPath) {
      return Response.json({ nodes: [], edges: [] });
    }

    // 3. Fetch the saved canvas JSON from Vercel Blob
    const response = await fetch(project.canvasJsonPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch canvas from blob store: ${response.statusText}`);
    }

    const canvasData = await response.json();
    return Response.json(canvasData);
  } catch (error: any) {
    console.error("Failed to retrieve canvas state:", error);
    return Response.json({ error: error.message || "Failed to retrieve canvas" }, { status: 500 });
  }
}
