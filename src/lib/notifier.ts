import { NotificationSettings, Task, TaskStatus } from "@/types";
import { todayStr } from "./utils";

/**
 * Check if it's time to show the daily notification banner.
 * Returns true if current time matches the configured notification time
 * and we haven't already notified today.
 */
export function checkNotificationTime(
  settings: NotificationSettings,
  tasks: Task[]
): { shouldShow: boolean; message: string } {
  if (!settings.enabled) {
    return { shouldShow: false, message: "" };
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [targetHour, targetMinute] = settings.time.split(":").map(Number);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if we're within 1 minute of the target time
  const timeMatch =
    currentHour === targetHour && Math.abs(currentMinute - targetMinute) <= 1;

  // Don't show if already notified today
  if (settings.lastNotifiedDate === todayStr()) {
    return { shouldShow: false, message: "" };
  }

  if (!timeMatch) {
    return { shouldShow: false, message: "" };
  }

  // Build the message
  const pendingTasks = tasks.filter(
    (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE
  );

  if (pendingTasks.length === 0) {
    return {
      shouldShow: true,
      message: "Mañana libre — sin tareas pendientes.",
    };
  }

  const totalHours = pendingTasks.reduce(
    (sum, t) => sum + t.metrics.timeRequired,
    0
  );
  const hoursStr =
    totalHours >= 1
      ? `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}min`
      : `${Math.round(totalHours * 60)}min`;

  return {
    shouldShow: true,
    message: `Mañana listo. ${pendingTasks.length} tarea${pendingTasks.length !== 1 ? "s" : ""}, ${hoursStr} totales. Duerme tranquilo.`,
  };
}

/**
 * Send a browser notification using the Notification API.
 * Returns true if notification was sent, false otherwise.
 */
export function sendBrowserNotification(title: string, body: string): boolean {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
    return true;
  }

  return false;
}

/**
 * Mark that we've notified today so we don't show again.
 */
export function markNotifiedToday(): string {
  return todayStr();
}
