import { Task, CalendarEvent, TaskStatus } from "@/types";

// ─── WSJF Priority ───────────────────────────────────────────────
export const calculateWSJFPriority = (
  gradeImpact: number,
  urgency: number,
  risk: number,
  timeRequired: number
): number => {
  if (timeRequired <= 0) return 0;
  const score = (gradeImpact + urgency * 1.5 + risk) / timeRequired;
  return parseFloat(score.toFixed(2));
};

// ─── Energy Zones ────────────────────────────────────────────────
// Cognitive energy follows a predictable curve throughout the day.
// We use this to place high-priority tasks in peak hours.
type EnergyLevel = "peak" | "high" | "moderate" | "low";

interface EnergyZone {
  startHour: number;
  endHour: number;
  level: EnergyLevel;
  multiplier: number; // Priority boost for this zone
}

const ENERGY_ZONES: EnergyZone[] = [
  { startHour: 8, endHour: 10, level: "peak", multiplier: 1.5 },
  { startHour: 10, endHour: 12, level: "high", multiplier: 1.25 },
  { startHour: 12, endHour: 14, level: "low", multiplier: 0.7 }, // Post-lunch dip
  { startHour: 14, endHour: 16, level: "moderate", multiplier: 1.0 },
  { startHour: 16, endHour: 18, level: "high", multiplier: 1.15 }, // Second wind
  { startHour: 18, endHour: 20, level: "moderate", multiplier: 0.9 },
  { startHour: 20, endHour: 22, level: "low", multiplier: 0.6 },
];

function getEnergyZone(hour: number): EnergyZone {
  return (
    ENERGY_ZONES.find((z) => hour >= z.startHour && hour < z.endHour) ??
    ENERGY_ZONES[ENERGY_ZONES.length - 1]
  );
}

// ─── Constants ───────────────────────────────────────────────────
const MAX_BLOCK_MINUTES = 50; // Pomodoro-inspired: max 50min per block
const BREAK_MINUTES = 10; // Break between study blocks
const MAX_STUDY_HOURS_PER_DAY = 6; // Realistic cap to avoid burnout
const SLOT_STEP_MINUTES = 15; // Search granularity (finer than 30min)

// ─── Collision Detection ─────────────────────────────────────────
function hasCollision(
  start: Date,
  end: Date,
  events: { start: Date; end: Date }[]
): boolean {
  return events.some(
    (evt) =>
      (start >= evt.start && start < evt.end) ||
      (end > evt.start && end <= evt.end) ||
      (start <= evt.start && end >= evt.end)
  );
}

// ─── Smart Schedule Generator ────────────────────────────────────
export const generateSchedule = (
  tasks: Task[],
  fixedEvents: CalendarEvent[],
  dayStartHour: number = 8,
  dayEndHour: number = 22
): { scheduledTasks: Task[]; studyBlocks: CalendarEvent[] } => {
  const pendingTasks = tasks
    .filter(
      (t) =>
        t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE
    )
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  if (pendingTasks.length === 0) {
    return { scheduledTasks: [], studyBlocks: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const studyBlocks: CalendarEvent[] = [];
  const scheduledTasks: Task[] = [];

  // Parse fixed events once
  const parsedFixed = fixedEvents.map((e) => ({
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  let totalScheduledMinutes = 0;
  const maxMinutes = MAX_STUDY_HOURS_PER_DAY * 60;

  // Separate tasks by priority for energy-aware placement
  const highPriority = pendingTasks.filter((t) => t.calculatedPriority > 10);
  const medPriority = pendingTasks.filter(
    (t) => t.calculatedPriority > 5 && t.calculatedPriority <= 10
  );
  const lowPriority = pendingTasks.filter((t) => t.calculatedPriority <= 5);

  // Order: high-priority gets peak hours, then medium, then low
  const orderedTasks = [...highPriority, ...medPriority, ...lowPriority];

  for (const task of orderedTasks) {
    if (totalScheduledMinutes >= maxMinutes) break;

    const totalTaskMinutes = task.metrics.timeRequired * 60;

    // Fragment long tasks into Pomodoro-sized blocks
    const blockCount = Math.ceil(totalTaskMinutes / MAX_BLOCK_MINUTES);
    const minutesPerBlock = Math.min(totalTaskMinutes, MAX_BLOCK_MINUTES);

    let blocksPlaced = 0;
    let firstBlockStart: Date | null = null;
    let lastBlockEnd: Date | null = null;

    for (let blockIdx = 0; blockIdx < blockCount; blockIdx++) {
      if (totalScheduledMinutes >= maxMinutes) break;

      const thisBlockMinutes =
        blockIdx === blockCount - 1
          ? totalTaskMinutes - blocksPlaced * MAX_BLOCK_MINUTES
          : minutesPerBlock;

      if (thisBlockMinutes <= 0) break;

      const blockDurationMs = thisBlockMinutes * 60 * 1000;

      // Determine preferred search range based on task priority
      const isHighPri = task.calculatedPriority > 10;
      const preferredStart = isHighPri ? dayStartHour : dayStartHour;
      const preferredEnd = dayEndHour;

      const searchPointer = new Date(today);
      searchPointer.setHours(preferredStart, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(preferredEnd, 0, 0, 0);

      let placed = false;

      while (searchPointer.getTime() + blockDurationMs <= endOfDay.getTime()) {
        const potentialEnd = new Date(
          searchPointer.getTime() + blockDurationMs
        );

        // Collect all occupied slots (fixed + already scheduled + breaks)
        const allOccupied = [
          ...parsedFixed,
          ...studyBlocks.map((b) => ({
            start: new Date(b.start),
            end: new Date(b.end),
          })),
        ];

        if (!hasCollision(searchPointer, potentialEnd, allOccupied)) {
          // Score this slot by energy level
          const hour = searchPointer.getHours();
          const zone = getEnergyZone(hour);

          // For high priority tasks, prefer peak energy zones
          // For low priority, accept any zone
          if (isHighPri && zone.level === "low" && blocksPlaced === 0) {
            // Skip low-energy zones for first block of high-priority tasks
            searchPointer.setMinutes(
              searchPointer.getMinutes() + SLOT_STEP_MINUTES
            );
            continue;
          }

          // Place the study block
          const studyBlock: CalendarEvent = {
            id: `block-${task.id}-${blockIdx}`,
            title:
              blockCount > 1
                ? `Focus: ${task.title} (${blockIdx + 1}/${blockCount})`
                : `Focus: ${task.title}`,
            start: new Date(searchPointer).toISOString(),
            end: potentialEnd.toISOString(),
            isFixed: false,
            type: "STUDY_BLOCK",
          };

          studyBlocks.push(studyBlock);

          // Add a break after this block (if not the last block of the day)
          if (thisBlockMinutes >= 30) {
            const breakStart = new Date(potentialEnd);
            const breakEnd = new Date(
              breakStart.getTime() + BREAK_MINUTES * 60 * 1000
            );

            if (breakEnd <= endOfDay) {
              studyBlocks.push({
                id: `break-${task.id}-${blockIdx}`,
                title: "Descanso",
                start: breakStart.toISOString(),
                end: breakEnd.toISOString(),
                isFixed: false,
                type: "PERSONAL",
              });
            }
          }

          if (!firstBlockStart) firstBlockStart = new Date(searchPointer);
          lastBlockEnd = potentialEnd;
          blocksPlaced++;
          totalScheduledMinutes += thisBlockMinutes;
          placed = true;
          break;
        }

        searchPointer.setMinutes(
          searchPointer.getMinutes() + SLOT_STEP_MINUTES
        );
      }

      if (!placed) break; // No more room today
    }

    // Record the task as scheduled with first/last block times
    if (blocksPlaced > 0 && firstBlockStart && lastBlockEnd) {
      scheduledTasks.push({
        ...task,
        scheduledStart: firstBlockStart.toISOString(),
        scheduledEnd: lastBlockEnd.toISOString(),
      });
    }
  }

  return { scheduledTasks, studyBlocks };
};

// ─── Schedule Summary ────────────────────────────────────────────
// Used by AI coach to understand the schedule
export function getScheduleSummary(studyBlocks: CalendarEvent[]): string {
  const blocks = studyBlocks.filter((b) => b.type === "STUDY_BLOCK");
  const totalMinutes = blocks.reduce((sum, b) => {
    const dur =
      (new Date(b.end).getTime() - new Date(b.start).getTime()) / 60000;
    return sum + dur;
  }, 0);
  const breaks = studyBlocks.filter((b) => b.id.startsWith("break-")).length;

  return `${blocks.length} bloques de estudio (${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m total), ${breaks} descansos programados`;
}
