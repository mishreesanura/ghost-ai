import { useState, useEffect, useRef } from "react";
import { CanvasNode, CanvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseCanvasAutosaveProps {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  isInitialized: boolean; // Only save once the editor has finished loading existing database state
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  isInitialized,
}: UseCanvasAutosaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);
  const prevNodesRef = useRef<CanvasNode[]>([]);
  const prevEdgesRef = useRef<CanvasEdge[]>([]);

  useEffect(() => {
    // Skip saving on first render or until the canvas state is initialized
    if (!isInitialized) {
      return;
    }

    // Also skip if it is the first render with initialized state to avoid saving immediately on load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
      return;
    }

    // Check if anything actually changed to prevent redundant API calls
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(prevNodesRef.current);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(prevEdgesRef.current);
    if (!nodesChanged && !edgesChanged) {
      return;
    }

    setSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodes, edges }),
        });

        if (!response.ok) {
          let errorMsg = `Server returned status ${response.status}`;
          try {
            const errJson = await response.json();
            if (errJson && errJson.error) {
              errorMsg = errJson.error;
            }
          } catch {
            try {
              const errText = await response.text();
              if (errText) errorMsg = errText;
            } catch {}
          }
          throw new Error(errorMsg);
        }

        prevNodesRef.current = nodes;
        prevEdgesRef.current = edges;
        setSaveStatus("saved");
      } catch (error) {
        console.error("Autosave error:", error);
        setSaveStatus("error");
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [projectId, nodes, edges, isInitialized]);

  // Reset "saved" status to "idle" after a few seconds of inactivity
  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  return { saveStatus };
}
