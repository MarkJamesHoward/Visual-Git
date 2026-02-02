declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", attachDownloadTracking, {
    once: true,
  });
} else {
  attachDownloadTracking();
}

function attachDownloadTracking() {
  const downloadButtons =
    document.querySelectorAll<HTMLElement>("[data-download-os]");

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
      } else if (
        window.dataLayer &&
        typeof window.dataLayer.push === "function"
      ) {
        window.dataLayer.push({
          event: "app_download",
          os,
          page_path: window.location.pathname,
        });
      } else {
        console.log("gtag not available for download tracking");
      }
    });
  });
}
