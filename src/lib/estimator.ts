import { Task, WSJFMetrics, TaskStatus, SubjectLearningRecord } from "@/types";
import { daysUntil } from "./utils";
import { calculateWSJFPriority } from "./scheduler";
import { getAdjustedEstimate } from "./learning-engine";

/**
 * Estimates WSJF metrics automatically from simple inputs,
 * so the user doesn't need to manually set 4 sliders.
 */
export function estimateMetrics(
  deadline: string,
  timeRequired: number,
  subject: string | undefined,
  existingTasks: Task[],
  subjectLearning?: Record<string, SubjectLearningRecord>
): WSJFMetrics {
  const urgency = estimateUrgency(deadline);
  const gradeImpact = estimateGradeImpact(subject, existingTasks);
  const risk = estimateRisk(deadline, timeRequired, subject, existingTasks);

  // Apply learning-based adjustment if available
  const adjustedTime =
    subject && subjectLearning
      ? getAdjustedEstimate(subjectLearning, subject, timeRequired)
      : timeRequired;

  return {
    gradeImpact,
    urgency,
    risk,
    timeRequired: parseFloat(adjustedTime.toFixed(2)),
  };
}

function estimateUrgency(deadline: string): number {
  const days = daysUntil(deadline);
  if (days <= 0) return 10; // overdue
  if (days === 1) return 9;
  if (days <= 3) return 8;
  if (days <= 5) return 6;
  if (days <= 7) return 4;
  if (days <= 14) return 3;
  return Math.max(1, 10 - days);
}

function estimateGradeImpact(
  subject: string | undefined,
  existingTasks: Task[]
): number {
  if (!subject) return 6; // sensible default

  // Average grade impact from same subject tasks
  const sameSub = existingTasks.filter(
    (t) => t.subject?.toLowerCase() === subject.toLowerCase()
  );

  if (sameSub.length === 0) return 6;

  const avg =
    sameSub.reduce((sum, t) => sum + t.metrics.gradeImpact, 0) / sameSub.length;
  return Math.round(avg);
}

function estimateRisk(
  deadline: string,
  timeRequired: number,
  subject: string | undefined,
  existingTasks: Task[]
): number {
  let risk = 4; // base risk

  // Time pressure: high time + close deadline = high risk
  const days = daysUntil(deadline);
  if (days > 0) {
    const hoursAvailable = days * 6; // ~6 productive hours/day
    const ratio = timeRequired / hoursAvailable;
    if (ratio > 0.5) risk += 3;
    else if (ratio > 0.3) risk += 2;
    else if (ratio > 0.15) risk += 1;
  } else {
    risk += 4; // overdue = high risk
  }

  // History: if this subject has had overdue tasks, add risk
  if (subject) {
    const overdueInSubject = existingTasks.filter(
      (t) =>
        t.subject?.toLowerCase() === subject.toLowerCase() &&
        t.status === TaskStatus.OVERDUE
    );
    if (overdueInSubject.length > 0) risk += 2;
  }

  return Math.min(10, Math.max(1, risk));
}

export function createTaskWithEstimation(
  title: string,
  deadline: string,
  timeRequired: number,
  subject: string | undefined,
  existingTasks: Task[],
  subjectLearning?: Record<string, SubjectLearningRecord>
): { metrics: WSJFMetrics; calculatedPriority: number } {
  const metrics = estimateMetrics(deadline, timeRequired, subject, existingTasks, subjectLearning);
  const calculatedPriority = calculateWSJFPriority(
    metrics.gradeImpact,
    metrics.urgency,
    metrics.risk,
    metrics.timeRequired
  );
  return { metrics, calculatedPriority };
}
