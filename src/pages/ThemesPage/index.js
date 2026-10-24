import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useAppTheme } from "../../context/ThemeContext";
import { playClickSound, playHoverSound } from "../../utils/soundEffects";
import { 
  FaPalette, 
  FaCheck, 
  FaEye, 
  FaEyeSlash, 
  FaVolumeUp, 
  FaVolumeMute, 
  FaGlobe, 
  FaPowerOff,
  FaHeart,
  FaFire,
  FaSnowflake,
  FaFlag,
  FaMoon,
  FaGhost,
  FaStar,
  FaBolt,
  FaWater,
  FaSpa,
  FaCompass,
  FaLeaf,
  FaCode
} from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import "./style.scss";

// Bản đồ Icon tương ứng
const THEME_ICONS = {
  FaHeart,
  FaFire,
  FaSnowflake,
  FaFlag,
  FaMoon,
  FaGhost,
  FaStar,
  FaBolt,
  FaWater,
  FaSpa,
  FaCompass,
  FaLeaf,
  FaCode
};

const CATEGORIES = [
  { id: "all", name: "Tất cả" },
  { id: "holiday", name: "Lễ hội & Kỷ niệm" },
  { id: "scifi", name: "Vũ trụ & Kỹ thuật số" },
  { id: "nature", name: "Thiên nhiên & Bốn mùa" }
];

export default function ThemesPage() {
  const { 
    activeTheme, 
    themes, 
    isEffectEnabled, 
    isSoundEnabled, 
    isGlobalThemeEnabled, 
    applyTheme, 
    disableTheme,
    toggleEffect, 
    toggleSound, 
    toggleGlobalTheme 
  } = useAppTheme();

  const [selectedCategory, setSelectedCategory] = useState("all");

  const themeList = useMemo(() => {
    return Object.values(themes).map((t) => {
      let category = "scifi";
      if (["pink", "tet", "noel", "national", "midautumn", "halloween"].includes(t.id)) {
        category = "holiday";
      } else if (["ocean", "sakura", "aurora", "sunset"].includes(t.id)) {
        category = "nature";
      }
      return { ...t, category };
    });
  }, [themes]);

  const filteredThemes = useMemo(() => {
    if (selectedCategory === "all") return themeList;
    return themeList.filter((t) => t.category === selectedCategory);
  }, [themeList, selectedCategory]);

  const isThemeActive = Boolean(isGlobalThemeEnabled && activeTheme);
  const activeConfig = (activeTheme && themes[activeTheme]) || themes.default;
  const ActiveIcon = THEME_ICONS[activeConfig?.icon] || FaStar;

  return (
    <div className="themes-page-container">
      <Helmet>
        <title>Kho Chủ Đề &amp; Tùy Biến Giao Diện - Tecede</title>
        <meta
          name="description"
          content="Tùy biến diện mạo website Tecede với các không gian lễ hội, vũ trụ 3D, Cyberpunk, đại dương, tuyết rơi và hiệu ứng âm thanh sống động."
        />
      </Helmet>

      <div className="themes-main-wrapper">
        
        {/* ================= HERO HEADER ================= */}
        <div className="themes-hero">
          <div className="themes-pill-badge">
            <FaWandMagicSparkles className="icon-magic" />
            <span>Kho Giao Diện &amp; Không Gian Tương Tác</span>
          </div>

          <h1 className="themes-title">
            Tùy Biến <span className="highlight-gradient">Chủ Đề Website</span>
          </h1>

          {/* HIỂN THỊ THEME ĐANG DÙNG */}
          <div 
            className={`active-theme-banner ${!isThemeActive ? "is-disabled" : ""}`}
            style={{ borderColor: isThemeActive ? (activeConfig?.primaryColor || "#38bdf8") : "rgba(255, 255, 255, 0.15)" }}
          >
            <div className="banner-left">
              <div 
                className="banner-icon-box"
                style={{ background: isThemeActive ? (activeConfig?.primaryColor || "#38bdf8") : "#475569" }}
              >
                {isThemeActive ? <ActiveIcon /> : <FaPowerOff />}
              </div>
              <div className="banner-text">
                <span className="banner-label">
                  {isThemeActive ? "Đang áp dụng toàn trang:" : "Trạng thái giao diện:"}
                </span>
                <span className="banner-name">
                  {isThemeActive ? activeConfig?.name : "Giao diện gốc mặc định (Chủ đề đang tắt)"}
                </span>
              </div>
            </div>
            {isThemeActive && (
              <div className="banner-badges">
                <span className="badge-pill">{activeConfig?.badge}</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= THANH ĐIỀU KHIỂN TOÀN CỤC ================= */}
        <div className="themes-controls-card">
          <div className="controls-header">
            <FaPalette className="icon" />
            <span>Cài đặt hệ thống giao diện:</span>
          </div>

          <div className="controls-actions">
            {/* 1. NÚT TẮT / BẬT CHỦ ĐỀ */}
            <button
              type="button"
              className={`ctrl-btn ${!isThemeActive ? "btn-danger-active" : ""}`}
              onClick={() => {
                if (isGlobalThemeEnabled) {
                  disableTheme();
                } else {
                  applyTheme(activeTheme || "default");
                }
              }}
              onMouseEnter={playHoverSound}
              title={isGlobalThemeEnabled ? "Tắt chủ đề, trở về giao diện mặc định gốc của website" : "Bật lại chủ đề"}
            >
              <FaPowerOff className={`ctrl-icon ${!isGlobalThemeEnabled ? "icon-red" : ""}`} />
              <div className="ctrl-text">
                <span className="ctrl-title">Tắt chủ đề</span>
                <span className="ctrl-desc">
                  {isThemeActive ? "Bấm để tắt" : "Đang tắt (Gốc)"}
                </span>
              </div>
            </button>

            {/* 2. TOGGLE TOÀN CỤC */}
            <button
              type="button"
              className={`ctrl-btn ${isGlobalThemeEnabled ? "active-btn" : ""}`}
              onClick={toggleGlobalTheme}
              onMouseEnter={playHoverSound}
              title="Bật/tắt áp dụng theme cho toàn bộ các trang trên website"
            >
              <FaGlobe className="ctrl-icon" />
              <div className="ctrl-text">
                <span className="ctrl-title">Áp dụng toàn trang</span>
                <span className="ctrl-desc">{isGlobalThemeEnabled ? "Đang Bật" : "Đang Tắt"}</span>
              </div>
            </button>

            {/* 3. TOGGLE HIỆU ỨNG HẠT */}
            <button
              type="button"
              className={`ctrl-btn ${isEffectEnabled ? "active-btn" : ""}`}
              onClick={toggleEffect}
              onMouseEnter={playHoverSound}
              title="Bật/tắt hiệu ứng hạt 3D và chuyển động nền"
            >
              {isEffectEnabled ? <FaEye className="ctrl-icon" /> : <FaEyeSlash className="ctrl-icon" />}
              <div className="ctrl-text">
                <span className="ctrl-title">Hiệu ứng hạt 3D</span>
                <span className="ctrl-desc">{isEffectEnabled ? "Đang Bật" : "Đang Tắt"}</span>
              </div>
            </button>

            {/* 4. TOGGLE ÂM THANH */}
            <button
              type="button"
              className={`ctrl-btn ${isSoundEnabled ? "active-btn" : ""}`}
              onClick={toggleSound}
              onMouseEnter={playHoverSound}
              title="Bật/tắt âm thanh tương tác click và chuông chuyển chủ đề"
            >
              {isSoundEnabled ? <FaVolumeUp className="ctrl-icon" /> : <FaVolumeMute className="ctrl-icon" />}
              <div className="ctrl-text">
                <span className="ctrl-title">Âm thanh giao diện</span>
                <span className="ctrl-desc">{isSoundEnabled ? "Đang Bật" : "Đang Tắt"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* ================= BỘ LỌC DANH MỤC ================= */}
        <div className="themes-filter-bar">
          <div className="filter-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-btn ${selectedCategory === cat.id ? "active" : ""}`}
                onClick={() => {
                  playClickSound();
                  setSelectedCategory(cat.id);
                }}
                onMouseEnter={playHoverSound}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <span className="theme-count">
            Tổng cộng <b>{filteredThemes.length}</b> chủ đề
          </span>
        </div>

        {/* ================= LƯỚI DANH SÁCH THEME GỌN GÀNG ================= */}
        <div className="themes-compact-grid">
          {filteredThemes.map((theme) => {
            const IconComp = THEME_ICONS[theme.icon] || FaStar;
            const isCurrent = Boolean(isThemeActive && activeTheme === theme.id);

            return (
              <div
                key={theme.id}
                className={`compact-theme-card ${isCurrent ? "is-active" : ""}`}
                style={{
                  "--theme-primary": theme.primaryColor,
                  "--theme-secondary": theme.secondaryColor,
                  "--theme-accent": theme.accentColor
                }}
                onClick={() => {
                  applyTheme(theme.id);
                }}
                onMouseEnter={playHoverSound}
                title={`Bấm để chọn: ${theme.name}`}
              >
                {/* TOP ROW: ICON + BADGE + ACTIVE TAG */}
                <div className="compact-card-top">
                  <div 
                    className="compact-icon-box"
                    style={{ background: theme.bgGradient, color: theme.primaryColor }}
                  >
                    <IconComp />
                  </div>
                  <span className="compact-badge">{theme.badge.split("•")[0].trim()}</span>
                  {isCurrent && (
                    <span className="compact-active-pill">
                      <FaCheck /> Đang dùng
                    </span>
                  )}
                </div>

                {/* THEME INFO */}
                <div className="compact-card-body">
                  <h4 className="compact-name">
                    {theme.shortName || theme.name}
                  </h4>
                </div>

                {/* FOOTER: COLOR DOTS & ACTION */}
                <div className="compact-card-footer">
                  <div className="compact-dots">
                    <span className="dot" style={{ background: theme.primaryColor }} />
                    <span className="dot" style={{ background: theme.secondaryColor }} />
                    <span className="dot" style={{ background: theme.accentColor }} />
                  </div>
                  <span className={`compact-action-label ${isCurrent ? "active-text" : ""}`}>
                    {isCurrent ? "✓ Đang chọn" : "Chọn chủ đề"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
