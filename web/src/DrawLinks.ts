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

const DiagonalArrowOffsetX = 25;
const DiagonalArrowOffsetY = 10;
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
  // Get angle for line:
  let LineAngle = Math.atan2(toy - fromy, tox - fromx);
  let MoveXArrow;
  let MoveYArrow;
  let MoveX;
  let MoveY;

  // console.log(`Node Type head ${NodeType.head}`);
  // console.log(`Node Type branch ${NodeType.branch}`);

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

  ctx?.beginPath();
  var headlen = 5; // length of head in pixels
  var dx = tox - fromx;
  var dy = toy - fromy;
  var angle = Math.atan2(dy, dx);
  ctx?.moveTo(fromx, fromy);
  ctx?.lineTo(tox, toy);
  ctx?.lineTo(
    tox - headlen * Math.cos(angle - Math.PI / 6),
    toy - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx?.moveTo(tox, toy);
  ctx?.lineTo(
    tox - headlen * Math.cos(angle + Math.PI / 6),
    toy - headlen * Math.sin(angle + Math.PI / 6)
  );
  if (childType == NodeType.commit && parentType == NodeType.commit) {
    ctx.lineWidth = 1;
  } else if (childType == NodeType.head && parentType == NodeType.head) {
    ctx.lineWidth = 3;
  } else {
    ctx.lineWidth = 3;
  }
  ctx.strokeStyle = "0";
  ctx?.stroke();
}

export function DrawIndexfiles(
  ctx: CanvasRenderingContext2D,
  IndexFileNodes: Array<GitNode>
) {
  IndexFileNodes.forEach((file) => {
    ctx?.fillText(`File: ${file.filename}`, 200, 50);
  });
}

export function DrawCommitToTreeLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>,
  TreeNodes: Array<GitTree>
) {
  CommitNodes.forEach((cn) => {
    let tn = TreeNodes.find((i) => i.hash == cn.tree);
    //console.log(`Drawing link from Commit ${cn.hash} TO ${tn?.hash}`);
    //console.log(`${cn.xPos} to ${tn.xPos}`);
    if (tn) {
      canvas_arrow(
        ctx,
        cn?.xPos,
        cn?.yPos,
        tn?.xPos,
        tn?.yPos,
        NodeType.tree,
        NodeType.commit
      );
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

      canvas_arrow(
        ctx,
        cn?.xPos,
        cn?.yPos,
        blobNode?.xPos,
        blobNode?.yPos,
        NodeType.blob,
        NodeType.commit
      );
    });
  });
}

function TraverseAllTehWayToCommit(
  tn: GitTree,
  TreeNodes: Array<GitTree>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D,
  blob: GitBlob
) {
  try {
    console.log(tn.text);
  } catch (e) {
    console.log(e);
    console.log(tn);
  }
  if (tn.text == "Root") {
    let cn = CommitNodes.find((i) => i.hash == tn?.parents[0]);

    canvas_arrow(
      ctx,
      cn?.xPos,
      cn?.yPos,
      blob?.xPos,
      blob?.yPos,
      NodeType.blob,
      NodeType.commit
    );
  } else {
    tn.parents.forEach((pnHash) => {
      if (pnHash != "") {
        let pn = TreeNodes.find((tn) => tn.hash == pnHash);
        TraverseAllTehWayToCommit(pn, TreeNodes, CommitNodes, ctx, blob);
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
    console.log(blob.hash);
    blob.trees.forEach((blobParentTreeHash) => {
      if (blobParentTreeHash != "" && blobParentTreeHash != undefined) {
        let tn = TreeNodes.find((i) => i.hash == blobParentTreeHash);
        TraverseAllTehWayToCommit(tn, TreeNodes, CommitNodes, ctx, blob);
      }
    });
  });
}

export function DrawCommitToParentCommitLinks(
  ctx: CanvasRenderingContext2D,
  CommitNodes: Array<GitCommit>
) {
  CommitNodes.forEach((cn) => {
    console.log("drawing links");
    if (cn.parent.length > 0) {
      cn.parent.forEach((parentNode) => {
        let pcn = CommitNodes.find((pcn) => pcn.hash == parentNode);

        canvas_arrow(
          ctx,
          cn?.xPos,
          cn?.yPos,
          pcn?.xPos,
          pcn?.yPos,
          NodeType.commit,
          NodeType.commit
        );
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
    //console.log(`head hash ${head.hash}`);
    //console.log(`${BranchNodes.length}`);
    //BranchNodes.forEach((i) => console.log(i));
    let b = BranchNodes.find(
      (i) => i.name.toLowerCase() == head.hash.toLowerCase()
    );
    //console.log(`Found branch ${b}`);
    //console.log(`HEad ${head.hash}`);

    if (b === undefined || b === null) {
      let c = CommitNodes.find(
        (i) => i.hash.toLowerCase() == head.hash.toLowerCase()
      );
      if (c) {
        canvas_arrow(
          ctx,
          head?.xPos,
          head?.yPos,
          c?.xPos,
          c?.yPos,
          NodeType.commit,
          NodeType.head
        );
      }
    } else {
      if (b) {
        canvas_arrow(
          ctx,
          head?.xPos,
          head?.yPos,
          b?.xPos,
          b?.yPos,
          NodeType.branch,
          NodeType.head
        );
      }
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
      // console.log(`Drawixng Branch ${bn.hash} to Commit ${CommitNode.hash}`);
      // console.log(
      //   `Drawing Branch ${bn.xPos}  ${bn.yPos} to Commit ${CommitNode.xPos} ${CommitNode.yPos}`
      // );

      canvas_arrow(
        ctx,
        bn?.xPos,
        bn?.yPos,
        CommitNode?.xPos,
        CommitNode?.yPos,
        NodeType.commit,
        NodeType.tag
      );
    } else {
      console.log(`Failed to draw link from Tag ${bn.name} ${bn.hash}`);
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
      // console.log(`Drawixng Branch ${bn.hash} to Commit ${CommitNode.hash}`);
      // console.log(
      //   `Drawing Branch ${bn.xPos}  ${bn.yPos} to Commit ${CommitNode.xPos} ${CommitNode.yPos}`
      // );

      canvas_arrow(
        ctx,
        bn?.xPos,
        bn?.yPos,
        CommitNode?.xPos,
        CommitNode?.yPos,
        NodeType.commit,
        NodeType.branch
      );
    } else {
      console.log(`Failed to draw link from Branch ${bn.name} ${bn.hash}`);
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

      canvas_arrow(
        ctx,
        tn?.xPos,
        tn?.yPos,
        blobNode?.xPos,
        blobNode?.yPos,
        NodeType.blob,
        NodeType.tree
      );
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

      canvas_arrow(
        ctx,
        parentTree?.xPos,
        parentTree?.yPos,
        tn?.xPos,
        tn?.yPos,
        NodeType.tree,
        NodeType.tree
      );
    });
  });
}
