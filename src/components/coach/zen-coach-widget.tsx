"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

export function ZenCoachWidget() {
  const { advice, loadingAdvice, tasks, user, setAdvice, setLoadingAdvice, canUseCoach, trackCoachRequest } =
    useZenStore();

  const coachAvailable = canUseCoach();

  const fetchAdvice = useCallback(async () => {
    if (loadingAdvice || !coachAvailable) return;
    trackCoachRequest();
    setLoadingAdvice(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks
            .filter((t) => t.status !== "COMPLETED")
            .sort((a, b) => b.calculatedPriority - a.calculatedPriority)
            .slice(0, 3),
          userName: user.name,
        }),
      });
      const data = await res.json();
      setAdvice(data.advice);
    } catch {
      setAdvice("Enfócate en lo que puedes controlar. Un paso a la vez.");
    } finally {
      setLoadingAdvice(false);
    }
  }, [loadingAdvice, coachAvailable, tasks, user.name, setAdvice, setLoadingAdvice, trackCoachRequest]);

  return (
    <Card className="relative overflow-hidden" hover={false}>
      <div className="absolute top-3 right-3 opacity-[0.05]">
        <Brain className="w-24 h-24 text-primary" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
              <Brain className="w-[18px] h-[18px] text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-1">Zen Coach</h2>
              <p className="text-[11px] text-text-3">Asistente IA</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchAdvice}
            disabled={loadingAdvice || !coachAvailable}
            aria-label="Actualizar consejo"
          >
            <RefreshCw className={cn("w-4 h-4", loadingAdvice && "animate-spin")} />
          </Button>
        </div>

        <p className="text-sm text-text-2 leading-relaxed">
          {loadingAdvice ? (
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:300ms]" />
            </span>
          ) : (
            advice
          )}
        </p>
      </div>
    </Card>
  );
}
