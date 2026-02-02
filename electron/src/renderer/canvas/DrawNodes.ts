import { radius, NodeType } from "./Types";
import { DrawCircle } from "./DrawCircle";
import type { GitNode } from "./Types";

export function DrawText(ctx: CanvasRenderingContext2D, node: GitNode) {
  ctx.font = "small-caps bold 12px arial";
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  switch (node.type) {
    case NodeType.branch:
      ctx.fillText(`Branch`, node.xPos, node.yPos - 10);
      ctx.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.tag:
      ctx.fillText(`Tag`, node.xPos, node.yPos - 10);
      ctx.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.remotebranch:
      ctx.fillText(`Remote`, node.xPos, node.yPos - 10);
      ctx.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.head:
      ctx.fillStyle = "#000";
      ctx.fillText("HEAD", node.xPos, node.yPos);
      break;
    case NodeType.commit:
      ctx.fillStyle = "white";
      ctx.fillText(`Commit`, node.xPos, node.yPos - 10);
      ctx.fillText(`${node.text}`, node.xPos, node.yPos);
      ctx.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    case NodeType.tree:
      ctx.fillStyle = "white";
      ctx.fillText(`Tree`, node.xPos, node.yPos - 10);
      ctx.fillText(`${node.text}`, node.xPos, node.yPos);
      ctx.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    case NodeType.blob:
      ctx.fillText(`${node.filename}`, node.xPos, node.yPos - 20);
      ctx.fillText(`${node.contents}`, node.xPos, node.yPos);
      ctx.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    default:
      ctx.fillText(node.text, node.xPos, node.yPos - 5);
      ctx.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 3);
  }
}

export function DrawNodes<T>(ctx: CanvasRenderingContext2D, nodes: Array<T>) {
  nodes.forEach((node) => {
    DrawNode(ctx, node as unknown as GitNode, false);
  });
}

export function DrawNode(
  ctx: CanvasRenderingContext2D,
  node: GitNode,
  dragging: boolean
) {
  DrawCircle(ctx, node, dragging);
}
