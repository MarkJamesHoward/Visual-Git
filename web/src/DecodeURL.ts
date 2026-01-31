import {
  cmdversion,
  dataNanoStore,
  webversion,
  setCmdVersion,
  setWebVersion,
  passed_in_apiurl,
  setPassedInApiUrl,
} from "./State";

export function DecodeURL() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Decode the URL-encoded API parameter
  setPassedInApiUrl(
    urlParams.get("url") ? decodeURIComponent(urlParams.get("url")!) : null
  );
  dataNanoStore.set(
    urlParams.get("data") ? decodeURIComponent(urlParams.get("data")!) : null
  );
  setCmdVersion(
    urlParams.get("cmdversion")
      ? decodeURIComponent(urlParams.get("cmdversion")!)
      : null
  );
  setWebVersion(__BUILD_NUMBER__);

  console.log("Parsed URL parameters:");
  console.log("API URL:", passed_in_apiurl);
  console.log("Data:", dataNanoStore.get());
  console.log("Command Version:", cmdversion);
}
