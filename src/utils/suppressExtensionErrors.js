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

  // 2. Chặn lỗi từ Chrome Extension bắn vào React Dev Error Overlay
  const isExtensionError = (error, filename, message) => {
    const msg = message || error?.message || "";
    const file = filename || error?.stack || "";
    if (typeof file === "string" && (file.includes("chrome-extension://") || file.includes("moz-extension://"))) {
      return true;
    }
    if (typeof msg === "string" && msg.includes("responseText") && msg.includes("XMLHttpRequest")) {
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
      }
    },
    true
  );
}
