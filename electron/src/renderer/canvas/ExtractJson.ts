import {
  NodeVerticalSpacing,
  NodePositionX,
  NodeType,
  NodePositionY,
} from "./Types";

import type {
  GitCommitJson,
  GitTreeJson,
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./Types";

export function ExtractCommitJsonToNodes(
  CommitJson: Array<GitCommitJson>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 250;

  CommitNodes.forEach((existingCommit) => {
    if (!CommitJson.find((i) => i.hash == existingCommit.hash)) {
      const NodeToRemoveIndex = CommitNodes.indexOf(existingCommit);
      CommitNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  let initialCommit = CommitJson.find((i) => i.parent.length == 0);

  if (initialCommit) {
    let cm: GitCommit = {
      type: NodeType.commit,
      hash: initialCommit.hash,
      tree: initialCommit.tree,
      parent: initialCommit.parent,
      text: initialCommit.text,
      xPos: NodePositionX.column3,
      yPos: NodePositionY.level0,
    };

    if (!CommitNodes.find((existingNode) => existingNode.hash == cm.hash)) {
      CommitNodes.push(cm);
    }
  }

  let secondCommit = CommitJson.find((i) => i.parent[0] == initialCommit?.hash);

  if (secondCommit) {
    let cm: GitCommit = {
      type: NodeType.commit,
      hash: secondCommit.hash,
      tree: secondCommit.tree,
      parent: secondCommit.parent,
      text: secondCommit.text,
      xPos: NodePositionX.column3,
      yPos: NodePositionY.level1,
    };
    if (!CommitNodes.find((existingNode) => existingNode.hash == cm.hash)) {
      CommitNodes.push(cm);
    }
  }

  let thirdCommit = CommitJson.find((i) => i.parent[0] == secondCommit?.hash);

  if (thirdCommit) {
    let cm: GitCommit = {
      type: NodeType.commit,
      hash: thirdCommit.hash,
      tree: thirdCommit.tree,
      parent: thirdCommit.parent,
      text: thirdCommit.text,
      xPos: NodePositionX.column3,
      yPos: NodePositionY.level2,
    };
    if (!CommitNodes.find((existingNode) => existingNode.hash == cm.hash)) {
      CommitNodes.push(cm);
    }
  }

  for (var node of CommitJson) {
    let cm: GitCommit = {
      type: NodeType.commit,
      hash: node.hash,
      tree: node.tree,
      parent: node.parent,
      text: node.text,
      xPos: NodePositionX.column3,
      yPos,
    };
    if (cm.hash != initialCommit?.hash && cm.hash != secondCommit?.hash) {
      if (!CommitNodes.find((existingNode) => existingNode.hash == cm.hash)) {
        CommitNodes.push(cm);
        yPos = yPos + NodeVerticalSpacing;
      }
    }
  }
}

export function ExtractTreeJsonToNodes(
  TreeJson: Array<GitTreeJson>,
  TreeNodes: Array<GitTree>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D
) {
  TreeNodes.forEach((existingTree) => {
    if (!TreeJson.find((i) => i.hash == existingTree.hash)) {
      const NodeToRemoveIndex = TreeNodes.indexOf(existingTree);
      TreeNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of TreeJson) {
    let parentCommit = CommitNodes.find((c) => c.tree == node.hash);

    if (parentCommit) {
      let tree: GitTree = {
        type: NodeType.tree,
        parents: node.parents,
        blobs: node.blobs,
        text: node.text,
        hash: node.hash,
        xPos: NodePositionX.column4,
        yPos: parentCommit.yPos,
      };

      if (!TreeNodes.find((existingTree) => existingTree.hash == tree.hash)) {
        TreeNodes.push(tree);
      }
    } else {
      let tree: GitTree = {
        type: NodeType.tree,
        parents: node.parents,
        blobs: node.blobs,
        text: node.text,
        hash: node.hash,
        xPos: NodePositionX.column4,
        yPos: NodePositionY.level0,
      };

      if (!TreeNodes.find((existingTree) => existingTree.hash == tree.hash)) {
        TreeNodes.push(tree);
      }
    }
  }
}

export function ExtractTagJsonToNodes(
  TagJson: Array<GitTag>,
  TagNodes: Array<GitTag>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;

  TagNodes.forEach((existingBranch) => {
    if (!TagJson.find((i) => i.name == existingBranch.name)) {
      const NodeToRemoveIndex = TagNodes.indexOf(existingBranch);
      TagNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of TagJson) {
    if (TagNodes.length > 0) yPos = 70 + TagNodes.length * NodeVerticalSpacing;

    let tag: GitTag = {
      type: NodeType.tag,
      text: "Tag",
      hash: node.hash,
      name: node.name,
      xPos: NodePositionX.column2 + 30,
      yPos,
    };

    if (
      TagNodes.find(
        (bn) =>
          bn.name.toUpperCase() == node.name.toUpperCase() &&
          bn.hash != node.hash
      )
    ) {
      let existingTag = TagNodes.find(
        (bn) => bn.name.toUpperCase() == node.name.toUpperCase()
      );
      if (existingTag) {
        existingTag.hash = node.hash;
      }
    }
    if (
      !TagNodes.find(
        (n) => n.name.toUpperCase() == tag.name.toUpperCase()
      )
    ) {
      TagNodes.push(tag);
    }
  }
}

export function ExtractBranchJsonToNodes(
  BranchJson: Array<GitBranch>,
  BranchNodes: Array<GitBranch>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;

  BranchNodes.forEach((existingBranch) => {
    if (!BranchJson.find((i) => i.name == existingBranch.name)) {
      const NodeToRemoveIndex = BranchNodes.indexOf(existingBranch);
      BranchNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of BranchJson) {
    if (BranchNodes.length > 0)
      yPos = 50 + BranchNodes.length * NodeVerticalSpacing;

    let branch: GitBranch = {
      type: NodeType.branch,
      text: "Branch",
      hash: node.hash,
      name: node.name,
      xPos: NodePositionX.column2,
      yPos,
    };

    if (
      BranchNodes.find(
        (bn) =>
          bn.name.toUpperCase() == node.name.toUpperCase() &&
          bn.hash != node.hash
      )
    ) {
      let existingBranch = BranchNodes.find(
        (bn) => bn.name.toUpperCase() == node.name.toUpperCase()
      );
      if (existingBranch) {
        existingBranch.hash = node.hash;
      }
    }
    if (
      !BranchNodes.find(
        (n) => n.name.toUpperCase() == branch.name.toUpperCase()
      )
    ) {
      BranchNodes.push(branch);
    }
  }
}

export function ExtractRemoteBranchJsonToNodes(
  RemoteBranchJson: Array<GitNode>,
  RemoteBranchNodes: Array<GitBranch>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;

  try {
    RemoteBranchNodes.forEach((existingBranch) => {
      if (!RemoteBranchJson?.find((i) => i.name == existingBranch?.name)) {
        const NodeToRemoveIndex = RemoteBranchNodes.indexOf(existingBranch);
        RemoteBranchNodes.splice(NodeToRemoveIndex, 1);
      }
    });

    for (var node of RemoteBranchJson) {
      if (RemoteBranchNodes.length > 0)
        yPos = 50 + RemoteBranchNodes.length * NodeVerticalSpacing;

      let branch: GitBranch = {
        type: NodeType.remotebranch,
        text: "Remote Branch",
        hash: `${node.hash}`,
        name: node.name,
        xPos: NodePositionX.column6,
        yPos,
      };

      if (
        RemoteBranchNodes.find(
          (bn) =>
            bn.name.toUpperCase() == node.name.toUpperCase() &&
            bn.hash != node.hash
        )
      ) {
        let existingBranch = RemoteBranchNodes.find(
          (bn) => bn.name.toUpperCase() == node.name.toUpperCase()
        );
        if (existingBranch) {
          existingBranch.hash = node.hash;
        }
      }
      if (
        !RemoteBranchNodes.find(
          (n) => n.name.toUpperCase() == branch.name.toUpperCase()
        )
      ) {
        RemoteBranchNodes.push(branch);
      }
    }
  } catch (e) {
    console.error(`Error extracting Remotes ${e}`);
  }
}

export function ExtractHeadJsonToNodes(
  HeadJson: { hash: string },
  HEADNodes: Array<GitNode>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;

  if (HEADNodes.length == 0) {
    let head: GitNode = {
      type: NodeType.head,
      text: "HEAD",
      hash: HeadJson.hash,
      xPos: NodePositionX.column1,
      yPos,
      contents: "",
      tree: "",
      blobs: [],
      parents: [],
      trees: [],
      name: "",
      filename: "",
      parent: "",
    };
    HEADNodes.push(head);
  } else {
    let head = HEADNodes[0];
    head.hash = HeadJson.hash;
  }
}

export function ExtractBlobJsonToNodes(
  BlobJson: Array<GitBlob>,
  BlobNodes: Array<GitBlob>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;

  BlobNodes.forEach((existingBlob) => {
    if (!BlobJson.find((i) => i.hash == existingBlob.hash)) {
      const NodeToRemoveIndex = BlobNodes.indexOf(existingBlob);
      BlobNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of BlobJson) {
    if (BlobNodes.length > 0)
      yPos = 50 + BlobNodes.length * NodeVerticalSpacing;

    let cm: GitBlob = {
      contents: node.contents,
      type: NodeType.blob,
      filename: node.filename,
      trees: node.trees,
      text: "Blob",
      hash: node.hash,
      xPos: NodePositionX.column5,
      yPos,
    };

    let blob = BlobNodes.find(
      (i) => i.hash == cm.hash && i.filename == "" && cm.filename != ""
    );
    if (blob) {
      blob.filename = cm.filename;
      blob.trees = cm.trees;
    }

    if (!BlobNodes.find((existingBlob) => existingBlob.hash == cm.hash)) {
      BlobNodes.push(cm);
      yPos = yPos + NodeVerticalSpacing;
    }
  }
}
