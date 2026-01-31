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
import {
  BlobNodes,
  BranchNodes,
  CommitNodes,
  HEADNodes,
  RemoteBranchNodes,
  TagNodes,
  TreeNodes,
  ShowTreesNanoStore,
  ShowBlobsNanoStore,
  ShowTagsNanoStore,
} from "./State";
import { canvas, ctx } from "./StateGlobalWindow";

export function ReDraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  DrawNodes(ctx, CommitNodes);

  if (ShowTreesNanoStore.get()) {
    DrawNodes(ctx, TreeNodes);
  }

  if (ShowBlobsNanoStore.get()) {
    DrawNodes(ctx, BlobNodes);
  }

  DrawNodes(ctx, BranchNodes);
  if (ShowTagsNanoStore.get()) {
    DrawNodes(ctx, TagNodes);
  }
  DrawNodes(ctx, RemoteBranchNodes);
  DrawNodes(ctx, HEADNodes);

  if (ShowTreesNanoStore.get()) {
    DrawCommitToTreeLinks(ctx, CommitNodes, TreeNodes);
  }

  if (!ShowTreesNanoStore.get() && ShowBlobsNanoStore.get()) {
    DrawCommitDirectToBlobLinks(ctx, CommitNodes, TreeNodes, BlobNodes);
    DrawBlobDirectToCommitLinks(ctx, CommitNodes, TreeNodes, BlobNodes);
  }

  DrawCommitToParentCommitLinks(ctx, CommitNodes);
  DrawHeadToCommitLinks(ctx, BranchNodes, CommitNodes, HEADNodes);
  DrawBranchToCommitLinks(ctx, BranchNodes, CommitNodes);
  if (ShowTagsNanoStore.get()) {
    DrawTagToCommitLinks(ctx, TagNodes, CommitNodes);
  }
  DrawBranchToCommitLinks(ctx, RemoteBranchNodes, CommitNodes);

  if (ShowBlobsNanoStore.get() && ShowTreesNanoStore.get()) {
    DrawBlobToTreeLinks(ctx, TreeNodes, BlobNodes);
    DrawTreeToParentTreeLinks(ctx, TreeNodes);
  }

  if (!ShowBlobsNanoStore.get() && ShowTreesNanoStore.get()) {
    DrawTreeToParentTreeLinks(ctx, TreeNodes);
  }
}
