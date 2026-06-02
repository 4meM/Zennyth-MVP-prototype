"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "./card";
import { Button } from "./button";
import { Sparkles, Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeGateProps {
  feature: string;
  children: React.ReactNode;
}

export function UpgradeGate({ feature, children }: UpgradeGateProps) {
  const { tier, trackEvent } = useZenStore();

  if (tier === "pro") return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-[1px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card hover={false} className="text-center p-6 max-w-xs shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-primary-subtle flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-text-1 mb-1">
            {feature}
          </h3>
          <p className="text-xs text-text-2 mb-4">
            Disponible en el plan Pro
          </p>
          <Link href="/pricing" onClick={() => trackEvent("upgradeClicks")}>
            <Button size="sm">
              <Sparkles className="w-3.5 h-3.5" />
              Ver planes
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

export function TaskLimitBanner() {
  const { canAddTask, tier, tasks, trackEvent } = useZenStore();
  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");

  if (tier === "pro" || activeTasks.length < 4) return null;

  const isFull = !canAddTask();

  return (
    <div className={`rounded-xl p-3 flex items-center justify-between gap-3 ${isFull ? "bg-danger-subtle border border-danger/10" : "bg-warning-subtle border border-warning/10"}`}>
      <p className="text-xs text-text-2">
        {isFull
          ? "Llegaste al límite de 5 tareas en Free"
          : `${activeTasks.length}/5 tareas usadas`}
      </p>
      <Link href="/pricing" onClick={() => trackEvent("upgradeClicks")}>
        <Button size="sm" variant={isFull ? "primary" : "ghost"}>
          <Sparkles className="w-3 h-3" />
          Upgrade
        </Button>
      </Link>
    </div>
  );
}
