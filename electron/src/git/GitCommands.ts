import { execFileSync } from "child_process";

export function catFileType(hash: string, cwd: string): string {
  try {
    const output = execFileSync("git", ["cat-file", hash, "-t"], {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
    });
    return output.trim();
  } catch {
    return "";
  }
}

export function catFileContents(hash: string, cwd: string): string {
  try {
    const output = execFileSync("git", ["cat-file", hash, "-p"], {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
    });
    return output;
  } catch {
    return "";
  }
}

export function lsFiles(cwd: string): string {
  try {
    const output = execFileSync("git", ["ls-files", "-s"], {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
    });
    return output;
  } catch {
    return "";
  }
}
