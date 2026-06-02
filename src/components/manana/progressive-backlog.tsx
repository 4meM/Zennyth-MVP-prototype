"use client";

import { Task, TaskStatus } from "@/types";
import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ChevronDown, ChevronUp, Inbox } from "lucide-react";
import { useState } from "react";
import { cn, formatDuration, daysUntil } from "@/lib/utils";

const INITIAL_VISIBLE = 3;

export function ProgressiveBacklog() {
  const { tasks, completeTask, updateStreak } = useZenStore();
  const [expanded, setExpanded] = useState(false);

  const pendingTasks = tasks
    .filter((t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE)
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  if (pendingTasks.length === 0) {
    return (
      <Card hover={false} className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6 text-text-3" />
        </div>
        <p className="text-sm font-semibold text-text-2">Tu día está tranquilo</p>
        <p className="text-xs text-text-3 mt-1">No hay tareas pendientes. Buen trabajo!</p>
      </Card>
    );
  }

  const visibleTasks = expanded ? pendingTasks : pendingTasks.slice(0, INITIAL_VISIBLE);
  const hasMore = pendingTasks.length > INITIAL_VISIBLE;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-text-2 uppercase tracking-wider">
          Plan del día
        </h2>
        <span className="text-xs text-text-3">{pendingTasks.length} tarea{pendingTasks.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="stagger-children space-y-2">
        {visibleTasks.map((task) => (
          <BacklogTaskCard
            key={task.id}
            task={task}
            onComplete={() => {
              completeTask(task.id);
              updateStreak();
            }}
          />
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver más ({pendingTasks.length - INITIAL_VISIBLE} restantes)
            </>
          )}
        </Button>
      )}
    </div>
  );
}

function BacklogTaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const days = daysUntil(task.deadline);
  const isOverdue = task.status === TaskStatus.OVERDUE || days < 0;

  return (
    <Card hover={false} className={cn("py-3 px-4", isOverdue && "border-l-3 border-l-warning")}>
      <div className="flex items-start gap-3">
        <button
          onClick={onComplete}
          aria-label={`Completar: ${task.title}`}
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
            "transition-all duration-200 cursor-pointer min-w-[20px]",
            "border-border-strong hover:border-accent hover:bg-accent-subtle active:scale-90"
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {task.subject && (
              <span className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {task.subject}
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-text-1 mt-0.5">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-text-2">
              <Clock className="w-3 h-3" />
              {formatDuration(task.metrics.timeRequired)}
            </span>
            {isOverdue ? (
              <Badge variant="warning">Vencida</Badge>
            ) : (
              <span className={cn(
                "text-xs font-medium",
                days <= 1 ? "text-warning" : days <= 3 ? "text-text-2" : "text-text-3"
              )}>
                {days === 0 ? "Hoy" : days === 1 ? "Mañana" : `${days} días`}
              </span>
            )}
            <span className="text-xs text-text-3 tabular-nums ml-auto">
              {task.calculatedPriority}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
