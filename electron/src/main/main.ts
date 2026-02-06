import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
} from "electron";

// Linux: Disable sandbox due to AppArmor restrictions on modern distros (Ubuntu 24.04+)
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
}
import * as path from "path";
import * as fs from "fs";
import { randomUUID } from "crypto";
import * as https from "https";
import { readGitRepo } from "../git/GitReader";

declare const __GA_MEASUREMENT_ID__: string | undefined;
declare const __GA_API_SECRET__: string | undefined;
declare const __GA_DEBUG__: string | undefined;

let mainWindow: BrowserWindow | null = null;
let currentRepoPath: string | null = null;
let gitWatcher: fs.FSWatcher | null = null;
let workingDirWatcher: fs.FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

const analyticsConfig = {
  measurementId: process.env.GA_MEASUREMENT_ID || __GA_MEASUREMENT_ID__ || "",
  apiSecret: process.env.GA_API_SECRET || __GA_API_SECRET__ || "",
  debug:
    process.env.GA_DEBUG === "1" ||
    process.env.GA_DEBUG === "true" ||
    __GA_DEBUG__ === "1" ||
    __GA_DEBUG__ === "true",
};

type AnalyticsEventParams = Record<string, string | number | boolean>;

function getAnalyticsClientId(): string {
  const filePath = path.join(app.getPath("userData"), "analytics.json");
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw) as { clientId?: string };
      if (parsed.clientId) return parsed.clientId;
    }
  } catch (e) {
    console.warn("Failed to read analytics client id:", e);
  }

  const clientId = randomUUID();
  try {
    fs.writeFileSync(filePath, JSON.stringify({ clientId }));
  } catch (e) {
    console.warn("Failed to persist analytics client id:", e);
  }
  return clientId;
}

function sendAnalyticsEvent(name: string, params: AnalyticsEventParams) {
  if (!analyticsConfig.measurementId || !analyticsConfig.apiSecret) {
    console.warn(
      "GA analytics not configured. Set GA_MEASUREMENT_ID and GA_API_SECRET.",
    );
    return;
  }

  const payload = JSON.stringify({
    client_id: getAnalyticsClientId(),
    events: [
      {
        name,
        params: {
          ...params,
          debug_mode: analyticsConfig.debug,
          engagement_time_msec: 1,
        },
      },
    ],
  });

  const sendRequest = (path: string, label: string) => {
    const request = https.request(
      {
        method: "POST",
        hostname: "www.google-analytics.com",
        path,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        if (analyticsConfig.debug) {
          console.log(
            `GA ${label} response status: ${response.statusCode || "unknown"}`,
          );
        }
        if (label === "debug") {
          let body = "";
          response.on("data", (chunk) => {
            body += chunk.toString();
          });
          response.on("end", () => {
            if (body) console.log("GA debug response:", body);
          });
        }
        if (response.statusCode && response.statusCode >= 400) {
          console.warn(`GA event failed with status ${response.statusCode}.`);
        }
        response.resume();
      },
    );

    request.on("error", (error) => {
      console.warn("GA event failed:", error);
    });

    request.write(payload);
    request.end();
  };

  const basePath = `/mp/collect?measurement_id=${encodeURIComponent(
    analyticsConfig.measurementId,
  )}&api_secret=${encodeURIComponent(analyticsConfig.apiSecret)}`;

  sendRequest(basePath, "collect");

  if (analyticsConfig.debug) {
    sendRequest(`/debug${basePath}`, "debug");
  }
}

function getRegionFromLocale(locale: string): string {
  const normalized = locale.replace("_", "-");
  const parts = normalized.split("-");
  return parts[1]?.toUpperCase() || "unknown";
}

function trackAppRun() {
  const locale = app.getLocale();
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";

  sendAnalyticsEvent("app_run", {
    app_region: getRegionFromLocale(locale),
    app_locale: locale,
    app_timezone: timeZone,
    app_version: app.getVersion(),
  });
}

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
  trackAppRun();

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

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
