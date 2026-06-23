"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Split, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SplitTaskDialogProps {
  open: boolean;
  workspaceId: string;
  taskId: string;
  onClose: () => void;
}

const COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;
const DEFAULT_COUNT = 3;

/**
 * Modal that asks "¿en cuántas partes?" and calls `useWorkspaceStore.splitTask`
 * on confirm. The store overwrites any existing subtasks; the caller (the
 * task card) is responsible for hiding the trigger when subtasks already
 * exist to avoid accidental overwrites.
 */
export function SplitTaskDialog({
  open,
  workspaceId,
  taskId,
  onClose,
}: SplitTaskDialogProps) {
  const splitTask = useWorkspaceStore((s) => s.splitTask);
  const [count, setCount] = useState<number>(DEFAULT_COUNT);

  // Reset to default whenever the dialog re-opens.
  useEffect(() => {
    if (open) setCount(DEFAULT_COUNT);
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    splitTask(workspaceId, taskId, count);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="split-task-title"
    >
      <Card
        hover={false}
        className="max-w-sm w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
              <Split className="w-4 h-4 text-accent" />
            </div>
            <h2 id="split-task-title" className="text-lg font-bold text-text-1">
              Dividir entre el grupo
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-text-3 hover:text-text-1 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-2 mb-4">
          ¿En cuántas partes quieren dividir esta tarea? Cada parte la va a
          poder reclamar un miembro del grupo.
        </p>

        <div className="grid grid-cols-7 gap-1.5 mb-5" role="radiogroup" aria-label="Cantidad de partes">
          {COUNT_OPTIONS.map((n) => {
            const selected = n === count;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCount(n)}
                className={cn(
                  "py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  selected
                    ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
                    : "bg-bg-subtle text-text-2 hover:bg-surface-hover hover:text-text-1"
                )}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} className="flex-1">
            Dividir en {count}
          </Button>
        </div>
      </Card>
    </div>
  );
}
