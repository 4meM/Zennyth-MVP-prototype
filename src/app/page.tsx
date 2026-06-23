"use client";

import { useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { ZenCoachWidget } from "@/components/coach/zen-coach-widget";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { RescueButton } from "@/components/manana/rescue-button";
import { TimeAccuracyBadge } from "@/components/manana/time-accuracy-badge";
import { DailyBanner } from "@/components/manana/daily-banner";
import { ShareStats } from "@/components/ui/share-stats";
import { NpsPrompt } from "@/components/ui/nps-prompt";

import { VelocityChart } from "../app/analytics/velocity-chart";
import { KanbanBoard } from "../app/analytics/kanban-board";
import { DailyAgenda, AgendaTask } from "../app/analytics/daily-agenda";

/**
 * Group-task → agenda-task conversion.
 *
 * We pull workspace tasks that are due today AND either unassigned or
 * assigned to the current member. The "current member" is the
 * last-joined member in a workspace (single-device MVP assumption).
 *
 * Group tasks are pinned at 08:00 so they appear at the top of the
 * timeline where the user sees them immediately upon opening the app.
 * The deadline date drives *visibility* (is it due today?); the time
 * of day is intentionally fixed, not derived from the deadline clock.
 *
 * Priority is fixed at 5 (middle of the visual scale) so group work sits
 * clearly between high- and low-priority individual tasks, never
 * overshadowing either.
 */
function buildGroupAgendaTasks(
  workspaces: ReturnType<typeof useWorkspaceStore.getState>["workspaces"],
  today: Date
): AgendaTask[] {
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const out: AgendaTask[] = [];

  for (const ws of workspaces) {
    const currentMember = ws.members[ws.members.length - 1];
    if (!currentMember) continue;
    const currentMemberId = currentMember.id;

    for (const t of ws.tasks) {
      // Skip if status is DONE — the user already finished it.
      if (t.status === "DONE") continue;

      // Skip if explicitly assigned to someone else in the group.
      if (t.assignedTo && t.assignedTo !== currentMemberId) continue;

      const deadline = new Date(t.deadline);
      if (Number.isNaN(deadline.getTime())) continue;
      if (deadline < startOfDay || deadline > endOfDay) continue;

      out.push({
        id: `grp-${t.id}`,
        title: `[Grupo] ${t.title}`,
        priority: 5,
        startH: 8,
        startM: 0,
        duration: 60,
      });
    }
  }

  return out;
}

export default function DashboardPage() {
  const { tasks, autoSchedule } = useZenStore();
  // NOTE: this is a deliberate, documented exception to strict store
  // isolation. The Mañana dashboard is the aggregation layer where group
  // work meets the individual timeline. If the user has zero workspaces,
  // the workspace store is read but contributes zero tasks, leaving the
  // render byte-identical to the pre-workspace Mañana view.
  const workspaces = useWorkspaceStore((s) => s.workspaces);

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

  // Preparamos las tareas individuales para la Agenda visual
  const individualAgendaTasks: AgendaTask[] = tasks.filter(t => t.scheduledStart).map(t => {
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

  // Concatenar tareas del grupo (due today, visible to the current member).
  const groupAgendaTasks = buildGroupAgendaTasks(workspaces, today);
  const agendaTasksToPass: AgendaTask[] = [
    ...individualAgendaTasks,
    ...groupAgendaTasks,
  ];

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
        <DailyAgenda
          tasks={agendaTasksToPass.length > 0 ? agendaTasksToPass : undefined}
        />
      </div>

      <div className="pt-8 opacity-80 max-w-2xl">
        <ZenCoachWidget />
      </div>
    </div>
  );
}