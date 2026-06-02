"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UpgradeGate } from "@/components/ui/upgrade-gate";
import { Play, Pause, RotateCcw, Timer, Coffee, Sparkles } from "lucide-react";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
type TimerPhase = "idle" | "work" | "break";

export default function FocusPage() {
  const { tasks, addFocusSession, updateStreak } = useZenStore();
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED").sort((a, b) => b.calculatedPriority - a.calculatedPriority);
  const selectedTask = activeTasks.find((t) => t.id === selectedTaskId);
  const totalSeconds = phase === "break" ? BREAK_MINUTES * 60 : WORK_MINUTES * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (phase === "work") {
      addFocusSession({ taskId: selectedTaskId ?? undefined, taskTitle: selectedTask?.title, startedAt: new Date().toISOString(), duration: WORK_MINUTES, type: "WORK" });
      updateStreak();
      setSessionsCompleted((s) => s + 1);
      setPhase("break");
      setSecondsLeft(BREAK_MINUTES * 60);
    } else if (phase === "break") {
      setPhase("work");
      setSecondsLeft(WORK_MINUTES * 60);
    }
  }, [phase, selectedTaskId, selectedTask, addFocusSession, updateStreak]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0) {
      handleComplete();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, secondsLeft, handleComplete]);

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-1 flex items-center justify-center gap-2.5"><Timer className="w-6 h-6 text-primary" />Focus Mode</h1>
        <p className="text-sm text-text-2 mt-0.5">Pomodoro integrado con tus tareas</p>
        <Badge variant="premium" className="mt-2"><Sparkles className="w-3 h-3" />PRO</Badge>
      </div>

      <Card hover={false} className="flex flex-col items-center py-10">
        <div className="relative w-52 h-52 mb-8" role="timer" aria-label={`${minutes} minutos ${seconds} segundos`}>
          <svg className="w-52 h-52 -rotate-90" viewBox="0 0 208 208">
            <circle cx="104" cy="104" r="92" fill="none" stroke="var(--color-bg-subtle)" strokeWidth="6" />
            <circle cx="104" cy="104" r="92" fill="none" stroke={phase === "break" ? "var(--color-accent)" : "var(--color-primary)"} strokeWidth="6" strokeDasharray={`${(progress / 100) * 578} 578`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-text-1 font-mono tabular-nums tracking-tight">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
            <span className="text-xs text-text-2 mt-2 flex items-center gap-1.5">
              {phase === "break" ? <><Coffee className="w-3.5 h-3.5" /> Descanso</> : phase === "work" ? "Enfocado" : "Listo para empezar"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRunning ? (
            <Button onClick={() => setIsRunning(false)} variant="secondary" size="lg"><Pause className="w-5 h-5" />Pausar</Button>
          ) : (
            <Button onClick={() => { if (phase === "idle") setPhase("work"); setIsRunning(true); }} size="lg"><Play className="w-5 h-5" />{phase === "idle" ? "Iniciar" : "Continuar"}</Button>
          )}
          <Button onClick={() => { setIsRunning(false); setPhase("idle"); setSecondsLeft(WORK_MINUTES * 60); }} variant="ghost" size="icon" aria-label="Reiniciar"><RotateCcw className="w-4 h-4" /></Button>
        </div>

        {sessionsCompleted > 0 && <p className="text-xs text-accent mt-5 font-semibold">{sessionsCompleted} sesión{sessionsCompleted !== 1 ? "es" : ""} completada{sessionsCompleted !== 1 ? "s" : ""}</p>}
      </Card>

      <UpgradeGate feature="Vincular tareas al timer">
      <Card hover={false}>
        <h2 className="text-sm font-bold text-text-1 mb-3">Vincular tarea (opcional)</h2>
        {activeTasks.length === 0 ? (
          <p className="text-xs text-text-3 py-2">Sin tareas pendientes</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto" role="listbox" aria-label="Seleccionar tarea">
            {activeTasks.map((task) => (
              <button key={task.id} role="option" aria-selected={selectedTaskId === task.id} onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)} className={cn(
                "w-full text-left px-3.5 py-2.5 rounded-xl text-sm min-h-[44px] transition-all duration-150 cursor-pointer",
                selectedTaskId === task.id ? "bg-primary-subtle text-text-1 border border-primary/15" : "text-text-2 hover:bg-bg-subtle"
              )}>
                <span className="font-medium">{task.title}</span>
                {task.subject && <span className="text-[11px] text-text-3 ml-2">{task.subject}</span>}
              </button>
            ))}
          </div>
        )}
      </Card>
      </UpgradeGate>
    </div>
  );
}
