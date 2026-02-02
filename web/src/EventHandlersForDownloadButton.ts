declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

attachDownloadTracking();

function attachDownloadTracking() {
  const downloadButtons = document.querySelectorAll<HTMLElement>(
    "[data-download-os]"
  );

  if (downloadButtons.length === 0) {
    console.log("No download buttons found for tracking");
    return;
  }

  downloadButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const os = btn.getAttribute("data-download-os") || "unknown";
      if (typeof window.gtag === "function") {
        window.gtag("event", "app_download", {
          os,
          page_path: window.location.pathname,
        });
      } else {
        console.log("gtag not available for download tracking");
      }
    });
  });
}
