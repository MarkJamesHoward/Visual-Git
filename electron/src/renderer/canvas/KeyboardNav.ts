import type { GitNode, GitCommit, GitTree, GitBlob, GitBranch, GitTag, GitWorktree } from "./Types";
import { NodeType } from "./Types";
import type { VisState } from "./Redraw";

type AnyNode = GitNode | GitCommit | GitTree | GitBlob | GitBranch | GitTag | GitWorktree;

let focusedNode: AnyNode | null = null;
let focusableNodes: AnyNode[] = [];
let focusIndex = -1;

const TYPE_NAMES = ["Branch", "Commit", "Tree", "Blob", "HEAD", "Remote Branch", "Tag", "Worktree"];

export function getFocusedNode(): AnyNode | null {
  return focusedNode;
}

export function setFocusedNode(node: AnyNode | null): void {
  focusedNode = node;
  if (node) {
    focusIndex = focusableNodes.indexOf(node);
    announceNode(node);
  } else {
    focusIndex = -1;
    clearAnnouncement();
  }
}

export function buildFocusableList(state: VisState): AnyNode[] {
  const nodes: AnyNode[] = [];

  // Add in visual column order (left to right)
  nodes.push(...state.HEADNodes);
  nodes.push(...state.BranchNodes);
  if (state.showWorktrees) nodes.push(...state.WorktreeNodes);
  if (state.showTags) nodes.push(...state.TagNodes);
  nodes.push(...state.CommitNodes);
  if (state.showTrees) nodes.push(...state.TreeNodes);
  if (state.showBlobs) nodes.push(...state.BlobNodes);
  nodes.push(...state.RemoteBranchNodes);

  // Sort by x position first, then y position for consistent navigation
  focusableNodes = nodes.sort((a, b) => {
    const ax = a.xPos ?? 0;
    const bx = b.xPos ?? 0;
    const ay = a.yPos ?? 0;
    const by = b.yPos ?? 0;
    return ax - bx || ay - by;
  });

  return focusableNodes;
}

function announceNode(node: AnyNode): void {
  const announcer = document.getElementById("node-announcer");
  if (!announcer) return;

  const typeName = TYPE_NAMES[node.type] || "Node";
  let label = "";

  if ("name" in node && node.name) {
    label = node.name;
  } else if ("filename" in node && node.filename) {
    label = node.filename;
  } else if (node.hash) {
    label = node.hash.substring(0, 7);
  }

  const text = node.text ? `, ${node.text}` : "";
  announcer.textContent = `${typeName}: ${label}${text}`;
}

function clearAnnouncement(): void {
  const announcer = document.getElementById("node-announcer");
  if (announcer) {
    announcer.textContent = "";
  }
}

function findNearestNode(
  currentNode: AnyNode,
  direction: "left" | "right" | "up" | "down"
): AnyNode | null {
  if (focusableNodes.length === 0) return null;

  const cx = currentNode.xPos ?? 0;
  const cy = currentNode.yPos ?? 0;

  let candidates: AnyNode[] = [];

  switch (direction) {
    case "left":
      candidates = focusableNodes.filter(n => (n.xPos ?? 0) < cx - 10);
      break;
    case "right":
      candidates = focusableNodes.filter(n => (n.xPos ?? 0) > cx + 10);
      break;
    case "up":
      candidates = focusableNodes.filter(n => (n.yPos ?? 0) < cy - 10);
      break;
    case "down":
      candidates = focusableNodes.filter(n => (n.yPos ?? 0) > cy + 10);
      break;
  }

  if (candidates.length === 0) return null;

  // Find nearest by distance
  let nearest = candidates[0];
  let minDist = Infinity;

  for (const n of candidates) {
    const nx = n.xPos ?? 0;
    const ny = n.yPos ?? 0;
    const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
    if (dist < minDist) {
      minDist = dist;
      nearest = n;
    }
  }

  return nearest;
}

function getNodesByTypeGroup(state: VisState): Map<string, AnyNode[]> {
  const groups = new Map<string, AnyNode[]>();
  groups.set("head", state.HEADNodes);
  groups.set("branch", state.BranchNodes);
  if (state.showTags) groups.set("tag", state.TagNodes);
  groups.set("commit", state.CommitNodes);
  if (state.showTrees) groups.set("tree", state.TreeNodes);
  if (state.showBlobs) groups.set("blob", state.BlobNodes);
  groups.set("remote", state.RemoteBranchNodes);
  return groups;
}

function getNextTypeGroup(currentType: NodeType, state: VisState, reverse: boolean): AnyNode | null {
  const typeOrder = [
    NodeType.head,
    NodeType.branch,
    NodeType.worktree,
    NodeType.tag,
    NodeType.commit,
    NodeType.tree,
    NodeType.blob,
    NodeType.remotebranch,
  ];

  const currentIndex = typeOrder.indexOf(currentType);
  const direction = reverse ? -1 : 1;

  for (let i = 1; i <= typeOrder.length; i++) {
    const nextIndex = (currentIndex + i * direction + typeOrder.length) % typeOrder.length;
    const nextType = typeOrder[nextIndex];

    // Check if this type is visible
    if (nextType === NodeType.tag && !state.showTags) continue;
    if (nextType === NodeType.worktree && !state.showWorktrees) continue;
    if (nextType === NodeType.tree && !state.showTrees) continue;
    if (nextType === NodeType.blob && !state.showBlobs) continue;

    // Find first node of this type
    const node = focusableNodes.find(n => n.type === nextType);
    if (node) return node;
  }

  return null;
}

export function createKeyboardHandler(
  canvas: HTMLCanvasElement,
  state: VisState,
  onFocusChange: () => void
): void {
  canvas.addEventListener("keydown", (e: KeyboardEvent) => {
    // Only handle keys when canvas is focused
    if (document.activeElement !== canvas) return;

    let handled = false;

    switch (e.key) {
      case "ArrowLeft":
        if (focusedNode) {
          const next = findNearestNode(focusedNode, "left");
          if (next) {
            setFocusedNode(next);
            handled = true;
          }
        }
        break;

      case "ArrowRight":
        if (focusedNode) {
          const next = findNearestNode(focusedNode, "right");
          if (next) {
            setFocusedNode(next);
            handled = true;
          }
        } else if (focusableNodes.length > 0) {
          // First focus - start with first node
          setFocusedNode(focusableNodes[0]);
          handled = true;
        }
        break;

      case "ArrowUp":
        if (focusedNode) {
          const next = findNearestNode(focusedNode, "up");
          if (next) {
            setFocusedNode(next);
            handled = true;
          }
        }
        break;

      case "ArrowDown":
        if (focusedNode) {
          const next = findNearestNode(focusedNode, "down");
          if (next) {
            setFocusedNode(next);
            handled = true;
          }
        } else if (focusableNodes.length > 0) {
          // First focus - start with first node
          setFocusedNode(focusableNodes[0]);
          handled = true;
        }
        break;

      case "Tab":
        if (focusedNode) {
          const next = getNextTypeGroup(focusedNode.type, state, e.shiftKey);
          if (next) {
            setFocusedNode(next);
            handled = true;
          }
        } else if (focusableNodes.length > 0) {
          setFocusedNode(focusableNodes[0]);
          handled = true;
        }
        break;

      case "Home":
        if (focusableNodes.length > 0) {
          setFocusedNode(focusableNodes[0]);
          handled = true;
        }
        break;

      case "End":
        if (focusableNodes.length > 0) {
          setFocusedNode(focusableNodes[focusableNodes.length - 1]);
          handled = true;
        }
        break;

      case "Escape":
        if (focusedNode) {
          setFocusedNode(null);
          handled = true;
        }
        break;

      case "Enter":
      case " ":
        // Select/activate the focused node (currently just keeps focus)
        if (focusedNode) {
          handled = true;
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      onFocusChange();
    }
  });

  // Clear focus when canvas loses focus
  canvas.addEventListener("blur", () => {
    if (focusedNode) {
      setFocusedNode(null);
      onFocusChange();
    }
  });
}
