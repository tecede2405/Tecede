import { useState, useEffect } from "react";
import { getUpcomingEvents, THEMES } from "../../utils/eventsData";
import { FaHourglassHalf, FaHeart, FaFire, FaSnowflake, FaFlag, FaMoon, FaGhost, FaStar } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { playClickSound, playHoverSound, playThemeChime } from "../../utils/soundEffects";
import "./style.scss";

const THEME_ICONS = {
  pink: FaHeart,
  tet: FaFire,
  noel: FaSnowflake,
  national: FaFlag,
  midautumn: FaMoon,
  halloween: FaGhost,
  default: FaStar
};

export default function UpcomingEvents({ 
  onSelectEvent, 
  onApplyTheme, 
  activeTheme = "default" 
}) {
  const [upcoming, setUpcoming] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const list = getUpcomingEvents(new Date(), 12);
    setUpcoming(list);
  }, []);

  const nextEvent = upcoming[0];

  // Cập nhật Countdown đến sự kiện kế tiếp
  useEffect(() => {
    if (!nextEvent) return;

    const targetDate = nextEvent.calculatedSolar.dateObj.getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  if (!nextEvent) return null;

  const ThemeIcon = THEME_ICONS[nextEvent.theme] || FaStar;
  const nextThemeConfig = THEMES[nextEvent.theme] || THEMES.default;

  return (
    <div className={`upcoming-events-wrapper upcoming--${activeTheme}`}>
      
      {/* HERO COUNTDOWN BANNER CHO SỰ KIỆN GẦN NHẤT */}
      <div className={`next-event-banner theme-bg-${nextEvent.theme}`}>
        <div className="banner-glow-ambient" />
        
        <div className="banner-content">
          <div className="banner-tag">
            <span className="live-pulse" />
            <FaHourglassHalf className="icon" />
            <span>SỰ KIỆN GẦN NHẤT</span>
          </div>

          <h2 className="next-event-title">{nextEvent.title}</h2>
          
          <div className="next-event-date-row">
            <span className="date-badge">
              {nextEvent.calculatedSolar.day}/{nextEvent.calculatedSolar.month}/{nextEvent.calculatedSolar.year}
            </span>
            {nextEvent.isLunar && (
              <span className="lunar-tag">
                ({nextEvent.day}/{nextEvent.month} Âm lịch)
              </span>
            )}
            <span className="category-pill">{nextEvent.category}</span>
          </div>

          <p className="next-event-desc">{nextEvent.desc}</p>

          {/* COUNTDOWN TIMER BOXES */}
          <div className="countdown-timer-grid">
            <div className="timer-unit">
              <span className="unit-value">{countdown.days}</span>
              <span className="unit-label">NGÀY</span>
            </div>
            <span className="unit-colon">:</span>
            <div className="timer-unit">
              <span className="unit-value">{String(countdown.hours).padStart(2, "0")}</span>
              <span className="unit-label">GIỜ</span>
            </div>
            <span className="unit-colon">:</span>
            <div className="timer-unit">
              <span className="unit-value">{String(countdown.minutes).padStart(2, "0")}</span>
              <span className="unit-label">PHÚT</span>
            </div>
            <span className="unit-colon">:</span>
            <div className="timer-unit">
              <span className="unit-value">{String(countdown.seconds).padStart(2, "0")}</span>
              <span className="unit-label">GIÂY</span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="banner-actions">
            <button
              type="button"
              className="btn-apply-theme"
              onClick={() => {
                playClickSound();
                playThemeChime();
                onApplyTheme?.(nextEvent.theme);
              }}
              onMouseEnter={playHoverSound}
              title="Đổi không gian theo theme sự kiện này"
            >
              <FaWandMagicSparkles className="icon" />
              <span>Bật Theme {nextThemeConfig.shortName}</span>
            </button>

            <button
              type="button"
              className="btn-view-detail"
              onClick={() => {
                playClickSound();
                onSelectEvent?.(nextEvent);
              }}
              onMouseEnter={playHoverSound}
            >
              <span>Xem chi tiết &amp; Lời chúc</span>
            </button>
          </div>
        </div>

        <div className="banner-theme-icon-wrap">
          <ThemeIcon className="big-floating-icon" />
        </div>
      </div>

      {/* DANH SÁCH CÁC SỰ KIỆN TIẾP THEO */}
      <div className="upcoming-sub-list">
        <h3 className="sub-list-title">Các Dịp Lễ &amp; Sự Kiện Còn Lại Trong Năm</h3>
        
        <div className="sub-list-grid">
          {upcoming.slice(1).map((item) => {
            const ItemIcon = THEME_ICONS[item.theme] || FaStar;
            return (
              <div 
                key={item.id} 
                className="sub-item-card"
                onClick={() => {
                  playClickSound();
                  onSelectEvent?.(item);
                }}
                onMouseEnter={playHoverSound}
              >
                <div className={`sub-item-icon-box box-${item.theme}`}>
                  <ItemIcon />
                </div>

                <div className="sub-item-info">
                  <div className="sub-item-name">{item.title}</div>
                  <div className="sub-item-date">
                    {item.calculatedSolar.day}/{item.calculatedSolar.month}
                    {item.isLunar && <span className="lunar-note"> ({item.day}/{item.month} ÂL)</span>}
                  </div>
                </div>

                <div className="sub-item-badge">
                  {item.daysLeft === 0 ? "Hôm nay!" : `Còn ${item.daysLeft} ngày`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
