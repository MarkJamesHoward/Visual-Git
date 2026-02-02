import { catFileContents } from "./GitCommands";

export interface CommitExtraction {
  treeHash: string;
  parentHashes: string[];
  comment: string;
}

export function extractCommit(
  hash: string,
  cwd: string
): CommitExtraction | null {
  const contents = catFileContents(hash, cwd);
  if (!contents) return null;

  const treeMatch = contents.match(/tree ([0-9a-f]{4})/);
  if (!treeMatch) return null;

  const parentMatches = [...contents.matchAll(/parent ([0-9a-f]{4})/g)];
  const parentHashes = parentMatches.map((m) => m[1]);

  const commentMatch = contents.match(/\n\n(.+)\n?/);
  const comment = commentMatch ? commentMatch[1].trim() : "";

  return {
    treeHash: treeMatch[1],
    parentHashes,
    comment,
  };
}
