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
    return;
  }

  downloadButtons.forEach((btn) => {
    // Open download in new tab so the current page stays alive for GA to fire
    if (btn instanceof HTMLAnchorElement) {
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    }

    btn.addEventListener("click", () => {
      const os = btn.getAttribute("data-download-os") || "unknown";
      const href =
        btn instanceof HTMLAnchorElement ? btn.getAttribute("href") : null;
      const fileName = href?.split("/").pop() || "unknown";
      const fileExtension = fileName.split(".").pop() || "unknown";

      if (typeof window.gtag === "function") {
        window.gtag("event", "file_download", {
          file_name: fileName,
          file_extension: fileExtension,
          link_url: href || "",
          os,
          transport_type: "beacon",
        });
        window.gtag("event", "app_download", {
          os,
          page_path: window.location.pathname,
          transport_type: "beacon",
        });
      }
    });
  });
}
