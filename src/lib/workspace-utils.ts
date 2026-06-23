import type { Workspace, WorkspaceSeed } from "@/types/workspace";

// 6-character human-readable join code (uppercase A-Z + 0-9).
// Uses base36 (Math.random * 36) for a simple alphanumeric generator.
const JOIN_CODE_LENGTH = 6;

/**
 * Generate a 6-char alphanumeric join code (uppercase base36).
 * Example: "K3P9XR"
 */
export function generateJoinCode(): string {
  return Array.from(
    { length: JOIN_CODE_LENGTH },
    () => Math.floor(Math.random() * 36).toString(36)
  )
    .join("")
    .toUpperCase();
}

/**
 * Validate the format of a join code (6 uppercase alphanumeric chars).
 * Does NOT verify that the code corresponds to an existing workspace —
 * it is a syntactic check used to fail fast on obvious typos.
 */
export function isValidJoinCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

/**
 * Serialize a workspace to a JSON string suitable for clipboard share.
 * The output is what a joiner pastes into the join dialog.
 */
export function serializeSeedData(workspace: Workspace): string {
  const seed: WorkspaceSeed = {
    name: workspace.name,
    joinCode: workspace.joinCode,
    members: workspace.members,
    tasks: workspace.tasks,
  };
  return JSON.stringify(seed, null, 2);
}

/**
 * Parse and validate a seed data JSON string.
 * Throws on invalid JSON or structural mismatch.
 */
export function deserializeSeedData(json: string): WorkspaceSeed {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON inválido");
  }
  if (!isWorkspaceSeed(parsed)) {
    throw new Error("Datos de workspace inválidos");
  }
  return parsed;
}

function isWorkspaceSeed(value: unknown): value is WorkspaceSeed {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.joinCode === "string" &&
    Array.isArray(v.members) &&
    Array.isArray(v.tasks)
  );
}
