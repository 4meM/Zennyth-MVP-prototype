"use client";

import { useZenStore } from "@/lib/store";
import { calculateAccuracy, getOverallCompletionCount } from "@/lib/learning-engine";
import { Badge } from "@/components/ui/badge";
import { Target, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MIN_DATA_POINTS = 5;

export function TimeAccuracyBadge() {
  const { subjectLearning } = useZenStore();
  const [showTooltip, setShowTooltip] = useState(false);

  const accuracy = calculateAccuracy(subjectLearning);
  const totalCompletions = getOverallCompletionCount(subjectLearning);

  if (totalCompletions < MIN_DATA_POINTS) {
    return null;
  }

  const accuracyPercent = Math.round((accuracy ?? 0) * 100);

  // Color based on accuracy
  const colorClass =
    accuracyPercent >= 80
      ? "text-accent"
      : accuracyPercent >= 60
        ? "text-warning"
        : "text-text-2";

  const bgClass =
    accuracyPercent >= 80
      ? "bg-accent-subtle"
      : accuracyPercent >= 60
        ? "bg-warning-subtle"
        : "bg-bg-subtle";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Badge className={cn("flex items-center gap-1 cursor-default", bgClass, colorClass)}>
        <Target className="w-3 h-3" />
        Estimaciones {accuracyPercent}% precisas
      </Badge>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-surface border border-border shadow-sm text-xs text-text-2 whitespace-nowrap animate-fade-in z-50">
          <Info className="w-3 h-3 inline mr-1 relative -top-px" />
          Basado en tus últimas {totalCompletions} tareas completadas
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-surface border-r border-b border-border rotate-45 -translate-y-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}
