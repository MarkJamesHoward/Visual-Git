import { describe, it, expect, beforeEach } from "vitest";
import {
  ExtractBranchJsonToNodes,
  ExtractCommitJsonToNodes,
  ExtractTreeJsonToNodes,
  ExtractTagJsonToNodes,
  ExtractBlobJsonToNodes,
} from "../src/ExtractJson";
import {
  NodeType,
  NodePositionX,
  NodePositionY,
  NodeVerticalSpacing,
} from "../src/Types";
import type {
  GitBranch,
  GitCommit,
  GitCommitJson,
  GitTree,
  GitTreeJson,
  GitTag,
  GitBlob,
} from "../src/Types";

describe("ExtractBranchJsonToNodes", () => {
  let mockCtx: CanvasRenderingContext2D;
  let BranchNodes: Array<GitBranch>;

  beforeEach(() => {
    // Create a minimal mock canvas context
    mockCtx = {} as CanvasRenderingContext2D;
    BranchNodes = [];
  });

  it("should extract branch nodes from JSON data correctly", () => {
    // Sample data from the test JSON file
    const BranchJson: Array<GitBranch> = [
      {
        hash: "3225",
        name: "feature",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
      {
        hash: "d441",
        name: "main",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    // Verify correct number of branches extracted
    expect(BranchNodes.length).toBe(2);

    // Verify first branch (feature)
    const featureBranch = BranchNodes.find((b) => b.name === "feature");
    expect(featureBranch).toBeDefined();
    expect(featureBranch?.hash).toBe("3225");
    expect(featureBranch?.name).toBe("feature");
    expect(featureBranch?.type).toBe(NodeType.branch);
    expect(featureBranch?.text).toBe("Branch");
    expect(featureBranch?.xPos).toBe(NodePositionX.column2);
    expect(featureBranch?.yPos).toBe(50);

    // Verify second branch (main)
    const mainBranch = BranchNodes.find((b) => b.name === "main");
    expect(mainBranch).toBeDefined();
    expect(mainBranch?.hash).toBe("d441");
    expect(mainBranch?.name).toBe("main");
    expect(mainBranch?.type).toBe(NodeType.branch);
    expect(mainBranch?.text).toBe("Branch");
    expect(mainBranch?.xPos).toBe(NodePositionX.column2);
    expect(mainBranch?.yPos).toBe(50 + NodeVerticalSpacing);
  });

  it("should handle empty branch JSON array", () => {
    const BranchJson: Array<GitBranch> = [];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    expect(BranchNodes.length).toBe(0);
  });

  it("should update existing branch hash when hash changes", () => {
    // Pre-populate with a branch
    BranchNodes.push({
      type: NodeType.branch,
      hash: "old_hash",
      name: "main",
      text: "Branch",
      xPos: NodePositionX.column2,
      yPos: 50,
    });

    // Update with new hash
    const BranchJson: Array<GitBranch> = [
      {
        hash: "new_hash",
        name: "main",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    // Should still have only one branch
    expect(BranchNodes.length).toBe(1);
    // Hash should be updated
    expect(BranchNodes[0].hash).toBe("new_hash");
    expect(BranchNodes[0].name).toBe("main");
  });

  it("should remove branches that no longer exist in JSON", () => {
    // Pre-populate with branches
    BranchNodes.push({
      type: NodeType.branch,
      hash: "3225",
      name: "feature",
      text: "Branch",
      xPos: NodePositionX.column2,
      yPos: 50,
    });
    BranchNodes.push({
      type: NodeType.branch,
      hash: "d441",
      name: "main",
      text: "Branch",
      xPos: NodePositionX.column2,
      yPos: 50 + NodeVerticalSpacing,
    });

    // Only include main branch in JSON
    const BranchJson: Array<GitBranch> = [
      {
        hash: "d441",
        name: "main",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    // Should only have main branch now
    expect(BranchNodes.length).toBe(1);
    expect(BranchNodes[0].name).toBe("main");
  });

  it("should handle case-insensitive branch name matching", () => {
    // Pre-populate with lowercase branch name
    BranchNodes.push({
      type: NodeType.branch,
      hash: "old_hash",
      name: "main",
      text: "Branch",
      xPos: NodePositionX.column2,
      yPos: 50,
    });

    // Update with uppercase branch name
    const BranchJson: Array<GitBranch> = [
      {
        hash: "new_hash",
        name: "MAIN",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    // Should recognize it as the same branch and update hash
    expect(BranchNodes.length).toBe(1);
    expect(BranchNodes[0].hash).toBe("new_hash");
  });

  it("should create correct links from branches to commits", () => {
    const BranchJson: Array<GitBranch> = [
      {
        hash: "3225",
        name: "feature",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
      {
        hash: "d441",
        name: "main",
        type: NodeType.branch,
        text: "Branch",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBranchJsonToNodes(BranchJson, BranchNodes, mockCtx);

    // Verify branches point to correct commit hashes
    const featureBranch = BranchNodes.find((b) => b.name === "feature");
    expect(featureBranch?.hash).toBe("3225"); // Points to initial commit

    const mainBranch = BranchNodes.find((b) => b.name === "main");
    expect(mainBranch?.hash).toBe("d441"); // Points to third commit
  });
});

describe("ExtractCommitJsonToNodes", () => {
  let mockCtx: CanvasRenderingContext2D;
  let CommitNodes: Array<GitCommit>;

  beforeEach(() => {
    mockCtx = {} as CanvasRenderingContext2D;
    CommitNodes = [];
  });

  it("should extract commit nodes from JSON data correctly", () => {
    const CommitJson: Array<GitCommitJson> = [
      { hash: "3225", parent: [], tree: "cf25", text: "initial" },
      { hash: "60bf", parent: ["3225"], tree: "d91a", text: "more" },
      { hash: "d441", parent: ["60bf"], tree: "11a3", text: "next" },
    ];

    ExtractCommitJsonToNodes(CommitJson, CommitNodes, mockCtx);

    expect(CommitNodes.length).toBe(3);

    // Verify initial commit
    const initialCommit = CommitNodes.find((c) => c.hash === "3225");
    expect(initialCommit).toBeDefined();
    expect(initialCommit?.text).toBe("initial");
    expect(initialCommit?.parent).toEqual([]);
    expect(initialCommit?.tree).toBe("cf25");
    expect(initialCommit?.type).toBe(NodeType.commit);
    expect(initialCommit?.xPos).toBe(NodePositionX.column3);
    expect(initialCommit?.yPos).toBe(NodePositionY.level0);

    // Verify second commit
    const secondCommit = CommitNodes.find((c) => c.hash === "60bf");
    expect(secondCommit).toBeDefined();
    expect(secondCommit?.text).toBe("more");
    expect(secondCommit?.parent).toEqual(["3225"]);
    expect(secondCommit?.tree).toBe("d91a");
    expect(secondCommit?.yPos).toBe(NodePositionY.level1);

    // Verify third commit
    const thirdCommit = CommitNodes.find((c) => c.hash === "d441");
    expect(thirdCommit).toBeDefined();
    expect(thirdCommit?.text).toBe("next");
    expect(thirdCommit?.parent).toEqual(["60bf"]);
    expect(thirdCommit?.tree).toBe("11a3");
    expect(thirdCommit?.yPos).toBe(NodePositionY.level2);
  });

  it("should create correct links from commits to trees", () => {
    const CommitJson: Array<GitCommitJson> = [
      { hash: "3225", parent: [], tree: "cf25", text: "initial" },
      { hash: "60bf", parent: ["3225"], tree: "d91a", text: "more" },
      { hash: "d441", parent: ["60bf"], tree: "11a3", text: "next" },
    ];

    ExtractCommitJsonToNodes(CommitJson, CommitNodes, mockCtx);

    // Verify each commit points to correct tree
    expect(CommitNodes.find((c) => c.hash === "3225")?.tree).toBe("cf25");
    expect(CommitNodes.find((c) => c.hash === "60bf")?.tree).toBe("d91a");
    expect(CommitNodes.find((c) => c.hash === "d441")?.tree).toBe("11a3");
  });

  it("should maintain parent-child relationships between commits", () => {
    const CommitJson: Array<GitCommitJson> = [
      { hash: "3225", parent: [], tree: "cf25", text: "initial" },
      { hash: "60bf", parent: ["3225"], tree: "d91a", text: "more" },
      { hash: "d441", parent: ["60bf"], tree: "11a3", text: "next" },
    ];

    ExtractCommitJsonToNodes(CommitJson, CommitNodes, mockCtx);

    // Verify parent relationships
    const initialCommit = CommitNodes.find((c) => c.hash === "3225");
    expect(initialCommit?.parent).toEqual([]);

    const secondCommit = CommitNodes.find((c) => c.hash === "60bf");
    expect(secondCommit?.parent).toEqual(["3225"]);

    const thirdCommit = CommitNodes.find((c) => c.hash === "d441");
    expect(thirdCommit?.parent).toEqual(["60bf"]);
  });
});

describe("ExtractTreeJsonToNodes", () => {
  let mockCtx: CanvasRenderingContext2D;
  let TreeNodes: Array<GitTree>;
  let CommitNodes: Array<GitCommit>;

  beforeEach(() => {
    mockCtx = {} as CanvasRenderingContext2D;
    TreeNodes = [];
    CommitNodes = [
      {
        type: NodeType.commit,
        hash: "3225",
        parent: [],
        tree: "cf25",
        text: "initial",
        xPos: NodePositionX.column3,
        yPos: NodePositionY.level0,
      },
      {
        type: NodeType.commit,
        hash: "60bf",
        parent: ["3225"],
        tree: "d91a",
        text: "more",
        xPos: NodePositionX.column3,
        yPos: NodePositionY.level1,
      },
      {
        type: NodeType.commit,
        hash: "d441",
        parent: ["60bf"],
        tree: "11a3",
        text: "next",
        xPos: NodePositionX.column3,
        yPos: NodePositionY.level2,
      },
    ];
  });

  it("should extract tree nodes from JSON data correctly", () => {
    const TreeJson: Array<GitTreeJson> = [
      { hash: "cf25", blobs: ["492f"], parents: ["3225"], text: "Root" },
      {
        hash: "d91a",
        blobs: ["ef49", "492f"],
        parents: ["60bf"],
        text: "Root",
      },
      {
        hash: "11a3",
        blobs: ["ef49", "492f"],
        parents: ["d441"],
        text: "Root",
      },
    ];

    ExtractTreeJsonToNodes(TreeJson, TreeNodes, CommitNodes, mockCtx);

    expect(TreeNodes.length).toBe(3);

    // Verify first tree
    const firstTree = TreeNodes.find((t) => t.hash === "cf25");
    expect(firstTree).toBeDefined();
    expect(firstTree?.blobs).toEqual(["492f"]);
    expect(firstTree?.parents).toEqual(["3225"]);
    expect(firstTree?.text).toBe("Root");
    expect(firstTree?.type).toBe(NodeType.tree);
    expect(firstTree?.xPos).toBe(NodePositionX.column4);

    // Verify second tree
    const secondTree = TreeNodes.find((t) => t.hash === "d91a");
    expect(secondTree).toBeDefined();
    expect(secondTree?.blobs).toEqual(["ef49", "492f"]);
    expect(secondTree?.parents).toEqual(["60bf"]);

    // Verify third tree
    const thirdTree = TreeNodes.find((t) => t.hash === "11a3");
    expect(thirdTree).toBeDefined();
    expect(thirdTree?.blobs).toEqual(["ef49", "492f"]);
    expect(thirdTree?.parents).toEqual(["d441"]);
  });

  it("should create correct links from trees to blobs", () => {
    const TreeJson: Array<GitTreeJson> = [
      { hash: "cf25", blobs: ["492f"], parents: ["3225"], text: "Root" },
      {
        hash: "d91a",
        blobs: ["ef49", "492f"],
        parents: ["60bf"],
        text: "Root",
      },
      {
        hash: "11a3",
        blobs: ["ef49", "492f"],
        parents: ["d441"],
        text: "Root",
      },
    ];

    ExtractTreeJsonToNodes(TreeJson, TreeNodes, CommitNodes, mockCtx);

    // Verify tree-to-blob links
    expect(TreeNodes.find((t) => t.hash === "cf25")?.blobs).toEqual(["492f"]);
    expect(TreeNodes.find((t) => t.hash === "d91a")?.blobs).toEqual([
      "ef49",
      "492f",
    ]);
    expect(TreeNodes.find((t) => t.hash === "11a3")?.blobs).toEqual([
      "ef49",
      "492f",
    ]);
  });

  it("should create correct links from trees to parent commits", () => {
    const TreeJson: Array<GitTreeJson> = [
      { hash: "cf25", blobs: ["492f"], parents: ["3225"], text: "Root" },
      {
        hash: "d91a",
        blobs: ["ef49", "492f"],
        parents: ["60bf"],
        text: "Root",
      },
      {
        hash: "11a3",
        blobs: ["ef49", "492f"],
        parents: ["d441"],
        text: "Root",
      },
    ];

    ExtractTreeJsonToNodes(TreeJson, TreeNodes, CommitNodes, mockCtx);

    // Verify tree-to-commit links through parents
    expect(TreeNodes.find((t) => t.hash === "cf25")?.parents).toEqual(["3225"]);
    expect(TreeNodes.find((t) => t.hash === "d91a")?.parents).toEqual(["60bf"]);
    expect(TreeNodes.find((t) => t.hash === "11a3")?.parents).toEqual(["d441"]);
  });
});

describe("ExtractTagJsonToNodes", () => {
  let mockCtx: CanvasRenderingContext2D;
  let TagNodes: Array<GitTag>;

  beforeEach(() => {
    mockCtx = {} as CanvasRenderingContext2D;
    TagNodes = [];
  });

  it("should handle empty tag JSON array", () => {
    const TagJson: Array<GitTag> = [];

    ExtractTagJsonToNodes(TagJson, TagNodes, mockCtx);

    expect(TagNodes.length).toBe(0);
  });

  it("should extract tag nodes correctly when present", () => {
    const TagJson: Array<GitTag> = [
      {
        hash: "3225",
        name: "v1.0",
        type: NodeType.tag,
        text: "Tag",
        xPos: 0,
        yPos: 0,
      },
      {
        hash: "d441",
        name: "v2.0",
        type: NodeType.tag,
        text: "Tag",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractTagJsonToNodes(TagJson, TagNodes, mockCtx);

    expect(TagNodes.length).toBe(2);

    const v1Tag = TagNodes.find((t) => t.name === "v1.0");
    expect(v1Tag).toBeDefined();
    expect(v1Tag?.hash).toBe("3225");
    expect(v1Tag?.type).toBe(NodeType.tag);
    expect(v1Tag?.text).toBe("Tag");
    expect(v1Tag?.xPos).toBe(NodePositionX.column2 + 30);

    const v2Tag = TagNodes.find((t) => t.name === "v2.0");
    expect(v2Tag).toBeDefined();
    expect(v2Tag?.hash).toBe("d441");
  });

  it("should create correct links from tags to commits", () => {
    const TagJson: Array<GitTag> = [
      {
        hash: "3225",
        name: "v1.0",
        type: NodeType.tag,
        text: "Tag",
        xPos: 0,
        yPos: 0,
      },
      {
        hash: "d441",
        name: "v2.0",
        type: NodeType.tag,
        text: "Tag",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractTagJsonToNodes(TagJson, TagNodes, mockCtx);

    // Verify tags point to correct commit hashes
    expect(TagNodes.find((t) => t.name === "v1.0")?.hash).toBe("3225");
    expect(TagNodes.find((t) => t.name === "v2.0")?.hash).toBe("d441");
  });

  it("should update tag hash when it changes", () => {
    // Pre-populate with a tag
    TagNodes.push({
      type: NodeType.tag,
      hash: "old_hash",
      name: "v1.0",
      text: "Tag",
      xPos: NodePositionX.column2 + 30,
      yPos: 50,
    });

    const TagJson: Array<GitTag> = [
      {
        hash: "new_hash",
        name: "v1.0",
        type: NodeType.tag,
        text: "Tag",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractTagJsonToNodes(TagJson, TagNodes, mockCtx);

    expect(TagNodes.length).toBe(1);
    expect(TagNodes[0].hash).toBe("new_hash");
    expect(TagNodes[0].name).toBe("v1.0");
  });
});

describe("ExtractBlobJsonToNodes", () => {
  let mockCtx: CanvasRenderingContext2D;
  let BlobNodes: Array<GitBlob>;

  beforeEach(() => {
    mockCtx = {} as CanvasRenderingContext2D;
    BlobNodes = [];
  });

  it("should extract blob nodes from JSON data correctly", () => {
    const BlobJson: Array<GitBlob> = [
      {
        filename: "test.txt",
        hash: "492f",
        trees: ["cf25", "d91a", "11a3", ""],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
      {
        filename: "more.txt more1.txt",
        hash: "ef49",
        trees: ["d91a", "11a3", ""],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBlobJsonToNodes(BlobJson, BlobNodes, mockCtx);

    expect(BlobNodes.length).toBe(2);

    // Verify first blob
    const testBlob = BlobNodes.find((b) => b.hash === "492f");
    expect(testBlob).toBeDefined();
    expect(testBlob?.filename).toBe("test.txt");
    expect(testBlob?.trees).toEqual(["cf25", "d91a", "11a3", ""]);
    expect(testBlob?.type).toBe(NodeType.blob);
    expect(testBlob?.text).toBe("Blob");
    expect(testBlob?.xPos).toBe(NodePositionX.column5);

    // Verify second blob
    const moreBlob = BlobNodes.find((b) => b.hash === "ef49");
    expect(moreBlob).toBeDefined();
    expect(moreBlob?.filename).toBe("more.txt more1.txt");
    expect(moreBlob?.trees).toEqual(["d91a", "11a3", ""]);
  });

  it("should create correct links from blobs to trees", () => {
    const BlobJson: Array<GitBlob> = [
      {
        filename: "test.txt",
        hash: "492f",
        trees: ["cf25", "d91a", "11a3", ""],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
      {
        filename: "more.txt more1.txt",
        hash: "ef49",
        trees: ["d91a", "11a3", ""],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBlobJsonToNodes(BlobJson, BlobNodes, mockCtx);

    // Verify blob-to-tree links
    const testBlob = BlobNodes.find((b) => b.hash === "492f");
    expect(testBlob?.trees).toContain("cf25");
    expect(testBlob?.trees).toContain("d91a");
    expect(testBlob?.trees).toContain("11a3");

    const moreBlob = BlobNodes.find((b) => b.hash === "ef49");
    expect(moreBlob?.trees).toContain("d91a");
    expect(moreBlob?.trees).toContain("11a3");
    expect(moreBlob?.trees).not.toContain("cf25");
  });

  it("should update blob filename when it becomes available", () => {
    // Pre-populate with blob without filename
    BlobNodes.push({
      type: NodeType.blob,
      contents: "",
      filename: "",
      trees: ["cf25"],
      text: "Blob",
      hash: "492f",
      xPos: NodePositionX.column5,
      yPos: 50,
    });

    const BlobJson: Array<GitBlob> = [
      {
        filename: "test.txt",
        hash: "492f",
        trees: ["cf25", "d91a", "11a3", ""],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBlobJsonToNodes(BlobJson, BlobNodes, mockCtx);

    // Should update filename and trees
    expect(BlobNodes.length).toBe(1);
    expect(BlobNodes[0].filename).toBe("test.txt");
    expect(BlobNodes[0].trees).toEqual(["cf25", "d91a", "11a3", ""]);
  });

  it("should remove blobs that no longer exist in JSON", () => {
    // Pre-populate with blobs
    BlobNodes.push({
      type: NodeType.blob,
      contents: "",
      filename: "test.txt",
      trees: ["cf25"],
      text: "Blob",
      hash: "492f",
      xPos: NodePositionX.column5,
      yPos: 50,
    });
    BlobNodes.push({
      type: NodeType.blob,
      contents: "",
      filename: "more.txt",
      trees: ["d91a"],
      text: "Blob",
      hash: "ef49",
      xPos: NodePositionX.column5,
      yPos: 50 + NodeVerticalSpacing,
    });

    // Only include one blob in JSON
    const BlobJson: Array<GitBlob> = [
      {
        filename: "test.txt",
        hash: "492f",
        trees: ["cf25"],
        contents: "",
        type: NodeType.blob,
        text: "Blob",
        xPos: 0,
        yPos: 0,
      },
    ];

    ExtractBlobJsonToNodes(BlobJson, BlobNodes, mockCtx);

    // Should only have test.txt blob now
    expect(BlobNodes.length).toBe(1);
    expect(BlobNodes[0].hash).toBe("492f");
  });
});
