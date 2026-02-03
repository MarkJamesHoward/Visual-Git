import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
} from "./canvas/Types";
import {
  ExtractCommitJsonToNodes,
  ExtractBranchJsonToNodes,
  ExtractTagJsonToNodes,
  ExtractRemoteBranchJsonToNodes,
  ExtractTreeJsonToNodes,
  ExtractBlobJsonToNodes,
  ExtractHeadJsonToNodes,
} from "./canvas/ExtractJson";
import { ReDraw, type VisState } from "./canvas/Redraw";
import { CreateMouseListenerHandler } from "./canvas/MouseEvents";
import { layoutNodes } from "./canvas/LayoutEngine";

declare global {
  interface Window {
    electronAPI: {
      selectRepo: () => Promise<string | null>;
      readGitRepo: (path: string) => Promise<any>;
      onGitChanged: (callback: (data: any) => void) => void;
      getAppVersion: () => Promise<string>;
    };
  }
}

const state: VisState = {
  CommitNodes: [],
  TreeNodes: [],
  BlobNodes: [],
  BranchNodes: [],
  TagNodes: [],
  RemoteBranchNodes: [],
  HEADNodes: [],
  showTrees: true,
  showBlobs: true,
  showTags: true,
};

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let mouseListenersSetup = false;

function setLoading(isLoading: boolean, message?: string) {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) return;
  if (message) {
    const text = document.getElementById("loading-text");
    if (text) text.textContent = message;
  }
  overlay.style.display = isLoading ? "flex" : "none";
}

// ---------- Data processing ----------

function processData(data: any) {
  const tmpCanvas = document.createElement("canvas");
  const tmpCtx = tmpCanvas.getContext("2d")!;

  ExtractCommitJsonToNodes(
    JSON.parse(data.commitNodes),
    state.CommitNodes,
    tmpCtx,
  );
  ExtractBranchJsonToNodes(
    JSON.parse(data.branchNodes),
    state.BranchNodes,
    tmpCtx,
  );
  ExtractTagJsonToNodes(JSON.parse(data.tagNodes), state.TagNodes, tmpCtx);
  ExtractRemoteBranchJsonToNodes(
    JSON.parse(data.remoteBranchNodes),
    state.RemoteBranchNodes,
    tmpCtx,
  );
  ExtractTreeJsonToNodes(
    JSON.parse(data.treeNodes),
    state.TreeNodes,
    state.CommitNodes,
    tmpCtx,
  );
  ExtractBlobJsonToNodes(JSON.parse(data.blobNodes), state.BlobNodes, tmpCtx);
  ExtractHeadJsonToNodes(JSON.parse(data.headNodes), state.HEADNodes, tmpCtx);

  populateIndexFiles(data.indexFilesNodes, state.BlobNodes);
  populateWorkingFiles(data.workingFilesNodes);

  redraw();
}

function redraw() {
  if (canvas && ctx) {
    layoutNodes(state, canvas.width, canvas.height);
    ReDraw(canvas, ctx, state);
  }
}

// ---------- Index Files (Staging Area) ----------
// Matches the web's PopulateIndexFiles: parses `git ls-files -s` output via
// regex, extracts the 4-char hash and filename, then enriches with blob contents.

function populateIndexFiles(indexFilesJson: string, blobNodes: GitBlob[]) {
  const el = document.getElementById("index-files-list")!;
  try {
    const raw: Array<{ filename: string }> = JSON.parse(indexFilesJson);
    const cleaned = raw.filter((f) => f.filename && f.filename.trim() !== "");

    interface ParsedIndexFile {
      filename: string;
      hash: string;
      contents: string;
    }

    const parsed: ParsedIndexFile[] = [];
    const regex = /\d{6}\s([A-Za-z0-9]{4})[A-Za-z0-9]{36}\s\d\s(.+)/i;

    for (const item of cleaned) {
      const match = item.filename.match(regex);
      if (match) {
        parsed.push({
          filename: match[2],
          hash: match[1],
          contents: "",
        });
      }
    }

    // Enrich with blob contents
    for (const file of parsed) {
      const blob = blobNodes.find((b) => b.hash === file.hash);
      if (blob) {
        file.contents = blob.contents;
      }
    }

    if (parsed.length === 0) {
      el.innerHTML = '<div class="file-entry-empty">No staged files</div>';
      return;
    }

    el.innerHTML = parsed
      .map(
        (f) => `
      <div class="file-entry">
        <span class="file-entry-name">${escapeHtml(f.filename)}</span>
        <span class="file-entry-hash">#${escapeHtml(f.hash)}</span>
        ${
          f.contents
            ? `<textarea class="file-entry-contents" rows="2" readonly>${escapeHtml(f.contents)}</textarea>`
            : ""
        }
      </div>`,
      )
      .join("");
  } catch {
    el.innerHTML = '<div class="file-entry-empty">No staged files</div>';
  }
}

// ---------- Working Files ----------

function populateWorkingFiles(workingFilesJson: string) {
  const el = document.getElementById("working-files-list")!;
  try {
    const files: Array<{ filename: string; contents?: string }> =
      JSON.parse(workingFilesJson);

    if (files.length === 0) {
      el.innerHTML = '<div class="file-entry-empty">No working files</div>';
      return;
    }

    el.innerHTML = files
      .map(
        (f) => `
      <div class="file-entry">
        <span class="file-entry-name">${escapeHtml(f.filename)}</span>
        ${
          f.contents
            ? `<textarea class="file-entry-contents" rows="2" readonly>${escapeHtml(f.contents)}</textarea>`
            : ""
        }
      </div>`,
      )
      .join("");
  } catch {
    el.innerHTML = '<div class="file-entry-empty">No working files</div>';
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Draggable panels (matching web Draggable.ts) ----------

function makeDraggable(elmnt: HTMLElement) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  const header = document.getElementById(elmnt.id + "HEADER");
  if (header) {
    header.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    // Once user drags, switch from bottom-anchored to top-anchored positioning
    elmnt.style.bottom = "auto";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// ---------- Collapse/expand toggle ----------

function setupCollapseToggle(toggleId: string, contentId: string) {
  const toggle = document.getElementById(toggleId)!;
  const content = document.getElementById(contentId)!;
  let collapsed = false;

  toggle.addEventListener("click", () => {
    collapsed = !collapsed;
    if (collapsed) {
      content.classList.add("collapsed");
      toggle.innerHTML = "&#9660;"; // down chevron (collapsed)
    } else {
      content.classList.remove("collapsed");
      toggle.innerHTML = "&#9650;"; // up chevron (expanded)
    }
  });
}

// ---------- Visualization setup ----------

function showVisualization(repoPath: string) {
  document.getElementById("welcome-screen")!.style.display = "none";
  document.getElementById("app-container")!.style.display = "block";
  document.getElementById("repo-path-display")!.textContent = repoPath;

  canvas = document.getElementById("GitGraph") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redraw();
  });

  if (!mouseListenersSetup) {
    CreateMouseListenerHandler(canvas, ctx, state);
    mouseListenersSetup = true;
  }
}

async function openRepo() {
  const path = await window.electronAPI.selectRepo();
  if (!path) return;

  state.CommitNodes = [];
  state.TreeNodes = [];
  state.BlobNodes = [];
  state.BranchNodes = [];
  state.TagNodes = [];
  state.RemoteBranchNodes = [];
  state.HEADNodes = [];
  mouseListenersSetup = false;

  showVisualization(path);

  setLoading(true, "Loading repository...");
  try {
    const data = await window.electronAPI.readGitRepo(path);
    processData(data);
  } finally {
    setLoading(false);
  }
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("open-repo-btn")!.addEventListener("click", openRepo);
  document
    .getElementById("change-repo-btn")!
    .addEventListener("click", openRepo);

  // Display app version on welcome screen
  const versionEl = document.getElementById("app-version");
  if (versionEl) {
    const version = await window.electronAPI.getAppVersion();
    versionEl.textContent = `v${version}`;
  }

  // Toggle checkboxes
  document.getElementById("show-trees")!.addEventListener("change", (e) => {
    state.showTrees = (e.target as HTMLInputElement).checked;
    redraw();
  });
  document.getElementById("show-blobs")!.addEventListener("change", (e) => {
    state.showBlobs = (e.target as HTMLInputElement).checked;
    redraw();
  });
  document.getElementById("show-tags")!.addEventListener("change", (e) => {
    state.showTags = (e.target as HTMLInputElement).checked;
    redraw();
  });

  // Make file panels draggable (drag from indigo header)
  const workingPanel = document.getElementById("WorkingFiles");
  const indexPanel = document.getElementById("IndexAndWorkingFiles");
  if (workingPanel) makeDraggable(workingPanel);
  if (indexPanel) makeDraggable(indexPanel);

  // Collapse/expand toggles
  setupCollapseToggle("working-files-toggle", "working-files-content");
  setupCollapseToggle("index-files-toggle", "index-files-content");

  // Listen for file watcher updates from main process
  window.electronAPI.onGitChanged((data) => {
    setLoading(true, "Refreshing repository...");
    processData(data);
    setLoading(false);
  });
});
