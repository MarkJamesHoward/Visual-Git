const ProcessingChangesElement = document.getElementById("ProcessingChanges");

export function ShowProcessingChanges() {
  //console.log("showing processing chages");
  ProcessingChangesElement?.classList.add("display:block");
  ProcessingChangesElement?.classList.remove("display:none");
}

export function HideProcessingChanges() {
  //console.log("hidding processing");
  ProcessingChangesElement?.classList.remove("display:block");
  ProcessingChangesElement?.classList.add("display:none");
}
