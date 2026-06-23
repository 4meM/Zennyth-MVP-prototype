"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceStore } from "@/lib/workspace-store";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  FileText,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type {
  WorkspaceAttachment,
  WorkspaceAttachmentType,
} from "@/types/workspace";

interface WorkspaceResourcesProps {
  workspaceId: string;
}

const TYPE_OPTIONS: { value: WorkspaceAttachmentType; label: string }[] = [
  { value: "link", label: "Link" },
  { value: "gdrive", label: "Google Drive" },
];

/**
 * Shared resources section for a workspace. Lists links (or Google Drive
 * references) that the group can use to find shared notes, slides, or
 * folders. Pure local-first: the URL is stored as-is and rendered as an
 * anchor — we never fetch, scan, or sanitize the destination.
 *
 * The "Agregar link" affordance opens a compact inline form. No new
 * modal: the section is already a calm container, and the form is short
 * (name + URL + type), so a modal would add more noise than it removes.
 */
export function WorkspaceResources({ workspaceId }: WorkspaceResourcesProps) {
  const workspace = useWorkspaceStore((s) =>
    s.workspaces.find((w) => w.id === workspaceId)
  );
  const addAttachment = useWorkspaceStore((s) => s.addAttachment);
  const removeAttachment = useWorkspaceStore((s) => s.removeAttachment);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<WorkspaceAttachmentType>("link");

  if (!workspace) return null;

  const attachments: WorkspaceAttachment[] = workspace.attachments ?? [];
  const currentMember = workspace.members[workspace.members.length - 1];
  const currentMemberId = currentMember?.id;

  const reset = () => {
    setName("");
    setUrl("");
    setType("link");
  };

  const cancel = () => {
    setAdding(false);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl || !currentMemberId) return;
    addAttachment(workspaceId, {
      name: trimmedName,
      url: trimmedUrl,
      type,
      addedBy: currentMemberId,
    });
    reset();
    setAdding(false);
  };

  return (
    <Card hover={false} className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-bg-subtle flex items-center justify-center">
            <FileText className="w-4 h-4 text-text-2" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-1">
              Materiales del grupo
            </h2>
            <p className="text-[11px] text-text-3">
              Links compartidos, apuntes, drives del grupo.
            </p>
          </div>
        </div>
        {!adding && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar link
          </Button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-bg-subtle/40 p-3 mb-4 space-y-2.5 animate-fade-in"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-text-2">
              Nuevo material
            </p>
            <button
              type="button"
              onClick={cancel}
              aria-label="Cerrar formulario"
              className="text-text-3 hover:text-text-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <Input
            id="attachment-name"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Apuntes de Cálculo"
            maxLength={80}
            autoFocus
          />
          <Input
            id="attachment-url"
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            maxLength={500}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="attachment-type"
              className="block text-xs font-semibold text-text-2 uppercase tracking-wider"
            >
              Tipo
            </label>
            <select
              id="attachment-type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as WorkspaceAttachmentType)
              }
              className="w-full rounded-xl bg-bg-subtle border border-border px-4 py-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 min-h-[44px] cursor-pointer"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={cancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!name.trim() || !url.trim()}
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </form>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-6 opacity-60">
          <Link2 className="w-7 h-7 text-text-3 mx-auto mb-2" />
          <p className="text-xs text-text-3 font-medium leading-relaxed max-w-xs mx-auto">
            Sin materiales todavía. Sumá el primer link para que el grupo
            tenga dónde encontrar los apuntes.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {attachments.map((a) => (
            <AttachmentRow
              key={a.id}
              attachment={a}
              onRemove={() => removeAttachment(workspaceId, a.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

// ── Attachment row ───────────────────────────────────────────────

interface AttachmentRowProps {
  attachment: WorkspaceAttachment;
  onRemove: () => void;
}

function AttachmentRow({ attachment, onRemove }: AttachmentRowProps) {
  const isGdrive = attachment.type === "gdrive";
  return (
    <li
      className={cn(
        "group flex items-center gap-2.5 p-2.5 rounded-lg",
        "bg-bg-subtle/50 hover:bg-bg-subtle transition-colors"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
          isGdrive
            ? "bg-accent-subtle text-accent"
            : "bg-primary-subtle text-primary"
        )}
        aria-hidden
      >
        {isGdrive ? (
          <FileText className="w-4 h-4" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-text-1 hover:text-primary transition-colors truncate flex items-center gap-1"
          title={attachment.name}
        >
          <span className="truncate">{attachment.name}</span>
          <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
        </a>
        <p className="text-[10px] text-text-3 truncate font-mono">
          {attachment.url}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Eliminar ${attachment.name}`}
        className="flex-shrink-0 w-8 h-8 rounded-md text-text-3 hover:text-danger hover:bg-danger-subtle transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}
