/**
 * Chống lỗi InvalidStateError do các Chrome Extension (tiện ích mở rộng tải video, bắt link...)
 * tự ý can thiệp vào XMLHttpRequest của trang web và đọc `responseText` trên các request video/stream (arraybuffer).
 */
if (typeof window !== "undefined") {
  // 1. Bọc XMLHttpRequest.prototype.responseText an toàn
  try {
    const proto = window.XMLHttpRequest ? window.XMLHttpRequest.prototype : null;
    if (proto) {
      const originalDesc = Object.getOwnPropertyDescriptor(proto, "responseText");
      if (originalDesc && originalDesc.get) {
        Object.defineProperty(proto, "responseText", {
          get() {
            if (this.responseType && this.responseType !== "" && this.responseType !== "text") {
              return "";
            }
            try {
              return originalDesc.get.call(this);
            } catch (e) {
              return "";
            }
          },
          configurable: true,
          enumerable: true
        });
      }

      const originalXmlDesc = Object.getOwnPropertyDescriptor(proto, "responseXML");
      if (originalXmlDesc && originalXmlDesc.get) {
        Object.defineProperty(proto, "responseXML", {
          get() {
            if (this.responseType && this.responseType !== "" && this.responseType !== "document") {
              return null;
            }
            try {
              return originalXmlDesc.get.call(this);
            } catch (e) {
              return null;
            }
          },
          configurable: true,
          enumerable: true
        });
      }
    }
  } catch (e) {
    // Bỏ qua nếu môi trường không cho phép defineProperty
  }

  // 2. Chặn lỗi từ Chrome Extension bắn vào React Dev Error Overlay & Chrome WebGPU Warning
  const isExtensionError = (error, filename, message) => {
    const msg = String(message || error?.message || "");
    const stack = String(error?.stack || "");
    const file = String(filename || "");

    if (
      file.includes("chrome-extension://") ||
      file.includes("moz-extension://") ||
      stack.includes("chrome-extension://") ||
      stack.includes("moz-extension://") ||
      stack.includes("executors/") ||
      msg.includes("M_ID") ||
      (msg.includes("responseText") && msg.includes("XMLHttpRequest")) ||
      msg.includes("powerPreference") ||
      msg.includes("requestAdapter")
    ) {
      return true;
    }
    return false;
  };

  window.addEventListener(
    "error",
    (event) => {
      if (isExtensionError(event.error, event.filename, event.message)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        hideExtensionOverlay();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      if (isExtensionError(event.reason, null, event.reason?.message)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        hideExtensionOverlay();
      }
    },
    true
  );

  // 3. Tự động đóng overlay của React Dev nếu bị lỗi do Extension bên ngoài bắn vào
  const hideExtensionOverlay = () => {
    try {
      const overlays = document.querySelectorAll("iframe[id='webpack-dev-server-client-overlay'], #webpack-dev-server-client-overlay");
      overlays.forEach((el) => {
        try {
          const content = el.contentDocument?.body?.innerText || "";
          if (
            content.includes("chrome-extension://") ||
            content.includes("M_ID") ||
            content.includes("executors/")
          ) {
            el.remove();
          }
        } catch (e) {
          // ignore cross-origin frame check
        }
      });
    } catch (e) {
      // ignore
    }
  };

  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      hideExtensionOverlay();
    });

    const initObserver = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", initObserver);
    } else {
      initObserver();
    }
  }
}
