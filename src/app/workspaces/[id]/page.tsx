"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Sparkles } from "lucide-react";

export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const workspace = useWorkspaceStore((s) =>
    s.workspaces.find((w) => w.id === id)
  );
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  // Mark this workspace as active on mount (for PR #4b which will read it).
  useEffect(() => {
    if (id) {
      setActiveWorkspace(id);
    }
    return () => {
      // Don't clear on unmount — keep selection persistent.
    };
  }, [id, setActiveWorkspace]);

  // Workspace not found in store (e.g., direct URL access without joining)
  if (!workspace) {
    return (
      <div className="animate-fade-in space-y-6 pb-12">
        <Link href="/workspaces">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            Workspaces
          </Button>
        </Link>
        <Card hover={false} className="text-center py-12 px-6">
          <div className="w-14 h-14 rounded-2xl bg-bg-subtle flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-text-3" />
          </div>
          <h2 className="text-lg font-bold text-text-1 mb-2">
            No encontramos este workspace
          </h2>
          <p className="text-sm text-text-2 max-w-sm mx-auto leading-relaxed">
            Es posible que lo hayas dejado, o que el código no corresponda a
            este dispositivo. Volvé a la lista para ver tus workspaces activos.
          </p>
          <div className="mt-5">
            <Link href="/workspaces">
              <Button size="sm">
                Ver mis workspaces
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const memberCount = workspace.members.length;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <Link href="/workspaces">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspaces
        </Button>
      </Link>

      {/* Header placeholder — full workspace header ships in PR #4b */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-text-1 truncate">
                {workspace.name}
              </h1>
              <div className="flex items-center gap-2.5 mt-1 text-xs text-text-2">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                </span>
                <span className="text-text-3">·</span>
                <span className="font-mono">{workspace.joinCode}</span>
              </div>
            </div>
          </div>
        </div>
        <Badge variant="premium">
          <Sparkles className="w-3 h-3" />
          Grupo
        </Badge>
      </div>

      {/* Board placeholder — full board with kanban columns ships in PR #4b */}
      <Card hover={false} className="text-center py-16 px-6">
        <div className="w-12 h-12 rounded-2xl bg-primary-subtle flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-base font-bold text-text-1 mb-1.5">
          El tablero compartido llega pronto
        </h2>
        <p className="text-sm text-text-2 max-w-md mx-auto leading-relaxed">
          Acá vas a ver las tareas del grupo, dividir trabajo entre los miembros
          y celebrar los logros colectivos. Estamos puliendo los detalles.
        </p>
      </Card>
    </div>
  );
}
