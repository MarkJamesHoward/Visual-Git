import { radius, NodeType } from "./Types";
import { DrawCircle } from "./DrawCircle";

import type { GitNode, GitBlob, IndexFile } from "./Types";

export function DrawText(ctx: CanvasRenderingContext2D, node: GitNode) {
  // if (highDPI) {
  //   ctx.font = "italic small-caps bold 6px arial";
  // } else {
  //   ctx.font = "italic small-caps bold 12px arial";
  // }

  ctx.font = "small-caps bold 12px arial";

  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  switch (node.type) {
    case NodeType.branch:
      ctx?.fillText(`Branch`, node.xPos, node.yPos - 10);
      ctx?.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.tag:
      ctx?.fillText(`Tag`, node.xPos, node.yPos - 10);
      ctx?.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.remotebranch:
      ctx?.fillText(`Remote`, node.xPos, node.yPos - 10);
      ctx?.fillText(`${node.name}`, node.xPos, node.yPos + radius / 3);
      break;
    case NodeType.head:
      ctx.fillStyle = "#000";
      ctx?.fillText("HEAD", node.xPos, node.yPos);
      break;
    case NodeType.commit:
      ctx.fillStyle = "white";
      ctx?.fillText(`Commit`, node.xPos, node.yPos - 10);
      ctx?.fillText(`${node.text}`, node.xPos, node.yPos);
      ctx?.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    case NodeType.tree:
      ctx.fillStyle = "white";
      ctx?.fillText(`Tree`, node.xPos, node.yPos - 10);
      ctx?.fillText(`${node.text}`, node.xPos, node.yPos);
      ctx?.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    case NodeType.blob:
      ctx?.fillText(`${node.filename}`, node.xPos, node.yPos - 20);
      ctx?.fillText(`${node.contents}`, node.xPos, node.yPos);
      ctx?.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 2);
      break;
    default:
      ctx?.fillText(node.text, node.xPos, node.yPos - 5);
      ctx?.fillText(`#${node.hash}`, node.xPos, node.yPos + radius / 3);
  }
}

export function PopulateIndexFiles(
  indexFilesJson: string,
  BlobNodes: Array<GitBlob>
) {
  let indexfilesElement = document.getElementById("IndexFilesLitElement");
  let IndexFileNodesRegExed = Array();

  let indexFilesNodes = JSON.parse(indexFilesJson);
  const indexFilesNodeClean = indexFilesNodes.filter(
    (indexFile: IndexFile) => indexFile.filename != ""
  );

  try {
    indexFilesNodeClean.forEach((item) => {
      const regex = /\d{6}\s([A-Za-z0-9]{4})[A-Za-z0-9]{36}\s\d\s(.+)/i;
      const found = item.filename.match(regex);
      if (found) {
        const FoundIndexFile = <IndexFile>{
          filename: `${found?.[2]}`,
          hash: `${found?.[1]}`,
        };
        IndexFileNodesRegExed.push(FoundIndexFile);
      }
    });

    // Get File Contents
    IndexFileNodesRegExed.forEach((file: IndexFile) => {
      const blob = BlobNodes.find((blob) => blob.hash == file.hash);
      if (blob) {
        file.contents = blob.contents;
      }
    });

    const indexFilesJsonClean = JSON.stringify(IndexFileNodesRegExed);
    indexfilesElement?.setAttribute("src", indexFilesJsonClean);
  } catch (e) {
    console.log(e);
  }
}

export function PopulateWorkingFiles(workingFilesJson: string) {
  let indexfiles = document.getElementById("WorkingAreaLitElement");
  //console.log("working files");
  //console.dir(workingFilesJson);
  indexfiles?.setAttribute("src", workingFilesJson);
}

export function DrawNodes<T>(ctx: CanvasRenderingContext2D, nodes: Array<T>) {
  nodes.forEach((node) => {
    DrawNode(ctx, node, false);
  });
}

export function DrawNode(
  ctx: CanvasRenderingContext2D,
  node: GitNode,
  dragging: boolean
) {
  DrawCircle(ctx, node, dragging);
}

export function PaintOverNodeToRemove(
  ctx: CanvasRenderingContext2D,
  node: GitNode
) {
  // First
  ctx?.beginPath();
  ctx?.arc(node.xPos, node.yPos, radius, 0, 2 * Math.PI);
  ctx.fillStyle = "#333";
  ctx?.fill();
  DrawText(ctx, node);
}
