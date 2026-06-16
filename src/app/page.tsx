"use client";

import { useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { ZenCoachWidget } from "@/components/coach/zen-coach-widget";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { RescueButton } from "@/components/manana/rescue-button";
import { TimeAccuracyBadge } from "@/components/manana/time-accuracy-badge";
import { DailyBanner } from "@/components/manana/daily-banner";
import { ShareStats } from "@/components/ui/share-stats";
import { NpsPrompt } from "@/components/ui/nps-prompt";

import { VelocityChart } from "../app/analytics/velocity-chart";
import { KanbanBoard } from "../app/analytics/kanban-board";
import { DailyAgenda } from "../app/analytics/daily-agenda"; 

export default function DashboardPage() {
  const { tasks, autoSchedule } = useZenStore();

  useEffect(() => {
    const hasUnscheduled = tasks.some(
      (t) => t.status !== "COMPLETED" && !t.scheduledStart
    );
    if (hasUnscheduled) {
      autoSchedule();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  const dateStr = today.toLocaleDateString("es", { day: "numeric", month: "long" });
  const dayNameCapitalized = today.toLocaleDateString("es", { weekday: "long" }).charAt(0).toUpperCase() + today.toLocaleDateString("es", { weekday: "long" }).slice(1);

  // Preparamos las tareas para la Agenda visual
  const agendaTasksToPass = tasks.filter(t => t.scheduledStart).map(t => {
    const d = new Date(t.scheduledStart!);
    return {
      id: t.id,
      title: t.title,
      priority: t.calculatedPriority || 5,
      startH: d.getHours(),
      startM: d.getMinutes(),
      duration: (t.metrics?.timeRequired || 1) * 60
    };
  });

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <DailyBanner />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Mañana, {dayNameCapitalized}</h1>
          <p className="text-sm text-text-2 mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-3">
          <TimeAccuracyBadge />
          <ShareStats />
          <RescueButton />
        </div>
      </div>

      {/* 1. Gráfico Superior a todo ancho */}
      <div className="w-full">
        <VelocityChart />
      </div>

      <StreakBadge />
      <NpsPrompt />

      {/* 2. Tablero Kanban a todo ancho justo debajo de los datos */}
      <div className="w-full mt-4">
        <KanbanBoard />
      </div>

      {/* 3. Línea de tiempo (Agenda) a todo ancho en la parte inferior */}
      <div className="w-full mt-8">
        <DailyAgenda tasks={agendaTasksToPass.length > 0 ? agendaTasksToPass : undefined} />
      </div>

      <div className="pt-8 opacity-80 max-w-2xl">
        <ZenCoachWidget />
      </div>
    </div>
  );
}