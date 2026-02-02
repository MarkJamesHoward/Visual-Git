import * as fs from "fs";
import * as path from "path";
import type { WorkingFile } from "./types";

export function readWorkingFiles(workingDir: string): WorkingFile[] {
  return readDir(workingDir);
}

function readDir(dir: string): WorkingFile[] {
  const files: WorkingFile[] = [];

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (entry === ".git") continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...readDir(fullPath));
    } else {
      files.push({ filename: entry });
    }
  }

  return files;
}
