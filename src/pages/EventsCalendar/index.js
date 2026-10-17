import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAppTheme } from "../../context/ThemeContext";
import EventThemeCanvas from "./components/EventThemeCanvas/index";
import VietnamClock from "./components/VietnamClock/index";
import CalendarGrid from "./components/CalendarGrid/index";
import UpcomingEvents from "./components/UpcomingEvents/index";
import EventDetailModal from "./components/EventDetailModal/index";
import { 
  FaEye, 
  FaEyeSlash,
  FaHeart,
  FaFire,
  FaSnowflake,
  FaFlag,
  FaMoon,
  FaGhost,
  FaStar,
  FaVolumeUp,
  FaVolumeMute
} from "react-icons/fa";
import { FaWandMagicSparkles, FaCalendarDays } from "react-icons/fa6";
import { 
  playClickSound, 
  playHoverSound, 
  playThemeChime
} from "./utils/soundEffects";
import "./style.scss";

const THEME_BUTTONS = [
  { id: "pink", name: "Hồng 20/10", icon: FaHeart, color: "#f43f5e" },
  { id: "tet", name: "Tết Pháo Hoa", icon: FaFire, color: "#ef4444" },
  { id: "noel", name: "Noel Tuyết 3D", icon: FaSnowflake, color: "#06b6d4" },
  { id: "national", name: "Cờ Đỏ Sao Vàng", icon: FaFlag, color: "#dc2626" },
  { id: "midautumn", name: "Trăng Rằm", icon: FaMoon, color: "#f59e0b" },
  { id: "halloween", name: "Halloween", icon: FaGhost, color: "#f97316" },
  { id: "default", name: "Vũ Trụ 3D", icon: FaStar, color: "#38bdf8" }
];

export default function EventsCalendar() {
  const navigate = useNavigate();
  const { 
    activeTheme, 
    isEffectEnabled, 
    isSoundEnabled, 
    applyTheme, 
    toggleEffect, 
    toggleSound 
  } = useAppTheme();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleApplyTheme = (themeId) => {
    applyTheme(themeId);
  };

  const handleToggleEffect = () => {
    toggleEffect();
  };

  const handleToggleSound = () => {
    toggleSound();
  };

  const handleSelectDate = (day, month, year, events = []) => {
    setSelectedDate({ day, month, year });
    if (events && events.length > 0) {
      setSelectedEvent(events[0]);
    }
  };

  return (
    <div className={`events-page-wrapper page-theme-${activeTheme}`}>
      <Helmet>
        <title>Lịch &amp; Sự Kiện Việt Nam - Tra Cứu Lịch Âm Dương, Giờ Hoàng Đạo &amp; Ngày Lễ</title>
        <meta
          name="description"
          content="Trang tra cứu lịch và giờ Việt Nam thời gian thực, lịch âm dương chuẩn xác, đếm ngược ngày lễ lớn như 20/10, Tết, Giáng Sinh với hiệu ứng 3D sống động."
        />
      </Helmet>

      {/* CANVAS 3D/2D HIỆU ỨNG NỀN HIỆU NĂNG CAO */}
      <EventThemeCanvas theme={activeTheme} isEnabled={isEffectEnabled} />

      {/* AMBIENT GLOW BACKGROUNDS */}
      <div className="events-bg-glow glow-top" />
      <div className="events-bg-glow glow-bottom" />

      <div className="events-main-container">
        
        {/* ================= HERO HEADER ================= */}
        <div className="events-hero-header">
          <div className="hero-pill-badge">
            <FaCalendarDays className="badge-icon" />
            <span>Lịch &amp; Sự Kiện Việt Nam</span>
          </div>

          <h1 className="events-hero-title">
            Thời Gian Thực &amp; <span className="highlight-text">Các Dịp Lễ Trong Năm</span>
          </h1>

          {/* QUICK THEME SELECTOR BAR */}
          <div className="theme-selector-panel">
            <div className="selector-label">
              <FaWandMagicSparkles className="icon" />
              <span>Trải nghiệm không gian chủ đề:</span>
            </div>

            <div className="theme-pills-row">
              {THEME_BUTTONS.map((t) => {
                const IconComponent = t.icon;
                const isActive = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={`theme-pill-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      playClickSound();
                      playThemeChime();
                      handleApplyTheme(t.id);
                    }}
                    onMouseEnter={playHoverSound}
                    style={{ "--pill-color": t.color }}
                  >
                    <IconComponent className="pill-icon" />
                    <span>{t.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                className="theme-pill-btn"
                onClick={() => {
                  playClickSound();
                  navigate("/chu-de");
                }}
                onMouseEnter={playHoverSound}
                style={{ "--pill-color": "#a855f7" }}
                title="Mở kho 13 chủ đề website"
              >
                <FaWandMagicSparkles className="pill-icon" />
                <span>Kho 13 Chủ Đề</span>
              </button>

              {/* TOGGLE EFFECT BUTTON */}
              <button
                type="button"
                className={`effect-toggle-btn ${isEffectEnabled ? "on" : "off"}`}
                onClick={() => {
                  playClickSound();
                  handleToggleEffect();
                }}
                onMouseEnter={playHoverSound}
                title={isEffectEnabled ? "Tạm tắt hiệu ứng hạt 3D" : "Bật hiệu ứng hạt 3D"}
              >
                {isEffectEnabled ? <FaEye className="icon" /> : <FaEyeSlash className="icon" />}
                <span>{isEffectEnabled ? "Hiệu ứng: Bật" : "Hiệu ứng: Tắt"}</span>
              </button>

              {/* TOGGLE SOUND BUTTON */}
              <button
                type="button"
                className={`sound-toggle-btn ${isSoundEnabled ? "on" : "off"}`}
                onClick={handleToggleSound}
                onMouseEnter={playHoverSound}
                title={isSoundEnabled ? "Tắt âm thanh hiệu ứng giao diện" : "Bật âm thanh hiệu ứng giao diện"}
              >
                {isSoundEnabled ? <FaVolumeUp className="icon" /> : <FaVolumeMute className="icon" />}
                <span>{isSoundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= 2-COLUMN SECTION: ĐỒNG HỒ VN + LỊCH THÁNG ================= */}
        <div className="events-top-grid">
          {/* CỘT TRÁI: ĐỒNG HỒ VIỆT NAM + ÂM DƯƠNG + GIỜ HOÀNG ĐẠO */}
          <div className="grid-col-clock">
            <VietnamClock activeTheme={activeTheme} />
          </div>

          {/* CỘT PHẢI: LỊCH THÁNG TƯƠNG TÁC */}
          <div className="grid-col-calendar">
            <CalendarGrid
              onSelectEvent={setSelectedEvent}
              onSelectDate={handleSelectDate}
              selectedDate={selectedDate}
              activeTheme={activeTheme}
            />
          </div>
        </div>

        {/* ================= COUNTDOWN & SỰ KIỆN GẦN NHẤT ================= */}
        <UpcomingEvents
          onSelectEvent={setSelectedEvent}
          onApplyTheme={handleApplyTheme}
          activeTheme={activeTheme}
        />

      </div>

      {/* ================= POPUP CHI TIẾT SỰ KIỆN & LỜI CHÚC ================= */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApplyTheme={handleApplyTheme}
          activeTheme={activeTheme}
        />
      )}

    </div>
  );
}
