"use client";

import { useZenStore } from "@/lib/store";
import { Flame, Trophy } from "lucide-react";

export function StreakBadge() {
  const { streak, totalFocusMinutes, tasks } = useZenStore();
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  if (streak.currentStreak === 0 && completedCount === 0 && totalFocusMinutes === 0) return null;

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      {streak.currentStreak > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-warning-subtle border border-warning/10">
          <Flame className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs font-bold text-warning tabular-nums">{streak.currentStreak} días</span>
        </div>
      )}
      {completedCount > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-subtle border border-accent/10">
          <Trophy className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent tabular-nums">{completedCount} completada{completedCount !== 1 ? "s" : ""}</span>
        </div>
      )}
      {totalFocusMinutes > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-subtle border border-primary/10">
          <span className="text-xs font-semibold text-primary tabular-nums">{Math.round(totalFocusMinutes / 60)}h enfocado</span>
        </div>
      )}
    </div>
  );
}
