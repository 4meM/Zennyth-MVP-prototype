"use client";

import { useZenStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { CalmConfirmation } from "./calm-confirmation";

export function RescueButton() {
  const { tasks, rescueDay } = useZenStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rescueResult, setRescueResult] = useState<{
    tasksAffected: number;
    nextTask?: string;
    nextTime?: string;
  } | null>(null);
  const [isRescuing, setIsRescuing] = useState(false);

  const pendingTasks = tasks.filter(
    (t) => t.status === "PENDING" || t.status === "OVERDUE"
  );
  const hasTasksToRescue = pendingTasks.length > 0;

  const handleRescue = () => {
    if (!hasTasksToRescue) return;
    setIsRescuing(true);

    // Run rescue (should be fast, <2s)
    const result = rescueDay();
    setRescueResult(result);
    setIsRescuing(false);
    setShowConfirmation(true);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleRescue}
        disabled={!hasTasksToRescue || isRescuing}
        aria-label="Rescatar día"
      >
        <RefreshCw className={cn("w-3.5 h-3.5", isRescuing && "animate-spin")} />
        <span className="hidden sm:inline">Rescatar Día</span>
      </Button>

      {showConfirmation && rescueResult && (
        <CalmConfirmation
          tasksAffected={rescueResult.tasksAffected}
          nextTask={rescueResult.nextTask}
          nextTime={rescueResult.nextTime}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
}

// Import cn from utils
import { cn } from "@/lib/utils";
