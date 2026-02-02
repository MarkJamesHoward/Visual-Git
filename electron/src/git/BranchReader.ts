import * as fs from "fs";
import * as path from "path";
import type { Branch } from "./types";

export function readBranches(gitDir: string): Branch[] {
  const branchPath = path.join(gitDir, "refs", "heads");
  const branches: Branch[] = [];

  if (!fs.existsSync(branchPath)) return branches;

  const files = fs.readdirSync(branchPath);
  for (const file of files) {
    const filePath = path.join(branchPath, file);
    if (!fs.statSync(filePath).isFile()) continue;
    const hash = fs.readFileSync(filePath, "utf-8").trim().substring(0, 4);
    branches.push({ name: file, hash });
  }

  return branches;
}
