import {
  radius,
  radiusHEAD,
  radiusBRANCH,
  radiusTAG,
  radiusTREE,
  radiusBLOB,
  NodeType,
} from "./Types";

import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./Types";

const ArrowFit = 5;

function canvas_arrow(
  ctx: CanvasRenderingContext2D,
  fromx: number,
  fromy: number,
  tox: number,
  toy: number,
  childType: NodeType,
  parentType: NodeType
) {
  let LineAngle = Math.atan2(toy - fromy, tox - fromx);
  let MoveXArrow: number;
  let MoveYArrow: number;
  let MoveX: number;
  let MoveY: number;

  if (parentType == NodeType.head && childType == NodeType.branch) {
    MoveXArrow = Math.cos(LineAngle) * (radiusBRANCH + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radiusBRANCH + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusHEAD;
    MoveY = Math.sin(LineAngle) * radiusHEAD;
  } else if (parentType == NodeType.tag && childType == NodeType.commit) {
    MoveXArrow = Math.cos(LineAngle) * (radius + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radius + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusTAG;
    MoveY = Math.sin(LineAngle) * radiusTAG;
  } else if (parentType == NodeType.head && childType == NodeType.commit) {
    MoveXArrow = Math.cos(LineAngle) * (radius + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radius + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusHEAD;
    MoveY = Math.sin(LineAngle) * radiusHEAD;
  } else if (parentType == NodeType.tree && childType == NodeType.blob) {
    MoveXArrow = Math.cos(LineAngle) * (radiusBLOB + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radiusBLOB + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusTREE;
    MoveY = Math.sin(LineAngle) * radiusTREE;
  } else if (parentType == NodeType.commit && childType == NodeType.blob) {
    MoveXArrow = Math.cos(LineAngle) * (radiusBLOB + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radiusBLOB + ArrowFit);
    MoveX = Math.cos(LineAngle) * radius;
    MoveY = Math.sin(LineAngle) * radius;
  } else if (parentType == NodeType.branch && childType == NodeType.commit) {
    MoveXArrow = Math.cos(LineAngle) * (radius + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radius + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusBRANCH;
    MoveY = Math.sin(LineAngle) * radiusBRANCH;
  } else if (parentType == NodeType.tree && childType == NodeType.tree) {
    MoveXArrow = Math.cos(LineAngle) * (radiusTREE + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radiusTREE + ArrowFit);
    MoveX = Math.cos(LineAngle) * radiusTREE;
    MoveY = Math.sin(LineAngle) * radiusTREE;
  } else if (childType == NodeType.tree && parentType == NodeType.commit) {
    MoveXArrow = Math.cos(LineAngle) * (radiusTREE + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radiusTREE + ArrowFit);
    MoveX = Math.cos(LineAngle) * radius;
    MoveY = Math.sin(LineAngle) * radius;
  } else {
    MoveXArrow = Math.cos(LineAngle) * (radius + ArrowFit);
    MoveYArrow = Math.sin(LineAngle) * (radius + ArrowFit);
    MoveX = Math.cos(LineAngle) * radius;
    MoveY = Math.sin(LineAngle) * radius;
  }

  fromx += MoveX;
  fromy += MoveY;
  tox -= MoveXArrow;
  toy -= MoveYArrow;

  ctx.beginPath();
  var headlen = 5;
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(tox, toy);
  ctx.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6)
  );
  if (childType == NodeType.commit && parentType == NodeType.commit) {
    ctx.lineWidth = 1;
  } else {
    ctx.lineWidth = 3;
  }
  ctx.strokeStyle = "0";
  ctx.stroke();
}

export function DrawCommitToTreeLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>,
  TreeNodes: Array<GitTree>
) {
  CommitNodes.forEach((cn) => {
    let tn = TreeNodes.find((i) => i.hash == cn.tree);
    if (tn) {
      canvas_arrow(ctx, cn.xPos, cn.yPos, tn.xPos, tn.yPos, NodeType.tree, NodeType.commit);
    }
  });
}

export function DrawCommitDirectToBlobLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>,
  TreeNodes: Array<GitTree>,
  BlobNodes: Array<GitBlob>
) {
  CommitNodes.forEach((cn) => {
    let tn = TreeNodes.find((i) => i.hash == cn.tree);
    tn?.blobs?.forEach((blobHash) => {
      let blobNode = BlobNodes.find((i) => i.hash == blobHash);
      if (blobNode) {
        canvas_arrow(ctx, cn.xPos, cn.yPos, blobNode.xPos, blobNode.yPos, NodeType.blob, NodeType.commit);
      }
    });
  });
}

function TraverseAllTheWayToCommit(
  tn: GitTree,
  TreeNodes: Array<GitTree>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D,
  blob: GitBlob
) {
  if (tn.text == "Root") {
    let cn = CommitNodes.find((i) => i.hash == tn?.parents[0]);
    if (cn) {
      canvas_arrow(ctx, cn.xPos, cn.yPos, blob.xPos, blob.yPos, NodeType.blob, NodeType.commit);
    }
  } else {
    tn.parents.forEach((pnHash) => {
      if (pnHash != "") {
        let pn = TreeNodes.find((t) => t.hash == pnHash);
        if (pn) {
          TraverseAllTheWayToCommit(pn, TreeNodes, CommitNodes, ctx, blob);
        }
      }
    });
  }
}

export function DrawBlobDirectToCommitLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>,
  TreeNodes: Array<GitTree>,
  BlobNodes: Array<GitBlob>
) {
  BlobNodes.forEach((blob) => {
    blob.trees.forEach((blobParentTreeHash) => {
      if (blobParentTreeHash != "" && blobParentTreeHash != undefined) {
        let tn = TreeNodes.find((i) => i.hash == blobParentTreeHash);
        if (tn) {
          TraverseAllTheWayToCommit(tn, TreeNodes, CommitNodes, ctx, blob);
        }
      }
    });
  });
}

export function DrawCommitToParentCommitLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>
) {
  CommitNodes.forEach((cn) => {
    if (cn.parent.length > 0) {
      cn.parent.forEach((parentNode) => {
        let pcn = CommitNodes.find((pcn) => pcn.hash == parentNode);
        if (pcn) {
          canvas_arrow(ctx, cn.xPos, cn.yPos, pcn.xPos, pcn.yPos, NodeType.commit, NodeType.commit);
        }
      });
    }
  });
}

export function DrawHeadToCommitLinks(
  ctx: CanvasRenderingContext2D,
  BranchNodes: Array<GitBranch>,
  CommitNodes: Array<GitCommit>,
  HEADNodes: Array<GitNode>
) {
  HEADNodes.forEach((head) => {
    let b = BranchNodes.find((i) => i.name.toLowerCase() == head.hash.toLowerCase());

    if (b === undefined || b === null) {
      let c = CommitNodes.find((i) => i.hash.toLowerCase() == head.hash.toLowerCase());
      if (c) {
        canvas_arrow(ctx, head.xPos, head.yPos, c.xPos, c.yPos, NodeType.commit, NodeType.head);
      }
    } else {
      canvas_arrow(ctx, head.xPos, head.yPos, b.xPos, b.yPos, NodeType.branch, NodeType.head);
    }
  });
}

export function DrawTagToCommitLinks(
  ctx: CanvasRenderingContext2D,
  TagNodes: Array<GitTag>,
  CommitNodes: Array<GitCommit>
) {
  TagNodes.forEach((bn) => {
    let CommitNode = CommitNodes.find((i) => i.hash == bn.hash);
    if (CommitNode) {
      canvas_arrow(ctx, bn.xPos, bn.yPos, CommitNode.xPos, CommitNode.yPos, NodeType.commit, NodeType.tag);
    }
  });
}

export function DrawBranchToCommitLinks(
  ctx: CanvasRenderingContext2D,
  BranchNodes: Array<GitBranch>,
  CommitNodes: Array<GitCommit>
) {
  BranchNodes.forEach((bn) => {
    let CommitNode = CommitNodes.find((i) => i.hash == bn.hash);
    if (CommitNode) {
      canvas_arrow(ctx, bn.xPos, bn.yPos, CommitNode.xPos, CommitNode.yPos, NodeType.commit, NodeType.branch);
    }
  });
}

export function DrawBlobToTreeLinks(
  ctx: CanvasRenderingContext2D,
  TreeNodes: Array<GitTree>,
  BlobNodes: Array<GitBlob>
) {
  TreeNodes.forEach((tn) => {
    tn.blobs?.forEach((blobHash) => {
      let blobNode = BlobNodes.find((i) => i.hash == blobHash);
      if (blobNode) {
        canvas_arrow(ctx, tn.xPos, tn.yPos, blobNode.xPos, blobNode.yPos, NodeType.blob, NodeType.tree);
      }
    });
  });
}

export function DrawTreeToParentTreeLinks(
  ctx: CanvasRenderingContext2D,
  TreeNodes: Array<GitTree>
) {
  TreeNodes.forEach((tn) => {
    tn.parents.forEach((pn) => {
      let parentTree = TreeNodes.find((i) => i.hash == pn);
      if (parentTree) {
        canvas_arrow(ctx, parentTree.xPos, parentTree.yPos, tn.xPos, tn.yPos, NodeType.tree, NodeType.tree);
      }
    });
  });
}
