"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";

interface CalmConfirmationProps {
  tasksAffected: number;
  nextTask?: string;
  nextTime?: string;
  onDismiss: () => void;
}

export function CalmConfirmation({
  tasksAffected,
  nextTask,
  nextTime,
  onDismiss,
}: CalmConfirmationProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Confirmación de rescate"
    >
      <Card
        hover={false}
        className="max-w-sm w-full py-8 px-6 text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-accent-subtle flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-accent" />
        </div>

        <h2 className="text-lg font-bold text-text-1 mb-2">
          Tu día está salvado
        </h2>

        <p className="text-sm text-text-2 mb-4">
          {tasksAffected} tarea{tasksAffected !== 1 ? "s" : ""} reubicada{tasksAffected !== 1 ? "s" : ""}.
          {nextTask && nextTime && (
            <span className="block mt-1 text-text-1 font-medium">
              <Clock className="w-3.5 h-3.5 inline mr-1 relative -top-px" />
              Próxima: {nextTask} a las {nextTime}
            </span>
          )}
        </p>

        <Button onClick={onDismiss} size="lg" className="w-full">
          Entendido
        </Button>
      </Card>
    </div>
  );
}
