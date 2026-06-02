"use client";

import { useZenStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { formatTime, cn } from "@/lib/utils";
import { Clock } from "lucide-react";

const typeColors: Record<string, string> = {
  CLASS: "bg-primary",
  LAB: "bg-purple-400",
  STUDY_BLOCK: "bg-accent",
  PERSONAL: "bg-warning",
};

export function Timeline() {
  const { events } = useZenStore();
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-text-1">Timeline de Hoy</h2>
      </div>

      {sortedEvents.length === 0 ? (
        <p className="text-xs text-text-3 text-center py-6">Sin eventos programados</p>
      ) : (
        <div className="space-y-0.5">
          {sortedEvents.map((event) => {
            const startTime = formatTime(event.start);
            const durationHrs = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60);
            return (
              <div key={event.id} className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl hover:bg-bg-subtle transition-colors duration-150">
                <span className="text-xs text-text-3 w-10 font-mono tabular-nums flex-shrink-0">{startTime}</span>
                <div className={cn("w-2 h-2 rounded-full flex-shrink-0", typeColors[event.type])} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-2 truncate">{event.title}</p>
                </div>
                <span className="text-[10px] text-text-3 flex-shrink-0 tabular-nums">
                  {durationHrs < 1 ? `${Math.round(durationHrs * 60)}m` : `${durationHrs}h`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
