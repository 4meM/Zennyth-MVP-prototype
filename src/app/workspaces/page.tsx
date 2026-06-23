"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceDialog } from "@/components/workspaces/create-workspace-dialog";
import { JoinWorkspaceDialog } from "@/components/workspaces/join-workspace-dialog";
import { Plus, LogIn, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkspacesPage() {
  const { workspaces } = useWorkspaceStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const hasWorkspaces = workspaces.length > 0;

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinWorkspaceDialog open={joinOpen} onClose={() => setJoinOpen(false)} />

      <div>
        <h1 className="text-2xl font-bold text-text-1 flex items-center gap-2.5">
          <Users className="w-6 h-6 text-primary" />
          Workspaces
        </h1>
        <p className="text-sm text-text-2 mt-1">
          Coordiná tareas con tu grupo de estudio
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => setCreateOpen(true)} className="flex-1 sm:flex-none">
          <Plus className="w-3.5 h-3.5" />
          Crear workspace
        </Button>
        <Button variant="secondary" onClick={() => setJoinOpen(true)} className="flex-1 sm:flex-none">
          <LogIn className="w-3.5 h-3.5" />
          Unirme con código
        </Button>
      </div>

      {!hasWorkspaces && (
        <Card hover={false} className="text-center py-12 px-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-subtle flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-1 mb-2">
            No tienes workspaces
          </h2>
          <p className="text-sm text-text-2 max-w-sm mx-auto leading-relaxed">
            Creá uno para coordinar tareas con tu grupo, o unite a uno que ya
            exista con el código que te pasaron.
          </p>
        </Card>
      )}

      {hasWorkspaces && (
        <div className="space-y-3">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/workspaces/${ws.id}`} className="block group">
              <Card className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base font-bold text-white flex-shrink-0">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-text-1 truncate group-hover:text-primary transition-colors">
                      {ws.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-text-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ws.members.length} {ws.members.length === 1 ? "miembro" : "miembros"}
                      </span>
                      <span className="font-mono text-text-3">
                        {ws.joinCode}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight
                  className={cn(
                    "w-4 h-4 text-text-3 flex-shrink-0",
                    "group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  )}
                />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
