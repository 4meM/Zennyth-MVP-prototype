"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useZenStore } from "@/lib/store";
import { estimateMetrics, createTaskWithEstimation } from "@/lib/estimator";
import { calculateWSJFPriority } from "@/lib/scheduler";
import { getAdjustedEstimate } from "@/lib/learning-engine";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Sparkles, ChevronDown, ChevronUp, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TIME_OPTIONS = [
  { label: "30min", value: 0.5 }, { label: "1h", value: 1 }, { label: "2h", value: 2 },
  { label: "3h", value: 3 }, { label: "5h", value: 5 }, { label: "8h+", value: 8 },
];

export default function NewTaskPage() {
  const router = useRouter();
  const { addTask, tasks, subjectLearning } = useZenStore();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [timeRequired, setTimeRequired] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gradeImpact, setGradeImpact] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<number | null>(null);
  const [risk, setRisk] = useState<number | null>(null);

  const subjectHistory = [...new Set(tasks.map((t) => t.subject).filter(Boolean))];

  // Infer time from learning engine if subject has history
  const inferredTime = subject && subjectLearning
    ? getAdjustedEstimate(subjectLearning, subject, 2) // default 2h baseline
    : null;

  // Use inferred time or default 2h if no manual time set
  const effectiveTime = timeRequired ?? inferredTime ?? 2;

  const estimated = deadline && title
    ? estimateMetrics(deadline, effectiveTime, subject || undefined, tasks, subjectLearning)
    : null;
  const previewPriority = estimated
    ? calculateWSJFPriority(gradeImpact ?? estimated.gradeImpact, urgency ?? estimated.urgency, risk ?? estimated.risk, effectiveTime)
    : 0;

  const canSubmit = title.trim() && deadline;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const customMetrics = showAdvanced && (gradeImpact !== null || urgency !== null || risk !== null)
      ? { gradeImpact: gradeImpact ?? estimated!.gradeImpact, urgency: urgency ?? estimated!.urgency, risk: risk ?? estimated!.risk }
      : undefined;
    addTask(title, deadline, effectiveTime, subject || undefined, customMetrics);
    setSuccess(true);
    setTimeout(() => router.push("/"), 1200);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-accent-subtle flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-text-1 mb-1">Tarea Creada</h2>
        <p className="text-sm text-text-2">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="Volver"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold text-text-1">Nueva Tarea</h1>
          <p className="text-xs text-text-2">Solo lo esencial, calculamos el resto</p>
        </div>
      </div>

      <Card hover={false} className="space-y-5">
        {/* Quick-add mode: title + deadline only */}
        <Input id="title" label="Nombre de la tarea" placeholder="ej. Estudiar para parcial de Cálculo" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />

        <Input id="deadline" label="Fecha límite" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().split("T")[0]} />

        {/* Optional fields — progressive disclosure */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors cursor-pointer py-1"
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Campos opcionales
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-3 border-l-2 border-border animate-fade-in">
            <div className="space-y-1.5">
              <label htmlFor="subject" className="block text-xs font-semibold text-text-2 uppercase tracking-wider">Materia</label>
              <input
                id="subject"
                className="w-full rounded-xl bg-bg-subtle border border-border px-4 py-3 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 min-h-[44px]"
                placeholder="ej. Cálculo, Física"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                list="subjects"
              />
              {subjectHistory.length > 0 && (
                <datalist id="subjects">
                  {subjectHistory.map((s) => <option key={s} value={s!} />)}
                </datalist>
              )}
            </div>

            {/* Time estimation — with learning indicator */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Tiempo estimado
                {inferredTime && (
                  <Badge variant="accent" className="text-[9px] px-1.5 py-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    auto
                  </Badge>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimeRequired(opt.value)}
                    className={cn(
                      "px-3.5 py-2.5 rounded-xl text-xs font-semibold min-h-[44px] min-w-[48px]",
                      "transition-all duration-200 cursor-pointer active:scale-[0.95]",
                      timeRequired === opt.value
                        ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
                        : "bg-surface text-text-2 border border-border hover:bg-surface-hover"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {inferredTime && !timeRequired && (
                <p className="text-[10px] text-text-3">
                  Estimado automáticamente: {inferredTime.toFixed(1)}h basado en tu historial
                </p>
              )}
            </div>

            {/* Estimated priority preview */}
            {estimated && (
              <div className="rounded-xl bg-bg-subtle border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Prioridad auto-estimada
                  </span>
                  <span className="text-xl font-bold text-primary tabular-nums">{previewPriority}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge>Impacto: {gradeImpact ?? estimated.gradeImpact}</Badge>
                  <Badge>Urgencia: {urgency ?? estimated.urgency}</Badge>
                  <Badge>Riesgo: {risk ?? estimated.risk}</Badge>
                </div>
              </div>
            )}

            {/* Manual priority sliders */}
            <button
              onClick={() => {
                // Toggle a nested advanced section
                const el = document.getElementById("manual-priority");
                if (el) el.classList.toggle("hidden");
              }}
              className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-2 transition-colors cursor-pointer py-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Ajustar prioridad manualmente
            </button>

            <div id="manual-priority" className="hidden space-y-4">
              {estimated && (
                <>
                  <SliderField label="Impacto en nota" value={gradeImpact ?? estimated.gradeImpact} onChange={setGradeImpact} id="grade-impact" />
                  <SliderField label="Urgencia" value={urgency ?? estimated.urgency} onChange={setUrgency} id="urgency" />
                  <SliderField label="Riesgo" value={risk ?? estimated.risk} onChange={setRisk} id="risk" />
                </>
              )}
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="w-full">
          <Check className="w-4 h-4" />
          Crear Tarea
        </Button>
      </Card>
    </div>
  );
}

function SliderField({ label, value, onChange, id }: { label: string; value: number; onChange: (v: number) => void; id: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs text-text-2">{label}</label>
        <span className="text-xs font-mono text-text-1 tabular-nums">{value}</span>
      </div>
      <input id={id} type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--color-primary)] h-1.5" aria-valuenow={value} aria-valuemin={1} aria-valuemax={10} aria-label={label} />
    </div>
  );
}
