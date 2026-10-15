import { useState } from "react";
import { THEMES } from "../../utils/eventsData";
import { FaTimes, FaCalendarAlt, FaStar, FaCopy, FaCheck, FaQuoteLeft } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import Swal from "sweetalert2";
import { playClickSound, playHoverSound, playThemeChime } from "../../utils/soundEffects";
import "./style.scss";

export default function EventDetailModal({ 
  event, 
  onClose, 
  onApplyTheme, 
  activeTheme = "default" 
}) {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const themeConfig = THEMES[event.theme] || THEMES.default;

  const handleCopyWish = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(event.wishes);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1800,
      background: "#181e2e",
      color: "#fff",
      timerProgressBar: true
    });
    Toast.fire({
      icon: "success",
      title: "Đã sao chép lời chúc ý nghĩa!"
    });
  };

  return (
    <div className="event-modal-backdrop" onClick={onClose}>
      <div 
        className={`event-modal-card modal-theme-${event.theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* MODAL HEADER */}
        <div className="modal-header-banner">
          <div className="header-badge-row">
            <span className="event-cat-pill">{event.category}</span>
            {event.isOfficialHoliday && (
              <span className="official-holiday-pill">Nghỉ lễ chính thức</span>
            )}
          </div>

          <h2 className="modal-event-title">{event.title}</h2>

          <div className="modal-date-row">
            <div className="date-item">
              <FaCalendarAlt className="icon" />
              <span>
                {event.isLunar ? "Ngày âm:" : "Ngày dương:"}{" "}
                <strong>{event.day}/{event.month}</strong>
              </span>
            </div>
            {event.isLunar && (
              <div className="date-item lunar">
                <FaStar className="icon" />
                <span>Âm lịch truyền thống</span>
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={() => {
              playClickSound();
              onClose?.();
            }}
            onMouseEnter={playHoverSound}
            aria-label="Đóng"
          >
            <FaTimes />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="modal-body-scroll">
          
          {/* Ý NGHĨA SỰ KIỆN */}
          <div className="modal-section">
            <h4 className="section-heading">Ý nghĩa &amp; Nguồn gốc</h4>
            <p className="section-text">{event.desc}</p>
          </div>

          {/* LỜI CHÚC Ý NGHĨA */}
          {event.wishes && (
            <div className="modal-section wishes-section">
              <div className="wishes-header">
                <div className="wishes-title">
                  <FaQuoteLeft className="quote-icon" />
                  <span>Lời chúc &amp; Thông điệp hay</span>
                </div>
                <button 
                  type="button" 
                  className={`btn-copy-wish ${copied ? "copied" : ""}`}
                  onClick={() => {
                    playClickSound();
                    handleCopyWish();
                  }}
                  onMouseEnter={playHoverSound}
                >
                  {copied ? <FaCheck className="icon" /> : <FaCopy className="icon" />}
                  <span>{copied ? "Đã sao chép" : "Sao chép lời chúc"}</span>
                </button>
              </div>

              <div className="wishes-box">
                <p>"{event.wishes}"</p>
              </div>
            </div>
          )}

          {/* TRẢI NGHIỆM THEME */}
          <div className="modal-theme-cta">
            <div className="cta-info">
              <h5>Không gian 3D Theme {themeConfig.shortName}</h5>
              <p>{themeConfig.description}</p>
            </div>
            <button
              type="button"
              className="btn-trigger-theme"
              onClick={() => {
                playClickSound();
                playThemeChime();
                onApplyTheme?.(event.theme);
                onClose?.();
              }}
              onMouseEnter={playHoverSound}
            >
              <FaWandMagicSparkles className="icon" />
              <span>Kích hoạt Theme Ngay</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
