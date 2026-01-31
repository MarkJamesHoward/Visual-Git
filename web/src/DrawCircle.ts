import { DrawText } from "./DrawNodes";
import {
  radius,
  radiusHEAD,
  radiusBRANCH,
  radiusTAG,
  radiusTREE,
  radiusBLOB,
  NodeType,
} from "./Types";
import type { GitNode } from "./Types";

export function DrawCircle(
  ctx: CanvasRenderingContext2D,
  node: GitNode,
  dragging: boolean
) {
  var // Radii of the white glow.
    innerRadius = 1,
    outerRadius = 20;

  var gradient = ctx.createRadialGradient(
    node.xPos,
    node.yPos,
    innerRadius,
    node.xPos,
    node.yPos,
    outerRadius
  );

  switch (node.type) {
    case NodeType.head:
      gradient.addColorStop(0, "yellow");
      gradient.addColorStop(1, "yellow");
      break;
    case NodeType.blob:
      gradient.addColorStop(0, "blue");
      gradient.addColorStop(1, "blue");
      break;
    case NodeType.branch:
      gradient.addColorStop(0, "purple");
      gradient.addColorStop(1, "purple");
      break;
    case NodeType.tag:
      gradient.addColorStop(0, "orange");
      gradient.addColorStop(1, "orange");
      break;
    case NodeType.remotebranch:
      gradient.addColorStop(0, "orange");
      gradient.addColorStop(1, "orange");
      break;
    case NodeType.tree:
      gradient.addColorStop(0, "green");
      gradient.addColorStop(1, "green");
      break;
    case NodeType.commit:
      gradient.addColorStop(0, "red");
      gradient.addColorStop(1, "red");
      break;
  }

  ctx?.beginPath();

  if (node.type == NodeType.head) {
    ctx?.arc(node.xPos, node.yPos, radiusHEAD, 0, 2 * Math.PI);
  } else if (node.type == NodeType.branch) {
    ctx?.arc(node.xPos, node.yPos, radiusBRANCH, 0, 2 * Math.PI);
  } else if (node.type == NodeType.tag) {
    ctx?.arc(node.xPos, node.yPos, radiusTAG, 0, 2 * Math.PI);
  } else if (node.type == NodeType.remotebranch) {
    ctx?.arc(node.xPos, node.yPos, radiusBRANCH, 0, 2 * Math.PI);
  } else if (node.type == NodeType.tree) {
    ctx?.arc(node.xPos, node.yPos, radiusTREE, 0, 2 * Math.PI);
  } else if (node.type == NodeType.blob) {
    ctx?.arc(node.xPos, node.yPos, radiusBLOB, 0, 2 * Math.PI);
  } else {
    ctx?.arc(node.xPos, node.yPos, radius, 0, 2 * Math.PI);
  }
  ctx.fillStyle = gradient;

  ctx?.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.stroke();

  DrawText(ctx, node);

  ctx?.closePath();
}
