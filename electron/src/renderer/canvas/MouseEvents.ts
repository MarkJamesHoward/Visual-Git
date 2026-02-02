import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./Types";
import { radius } from "./Types";
import { ReDraw, type VisState } from "./Redraw";
import { recordUserDrag, getNodeLayoutKey } from "./LayoutEngine";

let Dragging = false;
let SelectedNode: any = null;
let x: number;
let y: number;

function DetectNode(ClickX: number, ClickY: number, state: VisState) {
  SelectedNode = null;

  const allNodes = [
    ...state.BranchNodes,
    ...state.TagNodes,
    ...state.RemoteBranchNodes,
    ...state.CommitNodes,
    ...state.TreeNodes,
    ...state.HEADNodes,
    ...state.BlobNodes,
  ];

  for (const node of allNodes) {
    if (
      ClickX < node.xPos + radius &&
      ClickX > node.xPos - radius &&
      ClickY < node.yPos + radius &&
      ClickY > node.yPos - radius
    ) {
      SelectedNode = node;
    }
  }
}

const getCursorPosition = (canvas: HTMLCanvasElement, event: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  x = event.clientX - rect.left;
  y = event.clientY - rect.top;
};

export function CreateMouseListenerHandler(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: VisState
) {
  canvas.addEventListener("mousedown", (e) => {
    Dragging = true;
    getCursorPosition(canvas, e);
    DetectNode(x, y, state);
  });

  canvas.addEventListener("mouseup", () => {
    // Record the user's drag offset so the layout engine preserves it on resize
    if (SelectedNode) {
      const key = getNodeLayoutKey(SelectedNode);
      recordUserDrag(key, SelectedNode.xPos, SelectedNode.yPos);
    }
    Dragging = false;
    SelectedNode = null;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (Dragging && SelectedNode) {
      getCursorPosition(canvas, e);
      SelectedNode.xPos = x;
      SelectedNode.yPos = y;
      // Redraw without running layout — user is actively positioning this node
      ReDraw(canvas, ctx, state);
    }
  });
}
