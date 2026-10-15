import { useState } from "react";
import { convertSolar2Lunar } from "../../utils/lunarCalendar";
import { getEventsForSpecificDate } from "../../utils/eventsData";
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from "react-icons/fa";
import { playClickSound, playHoverSound } from "../../utils/soundEffects";
import "./style.scss";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function CalendarGrid({ 
  onSelectEvent, 
  onSelectDate, 
  selectedDate, 
  activeTheme = "default" 
}) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentMonth(today.getMonth() + 1);
    setCurrentYear(today.getFullYear());
    onSelectDate?.(today.getDate(), today.getMonth() + 1, today.getFullYear());
  };

  // Tính số ngày trong tháng
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  // Tính thứ của ngày 1 trong tháng (0 = Chủ Nhật, 1 = Thứ 2, ...)
  // Ta đổi sang dạng: 0 = Thứ 2, 6 = Chủ Nhật
  let firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Tạo mảng các ô lịch
  const calendarCells = [];

  // Các ô trống tháng trước
  const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 1 ? 12 : currentMonth - 1;
    const y = currentMonth === 1 ? currentYear - 1 : currentYear;
    const [ld, lm] = convertSolar2Lunar(d, m, y);
    calendarCells.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      lunarDay: ld,
      lunarMonth: lm,
      events: getEventsForSpecificDate(d, m, y)
    });
  }

  // Các ô tháng hiện tại
  for (let d = 1; d <= daysInMonth; d++) {
    const [ld, lm] = convertSolar2Lunar(d, currentMonth, currentYear);
    calendarCells.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      lunarDay: ld,
      lunarMonth: lm,
      events: getEventsForSpecificDate(d, currentMonth, currentYear)
    });
  }

  // Các ô bù tháng sau
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const m = currentMonth === 12 ? 1 : currentMonth + 1;
    const y = currentMonth === 12 ? currentYear + 1 : currentYear;
    const [ld, lm] = convertSolar2Lunar(d, m, y);
    calendarCells.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      lunarDay: ld,
      lunarMonth: lm,
      events: getEventsForSpecificDate(d, m, y)
    });
  }

  return (
    <div className={`cal-grid-card cal-grid--${activeTheme}`}>
      
      {/* HEADER: THÁNG / NĂM & NÚT CHUYỂN */}
      <div className="cal-grid-header">
        <div className="month-year-title">
          <span className="month-text">Tháng {currentMonth}</span>
          <span className="year-text">Năm {currentYear}</span>
        </div>

        <div className="cal-header-actions">
          <button 
            type="button" 
            className="btn-today" 
            onClick={() => {
              playClickSound();
              handleTodayClick();
            }}
            onMouseEnter={playHoverSound}
            title="Trở về hôm nay"
          >
            <FaCalendarCheck className="icon" />
            <span>Hôm nay</span>
          </button>

          <button 
            type="button" 
            className="btn-nav" 
            onClick={() => {
              playClickSound();
              handlePrevMonth();
            }}
            onMouseEnter={playHoverSound}
            title="Tháng trước"
          >
            <FaChevronLeft />
          </button>

          <button 
            type="button" 
            className="btn-nav" 
            onClick={() => {
              playClickSound();
              handleNextMonth();
            }}
            onMouseEnter={playHoverSound}
            title="Tháng sau"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* WEEKDAY LABELS (T2 - CN) */}
      <div className="cal-weekdays">
        {WEEKDAYS.map((w, idx) => (
          <div key={idx} className={`weekday-cell ${idx >= 5 ? "weekend" : ""}`}>
            {w}
          </div>
        ))}
      </div>

      {/* DAYS GRID */}
      <div className="cal-days-grid">
        {calendarCells.map((cell, idx) => {
          const isToday =
            cell.day === today.getDate() &&
            cell.month === today.getMonth() + 1 &&
            cell.year === today.getFullYear();

          const isSelected =
            selectedDate &&
            cell.day === selectedDate.day &&
            cell.month === selectedDate.month &&
            cell.year === selectedDate.year;

          const hasEvents = cell.events.length > 0;
          const isRamm = cell.lunarDay === 15;
          const isMungMot = cell.lunarDay === 1;

          return (
            <div
              key={idx}
              className={`cal-day-cell ${!cell.isCurrentMonth ? "other-month" : ""} ${
                isToday ? "is-today" : ""
              } ${isSelected ? "is-selected" : ""} ${
                hasEvents ? "has-events" : ""
              }`}
              onClick={() => {
                playClickSound();
                onSelectDate?.(cell.day, cell.month, cell.year, cell.events);
                if (hasEvents) {
                  onSelectEvent?.(cell.events[0]);
                }
              }}
              onMouseEnter={playHoverSound}
              title={
                hasEvents
                  ? `${cell.day}/${cell.month}: ${cell.events.map((e) => e.title).join(", ")}`
                  : `Dương lịch: ${cell.day}/${cell.month}/${cell.year} - Âm lịch: ${cell.lunarDay}/${cell.lunarMonth}`
              }
            >
              {/* SỐ NGÀY DƯƠNG LỊCH */}
              <span className="solar-number">{cell.day}</span>

              {/* SỐ NGÀY ÂM LỊCH */}
              <span
                className={`lunar-number ${isRamm ? "is-ram" : ""} ${
                  isMungMot ? "is-mung-mot" : ""
                }`}
              >
                {cell.lunarDay === 1
                  ? `${cell.lunarDay}/${cell.lunarMonth}`
                  : cell.lunarDay}
              </span>

              {/* EVENT DOT / PILL INDICATOR */}
              {hasEvents && (
                <div className="event-indicator-dot">
                  <span className={`dot-color dot-${cell.events[0].theme}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER NOTE / CHÚ THÍCH */}
      <div className="cal-footer-legend">
        <div className="legend-item">
          <span className="legend-box is-today-box" />
          <span>Hôm nay</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot has-event-dot" />
          <span>Có sự kiện / Lễ</span>
        </div>
        <div className="legend-item">
          <span className="legend-text lunar-gold">Số vàng</span>
          <span>Ngày Rằm (15 ÂL) / Mùng 1</span>
        </div>
      </div>

    </div>
  );
}
