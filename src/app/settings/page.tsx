"use client";

import { useZenStore } from "@/lib/store";
import { useTheme } from "@/components/layout/theme-provider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Calendar, Sun, Moon, Monitor, Sparkles, Flame, Trophy, Activity, Bell, Target } from "lucide-react";
import { calculateAccuracy, getOverallCompletionCount } from "@/lib/learning-engine";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Hours for time picker
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsPage() {
  const { user, setUser, streak, tier, tasks, totalFocusMinutes, metrics, notificationSettings, setNotificationSettings, subjectLearning, requestNotificationPermission } = useZenStore();
  const { theme, setTheme } = useTheme();
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  const accuracy = calculateAccuracy(subjectLearning);
  const totalCompletions = getOverallCompletionCount(subjectLearning);

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Claro" },
    { value: "dark" as const, icon: Moon, label: "Oscuro" },
    { value: "system" as const, icon: Monitor, label: "Sistema" },
  ];

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-1 flex items-center gap-2.5"><Settings className="w-6 h-6 text-primary" />Configuración</h1>
      </div>

      <Card hover={false} className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-white shadow-sm shadow-primary/20">
            {user.name ? user.name[0].toUpperCase() : "Z"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-1">{user.name || "Estudiante"}</h2>
            <p className="text-xs text-text-2">{user.university || "Universidad"}</p>
            <Badge variant={tier === "pro" ? "premium" : "default"} className="mt-1.5">
              {tier === "pro" ? <><Sparkles className="w-3 h-3" /> Pro</> : "Free"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <Input id="settings-name" label="Nombre" value={user.name} onChange={(e) => setUser({ name: e.target.value })} placeholder="Tu nombre" />
          <Input id="settings-university" label="Universidad" value={user.university} onChange={(e) => setUser({ university: e.target.value })} placeholder="Tu universidad" />
        </div>
      </Card>

      {/* Theme */}
      <Card hover={false}>
        <h2 className="text-sm font-bold text-text-1 mb-3">Apariencia</h2>
        <div className="flex gap-2">
          {themeOptions.map((opt) => (
            <button key={opt.value} onClick={() => setTheme(opt.value)} className={cn(
              "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer min-h-[44px]",
              theme === opt.value ? "bg-primary-subtle text-primary border border-primary/15" : "bg-bg-subtle text-text-2 border border-border hover:bg-surface-hover"
            )}>
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-text-1">Notificaciones diarias</h2>
        </div>

        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-1">Recordatorio nocturno</p>
              <p className="text-xs text-text-3">Te avisa qué tienes mañana</p>
            </div>
            <button
              onClick={() => {
                const newEnabled = !notificationSettings.enabled;
                setNotificationSettings({ enabled: newEnabled });
                if (newEnabled) {
                  requestNotificationPermission();
                }
              }}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer",
                notificationSettings.enabled ? "bg-primary" : "bg-border"
              )}
              role="switch"
              aria-checked={notificationSettings.enabled}
              aria-label="Activar notificaciones"
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  notificationSettings.enabled && "translate-x-5"
                )}
              />
            </button>
          </div>

          {/* Time picker */}
          {notificationSettings.enabled && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-xs text-text-2">Hora de notificación</label>
              <div className="flex gap-2">
                <select
                  value={notificationSettings.time.split(":")[0]}
                  onChange={(e) => {
                    const [, minute] = notificationSettings.time.split(":");
                    setNotificationSettings({
                      time: `${e.target.value}:${minute}`,
                    });
                  }}
                  className="flex-1 rounded-xl bg-bg-subtle border border-border px-3 py-2.5 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
                  aria-label="Hora"
                >
                  {HOURS.map((h) => (
                    <option key={h} value={String(h).padStart(2, "0")}>
                      {String(h).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-text-3">:</span>
                <select
                  value={notificationSettings.time.split(":")[1]}
                  onChange={(e) => {
                    const [hour] = notificationSettings.time.split(":");
                    setNotificationSettings({
                      time: `${hour}:${e.target.value}`,
                    });
                  }}
                  className="flex-1 rounded-xl bg-bg-subtle border border-border px-3 py-2.5 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[44px]"
                  aria-label="Minuto"
                >
                  {["00", "15", "30", "45"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Estimation Accuracy */}
      {totalCompletions > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-1">Precisión de estimaciones</h2>
          </div>

          {accuracy !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-text-1">
                  {Math.round(accuracy * 100)}%
                </span>
                <Badge
                  variant={accuracy >= 0.8 ? "accent" : accuracy >= 0.6 ? "warning" : "default"}
                >
                  {totalCompletions} tarea{totalCompletions !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="w-full h-2 rounded-full bg-bg-subtle overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    accuracy >= 0.8 ? "bg-accent" : accuracy >= 0.6 ? "bg-warning" : "bg-text-3"
                  )}
                  style={{ width: `${accuracy * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-3">
                {accuracy >= 0.8
                  ? "Tus estimaciones son muy precisas. Buen trabajo!"
                  : accuracy >= 0.6
                    ? "Estimaciones razonables. Seguí registrando tu tiempo real."
                    : "Tus estimaciones varían bastante. El sistema aprenderá con más datos."}
              </p>
            </div>
          ) : (
            <p className="text-xs text-text-3">
              Completá más tareas para ver tu precisión de estimación.
            </p>
          )}
        </Card>
      )}

      {/* Stats */}
      <Card hover={false}>
        <h2 className="text-sm font-bold text-text-1 mb-3">Estadísticas</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3.5 rounded-xl bg-bg-subtle">
            <Flame className="w-5 h-5 text-warning mx-auto mb-1.5" />
            <p className="text-lg font-bold text-text-1 tabular-nums">{streak.currentStreak}</p>
            <p className="text-[10px] text-text-3">Racha</p>
          </div>
          <div className="text-center p-3.5 rounded-xl bg-bg-subtle">
            <Trophy className="w-5 h-5 text-accent mx-auto mb-1.5" />
            <p className="text-lg font-bold text-text-1 tabular-nums">{completedCount}</p>
            <p className="text-[10px] text-text-3">Completadas</p>
          </div>
          <div className="text-center p-3.5 rounded-xl bg-bg-subtle">
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-lg font-bold text-text-1 tabular-nums">{Math.round(totalFocusMinutes / 60)}h</p>
            <p className="text-[10px] text-text-3">Enfocado</p>
          </div>
        </div>
      </Card>

      <Card hover={false}>
        <h2 className="text-sm font-bold text-text-1 mb-3">Preferencias</h2>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5"><Calendar className="w-4 h-4 text-text-3" /><span className="text-sm text-text-2">Horario</span></div>
          <span className="text-sm text-text-3 tabular-nums">8:00 — 22:00</span>
        </div>
      </Card>

      {/* Innovation Accounting - Internal Metrics */}
      <Card hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-text-1">Métricas de Producto</h2>
          <Badge className="text-[9px]">interno</Badge>
        </div>
        <div className="space-y-2 text-xs">
          <MetricRow label="Tareas creadas" value={metrics.tasksCreated} />
          <MetricRow label="Tareas completadas" value={metrics.tasksCompleted} />
          <MetricRow label="Tasa de completado" value={metrics.tasksCreated > 0 ? `${Math.round((metrics.tasksCompleted / metrics.tasksCreated) * 100)}%` : "—"} />
          <div className="border-t border-border my-2" />
          <MetricRow label="Coach IA requests" value={metrics.coachRequests} />
          <MetricRow label="Auto-schedules" value={metrics.scheduleRuns} />
          <MetricRow label="Focus sessions" value={metrics.focusSessionsCompleted} />
          <div className="border-t border-border my-2" />
          <MetricRow label="Pricing page views" value={metrics.pricingPageViews} />
          <MetricRow label="Upgrade clicks" value={metrics.upgradeClicks} />
          <MetricRow label="Conversión intención" value={metrics.pricingPageViews > 0 ? `${Math.round((metrics.upgradeClicks / metrics.pricingPageViews) * 100)}%` : "—"} />
          <div className="border-t border-border my-2" />
          <MetricRow label="Share clicks" value={metrics.shareClicks} />
          <MetricRow label="NPS score" value={metrics.npsScore ?? "—"} />
          <MetricRow label="Días activos" value={metrics.daysActive} />
        </div>
      </Card>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-text-2">{label}</span>
      <span className="text-text-1 font-mono tabular-nums font-semibold">{value}</span>
    </div>
  );
}
