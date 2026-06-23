"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type MemberBadgeVariant = "default" | "self" | "unassigned";

interface MemberBadgeProps {
  /** Member display name. Pass `undefined` to render the "unassigned" state. */
  name?: string;
  /** "self" highlights the local user; "unassigned" surfaces a calm empty state. */
  variant?: MemberBadgeVariant;
  className?: string;
}

/**
 * Tiny badge used in the group-task card and workspace header to surface
 * ownership without resorting to red or blame-y color. Defaults to a quiet
 * neutral background; "self" gets a soft primary tint; `name === undefined`
 * renders a calm "Sin asignar" placeholder.
 */
export function MemberBadge({ name, variant, className }: MemberBadgeProps) {
  // Auto-detect unassigned when name is missing.
  const resolved: MemberBadgeVariant =
    variant ?? (name ? "default" : "unassigned");

  if (resolved === "unassigned") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
          "bg-bg-subtle text-text-3 italic",
          className
        )}
      >
        <User className="w-2.5 h-2.5" />
        Sin asignar
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold",
        resolved === "self"
          ? "bg-primary-subtle text-primary"
          : "bg-bg-subtle text-text-2",
        className
      )}
    >
      <User className="w-2.5 h-2.5" />
      {name}
    </span>
  );
}
