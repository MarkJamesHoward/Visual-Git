import { catFileContents } from "./GitCommands";
import type { Tree, Blob } from "./types";

export function processTreeBlobs(
  treeHash: string,
  parentHash: string,
  folderName: string,
  cwd: string,
  trees: Tree[],
  blobs: Blob[]
): void {
  // Add this tree
  addTree(trees, treeHash, parentHash, folderName);

  const treeContents = catFileContents(treeHash, cwd);
  if (!treeContents) return;

  // Extract blobs from tree
  const blobMatches = [
    ...treeContents.matchAll(/blob ([0-9a-f]{4})[0-9a-f]{36}\t([\w.]+)/g),
  ];
  for (const match of blobMatches) {
    const blobHash = match[1];
    const filename = match[2];
    addBlob(blobs, treeHash, filename, blobHash);
    addTreeToBlobLink(trees, treeHash, blobHash);
  }

  // Extract subtrees
  const treeMatches = [
    ...treeContents.matchAll(/tree ([0-9a-f]{4})[0-9a-f]{36}\t([\w.]+)/g),
  ];
  for (const match of treeMatches) {
    const subtreeHash = match[1];
    const subFolderName = match[2];
    processTreeBlobs(subtreeHash, treeHash, subFolderName, cwd, trees, blobs);
  }
}

function addTree(
  trees: Tree[],
  hash: string,
  parentHash: string,
  text: string
): void {
  const existing = trees.find((t) => t.hash === hash);
  if (!existing) {
    trees.push({
      hash,
      blobs: [],
      parents: [parentHash],
      text,
    });
  } else {
    if (!existing.parents.includes(parentHash)) {
      existing.parents.push(parentHash);
    }
  }
}

function addTreeToBlobLink(
  trees: Tree[],
  treeHash: string,
  blobHash: string
): void {
  const tree = trees.find((t) => t.hash === treeHash);
  if (tree && !tree.blobs.includes(blobHash)) {
    tree.blobs.push(blobHash);
  }
}

function addBlob(
  blobs: Blob[],
  treeHash: string,
  filename: string,
  hash: string
): void {
  const existing = blobs.find((b) => b.hash === hash);
  if (!existing) {
    blobs.push({
      filename,
      hash,
      trees: treeHash ? [treeHash] : [],
      contents: "",
    });
  } else {
    if (treeHash && !existing.trees.includes(treeHash)) {
      existing.trees.push(treeHash);
    }
    if (filename && !existing.filename.includes(filename)) {
      existing.filename = existing.filename
        ? existing.filename + " " + filename
        : filename;
    }
  }
}
