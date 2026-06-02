export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  OVERDUE = "OVERDUE",
}

export interface WSJFMetrics {
  gradeImpact: number; // 1-10
  urgency: number; // 1-10
  risk: number; // 1-10
  timeRequired: number; // Hours
  estimatedByAI?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  metrics: WSJFMetrics;
  calculatedPriority: number;
  status: TaskStatus;
  deadline: string; // ISO string for serialization
  scheduledStart?: string;
  scheduledEnd?: string;
  subject?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;
  isFixed: boolean;
  type: "CLASS" | "LAB" | "STUDY_BLOCK" | "PERSONAL";
}

export interface User {
  name: string;
  university: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  startedAt: string;
  duration: number; // minutes completed
  type: "WORK" | "BREAK";
}

// ─── Time Learning ───────────────────────────────────────────────
export interface SubjectLearningRecord {
  subject: string;
  ratios: number[]; // last 10 actual/estimated ratios
  totalCompletions: number;
}

// ─── Notifications ───────────────────────────────────────────────
export interface NotificationSettings {
  enabled: boolean;
  time: string; // "21:00"
  permission: NotificationPermission | "default";
  lastNotifiedDate?: string; // YYYY-MM-DD
}

// ─── Day Rescue ──────────────────────────────────────────────────
export interface RescueEvent {
  timestamp: string;
  tasksAffected: number;
  hourOfDay: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export type PremiumTier = "free" | "pro";

// ─── Lean Metrics ────────────────────────────────────────────────
export interface UsageMetrics {
  // Activation
  onboardedAt: string;
  firstTaskCreatedAt?: string;
  firstScheduleAt?: string;
  firstFocusSessionAt?: string;

  // Engagement
  tasksCreated: number;
  tasksCompleted: number;
  coachRequests: number;
  scheduleRuns: number;
  focusSessionsCompleted: number;

  // Conversion
  pricingPageViews: number;
  upgradeClicks: number;
  lastPricingView?: string;

  // Viral
  shareClicks: number;
  referralCode?: string;

  // Feedback
  npsScore?: number;
  npsSubmittedAt?: string;
  feedbackGiven: number;

  // Retention
  daysActive: number;
  lastActiveDate: string;
  weeklyActiveCount: number;

  // Waitlist (smoke test)
  waitlistEmail?: string;
  waitlistAt?: string;
}

// Feature gating
export const FREE_TIER_LIMITS = {
  maxTasks: 5,
  maxCoachRequests: 3, // per day
  focusTimerLinked: false,
  energyAwareScheduling: false,
  advancedAnalytics: false,
} as const;
