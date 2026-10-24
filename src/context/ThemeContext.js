import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { THEMES } from "../pages/EventsCalendar/utils/eventsData";
import { 
  playClickSound, 
  playThemeChime, 
  getSoundPreference, 
  setSoundPreference 
} from "../utils/soundEffects";
import Swal from "sweetalert2";

export const STORAGE_KEY_THEME = "tecede_events_theme";
export const STORAGE_KEY_EFFECT = "tecede_events_effect";
export const STORAGE_KEY_SOUND = "tecede_events_sound";
export const STORAGE_KEY_GLOBAL = "tecede_global_theme_enabled";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // 1. Theme hiện tại (Mặc định là null / tắt trừ khi user chủ động chọn và bật)
  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const isGlobal = localStorage.getItem(STORAGE_KEY_GLOBAL);
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (isGlobal === "true" && saved && THEMES[saved]) {
        return saved;
      }
    } catch (e) {}
    return null;
  });

  // 2. Hiệu ứng hạt 3D (Mặc định tắt, chỉ bật khi user chủ động bật chủ đề)
  const [isEffectEnabled, setIsEffectEnabled] = useState(() => {
    try {
      const isGlobal = localStorage.getItem(STORAGE_KEY_GLOBAL);
      const saved = localStorage.getItem(STORAGE_KEY_EFFECT);
      if (isGlobal === "true" && saved !== null) {
        return saved === "true";
      }
    } catch (e) {}
    return false;
  });

  // 3. Âm thanh giao diện
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => getSoundPreference());

  // 4. Bật chủ đề toàn cục mọi trang (Mặc định là TẮT / false)
  const [isGlobalThemeEnabled, setIsGlobalThemeEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GLOBAL);
      return saved === "true";
    } catch (e) {}
    return false;
  });

  // Đồng bộ class lên document.body cho toàn bộ website
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;

    // Xóa tất cả các class theme cũ
    const classesToRemove = [];
    body.classList.forEach((cls) => {
      if (cls.startsWith("site-theme-") || cls === "site-theme-active") {
        classesToRemove.push(cls);
      }
    });
    classesToRemove.forEach((cls) => body.classList.remove(cls));

    const isWatchPage = typeof window !== "undefined" && window.location.pathname.startsWith("/xem-phim");

    if (isGlobalThemeEnabled && activeTheme && !isWatchPage) {
      body.classList.add("site-theme-active");
      body.classList.add(`site-theme-${activeTheme}`);
    }
  }, [activeTheme, isGlobalThemeEnabled]);

  // Áp dụng chủ đề mới (Lưu lại lựa chọn của người dùng)
  const applyTheme = useCallback((themeId, { playSound = true, showToast = true } = {}) => {
    const validTheme = THEMES[themeId] ? themeId : "default";
    setActiveTheme(validTheme);
    setIsGlobalThemeEnabled(true);
    setIsEffectEnabled(true);

    try {
      localStorage.setItem(STORAGE_KEY_THEME, validTheme);
      localStorage.setItem(STORAGE_KEY_GLOBAL, "true");
      localStorage.setItem(STORAGE_KEY_EFFECT, "true");
    } catch (e) {}

    if (playSound) {
      playClickSound();
      playThemeChime();
    }

    if (showToast) {
      const config = THEMES[validTheme] || THEMES.default;
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        background: "#181e2e",
        color: "#fff",
        timerProgressBar: true
      });
      Toast.fire({
        icon: "success",
        title: `Đã kích hoạt chủ đề: ${config.name}`
      });
    }
  }, []);

  // Tắt chủ đề (về giao diện gốc mặc định của website)
  const disableTheme = useCallback(({ playSound = true, showToast = true } = {}) => {
    setActiveTheme(null);
    setIsGlobalThemeEnabled(false);
    setIsEffectEnabled(false);
    try {
      localStorage.removeItem(STORAGE_KEY_THEME);
      localStorage.setItem(STORAGE_KEY_GLOBAL, "false");
      localStorage.setItem(STORAGE_KEY_EFFECT, "false");
    } catch (e) {}

    if (playSound) {
      playClickSound();
    }

    if (showToast) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        background: "#181e2e",
        color: "#fff"
      });
      Toast.fire({
        icon: "info",
        title: "Đã tắt chủ đề, trở về giao diện mặc định"
      });
    }
  }, []);

  // Bật/tắt hiệu ứng hạt
  const toggleEffect = useCallback(() => {
    setIsEffectEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_EFFECT, String(next));
      } catch (e) {}
      playClickSound();
      return next;
    });
  }, []);

  // Bật/tắt âm thanh
  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      setSoundPreference(next);
      if (next) {
        playClickSound();
      }
      return next;
    });
  }, []);

  // Bật/tắt chế độ toàn cục
  const toggleGlobalTheme = useCallback(() => {
    setIsGlobalThemeEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setActiveTheme(null);
      } else {
        setActiveTheme((current) => current || "default");
      }
      try {
        localStorage.setItem(STORAGE_KEY_GLOBAL, String(next));
        if (!next) {
          localStorage.removeItem(STORAGE_KEY_THEME);
        } else {
          localStorage.setItem(STORAGE_KEY_THEME, activeTheme || "default");
        }
      } catch (e) {}
      playClickSound();

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        background: "#181e2e",
        color: "#fff"
      });
      Toast.fire({
        icon: next ? "success" : "info",
        title: next ? "Đã bật chủ đề cho toàn bộ website" : "Đã tắt chủ đề toàn cục"
      });

      return next;
    });
  }, [activeTheme]);

  const currentThemeConfig = (activeTheme && THEMES[activeTheme]) ? THEMES[activeTheme] : THEMES.default;

  return (
    <ThemeContext.Provider
      value={{
        activeTheme,
        currentThemeConfig,
        themes: THEMES,
        isEffectEnabled,
        isSoundEnabled,
        isGlobalThemeEnabled,
        applyTheme,
        disableTheme,
        toggleEffect,
        toggleSound,
        toggleGlobalTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
