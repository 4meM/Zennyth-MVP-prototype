"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { cn, daysUntil } from "@/lib/utils";
import {
  Calendar,
  Check,
  PartyPopper,
  Split,
  UserPlus,
} from "lucide-react";
import type {
  GroupTask,
  SubTask,
  WorkspaceMember,
} from "@/types/workspace";
import { SplitTaskDialog } from "./split-task-dialog";
import { MemberBadge } from "./member-badge";

interface GroupTaskCardProps {
  task: GroupTask;
  workspaceId: string;
  members: WorkspaceMember[];
  /** The local member id for the current user in this workspace. */
  currentMemberId?: string;
  /** Visual tone for the left border (matches the parent column's status). */
  statusTone: "todo" | "in-progress" | "done";
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const STATUS_BORDER: Record<GroupTaskCardProps["statusTone"], string> = {
  todo: "border-l-text-3",
  "in-progress": "border-l-primary",
  done: "border-l-accent",
};

/**
 * Card for a single GroupTask inside the shared workspace board.
 *
 * - Draggable: parent (WorkspaceBoard) attaches drag handlers via props.
 * - Empty state (no subtasks yet): shows a "Dividir entre el grupo" trigger
 *   that opens the SplitTaskDialog. Once split, the trigger is hidden to
 *   prevent accidental overwrites (per spec).
 * - Per-subtask row: shows owner (or "Sin asignar"), with "Reclamar" for
 *   unclaimed subtasks and "Completar" for the subtask's owner.
 * - Celebration: when every subtask is done, a subtle "Logro grupal" badge
 *   appears with `animate-scale-in` (respects prefers-reduced-motion).
 *
 * No red, no blame, no leaderboards — calm collective-progress tone.
 */
export function GroupTaskCard({
  task,
  workspaceId,
  members,
  currentMemberId,
  statusTone,
  onDragStart,
  onDragEnd,
}: GroupTaskCardProps) {
  const [splitOpen, setSplitOpen] = useState(false);
  const claimSubtask = useWorkspaceStore((s) => s.claimSubtask);
  const completeSubtask = useWorkspaceStore((s) => s.completeSubtask);

  const owner = members.find((m) => m.id === task.createdBy);
  const totalSubtasks = task.subtasks.length;
  const doneSubtasks = task.subtasks.filter((s) => s.status === "DONE").length;
  const allDone = totalSubtasks > 0 && doneSubtasks === totalSubtasks;
  const isComplete = task.status === "DONE";

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        className={cn(
          "bg-surface p-4 rounded-lg border-l-4 border-y border-r border-y-border border-r-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group",
          STATUS_BORDER[statusTone],
          allDone && "ring-1 ring-accent/30"
        )}
      >
        <h4
          className={cn(
            "text-sm font-semibold text-text-1 leading-snug mb-2",
            isComplete && "line-through text-text-3"
          )}
        >
          {task.title}
        </h4>

        <div className="flex items-center justify-between gap-2 mb-3 text-[10px]">
          <DeadlineBadge iso={task.deadline} />
          {owner && (
            <MemberBadge
              name={owner.name}
              variant={owner.id === currentMemberId ? "self" : "default"}
            />
          )}
        </div>

        {totalSubtasks === 0 ? (
          <Button
            variant="accent"
            size="sm"
            onClick={() => setSplitOpen(true)}
            className="w-full"
          >
            <Split className="w-3.5 h-3.5" />
            Dividir entre el grupo
          </Button>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-text-2 uppercase tracking-wider">
                {doneSubtasks}/{totalSubtasks} completadas
              </span>
              {allDone && (
                <span
                  className="flex items-center gap-1 text-[10px] text-accent font-bold animate-scale-in"
                  aria-live="polite"
                >
                  <PartyPopper className="w-3 h-3" />
                  Logro grupal
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              {task.subtasks.map((s) => (
                <SubtaskRow
                  key={s.id}
                  subtask={s}
                  members={members}
                  currentMemberId={currentMemberId}
                  onClaim={() =>
                    currentMemberId &&
                    claimSubtask(workspaceId, task.id, s.id, currentMemberId)
                  }
                  onComplete={() =>
                    completeSubtask(workspaceId, task.id, s.id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
      <SplitTaskDialog
        open={splitOpen}
        workspaceId={workspaceId}
        taskId={task.id}
        onClose={() => setSplitOpen(false)}
      />
    </>
  );
}

// ── Subtask row ───────────────────────────────────────────────────

interface SubtaskRowProps {
  subtask: SubTask;
  members: WorkspaceMember[];
  currentMemberId?: string;
  onClaim: () => void;
  onComplete: () => void;
}

function SubtaskRow({
  subtask,
  members,
  currentMemberId,
  onClaim,
  onComplete,
}: SubtaskRowProps) {
  const owner = members.find((m) => m.id === subtask.ownerId);
  const isDone = subtask.status === "DONE";
  const isMine = subtask.ownerId && subtask.ownerId === currentMemberId;

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
        isDone
          ? "bg-accent-subtle/40"
          : subtask.ownerId
            ? "bg-bg-subtle"
            : "bg-bg-subtle/60 border border-dashed border-border"
      )}
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[11px] font-semibold text-text-1 truncate",
            isDone && "line-through text-text-3"
          )}
        >
          {subtask.title}
        </p>
        <div className="mt-0.5">
          {owner ? (
            <MemberBadge
              name={owner.name}
              variant={owner.id === currentMemberId ? "self" : "default"}
            />
          ) : (
            <MemberBadge name={undefined} variant="unassigned" />
          )}
        </div>
      </div>

      {!isDone && (
        <>
          {subtask.ownerId ? (
            isMine && (
              <button
                onClick={onComplete}
                aria-label="Marcar como completada"
                className="flex-shrink-0 w-8 h-8 rounded-md bg-accent-subtle text-accent hover:bg-accent hover:text-on-primary transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <Check className="w-4 h-4" />
              </button>
            )
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClaim}
              disabled={!currentMemberId}
              className="text-[10px] flex-shrink-0"
            >
              <UserPlus className="w-3 h-3" />
              Reclamar
            </Button>
          )}
        </>
      )}
    </div>
  );
}

// ── Deadline badge ────────────────────────────────────────────────

function DeadlineBadge({ iso }: { iso: string }) {
  const days = daysUntil(iso);
  const label =
    days === 0
      ? "Hoy"
      : days < 0
        ? `Hace ${Math.abs(days)}d`
        : days === 1
          ? "Mañana"
          : `En ${days}d`;
  const tone =
    days < 0
      ? "text-text-3"
      : days <= 1
        ? "text-warning"
        : "text-text-2";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        tone
      )}
    >
      <Calendar className="w-3 h-3" />
      {label}
    </span>
  );
}
