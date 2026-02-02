import * as fs from "fs";
import * as path from "path";
import { catFileType } from "./GitCommands";
import { extractCommit } from "./CommitExtractor";
import { processTreeBlobs } from "./TreeExtractor";
import { readBranches } from "./BranchReader";
import { readTags } from "./TagReader";
import { readRemoteBranches } from "./RemoteBranchReader";
import { readHead } from "./HeadReader";
import { readIndexFiles } from "./IndexReader";
import { readWorkingFiles } from "./WorkingFilesReader";
import type { Commit, Tree, Blob, GitRepoData } from "./types";

export function readGitRepo(repoPath: string): GitRepoData {
  const gitDir = path.join(repoPath, ".git");
  const objectsPath = path.join(gitDir, "objects");

  const commits: Commit[] = [];
  const trees: Tree[] = [];
  const blobs: Blob[] = [];

  // Scan .git/objects directories
  if (fs.existsSync(objectsPath)) {
    const dirs = fs.readdirSync(objectsPath);
    for (const dir of dirs) {
      if (dir === "pack" || dir === "info") continue;

      const dirPath = path.join(objectsPath, dir);
      if (!fs.statSync(dirPath).isDirectory()) continue;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.includes("pack-") || file.includes(".idx")) continue;

        const hash = dir + file.substring(0, 2);
        const fileType = catFileType(hash, repoPath);

        if (fileType === "commit") {
          const extraction = extractCommit(hash, repoPath);
          if (extraction) {
            if (!commits.find((c) => c.hash === hash)) {
              commits.push({
                hash,
                parent: extraction.parentHashes,
                tree: extraction.treeHash,
                text: extraction.comment,
              });
            }

            // Add root tree and process blobs
            processTreeBlobs(
              extraction.treeHash,
              hash,
              "Root",
              repoPath,
              trees,
              blobs
            );
          }
        }
      }
    }
  }

  // Find orphan blobs (blobs not referenced by any tree)
  if (fs.existsSync(objectsPath)) {
    const dirs = fs.readdirSync(objectsPath);
    for (const dir of dirs) {
      if (dir === "pack" || dir === "info") continue;
      const dirPath = path.join(objectsPath, dir);
      if (!fs.statSync(dirPath).isDirectory()) continue;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const hash = dir + file.substring(0, 2);
        const fileType = catFileType(hash, repoPath);
        if (fileType === "blob" && !blobs.find((b) => b.hash === hash)) {
          blobs.push({ filename: "", hash, trees: [], contents: "" });
        }
      }
    }
  }

  const branches = readBranches(gitDir);
  const tags = readTags(gitDir);
  const remoteBranches = readRemoteBranches(gitDir);
  const head = readHead(gitDir);
  const indexFiles = readIndexFiles(repoPath);
  const workingFiles = readWorkingFiles(repoPath);

  return {
    commitNodes: JSON.stringify(commits),
    branchNodes: JSON.stringify(branches),
    tagNodes: JSON.stringify(tags),
    remoteBranchNodes: JSON.stringify(remoteBranches),
    treeNodes: JSON.stringify(trees),
    blobNodes: JSON.stringify(blobs),
    headNodes: JSON.stringify(head),
    indexFilesNodes: JSON.stringify(indexFiles),
    workingFilesNodes: JSON.stringify(workingFiles),
  };
}
