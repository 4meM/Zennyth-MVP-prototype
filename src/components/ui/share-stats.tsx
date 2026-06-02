"use client";

import { useZenStore } from "@/lib/store";
import { Button } from "./button";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

export function ShareStats() {
  const { user, streak, tasks, totalFocusMinutes, metrics, trackEvent } =
    useZenStore();
  const [copied, setCopied] = useState(false);

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;

  const shareText = [
    `${user.name} usa Zennyth para estudiar mejor`,
    `${streak.currentStreak} días de racha`,
    `${completedCount} tareas completadas`,
    `${Math.round(totalFocusMinutes / 60)}h de estudio enfocado`,
    "",
    "Prueba gratis: zennyth.app",
  ].join("\n");

  const handleShare = async () => {
    trackEvent("shareClicks");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mis stats en Zennyth",
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (completedCount === 0) return null;

  return (
    <Button variant="ghost" size="sm" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-accent" />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Compartir stats
        </>
      )}
    </Button>
  );
}
