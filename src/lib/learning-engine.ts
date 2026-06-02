import { SubjectLearningRecord } from "@/types";

/**
 * Pure functions for time estimation learning.
 * Rolling average of last 10 actual/estimated ratios per subject.
 */

export function getRecord(
  subjectLearning: Record<string, SubjectLearningRecord>,
  subject: string
): SubjectLearningRecord | undefined {
  if (!subject) return undefined;
  const key = subject.toLowerCase();
  return subjectLearning[key];
}

export function captureCompletion(
  subjectLearning: Record<string, SubjectLearningRecord>,
  subject: string,
  estimatedHours: number,
  actualHours: number
): Record<string, SubjectLearningRecord> {
  if (!subject || estimatedHours <= 0) return subjectLearning;

  const key = subject.toLowerCase();
  const ratio = actualHours / estimatedHours;
  const existing = subjectLearning[key] ?? {
    subject,
    ratios: [],
    totalCompletions: 0,
  };

  const newRatios = [...existing.ratios, ratio];
  if (newRatios.length > 10) {
    newRatios.shift(); // Keep only last 10
  }

  return {
    ...subjectLearning,
    [key]: {
      ...existing,
      subject,
      ratios: newRatios,
      totalCompletions: existing.totalCompletions + 1,
    },
  };
}

export function getAdjustedEstimate(
  subjectLearning: Record<string, SubjectLearningRecord>,
  subject: string,
  baseEstimateHours: number
): number {
  const record = getRecord(subjectLearning, subject);
  if (!record || record.ratios.length === 0) {
    return baseEstimateHours;
  }

  const avgRatio =
    record.ratios.reduce((sum, r) => sum + r, 0) / record.ratios.length;
  let adjusted = baseEstimateHours * avgRatio;

  // Spec: +15% buffer if fewer than 3 data points
  if (record.totalCompletions < 3) {
    adjusted *= 1.15;
  }

  return adjusted;
}

export function calculateAccuracy(
  subjectLearning: Record<string, SubjectLearningRecord>
): number | null {
  // Aggregate all ratios across all subjects (last 10 completions total)
  const allRatios: number[] = [];
  for (const key of Object.keys(subjectLearning)) {
    allRatios.push(...subjectLearning[key].ratios);
  }

  if (allRatios.length === 0) return null;

  // Accuracy = 1 - mean(|estimated - actual| / actual)
  // With ratio = actual/estimated, this becomes |ratio - 1| / ratio
  const errors = allRatios.map((r) => Math.abs(r - 1) / r);
  const meanError = errors.reduce((sum, e) => sum + e, 0) / errors.length;
  const accuracy = 1 - meanError;

  return Math.max(0, Math.min(1, accuracy)); // Clamp to [0, 1]
}

export function getOverallCompletionCount(
  subjectLearning: Record<string, SubjectLearningRecord>
): number {
  return Object.values(subjectLearning).reduce(
    (sum, r) => sum + r.totalCompletions,
    0
  );
}
