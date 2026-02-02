import * as fs from "fs";
import * as path from "path";
import type { HEADNode } from "./types";

export function readHead(gitDir: string): HEADNode {
  const headPath = path.join(gitDir, "HEAD");
  const contents = fs.readFileSync(headPath, "utf-8").trim();

  // Detached HEAD - contains a full commit hash
  const hashMatch = contents.match(/^[0-9a-f]{40}$/);
  if (hashMatch) {
    return { hash: hashMatch[0].substring(0, 4) };
  }

  // Symbolic ref - points to a branch
  const refMatch = contents.match(/ref: refs\/heads\/(.+)/);
  if (refMatch) {
    return { hash: refMatch[1] };
  }

  return { hash: "" };
}
