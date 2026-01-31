import { debug } from "./State";
import { PopulateIndexFiles, PopulateWorkingFiles } from "./DrawNodes";
import {
  ExtractBlobJsonToNodes,
  ExtractBranchJsonToNodes,
  ExtractCommitJsonToNodes,
  ExtractHeadJsonToNodes,
  ExtractRemoteBranchJsonToNodes,
  ExtractTagJsonToNodes,
  ExtractTreeJsonToNodes,
} from "./ExtractJson";
import { HideProcessingChanges } from "./ProcessingChanges";
import {
  BlobNodes,
  BranchNodes,
  CommitNodes,
  HEADNodes,
  RemoteBranchNodes,
  TagNodes,
  TreeNodes,
} from "./State";
import { ctx } from "./StateGlobalWindow";

export async function FetchURL(url: any) {
  let res: Response;

  if (debug.get()) {
    res = await fetch("/testdata/sample_api_response.json");
  } else {
    res = await fetch(url);
  }
  if (res.ok) {
    //ShowProcessingChanges();

    let data = await res.json();
    ExtractCommitJsonToNodes(JSON.parse(data.commitNodes), CommitNodes, ctx);
    ExtractBranchJsonToNodes(JSON.parse(data.branchNodes), BranchNodes, ctx);
    ExtractTagJsonToNodes(JSON.parse(data.tagNodes), TagNodes, ctx);
    ExtractTagJsonToNodes(JSON.parse(data.tagNodes), TagNodes, ctx);
    ExtractRemoteBranchJsonToNodes(
      JSON.parse(data.remoteBranchNodes),
      RemoteBranchNodes,
      ctx
    );
    ExtractTreeJsonToNodes(
      JSON.parse(data.treeNodes),
      TreeNodes,
      CommitNodes,
      ctx
    );
    ExtractBlobJsonToNodes(JSON.parse(data.blobNodes), BlobNodes, ctx);
    ExtractHeadJsonToNodes(JSON.parse(data.headNodes), HEADNodes, ctx);
    PopulateIndexFiles(data.indexFilesNodes, BlobNodes);
    //console.log(`Working files ${data.workingFilesNodes}`);
    PopulateWorkingFiles(data.workingFilesNodes);
    HideProcessingChanges();
  } else {
    //console.log("Nothing New Available");
    throw `Error call fetch ${res.statusText}`;
  }
}
