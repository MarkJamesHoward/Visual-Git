import {
  DrawBlobDirectToCommitLinks,
  DrawBranchToCommitLinks,
  DrawBlobToTreeLinks,
  DrawCommitDirectToBlobLinks,
  DrawCommitToParentCommitLinks,
  DrawCommitToTreeLinks,
  DrawHeadToCommitLinks,
  DrawTagToCommitLinks,
  DrawTreeToParentTreeLinks,
} from "./DrawLinks";
import { DrawNodes } from "./DrawNodes";
import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./Types";

export interface VisState {
  CommitNodes: GitCommit[];
  TreeNodes: GitTree[];
  BlobNodes: GitBlob[];
  BranchNodes: GitBranch[];
  TagNodes: GitTag[];
  RemoteBranchNodes: GitBranch[];
  HEADNodes: GitNode[];
  showTrees: boolean;
  showBlobs: boolean;
  showTags: boolean;
}

export function ReDraw(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: VisState
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  DrawNodes(ctx, state.CommitNodes);

  if (state.showTrees) {
    DrawNodes(ctx, state.TreeNodes);
  }

  if (state.showBlobs) {
    DrawNodes(ctx, state.BlobNodes);
  }

  DrawNodes(ctx, state.BranchNodes);
  if (state.showTags) {
    DrawNodes(ctx, state.TagNodes);
  }
  DrawNodes(ctx, state.RemoteBranchNodes);
  DrawNodes(ctx, state.HEADNodes);

  if (state.showTrees) {
    DrawCommitToTreeLinks(ctx, state.CommitNodes, state.TreeNodes);
  }

  if (!state.showTrees && state.showBlobs) {
    DrawCommitDirectToBlobLinks(ctx, state.CommitNodes, state.TreeNodes, state.BlobNodes);
    DrawBlobDirectToCommitLinks(ctx, state.CommitNodes, state.TreeNodes, state.BlobNodes);
  }

  DrawCommitToParentCommitLinks(ctx, state.CommitNodes);
  DrawHeadToCommitLinks(ctx, state.BranchNodes, state.CommitNodes, state.HEADNodes);
  DrawBranchToCommitLinks(ctx, state.BranchNodes, state.CommitNodes);
  if (state.showTags) {
    DrawTagToCommitLinks(ctx, state.TagNodes, state.CommitNodes);
  }
  DrawBranchToCommitLinks(ctx, state.RemoteBranchNodes, state.CommitNodes);

  if (state.showBlobs && state.showTrees) {
    DrawBlobToTreeLinks(ctx, state.TreeNodes, state.BlobNodes);
    DrawTreeToParentTreeLinks(ctx, state.TreeNodes);
  }

  if (!state.showBlobs && state.showTrees) {
    DrawTreeToParentTreeLinks(ctx, state.TreeNodes);
  }
}
