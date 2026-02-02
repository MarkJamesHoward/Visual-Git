export interface Commit {
  hash: string;
  parent: string[];
  tree: string;
  text: string;
}

export interface Tree {
  hash: string;
  blobs: string[];
  parents: string[];
  text: string;
}

export interface Blob {
  filename: string;
  hash: string;
  trees: string[];
  contents: string;
}

export interface Branch {
  hash: string;
  name: string;
}

export interface Tag {
  hash: string;
  name: string;
}

export interface HEADNode {
  hash: string;
}

export interface IndexFile {
  filename: string;
}

export interface WorkingFile {
  filename: string;
  contents?: string;
}

export interface GitRepoData {
  commitNodes: string;
  branchNodes: string;
  tagNodes: string;
  remoteBranchNodes: string;
  treeNodes: string;
  blobNodes: string;
  headNodes: string;
  indexFilesNodes: string;
  workingFilesNodes: string;
}
