import { contextBridge, ipcRenderer } from "electron";
import type { GitRepoData } from "../git/types";

contextBridge.exposeInMainWorld("electronAPI", {
  selectRepo: (): Promise<string | null> => ipcRenderer.invoke("select-repo"),
  readGitRepo: (repoPath: string): Promise<GitRepoData> =>
    ipcRenderer.invoke("read-git-repo", repoPath),
  onGitChanged: (callback: (data: GitRepoData) => void) => {
    ipcRenderer.on("git-changed", (_event, data) => callback(data));
  },
});
