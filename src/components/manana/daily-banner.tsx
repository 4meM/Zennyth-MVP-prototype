"use client";

import { useEffect, useState } from "react";
import { useZenStore } from "@/lib/store";
import { checkNotificationTime, sendBrowserNotification, markNotifiedToday } from "@/lib/notifier";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyBanner() {
  const { tasks, notificationSettings, setNotificationSettings } = useZenStore();
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const interval = setInterval(() => {
      const result = checkNotificationTime(notificationSettings, tasks);

      if (result.shouldShow && !showBanner) {
        setShowBanner(true);
        setMessage(result.message);

        // Try browser notification too
        sendBrowserNotification("Zennyth", result.message);

        // Mark as notified so we don't show again today
        setNotificationSettings({
          lastNotifiedDate: markNotifiedToday(),
        });
      }
    }, 60_000); // Check every minute

    return () => clearInterval(interval);
  }, [notificationSettings.enabled, notificationSettings.time, notificationSettings.lastNotifiedDate, tasks]);

  if (!showBanner) return null;

  return (
    <Card
      hover={false}
      className={cn(
        "py-3 px-4 bg-primary-subtle border-primary/15 animate-fade-in-up",
        "flex items-start gap-3"
      )}
      role="status"
      aria-live="polite"
    >
      <Bell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <p className="text-sm text-text-1 flex-1">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowBanner(false)}
        className="flex-shrink-0 -mt-1 -mr-1"
        aria-label="Cerrar notificación"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </Card>
  );
}
