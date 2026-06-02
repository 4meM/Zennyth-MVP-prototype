"use client";

import { useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { ZenCoachWidget } from "@/components/coach/zen-coach-widget";
import { Timeline } from "@/components/dashboard/timeline";
import { StreakBadge } from "@/components/dashboard/streak-badge";
import { MananaCard } from "@/components/manana/manana-card";
import { ProgressiveBacklog } from "@/components/manana/progressive-backlog";
import { RescueButton } from "@/components/manana/rescue-button";
import { TimeAccuracyBadge } from "@/components/manana/time-accuracy-badge";
import { DailyBanner } from "@/components/manana/daily-banner";
import { ShareStats } from "@/components/ui/share-stats";
import { NpsPrompt } from "@/components/ui/nps-prompt";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { tasks, user, autoSchedule } = useZenStore();

  // Auto-schedule on mount so tasks have scheduledStart/scheduledEnd
  useEffect(() => {
    const hasUnscheduled = tasks.some(
      (t) => t.status !== "COMPLETED" && !t.scheduledStart
    );
    if (hasUnscheduled) {
      autoSchedule();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date();
  const dayName = today.toLocaleDateString("es", { weekday: "long" });
  const dateStr = today.toLocaleDateString("es", {
    day: "numeric",
    month: "long",
  });

  // Capitalize first letter of day name
  const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Daily notification banner */}
      <DailyBanner />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-1">
            Mañana, {dayNameCapitalized}
          </h1>
          <p className="text-sm text-text-2 mt-0.5 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <TimeAccuracyBadge />
          <ShareStats />
          <RescueButton />
        </div>
      </div>

      <StreakBadge />
      <NpsPrompt />

      {/* Main Mañana view */}
      <MananaCard tasks={tasks} />

      {/* Secondary: progressive backlog */}
      <div className="pt-2">
        <ProgressiveBacklog />
      </div>

      {/* Below fold: keep existing widgets but de-emphasized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-border">
        <section className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-text-2 uppercase tracking-wider">
              Todas las tareas
            </h2>
            <Link href="/tasks/new">
              <span className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </span>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-text-2 uppercase tracking-wider mb-3">
            Hoy
          </h2>
          <Timeline />
        </section>
      </div>

      {/* Coach widget — de-emphasized */}
      <div className="pt-2 opacity-80">
        <ZenCoachWidget />
      </div>
    </div>
  );
}
