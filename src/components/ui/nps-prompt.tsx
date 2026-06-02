"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "./card";
import { Button } from "./button";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NpsPrompt() {
  const { metrics, tasks } = useZenStore();
  const [dismissed, setDismissed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  // Show NPS after 3 completed tasks and only if not already submitted
  if (
    completedCount < 3 ||
    metrics.npsSubmittedAt ||
    dismissed ||
    submitted
  ) {
    return null;
  }

  const handleSubmit = () => {
    if (score === null) return;

    // In a real app, send this to an analytics backend
    // For now, store in local metrics
    const store = useZenStore.getState();
    useZenStore.setState({
      metrics: {
        ...store.metrics,
        npsScore: score,
        npsSubmittedAt: new Date().toISOString(),
        feedbackGiven: store.metrics.feedbackGiven + 1,
      },
    });
    setSubmitted(true);
  };

  return (
    <Card hover={false} className="relative border-primary/15 animate-fade-in">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-text-3 hover:text-text-2 cursor-pointer"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-text-1">Tu opinión importa</h3>
      </div>

      <p className="text-xs text-text-2 mb-4">
        Del 0 al 10, ¿qué tan probable es que recomiendes Zennyth a un compañero?
      </p>

      <div className="flex gap-1 mb-4">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            onClick={() => setScore(i)}
            className={cn(
              "flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 min-h-[36px]",
              score === i
                ? "bg-primary text-on-primary"
                : "bg-bg-subtle text-text-2 hover:bg-surface-hover"
            )}
          >
            {i}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-3 mb-4">
        <span>Nada probable</span>
        <span>Muy probable</span>
      </div>

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={score === null}
        className="w-full"
      >
        Enviar
      </Button>
    </Card>
  );
}
