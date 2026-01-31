import { ReDraw } from "./Redraw";

export function DisplayDataSet(dataset: Number) {
  if (CurrentDataSetInput) CurrentDataSetInput.value = dataset.toString();
}

const CurrentDataSetInput = <HTMLInputElement>(
  document.getElementById("CurrentDataSet")
);

// const ToggleAutoMoveViewForward = <HTMLInputElement>(
//   document.getElementById("ToggleAutoMoveViewForward")
// );

// ToggleAutoMoveViewForward?.addEventListener("change", () => {
//   //AutoMoveViewForward = ToggleAutoMoveViewForward.checked;
//   setAutoMoveViewForward(ToggleAutoMoveViewForward.checked);

//   if (AutoMoveViewForward) {
//     MoveViewBackButton.disabled = true;
//     MoveViewForwardButton.disabled = true;
//     ReDraw();
//   } else {
//     MoveViewBackButton.disabled = false;
//     MoveViewForwardButton.disabled = false;
//   }
// });

// const MoveViewBackButton = <HTMLInputElement>(
//   document.getElementById("MoveViewBack")
// );
// MoveViewBackButton?.addEventListener("click", () => {
//   //MoveViewBack = true;
//   setMoveViewBack(true);
// });

// const MoveViewForwardButton = <HTMLInputElement>(
//   document.getElementById("MoveViewForward")
// );
// MoveViewForwardButton?.addEventListener("click", () => {
//   //MoveViewForward = true;
//   setMoveViewForward(true);
// });
