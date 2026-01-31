export enum NodePositionY {
  level0 = 100,
  level1 = 250,
  level2 = 400,
  level3 = 550,
  level4 = 600,
}

export const NodeHorizontalSpacing = 200;
export const NodeVerticalSpacing = 150;

// Radius of the entire circle.
export let radius = 60;
export let radiusHEAD = 40;
export let radiusBRANCH = 45;
export let radiusTAG = 40;
export let radiusTREE = 40;
export let radiusBLOB = 50;

export enum NodePositionX {
  column1 = 100,
  column2 = 250,
  column3 = 400,
  column4 = 550,
  column5 = 700,
  column6 = 430,
}

enum NodeType {
  branch = 0,
  commit = 1,
  tree = 2,
  blob = 3,
  head = 4,
  remotebranch = 5,
  tag = 6,
}

interface IndexFile {
  filename: string;
  hash: string;
  contents: string;
}

interface GitCommitNode {
  type: NodeType | undefined;
  tree: string;
  parent: Array<string>;
  hash: string;
  text: string;
  xPos: number | undefined;
  yPos: number | undefined;
}

interface GitCommitJson {
  type?: NodeType;
  tree: string;
  parent: Array<string>;
  hash: string;
  text: string;
  xPos?: number;
  yPos?: number;
}

interface GitNode {
  type: NodeType;
  contents: string;
  parents: string[];
  tree: string;
  blobs: string[];
  trees: string[];
  name: string;
  filename: string;
  parent: string;
  hash: string;
  text: string;
  xPos: number;
  yPos: number;
}

interface GitTreeJson {
  parents: string[];
  blobs: string[];
  text: string;
  hash: string;
}

interface GitTree {
  type: NodeType;
  parents: string[];
  blobs: string[];
  text: string;
  hash: string;
  xPos: number;
  yPos: number;
}

interface GitBlob {
  type: NodeType;
  contents: string;
  filename: string;
  trees: string[];
  text: string;
  hash: string;
  xPos: number;
  yPos: number;
}

interface GitCommit {
  type: NodeType;
  tree: string;
  parent: Array<string>;
  hash: string;
  text: string;
  xPos: number;
  yPos: number;
}

interface GitBranch {
  type: NodeType;
  hash: string;
  name: string;
  text: string;
  xPos: number;
  yPos: number;
}

interface GitTag {
  type: NodeType;
  hash: string;
  name: string;
  text: string;
  xPos: number;
  yPos: number;
}

export type {
  GitNode,
  GitCommitNode,
  GitCommitJson,
  GitTreeJson,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
  IndexFile,
};
export { NodeType };
