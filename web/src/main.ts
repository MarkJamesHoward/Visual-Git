import { dragElement } from "./Draggable";
import { dataNanoStore, datasetNanoStore, debug, nameNanoStore } from "./State";
import { CreateMouseListenerHandler, ResizeCanvas } from "./MouseEvents";

import {
  ShowTreesNanoStore,
  ShowBlobsNanoStore,
  ShowTagsNanoStore,
  MoveViewBackNanoStore,
  MoveViewForwardNanoStore,
  AutoMoveViewForwardNanoStore,
} from "./State";

import { ReDraw } from "./Redraw";
import { DecodeURL } from "./DecodeURL";
import { canvas, ctx } from "./StateGlobalWindow";
import { updateBuildVersion } from "./DisplayBuildVersion";
import { PerformUpdate } from "./PerformUpdate";
export let CurrentlyRunningUpdate = false;

ctx.clearRect(0, 0, canvas.width, canvas.height);

DecodeURL();

// Try to update immediately and also wait for custom elements to be defined
document.addEventListener("DOMContentLoaded", () => {
  // Wait for custom element to be defined
  customElements.whenDefined("build-version").then(() => {
    updateBuildVersion();
  });
});

dragElement(document.getElementById("IndexAndWorkingFiles"));
dragElement(document.getElementById("WorkingFiles"));
dragElement(document.getElementById("ToggleView"));

CreateMouseListenerHandler(canvas, ctx);
ResizeCanvas(false);

let nameandvalue = dataNanoStore.get()?.split("/");
nameNanoStore.set(nameandvalue?.[0]);
if (nameandvalue && nameandvalue.length >= 2) {
  datasetNanoStore.set(parseInt(nameandvalue[1]));
  console.log("Repository name:", nameNanoStore.get());
  console.log("Dataset:", datasetNanoStore.get());
} else {
  console.error(
    "Invalid data parameter format. Expected format: 'name/number'"
  );
}

if (!debug.get()) {
  setInterval(async () => {
    //Only try to update if we've completed the last one
    if (!CurrentlyRunningUpdate) {
      CurrentlyRunningUpdate = true;
      try {
        console.log("performing update");
        await PerformUpdate();
      } catch (e) {
        console.log("Error calling the API to fetch latest data");
      }
      CurrentlyRunningUpdate = false;
    }
  }, 1000);
} else {
  await PerformUpdate();
}

// Subscribe to the nanostore State of the HideThings React component to redraw whenever it changes
ShowTreesNanoStore.subscribe(() => {
  ReDraw();
});

ShowBlobsNanoStore.subscribe(() => {
  ReDraw();
});

ShowTagsNanoStore.subscribe(() => {
  ReDraw();
});

AutoMoveViewForwardNanoStore.subscribe(() => {
  ReDraw();
});

MoveViewBackNanoStore.subscribe(() => {
  ReDraw();
});

MoveViewForwardNanoStore.subscribe(() => {
  ReDraw();
});

debug.subscribe(() => {
  ReDraw();
});
