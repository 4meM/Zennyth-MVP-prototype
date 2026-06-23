// ─── Collaborative Study Workspace ───────────────────────────────
// Local-first shared Kanban for 2-6 student groups.
// Each member holds an independent localStorage copy seeded from a
// shareable join code. No backend, no auth.

export type SubTaskStatus = "TODO" | "DONE";
export type GroupTaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface WorkspaceMember {
  id: string; // local member ID
  name: string; // display name
  joinedAt: string; // ISO string
}

export interface SubTask {
  id: string;
  title: string;
  ownerId?: string; // member ID or undefined (unclaimed)
  status: SubTaskStatus;
  claimedAt?: string;
  completedAt?: string;
}

export interface GroupTask {
  id: string;
  title: string;
  deadline: string; // ISO string
  status: GroupTaskStatus;
  subtasks: SubTask[];
  createdAt: string;
  createdBy: string; // member ID
  /** Member ID individually responsible for this task (in addition to any subtask owners). */
  assignedTo?: string;
}

export type WorkspaceAttachmentType = "link" | "gdrive";

export interface WorkspaceAttachment {
  id: string;
  name: string;
  url: string;
  type: WorkspaceAttachmentType;
  addedBy: string; // member ID
  addedAt: string; // ISO string
}

export interface Workspace {
  id: string;
  name: string;
  joinCode: string; // 6-char alphanumeric
  members: WorkspaceMember[];
  tasks: GroupTask[];
  createdAt: string;
  /** Shared resources (links, Google Drive refs). Optional for backward compat. */
  attachments?: WorkspaceAttachment[];
}

// Out-of-band share payload: name + joinCode + members + tasks.
// id and createdAt are LOCAL to each member's device, so they are
// not part of the seed.
export interface WorkspaceSeed {
  name: string;
  joinCode: string;
  members: WorkspaceMember[];
  tasks: GroupTask[];
}
