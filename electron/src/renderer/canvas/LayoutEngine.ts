import type { VisState } from "./Redraw";
import type { GitCommit } from "./Types";
import { radius } from "./Types";

const PADDING = 80;
const MIN_NODE_SPACING = 90;
const BOTTOM_BAR_HEIGHT = 120;
const NODE_DIAMETER = radius * 2;

/**
 * Tracks user-dragged node offsets as proportional values (0-1 of viewport).
 * Key is node hash (or "head" for HEAD nodes).
 * Value is { dx, dy } — the pixel offset from the computed layout position
 * at the time of the last layout, stored as fractions of viewport dimensions.
 */
const userOffsets = new Map<string, { dx: number; dy: number }>();

/** Last viewport dimensions used for layout — needed to convert pixel drag deltas to proportions. */
let lastViewportW = 0;
let lastViewportH = 0;

/** Map of hash → { x, y } holding the most recent computed (non-dragged) positions. */
const computedPositions = new Map<string, { x: number; y: number }>();

/**
 * Called by MouseEvents when a user finishes dragging a node.
 * Records the offset between the node's computed position and where the user placed it.
 */
export function recordUserDrag(hash: string, actualX: number, actualY: number) {
  const computed = computedPositions.get(hash);
  if (!computed || lastViewportW === 0 || lastViewportH === 0) return;

  userOffsets.set(hash, {
    dx: (actualX - computed.x) / lastViewportW,
    dy: (actualY - computed.y) / lastViewportH,
  });
}

/**
 * Apply a stored user offset to a node position, scaled to the current viewport.
 * Returns the adjusted position. If no offset recorded, returns the computed position unchanged.
 */
function applyUserOffset(
  hash: string,
  computedX: number,
  computedY: number,
  vpW: number,
  vpH: number
): { x: number; y: number } {
  const offset = userOffsets.get(hash);
  if (!offset) return { x: computedX, y: computedY };

  return {
    x: clamp(computedX + offset.dx * vpW, PADDING, vpW - PADDING),
    y: clamp(computedY + offset.dy * vpH, PADDING, vpH - PADDING),
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Given an array of { key, y } entries in a single column, nudge any that
 * overlap (closer than NODE_DIAMETER) so they no longer sit on top of each other.
 * If the result exceeds maxY, linearly compress all positions into [minY, maxY].
 * This guarantees every node stays within the visible viewport.
 */
function resolveColumnOverlaps(
  entries: Array<{ key: string; y: number }>,
  minY: number = PADDING,
  maxY: number = Infinity
): Map<string, number> {
  const result = new Map<string, number>();
  if (entries.length === 0) return result;

  entries.sort((a, b) => a.y - b.y);

  // Push down: ensure each node is at least NODE_DIAMETER below the previous
  const adjusted = entries.map((e) => ({ ...e }));
  for (let i = 1; i < adjusted.length; i++) {
    const minGapY = adjusted[i - 1].y + NODE_DIAMETER;
    if (adjusted[i].y < minGapY) {
      adjusted[i].y = minGapY;
    }
  }

  // If nodes overflow the viewport, compress into [minY, maxY]
  const first = adjusted[0].y;
  const last = adjusted[adjusted.length - 1].y;
  if (adjusted.length === 1) {
    adjusted[0].y = clamp(adjusted[0].y, minY, maxY);
  } else if (last > maxY || first < minY) {
    const clampedFirst = Math.max(first, minY);
    const clampedLast = Math.min(last, maxY);
    const range = clampedLast - clampedFirst;
    const spacing = range / (adjusted.length - 1);
    for (let i = 0; i < adjusted.length; i++) {
      adjusted[i].y = clampedFirst + i * spacing;
    }
  }

  for (const e of adjusted) {
    result.set(e.key, e.y);
  }

  return result;
}

/**
 * Reposition all nodes to fit within the viewport.
 * User-dragged offsets are preserved proportionally across resizes.
 */
export function layoutNodes(
  state: VisState,
  viewportWidth: number,
  viewportHeight: number
) {
  lastViewportW = viewportWidth;
  lastViewportH = viewportHeight;

  const usableHeight = viewportHeight - PADDING * 2 - BOTTOM_BAR_HEIGHT;
  const usableWidth = viewportWidth - PADDING * 2;
  const maxNodeY = PADDING + usableHeight;

  // --- Determine which columns are active ---
  const columns: string[] = ["head", "branches"];
  if (state.showTags && state.TagNodes.length > 0) columns.push("tags");
  columns.push("commits");
  if (state.showTrees && state.TreeNodes.length > 0) columns.push("trees");
  if (state.showBlobs && state.BlobNodes.length > 0) columns.push("blobs");
  if (state.RemoteBranchNodes.length > 0) columns.push("remotes");

  const colSpacing = usableWidth / (columns.length + 1);
  const colX = (name: string) => {
    const idx = columns.indexOf(name);
    if (idx === -1) return PADDING;
    return PADDING + colSpacing * (idx + 1);
  };

  // --- Sort commits chronologically ---
  const orderedCommits = sortCommitsChronologically(state.CommitNodes);

  const commitCount = orderedCommits.length;
  // Use a fixed spacing between commits (clamped to fit viewport, never stretched)
  const commitSpacing =
    commitCount <= 1
      ? 0
      : Math.min(MIN_NODE_SPACING, usableHeight / (commitCount - 1));

  const commitX = colX("commits");

  // Position commits
  const commitYMap = new Map<string, number>();
  orderedCommits.forEach((commit, i) => {
    const cx = commitX;
    const cy = clamp(PADDING + i * commitSpacing, PADDING, maxNodeY);
    computedPositions.set(commit.hash, { x: cx, y: cy });
    const pos = applyUserOffset(commit.hash, cx, cy, viewportWidth, viewportHeight);
    commit.xPos = pos.x;
    commit.yPos = pos.y;
    commitYMap.set(commit.hash, cy); // use computed Y for dependent node alignment
  });

  // --- Trees ---
  const treeX = colX("trees");
  const treeYMap = new Map<string, number>();
  let subTreeOffset = 0;
  // First pass: compute initial Y values
  const treeInitialY: Array<{ hash: string; cx: number; cy: number }> = [];
  for (const tree of state.TreeNodes) {
    const parentCommitY = commitYMap.get(tree.parents[0]);
    let cx: number;
    let cy: number;
    if (parentCommitY !== undefined) {
      cx = treeX;
      cy = parentCommitY;
    } else {
      const parentTreeY = treeYMap.get(tree.parents[0]);
      cx = treeX + 30;
      cy =
        parentTreeY !== undefined
          ? parentTreeY + MIN_NODE_SPACING * 0.5
          : PADDING + subTreeOffset;
      subTreeOffset += MIN_NODE_SPACING * 0.6;
    }
    treeInitialY.push({ hash: tree.hash, cx, cy });
    treeYMap.set(tree.hash, cy);
  }
  // Resolve overlaps among trees
  const treeEntries = treeInitialY.map((t) => ({ key: t.hash, y: t.cy }));
  const treeResolved = resolveColumnOverlaps(treeEntries, PADDING, maxNodeY);
  // Update treeYMap with resolved values
  for (const [key, y] of treeResolved) {
    treeYMap.set(key, y);
  }
  for (let i = 0; i < state.TreeNodes.length; i++) {
    const tree = state.TreeNodes[i];
    const init = treeInitialY[i];
    const cy = treeResolved.get(tree.hash) ?? init.cy;
    computedPositions.set(tree.hash, { x: init.cx, y: cy });
    const pos = applyUserOffset(tree.hash, init.cx, cy, viewportWidth, viewportHeight);
    tree.xPos = pos.x;
    tree.yPos = pos.y;
  }

  // --- Blobs ---
  const blobX = colX("blobs");
  const blobTreeOwnership = new Map<string, Set<string>>();
  for (const tree of state.TreeNodes) {
    for (const blobHash of tree.blobs) {
      if (!blobTreeOwnership.has(blobHash))
        blobTreeOwnership.set(blobHash, new Set());
      blobTreeOwnership.get(blobHash)!.add(tree.hash);
    }
  }

  const exclusiveBlobs: typeof state.BlobNodes = [];
  const sharedBlobs: typeof state.BlobNodes = [];
  for (const blob of state.BlobNodes) {
    const owners = blobTreeOwnership.get(blob.hash);
    if (owners && owners.size === 1) {
      exclusiveBlobs.push(blob);
    } else {
      sharedBlobs.push(blob);
    }
  }

  const blobsByTree = new Map<string, typeof state.BlobNodes>();
  for (const blob of exclusiveBlobs) {
    const ownerTree = blobTreeOwnership.get(blob.hash)?.values().next()
      .value as string;
    if (!blobsByTree.has(ownerTree)) blobsByTree.set(ownerTree, []);
    blobsByTree.get(ownerTree)!.push(blob);
  }

  // Collect all blob positions, then resolve overlaps across the entire blob column
  const allBlobEntries: Array<{ key: string; y: number }> = [];

  for (const [treeHash, blobs] of blobsByTree) {
    const treeY = treeYMap.get(treeHash) ?? PADDING;
    const clusterHeight = (blobs.length - 1) * MIN_NODE_SPACING * 0.6;
    const startY = treeY - clusterHeight / 2;
    blobs.forEach((blob, i) => {
      const cy = startY + i * MIN_NODE_SPACING * 0.6;
      allBlobEntries.push({ key: blob.hash, y: cy });
    });
  }

  let maxExclusiveY = PADDING;
  for (const e of allBlobEntries) {
    if (e.y > maxExclusiveY) maxExclusiveY = e.y;
  }
  const sharedStartY =
    allBlobEntries.length > 0 ? maxExclusiveY + MIN_NODE_SPACING : PADDING;
  sharedBlobs.forEach((blob, i) => {
    const cy = sharedStartY + i * MIN_NODE_SPACING * 0.6;
    allBlobEntries.push({ key: blob.hash, y: cy });
  });

  // Resolve all blob overlaps at once
  const blobResolved = resolveColumnOverlaps(allBlobEntries, PADDING, maxNodeY);
  for (const blob of state.BlobNodes) {
    const cx = blobX;
    const cy = blobResolved.get(blob.hash) ?? PADDING;
    computedPositions.set(blob.hash, { x: cx, y: cy });
    const pos = applyUserOffset(blob.hash, cx, cy, viewportWidth, viewportHeight);
    blob.xPos = pos.x;
    blob.yPos = pos.y;
  }

  // --- Branches ---
  const branchX = colX("branches");
  let branchFallbackY = PADDING;
  const branchEntries: Array<{ key: string; y: number }> = [];
  for (const branch of state.BranchNodes) {
    const commitY = commitYMap.get(branch.hash);
    const cy = commitY ?? branchFallbackY;
    if (commitY === undefined) branchFallbackY += MIN_NODE_SPACING * 0.7;
    branchEntries.push({ key: `branch:${branch.name}`, y: cy });
  }
  const branchResolved = resolveColumnOverlaps(branchEntries, PADDING, maxNodeY);
  for (const branch of state.BranchNodes) {
    const key = `branch:${branch.name}`;
    const cx = branchX;
    const cy = branchResolved.get(key)!;
    computedPositions.set(key, { x: cx, y: cy });
    const pos = applyUserOffset(key, cx, cy, viewportWidth, viewportHeight);
    branch.xPos = pos.x;
    branch.yPos = pos.y;
  }

  // --- Tags ---
  const tagX = colX("tags");
  let tagFallbackY = PADDING;
  const tagEntries: Array<{ key: string; y: number }> = [];
  for (const tag of state.TagNodes) {
    const commitY = commitYMap.get(tag.hash);
    const cy = commitY ?? tagFallbackY;
    if (commitY === undefined) tagFallbackY += MIN_NODE_SPACING * 0.7;
    tagEntries.push({ key: `tag:${tag.name}`, y: cy });
  }
  const tagResolved = resolveColumnOverlaps(tagEntries, PADDING, maxNodeY);
  for (const tag of state.TagNodes) {
    const key = `tag:${tag.name}`;
    const cx = tagX;
    const cy = tagResolved.get(key)!;
    computedPositions.set(key, { x: cx, y: cy });
    const pos = applyUserOffset(key, cx, cy, viewportWidth, viewportHeight);
    tag.xPos = pos.x;
    tag.yPos = pos.y;
  }

  // --- Remote branches ---
  const remoteX = colX("remotes");
  let remoteFallbackY = PADDING;
  const remoteEntries: Array<{ key: string; y: number }> = [];
  for (const rb of state.RemoteBranchNodes) {
    const commitY = commitYMap.get(rb.hash);
    const cy = commitY ?? remoteFallbackY;
    if (commitY === undefined) remoteFallbackY += MIN_NODE_SPACING * 0.7;
    remoteEntries.push({ key: `remote:${rb.name}`, y: cy });
  }
  const remoteResolved = resolveColumnOverlaps(remoteEntries, PADDING, maxNodeY);
  for (const rb of state.RemoteBranchNodes) {
    const key = `remote:${rb.name}`;
    const cx = remoteX;
    const cy = remoteResolved.get(key)!;
    computedPositions.set(key, { x: cx, y: cy });
    const pos = applyUserOffset(key, cx, cy, viewportWidth, viewportHeight);
    rb.xPos = pos.x;
    rb.yPos = pos.y;
  }

  // --- HEAD ---
  const headX = colX("head");
  for (const head of state.HEADNodes) {
    const branch = state.BranchNodes.find(
      (b) => b.name.toLowerCase() === head.hash.toLowerCase()
    );
    let cy: number;
    if (branch) {
      const branchComputed = computedPositions.get(`branch:${branch.name}`);
      cy = branchComputed?.y ?? branch.yPos;
    } else {
      cy = commitYMap.get(head.hash) ?? PADDING;
    }
    const cx = headX;
    computedPositions.set("head", { x: cx, y: cy });
    const pos = applyUserOffset("head", cx, cy, viewportWidth, viewportHeight);
    head.xPos = pos.x;
    head.yPos = pos.y;
  }
}

/**
 * Get the layout key for a node given its hash and type context.
 * Used by MouseEvents to record drag offsets with the correct key.
 */
export function getNodeLayoutKey(node: any): string {
  if (node.type === 4) return "head"; // NodeType.head
  if (node.type === 0) return `branch:${node.name}`; // branch
  if (node.type === 6) return `tag:${node.name}`; // tag
  if (node.type === 5) return `remote:${node.name}`; // remotebranch
  return node.hash;
}

function sortCommitsChronologically(commits: GitCommit[]): GitCommit[] {
  if (commits.length === 0) return [];

  const childMap = new Map<string, GitCommit[]>();
  for (const c of commits) {
    for (const ph of c.parent) {
      if (!childMap.has(ph)) childMap.set(ph, []);
      childMap.get(ph)!.push(c);
    }
  }

  const root = commits.find((c) => c.parent.length === 0);
  if (!root) return [...commits];

  const ordered: GitCommit[] = [];
  const visited = new Set<string>();
  const queue: GitCommit[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.hash)) continue;
    visited.add(current.hash);
    ordered.push(current);

    const children = childMap.get(current.hash) || [];
    for (const child of children) {
      const allParentsVisited = child.parent.every((ph) => visited.has(ph));
      if (allParentsVisited) {
        queue.push(child);
      } else {
        queue.push(child);
      }
    }
  }

  for (const c of commits) {
    if (!visited.has(c.hash)) ordered.push(c);
  }

  return ordered;
}
