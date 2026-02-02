import * as fs from "fs";
import * as path from "path";
import type { Branch } from "./types";

export function readRemoteBranches(gitDir: string): Branch[] {
  const remotePath = path.join(gitDir, "refs", "remotes");
  const branches: Branch[] = [];

  if (!fs.existsSync(remotePath)) return branches;

  const remoteDirs = fs.readdirSync(remotePath);
  for (const remoteDir of remoteDirs) {
    const remoteDirPath = path.join(remotePath, remoteDir);
    if (!fs.statSync(remoteDirPath).isDirectory()) continue;

    const files = fs.readdirSync(remoteDirPath);
    for (const file of files) {
      const filePath = path.join(remoteDirPath, file);
      if (!fs.statSync(filePath).isFile()) continue;
      const hash = fs.readFileSync(filePath, "utf-8").trim().substring(0, 4);
      branches.push({ name: file, hash });
    }
  }

  return branches;
}
