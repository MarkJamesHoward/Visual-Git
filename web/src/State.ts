import type {
  GitNode,
  GitTree,
  GitBlob,
  GitCommit,
  GitBranch,
  GitTag,
  IndexFile,
} from "./Types";
import { atom } from "nanostores";

export const datasetNanoStore = atom(0);
export const nameNanoStore = atom("");

export const debug = atom(false);

export const ShowTreesNanoStore = atom(true);
export const ShowBlobsNanoStore = atom(true);
export const AutoMoveViewForwardNanoStore = atom(true);
export const MoveViewBackNanoStore = atom(false);
export const MoveViewForwardNanoStore = atom(false);
export const ShowTagsNanoStore = atom(true);

export let CommitNodes = Array<GitCommit>();
export let BlobNodes = Array<GitBlob>();
export let BranchNodes = Array<GitBranch>();
export let TagNodes = Array<GitTag>();
export let RemoteBranchNodes = Array<GitNode>();
export let HEADNodes = Array<GitNode>();
export let TreeNodes = Array<GitTree>();
export let IndexFileNodes = Array<IndexFile>();

export let passed_in_apiurl: string;
export let webversion: string;
export let dataNanoStore = atom<any>(null);
export let cmdversion: string;

export function setPassedInApiUrl(newUrl: any) {
  passed_in_apiurl = newUrl;
}

export function setWebVersion(newVersion: any) {
  webversion = newVersion;
}

export function setCmdVersion(newVersion: any) {
  cmdversion = newVersion;
}
