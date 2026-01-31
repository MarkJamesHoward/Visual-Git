

CreateDownloadListenerhandler();

function CreateDownloadListenerhandler() {
  var downloadBtn = document.getElementById("DownloadButton");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      // //Send even to GA4 to update analytics
      // fetch(
      //   "https://www.google-analytics.com/mp/collect?api_secret=n0_8jytOTxiC0bBKaQWLsg&measurement_id=G-7D9M5LKKR7",
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify( 
      //       {"client_id":"315413909.1743745950","non_personalized_ads":false,
      //         "events":[{"name":"application_downloaded_windows","params":{"session_id":1744417038,"debug_mode":1}}]}
      //       )
      //   }
      // );
     
      // Ok let's call the Azure logic app to send an email that a download happened
      console.log("calling API to log download");
      fetch(
        "https://prod-24.australiasoutheast.logic.azure.com:443/workflows/cfa18f55a9a5415eb6ee324fe18bb06d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AE-zwgK4_Y-GfNB-jUElhbDCBl-uApiDNWXPd_Nsx20",
        {
          method: "POST",
        }
      );
    });
  } else {
    console.log("Cannot find download button");
  }
}

function CreateMacOSDownloadListenerhandler() {
  var downloadBtn = document.getElementById("DownloadButtonMacOS");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      // Ok let's call the Azure logic app to send an email that a download happened
      console.log("calling API to log download");
      fetch(
        "https://prod-24.australiasoutheast.logic.azure.com:443/workflows/cfa18f55a9a5415eb6ee324fe18bb06d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AE-zwgK4_Y-GfNB-jUElhbDCBl-uApiDNWXPd_Nsx20",
        {
          method: "POST",
        }
      );
    });
  } else {
    console.log("Cannot find download button");
  }
}

function CreateLinuxDownloadListenerhandler() {
  var downloadBtn = document.getElementById("DownloadButtonLunux");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      // Ok let's call the Azure logic app to send an email that a download happened
      console.log("calling API to log download");
      fetch(
        "https://prod-24.australiasoutheast.logic.azure.com:443/workflows/cfa18f55a9a5415eb6ee324fe18bb06d/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=AE-zwgK4_Y-GfNB-jUElhbDCBl-uApiDNWXPd_Nsx20",
        {
          method: "POST",
        }
      );
    });
  } else {
    console.log("Cannot find download button");
  }
}
