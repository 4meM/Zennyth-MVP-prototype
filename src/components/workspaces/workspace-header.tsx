"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Copy,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceHeaderProps {
  workspaceId: string;
}

const LEAVE_CONFIRM_WINDOW_MS = 4000;

/**
 * Header strip for a single workspace. Shows:
 * - Avatar (first letter of the workspace name) + name + "Grupo" badge.
 * - Member list with the local user marked "(tú)".
 * - Join code with a copy-to-clipboard chip.
 * - "Salir del workspace" — one-tap confirm pattern. First click changes the
 *   label to "Confirmar" and tints danger for `LEAVE_CONFIRM_WINDOW_MS`;
 *   a second click within that window actually calls `leaveWorkspace()`
 *   and routes back to the list.
 */
export function WorkspaceHeader({ workspaceId }: WorkspaceHeaderProps) {
  const router = useRouter();
  const workspace = useWorkspaceStore((s) =>
    s.workspaces.find((w) => w.id === workspaceId)
  );
  const leaveWorkspace = useWorkspaceStore((s) => s.leaveWorkspace);

  const [copied, setCopied] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  // Reset copy feedback.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  // Reset the one-tap confirm after a few seconds of no follow-up click.
  useEffect(() => {
    if (!confirmingLeave) return;
    const t = setTimeout(() => setConfirmingLeave(false), LEAVE_CONFIRM_WINDOW_MS);
    return () => clearTimeout(t);
  }, [confirmingLeave]);

  if (!workspace) return null;

  const memberCount = workspace.members.length;
  const currentMember = workspace.members[workspace.members.length - 1];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(workspace.joinCode);
      setCopied(true);
    } catch {
      // Clipboard API unavailable; user can copy the visible text.
    }
  };

  const handleLeave = () => {
    if (!confirmingLeave) {
      setConfirmingLeave(true);
      return;
    }
    leaveWorkspace(workspaceId);
    router.push("/workspaces");
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-text-1 truncate">
                {workspace.name}
              </h1>
              <Badge variant="premium">
                <Sparkles className="w-3 h-3" />
                Grupo
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5 text-xs text-text-2">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
              </span>
              <span className="text-text-3" aria-hidden>·</span>
              <div className="flex flex-wrap items-center gap-1">
                {workspace.members.map((m) => {
                  const isMe = m.id === currentMember?.id;
                  return (
                    <span
                      key={m.id}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md font-semibold",
                        isMe
                          ? "bg-primary-subtle text-primary"
                          : "bg-bg-subtle text-text-2"
                      )}
                    >
                      {m.name}
                      {isMe && <span className="text-text-3 ml-1">(tú)</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          aria-label="Copiar código del workspace"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-bg-subtle border border-border hover:border-border-strong transition-colors text-xs font-mono font-semibold text-text-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {copied ? (
            <Check className="w-3 h-3 text-accent" aria-hidden />
          ) : (
            <Copy className="w-3 h-3" aria-hidden />
          )}
          {workspace.joinCode}
        </button>
        <Button
          variant={confirmingLeave ? "danger" : "ghost"}
          size="sm"
          onClick={handleLeave}
          aria-label={
            confirmingLeave
              ? "Confirmar salir del workspace"
              : "Salir del workspace"
          }
        >
          <LogOut className="w-3.5 h-3.5" />
          {confirmingLeave ? "Confirmar" : "Salir del workspace"}
        </Button>
      </div>
    </div>
  );
}
