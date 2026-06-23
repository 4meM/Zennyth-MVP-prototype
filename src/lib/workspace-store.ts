"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PremiumTier } from "@/types";
import { FREE_TIER_LIMITS } from "@/types";
import type {
  GroupTask,
  GroupTaskStatus,
  SubTask,
  Workspace,
  WorkspaceMember,
  WorkspaceSeed,
} from "@/types/workspace";
import { generateId } from "./utils";
import { generateJoinCode, isValidJoinCode } from "./workspace-utils";

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;

  // ─── Computed (tier-aware guards) ──────────────────────────
  /**
   * Returns true if the user can create another workspace.
   * Pro tier is unlimited; free tier is capped at FREE_TIER_LIMITS.maxWorkspaces.
   * NOTE: tier is passed in to keep this store isolated from useZenStore.
   */
  canCreateWorkspace: (tier: PremiumTier) => boolean;

  // ─── Lifecycle ─────────────────────────────────────────────
  /**
   * Create a new workspace. Returns the new workspace ID.
   * The creator is added as the first member.
   */
  createWorkspace: (name: string, memberName: string) => string;
  /**
   * Join an existing workspace via joinCode + seed data.
   * The joiner is added as a new member; a fresh local workspace ID is assigned.
   * Throws on invalid joinCode format or joinCode/seed mismatch.
   */
  joinWorkspace: (joinCode: string, memberName: string, seedData: WorkspaceSeed) => void;
  /**
   * Remove a workspace from local storage only.
   * Other members' copies are unaffected (no backend).
   */
  leaveWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string | null) => void;

  // ─── Task actions ──────────────────────────────────────────
  addGroupTask: (workspaceId: string, title: string, deadline: string, memberId: string) => void;
  /**
   * Split a task into N unclaimed SubTasks.
   * Replaces any existing subtasks on the parent task.
   */
  splitTask: (workspaceId: string, taskId: string, count: number) => void;
  claimSubtask: (workspaceId: string, taskId: string, subtaskId: string, memberId: string) => void;
  completeSubtask: (workspaceId: string, taskId: string, subtaskId: string) => void;
  updateTaskStatus: (workspaceId: string, taskId: string, status: GroupTaskStatus) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      // ─── Computed ────────────────────────────────────────────
      canCreateWorkspace: (tier) => {
        if (tier === "pro") return true;
        return get().workspaces.length < FREE_TIER_LIMITS.maxWorkspaces;
      },

      // ─── Lifecycle ───────────────────────────────────────────
      createWorkspace: (name, memberName) => {
        const memberId = generateId();
        const member: WorkspaceMember = {
          id: memberId,
          name: memberName.trim(),
          joinedAt: new Date().toISOString(),
        };
        const workspace: Workspace = {
          id: generateId(),
          name: name.trim(),
          joinCode: generateJoinCode(),
          members: [member],
          tasks: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        }));
        return workspace.id;
      },

      joinWorkspace: (joinCode, memberName, seedData) => {
        if (!isValidJoinCode(joinCode)) {
          throw new Error("Código de workspace inválido");
        }
        if (joinCode.toUpperCase() !== seedData.joinCode.toUpperCase()) {
          throw new Error("El código no coincide con los datos del workspace");
        }
        const memberId = generateId();
        const member: WorkspaceMember = {
          id: memberId,
          name: memberName.trim(),
          joinedAt: new Date().toISOString(),
        };
        const workspace: Workspace = {
          id: generateId(),
          name: seedData.name,
          joinCode: seedData.joinCode,
          members: [...seedData.members, member],
          tasks: seedData.tasks,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: workspace.id,
        }));
      },

      leaveWorkspace: (workspaceId) =>
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
          activeWorkspaceId:
            state.activeWorkspaceId === workspaceId ? null : state.activeWorkspaceId,
        })),

      setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),

      // ─── Task actions ────────────────────────────────────────
      addGroupTask: (workspaceId, title, deadline, memberId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tasks: [
                    ...w.tasks,
                    {
                      id: generateId(),
                      title: title.trim(),
                      deadline,
                      status: "TODO" as GroupTaskStatus,
                      subtasks: [],
                      createdAt: new Date().toISOString(),
                      createdBy: memberId,
                    } satisfies GroupTask,
                  ],
                }
              : w
          ),
        })),

      splitTask: (workspaceId, taskId, count) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) => {
            if (w.id !== workspaceId) return w;
            return {
              ...w,
              tasks: w.tasks.map((t) => {
                if (t.id !== taskId) return t;
                const subtasks: SubTask[] = Array.from({ length: count }, (_, i) => ({
                  id: generateId(),
                  title: `Parte ${i + 1}`,
                  status: "TODO" as const,
                }));
                return { ...t, subtasks };
              }),
            };
          }),
        })),

      claimSubtask: (workspaceId, taskId, subtaskId, memberId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tasks: w.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          subtasks: t.subtasks.map((s) =>
                            s.id === subtaskId
                              ? {
                                  ...s,
                                  ownerId: memberId,
                                  claimedAt: new Date().toISOString(),
                                }
                              : s
                          ),
                        }
                      : t
                  ),
                }
              : w
          ),
        })),

      completeSubtask: (workspaceId, taskId, subtaskId) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tasks: w.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          subtasks: t.subtasks.map((s) =>
                            s.id === subtaskId
                              ? {
                                  ...s,
                                  status: "DONE" as const,
                                  completedAt: new Date().toISOString(),
                                }
                              : s
                          ),
                        }
                      : t
                  ),
                }
              : w
          ),
        })),

      updateTaskStatus: (workspaceId, taskId, status) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  tasks: w.tasks.map((t) =>
                    t.id === taskId ? { ...t, status } : t
                  ),
                }
              : w
          ),
        })),
    }),
    { name: "zennyth-workspaces" }
  )
);
