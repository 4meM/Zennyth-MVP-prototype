"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useZenStore } from "@/lib/store";
import { useWorkspaceStore } from "@/lib/workspace-store";
import {
  deserializeSeedData,
  isValidJoinCode,
} from "@/lib/workspace-utils";
import { LogIn, X } from "lucide-react";

interface JoinWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function JoinWorkspaceDialog({ open, onClose }: JoinWorkspaceDialogProps) {
  const router = useRouter();
  const { user } = useZenStore();
  const { joinWorkspace } = useWorkspaceStore();

  const [code, setCode] = useState("");
  const [seed, setSeed] = useState("");
  const [memberName, setMemberName] = useState(user.name);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCode("");
      setSeed("");
      setMemberName(user.name);
      setError(null);
      setSubmitting(false);
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only alphanumerics, uppercase as user types (live feedback)
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(raw);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = memberName.trim();

    if (!trimmedCode) {
      setError("Ingresá el código de 6 caracteres que te compartió el grupo");
      return;
    }
    if (!isValidJoinCode(trimmedCode)) {
      setError("No encontramos el workspace");
      return;
    }
    if (!seed.trim()) {
      setError("Pegá los datos del workspace que te compartieron");
      return;
    }
    if (!trimmedName) {
      setError("Tu nombre es necesario para identificarte en el grupo");
      return;
    }

    setSubmitting(true);
    try {
      const seedData = deserializeSeedData(seed);
      joinWorkspace(trimmedCode, trimmedName, seedData);
      // After joining, active workspace is set by the store. Find it.
      const activeId = useWorkspaceStore.getState().activeWorkspaceId;
      onClose();
      if (activeId) {
        router.push(`/workspaces/${activeId}`);
      }
    } catch {
      // Any failure (invalid JSON, mismatched code, structural mismatch) →
      // same user-facing message per spec
      setError("No encontramos el workspace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-workspace-title"
    >
      <Card
        hover={false}
        className="max-w-md w-full p-6 animate-scale-in max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
              <LogIn className="w-4 h-4 text-accent" />
            </div>
            <h2 id="join-workspace-title" className="text-lg font-bold text-text-1">
              Unirse a un workspace
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-2">
            Pedile a quien creó el workspace que te pase el código y los datos del grupo.
          </p>

          <Input
            id="join-code"
            label="Código del workspace"
            value={code}
            onChange={handleCodeChange}
            placeholder="ABC123"
            maxLength={6}
              className="font-mono tracking-widest text-center text-lg"
              autoFocus
              autoCapitalize="characters"
              spellCheck={false}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="seed-data"
              className="block text-xs font-semibold text-text-2 uppercase tracking-wider"
            >
              Datos del workspace
            </label>
            <textarea
              id="seed-data"
              value={seed}
              onChange={(e) => {
                setSeed(e.target.value);
                if (error) setError(null);
              }}
              placeholder='Pegá acá el JSON con los datos del workspace'
              rows={4}
              className="w-full rounded-xl bg-bg-subtle border border-border px-4 py-3 text-xs text-text-1 placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 font-mono resize-y"
              spellCheck={false}
            />
            <p className="text-[10px] text-text-3">
              Lo que ves en el botón &quot;Compartir estado&quot; del workspace.
            </p>
          </div>

          <Input
            id="join-member-name"
            label="Tu nombre en el grupo"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Cómo te van a ver los demás"
            maxLength={40}
          />

          {error && (
            <p className="text-xs text-danger" role="alert">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? "..." : "Unirme"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
