"use client";

import React from "react";
// Import types for others
import { useOthers } from "@liveblocks/react";
import { useUser, UserButton } from "@clerk/nextjs";

interface CollaboratorUser {
  id: string;
  connectionId: number;
  info?: {
    name?: string;
    avatar?: string;
    color?: string;
  };
}

interface AvatarGroupProps {
  others: readonly CollaboratorUser[];
}

const MAX_AVATARS = 5;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function AvatarGroup({ others }: AvatarGroupProps) {
  const { user } = useUser();

  // Filter out any presence entry whose user ID matches the current Clerk user ID
  const collaborators = others.filter((other) => other.id !== user?.id);

  const displayedCollaborators = collaborators.slice(0, MAX_AVATARS);
  const overflowCount = collaborators.length - MAX_AVATARS;

  return (
    <div className="flex items-center gap-1.5 bg-surface/85 backdrop-blur-md border border-default pl-3 pr-2 py-1.5 rounded-full shadow-lg pointer-events-auto">
      {collaborators.length > 0 && (
        <div className="flex items-center -space-x-2.5">
          {displayedCollaborators.map(({ connectionId, info }) => {
            const name = info?.name || "Collaborator";
            const avatar = info?.avatar;
            const color = info?.color || "#6457f9";

            return (
              <div
                key={connectionId}
                className="relative group shrink-0"
                title={name}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-8 w-8 rounded-full border-2 border-base object-cover ring-1 ring-default shadow-md"
                    style={{ borderColor: "var(--bg-base)" }}
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full border-2 border-base flex items-center justify-center text-[10px] font-bold text-text-primary ring-1 ring-default shadow-md"
                    style={{
                      backgroundColor: color,
                      borderColor: "var(--bg-base)",
                    }}
                  >
                    {getInitials(name)}
                  </div>
                )}
              </div>
            );
          })}

          {overflowCount > 0 && (
            <div
              className="h-8 w-8 rounded-full border-2 border-base bg-subtle flex items-center justify-center text-[10px] font-bold text-text-secondary ring-1 ring-default shadow-md shrink-0"
              style={{ borderColor: "var(--bg-base)" }}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      )}

      {collaborators.length > 0 && (
        <div className="h-5 w-[1px] bg-border-default mx-1 shrink-0" />
      )}

      {/* Current Clerk user button matching the h-8 size */}
      <div className="flex items-center shrink-0">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8 border-2 border-base ring-1 ring-default shadow-md",
            },
          }}
        />
      </div>
    </div>
  );
}
