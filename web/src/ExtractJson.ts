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

import { DrawNodes } from "./DrawNodes";

export function ExtractCommitJsonToNodes(
  CommitJson: Array<GitCommitJson>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D
) {
  //console.dir(CommitJson);
  let yPos = 250;

  CommitNodes.forEach((existingCommit) => {
    // Remove any commits that are no longer present
    if (!CommitJson.find((i) => i.hash == existingCommit.hash)) {
      const NodeToRemoveIndex = CommitNodes.indexOf(existingCommit);
      CommitNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  // find the initial commit to add first
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

  //Find the second commit
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

  //Find the third commit
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
  //DrawNodes(ctx, CommitNodes);
}

export function ExtractTreeJsonToNodes(
  TreeJson: Array<GitTreeJson>,
  TreeNodes: Array<GitTree>,
  CommitNodes: Array<GitCommit>,
  ctx: CanvasRenderingContext2D
) {
  TreeNodes.forEach((existingTree) => {
    // Remove any trees that are no longer present
    if (!TreeJson.find((i) => i.hash == existingTree.hash)) {
      const NodeToRemoveIndex = TreeNodes.indexOf(existingTree);
      TreeNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  // Position trees to align with their corresponding commits
  for (var node of TreeJson) {
    // Find the commit that references this tree
    let parentCommit = CommitNodes.find((c) => c.tree == node.hash);

    if (parentCommit) {
      // Align tree with its commit's Y position
      let tree: GitTree = {
        type: NodeType.tree,
        parents: node.parents,
        blobs: node.blobs,
        text: node.text,
        hash: node.hash,
        xPos: NodePositionX.column4,
        yPos: parentCommit.yPos, // Use same Y position as commit
      };

      if (!TreeNodes.find((existingTree) => existingTree.hash == tree.hash)) {
        TreeNodes.push(tree);
      }
    } else {
      // Fallback for trees without a parent commit
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
    // Remove any commits that are no longer present
    if (!TagJson.find((i) => i.name == existingBranch.name)) {
      const NodeToRemoveIndex = TagNodes.indexOf(existingBranch);
      TagNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of TagJson) {
    // Get the number of existing branches to determine next YPos for new branches
    if (TagNodes.length > 0) yPos = 70 + TagNodes.length * NodeVerticalSpacing;

    // console.log(`adding branch ${node.name}`);
    let tag: GitTag = {
      type: NodeType.tag,
      text: "Tag",
      hash: node.hash,
      name: node.name,
      xPos: NodePositionX.column2 + 30,
      yPos,
    };

    //If Tag exists but Hash is differen then just update the hash
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
        console.log(`Updating existing Tag ${existingTag.name}`);
        existingTag.hash = node.hash;
      }
    }
    if (
      !TagNodes.find(
        (node) => node.name.toUpperCase() == tag.name.toUpperCase()
      )
    ) {
      TagNodes.push(tag);
      console.log(`Added Tag ${tag.name} ${tag.hash} ${tag.yPos}`);
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
    // Remove any commits that are no longer present
    if (!BranchJson.find((i) => i.name == existingBranch.name)) {
      const NodeToRemoveIndex = BranchNodes.indexOf(existingBranch);
      BranchNodes.splice(NodeToRemoveIndex, 1);
    }
  });

  for (var node of BranchJson) {
    // Get the number of existing branches to determine next YPos for new branches
    if (BranchNodes.length > 0)
      yPos = 50 + BranchNodes.length * NodeVerticalSpacing;

    // console.log(`adding branch ${node.name}`);
    let branch: GitBranch = {
      type: NodeType.branch,
      text: "Branch",
      hash: node.hash,
      name: node.name,
      xPos: NodePositionX.column2,
      yPos,
    };

    //If Branch exists but Hash is differen then just update the hash
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
        console.log(`Updating existing branch ${existingBranch.name}`);
        existingBranch.hash = node.hash;
      }
    }
    if (
      !BranchNodes.find(
        (node) => node.name.toUpperCase() == branch.name.toUpperCase()
      )
    ) {
      BranchNodes.push(branch);
      console.log(`Added Branch ${branch.name} ${branch.hash} ${branch.yPos}`);
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
      //console.log("extracting Remote branches");
      // Remove any commits that are no longer present
      if (!RemoteBranchJson?.find((i) => i.name == existingBranch?.name)) {
        const NodeToRemoveIndex = RemoteBranchNodes.indexOf(existingBranch);
        RemoteBranchNodes.splice(NodeToRemoveIndex, 1);
      }
    });

    for (var node of RemoteBranchJson) {
      // Get the number of existing branches to determine next YPos for new branches
      if (RemoteBranchNodes.length > 0)
        yPos = 50 + RemoteBranchNodes.length * NodeVerticalSpacing;

      // console.log(`adding branch ${node.name}`);
      let branch: GitBranch = {
        type: NodeType.remotebranch,
        text: "Remote Branch",
        hash: `${node.hash}`,
        name: node.name,
        xPos: NodePositionX.column6,
        yPos,
      };

      //If Branch exists but Hash is differen then just update the hash
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
          console.log(`Updating existing remote branch ${existingBranch.name}`);
          existingBranch.hash = node.hash;
        }
      }
      if (
        !RemoteBranchNodes.find(
          (node) => node.name.toUpperCase() == branch.name.toUpperCase()
        )
      ) {
        RemoteBranchNodes.push(branch);
        // console.log(
        //   `Added Remote Branch ${branch.name} ${branch.hash} ${branch.yPos}`
        // );
      }
    }
  } catch (e) {
    console.error(`Error extracting Remotes ${e}`);
  }
}

// export function ExtractIndexFileJsonToNodes(
//   IndexFiles: Array<IndexFile>,
//   IndexFileNodes: Array<IndexFile>
// ) {
//   console.log("Index Files");
//   //removeExistingIndexfiles();
//   IndexFiles.forEach((i) => {
//     if (i.filename != " " && i.filename != null && i.filename != undefined)
//       console.log(`filename ${i.filename}`);
//     const regex = new RegExp("/d{6}s([A-Za-z0-9]{4})[A-Za-z0-9]{36}sds(.+)/g");
//     const found = i.filename.match(regex);
//     if (found) {
//       const FoundIndexFile = <IndexFile>{
//         filename: found?.groups[0] + found?.groups[1],
//       };
//       IndexFileNodes.push(i);
//     }
//   });
// }

export function ExtractHeadJsonToNodes(
  HeadJson: GitNode,
  HEADNodes: Array<GitNode>,
  ctx: CanvasRenderingContext2D
) {
  let yPos = 50;
  //HEADNodes.forEach((h) => console.dir(h));
  if (HEADNodes.length == 0) {
    //console.log("adding HEAD again " + NodePositionX.column1);

    let head: GitNode = {
      type: NodeType.head,
      text: "HEAD",
      hash: HeadJson.hash,
      xPos: NodePositionX.column1,
      yPos,
      contents: "",
      tree: "",
      blobs: [],
      name: "",
      filename: "",
      parent: "",
    };
    HEADNodes.push(head);
  } else {
    //console.log("adding HEAD again " + NodePositionX.column1);

    //Update head in case detached
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
  //console.dir(BlobJson);
  BlobNodes.forEach((existingBlob) => {
    // Remove any blobs that are no longer present
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

    // If the blob exists then just update the filename in case now present

    let blob = BlobNodes.find(
      (i) => i.hash == cm.hash && i.filename == "" && cm.filename != ""
    );
    if (blob) {
      //console.log(`updating blob ${blob.hash} to ${cm.filename}`);
      blob.filename = cm.filename;
      blob.trees = cm.trees;
    }

    if (!BlobNodes.find((existingBlob) => existingBlob.hash == cm.hash)) {
      console.log(`Added Blob ${cm.hash} ${cm.filename} ${cm.contents}`);
      BlobNodes.push(cm);
      // console.log("Current BlobNodes");
      // console.dir(BlobNodes);
      yPos = yPos + NodeVerticalSpacing;
    }
  }
}
