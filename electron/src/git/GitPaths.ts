import * as fs from "fs";
import * as path from "path";

export interface ResolvedGitPaths {
  dotGitPath: string;
  commonGitDir: string;
  worktreeGitDir: string;
}

export function resolveGitPaths(repoPath: string): ResolvedGitPaths {
  const dotGitPath = path.join(repoPath, ".git");

  if (!fs.existsSync(dotGitPath)) {
    return {
      dotGitPath,
      commonGitDir: dotGitPath,
      worktreeGitDir: dotGitPath,
    };
  }

  const stat = fs.statSync(dotGitPath);
  if (stat.isDirectory()) {
    return {
      dotGitPath,
      commonGitDir: dotGitPath,
      worktreeGitDir: dotGitPath,
    };
  }

  const fileContents = fs.readFileSync(dotGitPath, "utf-8");
  const gitdirMatch = fileContents.match(/gitdir:\s*(.+)/i);
  if (!gitdirMatch) {
    return {
      dotGitPath,
      commonGitDir: dotGitPath,
      worktreeGitDir: dotGitPath,
    };
  }

  const gitdirValue = gitdirMatch[1].trim();
  const worktreeGitDir = path.resolve(repoPath, gitdirValue);

  const commondirPath = path.join(worktreeGitDir, "commondir");
  if (!fs.existsSync(commondirPath)) {
    return {
      dotGitPath,
      commonGitDir: worktreeGitDir,
      worktreeGitDir,
    };
  }

  const commondirValue = fs.readFileSync(commondirPath, "utf-8").trim();
  const commonGitDir = path.resolve(worktreeGitDir, commondirValue);

  return {
    dotGitPath,
    commonGitDir,
    worktreeGitDir,
  };
}
