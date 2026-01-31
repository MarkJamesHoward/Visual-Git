import { FetchURL } from "./Fetch";
import { ReDraw } from "./Redraw";
import {
  AutoMoveViewForwardNanoStore,
  dataNanoStore,
  datasetNanoStore,
  MoveViewBackNanoStore,
  MoveViewForwardNanoStore,
  nameNanoStore,
  passed_in_apiurl,
} from "./State";
import { DisplayDataSet } from "./ToggleView";

export async function PerformUpdate() {
  //Using API passed on URL from the command line app
  let APIurl = `${passed_in_apiurl}/${nameNanoStore.get()}/${
    datasetNanoStore.get() - 1
  }`;
  let APIurlPrevious = `${passed_in_apiurl}/${nameNanoStore.get()}/${
    datasetNanoStore.get() - 2
  }`;
  let APIurlNext = `${passed_in_apiurl}/${nameNanoStore.get()}/${datasetNanoStore.get()}`;
  console.log(`Automove forward is ${AutoMoveViewForwardNanoStore.get()}`);
  if (AutoMoveViewForwardNanoStore.get()) {
    try {
      console.log(`Fetching ${APIurlNext}`);
      await FetchURL(APIurlNext);
      datasetNanoStore.set(datasetNanoStore.get() + 1);
      ReDraw();
    } catch (e) {
      console.log(`No New Data Found For Dataset: ${datasetNanoStore.get()} `);
    }
  } else {
    if (MoveViewBackNanoStore.get()) {
      MoveViewBackNanoStore.set(false);
      try {
        await FetchURL(APIurlPrevious);
        //console.log(`Retrieved JSON for dataset ${dataset}`);
        datasetNanoStore.set(datasetNanoStore.get() - 1);
        ReDraw();
      } catch (e) {
        // console.log(
        //   `Failed to move back - must be at the first commit ${dataset - 1}`
        // );
        datasetNanoStore.set(datasetNanoStore.get() + 1);
      }
    } else if (MoveViewForwardNanoStore.get()) {
      datasetNanoStore.set(datasetNanoStore.get() + 1);
      try {
        MoveViewForwardNanoStore.set(false);
        await FetchURL(APIurlNext);
        ReDraw();
      } catch (e) {
        //console.log(`Failed to move forward - must be at most recent commit`);
        datasetNanoStore.set(datasetNanoStore.get() - 1);
      }
    }
  }
  DisplayDataSet(datasetNanoStore.get() - 1);

  //ImportJsonFromFiles();
}
