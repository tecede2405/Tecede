import { useEffect, useRef } from "react";

/**
 * Custom hook to prevent the screen from sleeping/turning black while watching movies.
 * Works seamlessly with both embed iframes and direct video players, in normal & fullscreen modes.
 * 
 * Strategy:
 * 1. Primary: Screen Wake Lock API (navigator.wakeLock) - modern standard (>97% browser support).
 *    - Automatically re-acquires lock when returning to tab (visibilitychange) or toggling fullscreen.
 * 2. Fallback: Hidden looping blank video element (NoSleep pattern) for legacy/restricted browsers.
 */
export function useScreenWakeLock(enabled = true) {
  const wakeLockRef = useRef(null);
  const fallbackVideoRef = useRef(null);
  const isAcquiringRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    // --- FALLBACK: Hidden looping video for browsers without WakeLock API ---
    const startFallbackVideo = () => {
      if (fallbackVideoRef.current || !isMounted) return;
      try {
        const video = document.createElement("video");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.muted = true;
        video.loop = true;
        video.style.position = "fixed";
        video.style.top = "-9999px";
        video.style.left = "-9999px";
        video.style.width = "1px";
        video.style.height = "1px";
        video.style.opacity = "0";
        video.style.pointerEvents = "none";
        video.style.zIndex = "-1";

        // 1-frame blank WebM video data URI
        video.src = "data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAuDQ1HQINtAIZEmZmZmZmZmb+BA0KFoQ==";
        document.body.appendChild(video);
        fallbackVideoRef.current = video;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If autoplay policy blocks it, user interaction will trigger it
          });
        }
      } catch (e) {
        // Ignore fallback errors
      }
    };

    const stopFallbackVideo = () => {
      if (fallbackVideoRef.current) {
        try {
          fallbackVideoRef.current.pause();
          fallbackVideoRef.current.src = "";
          if (fallbackVideoRef.current.parentNode) {
            fallbackVideoRef.current.parentNode.removeChild(fallbackVideoRef.current);
          }
        } catch (e) {}
        fallbackVideoRef.current = null;
      }
    };

    // --- PRIMARY: Modern Screen Wake Lock API ---
    const requestWakeLock = async () => {
      if (!isMounted || isAcquiringRef.current) return;
      
      // If already holding an active lock, no need to re-request
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        return;
      }

      // Check if Screen Wake Lock API is supported
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        if (document.visibilityState !== "visible") return;

        isAcquiringRef.current = true;
        try {
          const lock = await navigator.wakeLock.request("screen");
          if (!isMounted) {
            lock.release().catch(() => {});
            return;
          }

          wakeLockRef.current = lock;
          lock.addEventListener("release", () => {
            if (wakeLockRef.current === lock) {
              wakeLockRef.current = null;
            }
          });
        } catch (err) {
          // May be rejected if tab is backgrounded, battery is extremely low, or requires user gesture
          startFallbackVideo();
        } finally {
          isAcquiringRef.current = false;
        }
      } else {
        // Browser does not support WakeLock API -> use fallback video
        startFallbackVideo();
      }
    };

    const releaseWakeLock = async () => {
      try {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      } catch (e) {}
      stopFallbackVideo();
    };

    // 1. Initial attempt
    requestWakeLock();

    // 2. User interaction trigger (handles strict autoplay/gesture policies on mobile)
    const handleUserGesture = () => {
      requestWakeLock();
      if (fallbackVideoRef.current && fallbackVideoRef.current.paused) {
        fallbackVideoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });
    window.addEventListener("keydown", handleUserGesture, { passive: true });

    // 3. Tab visibility change (browser auto-releases wakeLock when tab is hidden, so re-acquire when visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Fullscreen change (ensure lock is held when user enters/exits fullscreen)
    const handleFullscreenChange = () => {
      requestWakeLock();
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      isMounted = false;
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      releaseWakeLock();
    };
  }, [enabled]);
}

export default useScreenWakeLock;
