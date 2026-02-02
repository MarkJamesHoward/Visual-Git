import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";
import * as path from "path";
import * as fs from "fs";
import { readGitRepo } from "../git/GitReader";

let mainWindow: BrowserWindow | null = null;
let currentRepoPath: string | null = null;
let gitWatcher: fs.FSWatcher | null = null;
let workingDirWatcher: fs.FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

function buildAppMenu(): Menu {
  const isMac = process.platform === "darwin";
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? ([
          {
            label: app.name,
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    {
      label: "File",
      submenu: [{ role: isMac ? "close" : "quit" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: isMac
        ? ([
            { role: "minimize" },
            { role: "zoom" },
            { type: "separator" },
            { role: "front" },
          ] as MenuItemConstructorOptions[])
        : ([
            { role: "minimize" },
            { role: "close" },
          ] as MenuItemConstructorOptions[]),
    },
  ];

  return Menu.buildFromTemplate(template);
}

function createWindow() {
  Menu.setApplicationMenu(buildAppMenu());
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Visual Git",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
    stopWatcher();
  });
}

function stopWatcher() {
  if (gitWatcher) {
    gitWatcher.close();
    gitWatcher = null;
  }
  if (workingDirWatcher) {
    workingDirWatcher.close();
    workingDirWatcher = null;
  }
}

function onRepoChanged() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (mainWindow && currentRepoPath) {
      try {
        const data = readGitRepo(currentRepoPath);
        mainWindow.webContents.send("git-changed", data);
      } catch (e) {
        console.error("Error reading git repo on change:", e);
      }
    }
  }, 500);
}

function startWatcher(repoPath: string) {
  stopWatcher();
  const gitDir = path.join(repoPath, ".git");

  try {
    // Watch .git/ for commits, staging, branch changes etc.
    gitWatcher = fs.watch(gitDir, { recursive: true }, onRepoChanged);
  } catch (e) {
    console.error("Error starting .git watcher:", e);
  }

  try {
    // Watch working directory for new/modified/deleted files
    workingDirWatcher = fs.watch(
      repoPath,
      { recursive: true },
      (_event, filename) => {
        // Ignore changes inside .git/ (already handled above)
        if (filename && filename.startsWith(".git")) return;
        onRepoChanged();
      },
    );
  } catch (e) {
    console.error("Error starting working directory watcher:", e);
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("read-git-repo", async (_event, repoPath: string) => {
    currentRepoPath = repoPath;
    startWatcher(repoPath);
    return readGitRepo(repoPath);
  });

  ipcMain.handle("select-repo", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select a Git Repository",
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const repoPath = result.filePaths[0];
    const gitDir = path.join(repoPath, ".git");
    if (!fs.existsSync(gitDir)) {
      dialog.showErrorBox(
        "Not a Git Repository",
        "The selected folder does not contain a .git directory.",
      );
      return null;
    }

    return repoPath;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  stopWatcher();
  if (process.platform !== "darwin") app.quit();
});
