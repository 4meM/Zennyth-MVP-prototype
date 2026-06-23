"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspaces/workspace-header";
import { WorkspaceBoard } from "@/components/workspaces/workspace-board";

export default function WorkspaceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const workspace = useWorkspaceStore((s) =>
    s.workspaces.find((w) => w.id === id)
  );
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  // Mark this workspace as active on mount.
  useEffect(() => {
    if (id) {
      setActiveWorkspace(id);
    }
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

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <Link href="/workspaces">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="w-3.5 h-3.5" />
          Workspaces
        </Button>
      </Link>

      <WorkspaceHeader workspaceId={id} />
      <WorkspaceBoard workspaceId={id} />
    </div>
  );
}
