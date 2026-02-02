import { lsFiles } from "./GitCommands";
import type { IndexFile } from "./types";

export function readIndexFiles(cwd: string): IndexFile[] {
  const output = lsFiles(cwd);
  if (!output) return [];

  const lines = output.split("\n").filter((l) => l.trim() !== "");
  return lines.map((line) => ({ filename: line }));
}
