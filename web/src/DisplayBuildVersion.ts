import type { BuildVersion } from "./components/BuildVersion";
import { cmdversion, passed_in_apiurl, webversion, debug } from "./State";

// Function to update build version - using proper custom element approach
export function updateBuildVersion() {
  const buildVersion = document.getElementById(
    "BuildVersion"
  ) as BuildVersion | null;

  if (buildVersion) {
    console.log(
      "Setting build versions - cmd:",
      cmdversion,
      "web:",
      webversion
    );
    if (cmdversion) {
      buildVersion.cmdversion = cmdversion;
    }
    if (passed_in_apiurl) {
      buildVersion.apiurl = passed_in_apiurl;
    }
    buildVersion.webversion = webversion;
  } else {
    console.log("BuildVersion element not found");
  }
}
