"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useZenStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Copy, Check, X, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

type Phase = "form" | "created";

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const { user, tier } = useZenStore();
  const { createWorkspace, canCreateWorkspace } = useWorkspaceStore();

  const [name, setName] = useState("");
  const [memberName, setMemberName] = useState(user.name);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const allowed = canCreateWorkspace(tier);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setMemberName(user.name);
      setError(null);
      setPhase("form");
      setCreatedCode(null);
      setCreatedId(null);
      setCopied(false);
    }
  }, [open, user.name]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    const trimmedMember = memberName.trim();
    if (!trimmedName) {
      setError("Ponle un nombre a tu workspace");
      return;
    }
    if (!trimmedMember) {
      setError("Tu nombre es necesario para identificarte en el grupo");
      return;
    }
    if (!allowed) {
      setError("Llegaste al límite de workspaces en Free");
      return;
    }
    const id = createWorkspace(trimmedName, trimmedMember);
    const ws = useWorkspaceStore.getState().workspaces.find((w) => w.id === id);
    if (!ws) {
      setError("No pudimos crear el workspace. Intentá de nuevo");
      return;
    }
    setCreatedCode(ws.joinCode);
    setCreatedId(id);
    setPhase("created");
  };

  const handleCopy = async () => {
    if (!createdCode) return;
    try {
      await navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available; user can copy manually
    }
  };

  const handleGoToWorkspace = () => {
    if (createdId) {
      onClose();
      router.push(`/workspaces/${createdId}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
    >
      <Card
        hover={false}
        className="max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <h2 id="create-workspace-title" className="text-lg font-bold text-text-1">
              {phase === "form" ? "Crear workspace" : "Workspace creado"}
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

        {phase === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!allowed && (
              <div className="rounded-xl bg-warning-subtle border border-warning/15 p-3 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-text-2">
                  Llegaste al límite de workspaces en el plan Free. Upgrade a Pro para crear más.
                </p>
              </div>
            )}
            <Input
              id="workspace-name"
              label="Nombre del workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Grupo de Cálculo"
              error={error && !name.trim() ? error : undefined}
              maxLength={60}
              autoFocus
            />
            <Input
              id="member-name"
              label="Tu nombre en el grupo"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Cómo te van a ver los demás"
              error={error && name.trim() && !memberName.trim() ? error : undefined}
              maxLength={40}
            />
            {error && name.trim() && memberName.trim() && (
              <p className="text-xs text-danger" role="alert">{error}</p>
            )}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={!allowed}>
                Crear
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-2">
              Compartí este código con tu grupo para que se unan. Lo necesitarán además de los datos del workspace.
            </p>
            <div className="rounded-xl bg-bg-subtle border border-border p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-3 font-semibold">
                  Código
                </p>
                <p className="text-2xl font-bold text-text-1 font-mono tracking-widest mt-1">
                  {createdCode}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                aria-label="Copiar código"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-accent" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <p className={cn("text-xs text-text-3")}>
              En la próxima versión podrás exportar el estado completo del workspace para que tu grupo lo importe.
            </p>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cerrar
              </Button>
              <Button type="button" onClick={handleGoToWorkspace} className="flex-1">
                Ir al workspace
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
