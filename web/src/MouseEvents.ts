import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./Types";
import { radius } from "./Types";

import {
  BranchNodes,
  TagNodes,
  RemoteBranchNodes,
  CommitNodes,
  TreeNodes,
  HEADNodes,
  BlobNodes,
} from "./State";
import { ReDraw } from "./Redraw";

let ResizeCanvasPerformed = false;
let Dragging = false;
let SelectedNode: GitNode | GitTree | GitBlob | GitCommit | GitBranch | GitTag;
let x: number;
let y: number;
let ctx: CanvasRenderingContext2D;
let canvas: HTMLCanvasElement;

/**
 * This function takes a canvas, context, width and height. It scales both the
 * canvas and the context in such a way that everything you draw will be as
 * sharp as possible for the device.
 *
 * It doesn't return anything, it just modifies whatever canvas and context you
 * pass in.
 *
 * Adapted from Paul Lewis's code here:
 * http://www.html5rocks.com/en/tutorials/canvas/hidpi/
 */

export default function scaleCanvas(canvas, context, width, height) {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1;

  // determine the 'backing store ratio' of the canvas context
  const backingStoreRatio =
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;

  // determine the actual ratio we want to draw at
  const ratio = devicePixelRatio / backingStoreRatio;

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    // ...then scale it back down with CSS
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "";
    canvas.style.height = "";
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
}

export function ResizeCanvas(PerformReDraw: boolean) {
  if (!ResizeCanvasPerformed) {
    ResizeCanvasPerformed = true;
    scaleCanvas(canvas, ctx, canvas.clientWidth, canvas.clientHeight);
  }
}

function DetectNode(ClickX: number, ClickY: number) {
  BranchNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Branch Node");
        SelectedNode = node;
      }
    }
  });

  TagNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Tag Node");
        SelectedNode = node;
      }
    }
  });

  RemoteBranchNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Branch Node");
        SelectedNode = node;
      }
    }
  });

  CommitNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Commit Node");
        SelectedNode = node;
      }
    }
  });

  TreeNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Tree Node");
        SelectedNode = node;
      }
    }
  });

  HEADNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Tree Node");
        SelectedNode = node;
      }
    }
  });

  BlobNodes.forEach((node) => {
    if (ClickX < node.xPos + radius && ClickX > node.xPos - radius) {
      if (ClickY < node.yPos + radius && ClickY > node.yPos - radius) {
        //console.log("Clicked on Tree Node");
        SelectedNode = node;
      }
    }
  });
}

const getCursorPosition = (canvas: HTMLCanvasElement, event) => {
  const rect = canvas.getBoundingClientRect();
  x = event.clientX - rect.left;
  y = event.clientY - rect.top;
  //console.log(`${Dragging ? "dragging" : ""} ${x}, ${y}`);
};

export function CreateMouseListenerHandler(
  _canvas: HTMLCanvasElement,
  _ctx: CanvasRenderingContext2D
) {
  ctx = _ctx;
  canvas = _canvas;

  window.addEventListener("resize", () => ResizeCanvas(true));

  //console.dir(BranchNodes);
  canvas.addEventListener("mousedown", (e) => {
    Dragging = true;
    getCursorPosition(canvas, e);
    DetectNode(x, y);
  });

  canvas.addEventListener("mouseup", (e) => {
    Dragging = false;
    getCursorPosition(canvas, e);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (Dragging) {
      //PaintOverNodeToRemove(ctx, SelectedNode);
      getCursorPosition(canvas, e);
      SelectedNode.xPos = x;
      SelectedNode.yPos = y;
      ReDraw();
    }
  });
}
