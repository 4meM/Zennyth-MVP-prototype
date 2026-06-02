"use client";

import { Task, TaskStatus } from "@/types";
import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn, formatDuration, formatTime } from "@/lib/utils";

interface MananaCardProps {
  tasks: Task[];
}

const energyConfig: Record<string, { label: string; variant: "default" | "accent" | "warning" | "premium"; icon: typeof Zap }> = {
  peak: { label: "Pico", variant: "accent", icon: Zap },
  high: { label: "Alta", variant: "premium", icon: Zap },
  moderate: { label: "Moderada", variant: "default", icon: Zap },
  low: { label: "Baja", variant: "warning", icon: Zap },
};

function getEnergyLevel(hour: number): string {
  if (hour >= 8 && hour < 10) return "peak";
  if (hour >= 10 && hour < 12) return "high";
  if (hour >= 12 && hour < 14) return "low";
  if (hour >= 14 && hour < 16) return "moderate";
  if (hour >= 16 && hour < 18) return "high";
  if (hour >= 18 && hour < 20) return "moderate";
  return "low";
}

export function MananaCard({ tasks }: MananaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { completeTask, updateStreak } = useZenStore();

  const pendingTasks = tasks
    .filter((t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE)
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  const nextTask = pendingTasks[0];
  const remainingTasks = pendingTasks.slice(1);

  if (pendingTasks.length === 0) {
    return (
      <Card hover={false} className="flex flex-col items-center justify-center py-14 text-center animate-scale-in">
        <div className="w-14 h-14 rounded-2xl bg-bg-subtle flex items-center justify-center mb-4">
          <BookOpen className="w-7 h-7 text-text-3" />
        </div>
        <p className="text-sm font-semibold text-text-2">Todo listo para mañana</p>
        <p className="text-xs text-text-3 mt-1 mb-5 max-w-[200px]">
          No tienes tareas pendientes. Disfruta tu tiempo libre.
        </p>
      </Card>
    );
  }

  const scheduledHour = nextTask.scheduledStart
    ? new Date(nextTask.scheduledStart).getHours()
    : 9;
  const energyLevel = getEnergyLevel(scheduledHour);
  const energy = energyConfig[energyLevel];

  return (
    <div className="space-y-3">
      {/* Main card — next task */}
      <Card
        hover={false}
        className="animate-fade-in-up border-l-4 border-l-primary"
      >
        <div className="space-y-3">
          {nextTask.subject && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {nextTask.subject}
            </span>
          )}

          <h3 className="text-lg font-bold text-text-1">{nextTask.title}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            {nextTask.scheduledStart && (
              <Badge variant="premium">
                <Clock className="w-3 h-3" />
                {formatTime(nextTask.scheduledStart)} — {nextTask.scheduledEnd ? formatTime(nextTask.scheduledEnd) : ""}
              </Badge>
            )}
            <Badge variant={energy.variant}>
              <energy.icon className="w-3 h-3" />
              Energía: {energy.label}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-text-2">
              <Clock className="w-3 h-3" />
              {formatDuration(nextTask.metrics.timeRequired)}
            </span>
          </div>

          <Button
            onClick={() => {
              completeTask(nextTask.id);
              updateStreak();
            }}
            size="lg"
            className="w-full"
          >
            Comenzar
          </Button>
        </div>
      </Card>

      {/* Progressive disclosure */}
      {remainingTasks.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-text-3 hover:text-text-2 transition-colors cursor-pointer py-1 w-full"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          {expanded ? "Ocultar plan" : `Ver plan completo (${remainingTasks.length} tarea${remainingTasks.length !== 1 ? "s" : ""})`}
        </button>
      )}

      {expanded && remainingTasks.length > 0 && (
        <div className="stagger-children space-y-2 animate-fade-in">
          {remainingTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={() => {
                completeTask(task.id);
                updateStreak();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const scheduledHour = task.scheduledStart
    ? new Date(task.scheduledStart).getHours()
    : 9;
  const energyLevel = getEnergyLevel(scheduledHour);
  const energy = energyConfig[energyLevel];

  return (
    <Card hover={false} className="py-3 px-4">
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
          {task.subject && (
            <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
              {task.subject}
            </span>
          )}
          <h4 className="text-sm font-semibold text-text-1">{task.title}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.scheduledStart && (
              <span className="text-[10px] text-text-3 tabular-nums">
                {formatTime(task.scheduledStart)}
              </span>
            )}
            <Badge variant={energy.variant} className="text-[9px] px-1.5 py-0.5">
              {energy.label}
            </Badge>
            <span className="text-[10px] text-text-3">
              {formatDuration(task.metrics.timeRequired)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
