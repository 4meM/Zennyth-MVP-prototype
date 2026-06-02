"use client";

import { Task, TaskStatus } from "@/types";
import { cn, formatDuration, daysUntil } from "@/lib/utils";
import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertTriangle, BookOpen } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

function getPriorityClass(priority: number, status: TaskStatus) {
  if (status === TaskStatus.OVERDUE) return "priority-high";
  if (priority > 15) return "priority-high";
  if (priority > 8) return "priority-medium";
  return "priority-low";
}

function getPriorityBadge(priority: number) {
  if (priority > 15) return { label: "Urgente", variant: "danger" as const };
  if (priority > 8) return { label: "Media", variant: "warning" as const };
  return { label: "Baja", variant: "accent" as const };
}

export function TaskCard({ task }: TaskCardProps) {
  const { completeTask, updateStreak } = useZenStore();
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const days = daysUntil(task.deadline);
  const priorityBadge = getPriorityBadge(task.calculatedPriority);

  const handleComplete = () => {
    if (isCompleted) return;
    completeTask(task.id);
    updateStreak();
  };

  return (
    <Card
      className={cn(
        getPriorityClass(task.calculatedPriority, task.status),
        isCompleted && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          aria-label={isCompleted ? "Tarea completada" : `Completar: ${task.title}`}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
            "transition-all duration-200 cursor-pointer min-w-[20px]",
            isCompleted
              ? "bg-accent border-accent"
              : "border-border-strong hover:border-accent hover:bg-accent-subtle active:scale-90"
          )}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {task.subject && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3" />
              {task.subject}
            </span>
          )}

          <h3
            className={cn(
              "text-sm font-semibold text-text-1 mb-2",
              isCompleted && "line-through text-text-3"
            )}
          >
            {task.title}
          </h3>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
            <span className="flex items-center gap-1 text-xs text-text-2">
              <Clock className="w-3 h-3" />
              {formatDuration(task.metrics.timeRequired)}
            </span>
            {task.status === TaskStatus.OVERDUE ? (
              <span className="flex items-center gap-1 text-xs text-danger font-semibold">
                <AlertTriangle className="w-3 h-3" />
                Vencida
              </span>
            ) : (
              <span className={cn(
                "text-xs font-medium",
                days <= 1 ? "text-danger" : days <= 3 ? "text-warning" : "text-text-2"
              )}>
                {days === 0 ? "Hoy" : days === 1 ? "Mañana" : `${days} días`}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-lg font-bold text-primary tabular-nums">
            {task.calculatedPriority}
          </span>
          <p className="text-[9px] text-text-3 uppercase tracking-wider">Score</p>
        </div>
      </div>
    </Card>
  );
}
