import * as path from "path";
import { worktreeList } from "./GitCommands";
import type { Worktree } from "./types";

interface WorktreeDraft {
  path: string;
  hash: string;
  branch: string;
  detached: boolean;
  bare: boolean;
}

function normalizeBranchName(branchRef: string): string {
  const prefix = "refs/heads/";
  if (branchRef.startsWith(prefix)) {
    return branchRef.substring(prefix.length);
  }
  return branchRef;
}

function normalizePath(p: string): string {
  return path.resolve(p).replace(/\\/g, "/").toLowerCase();
}

function finalizeWorktree(
  draft: WorktreeDraft,
  currentRepoPath: string,
): Worktree {
  const normalizedDraftPath = normalizePath(draft.path);
  const normalizedCurrentPath = normalizePath(currentRepoPath);

  return {
    path: draft.path,
    name: path.basename(draft.path),
    hash: draft.hash.substring(0, 4),
    branch: draft.branch,
    detached: draft.detached,
    bare: draft.bare,
    isCurrent: normalizedDraftPath === normalizedCurrentPath,
  };
}

export function readWorktrees(repoPath: string): Worktree[] {
  const output = worktreeList(repoPath);
  if (!output) return [];

  const worktrees: Worktree[] = [];
  const lines = output.split(/\r?\n/);

  let current: WorktreeDraft | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (current) {
        worktrees.push(finalizeWorktree(current, repoPath));
        current = null;
      }
      continue;
    }

    if (line.startsWith("worktree ")) {
      if (current) {
        worktrees.push(finalizeWorktree(current, repoPath));
      }
      current = {
        path: line.substring("worktree ".length),
        hash: "",
        branch: "",
        detached: false,
        bare: false,
      };
      continue;
    }

    if (!current) continue;

    if (line.startsWith("HEAD ")) {
      current.hash = line.substring("HEAD ".length);
    } else if (line.startsWith("branch ")) {
      const branchRef = line.substring("branch ".length);
      current.branch = normalizeBranchName(branchRef);
    } else if (line === "detached") {
      current.detached = true;
    } else if (line === "bare") {
      current.bare = true;
    }
  }

  if (current) {
    worktrees.push(finalizeWorktree(current, repoPath));
  }

  return worktrees;
}
