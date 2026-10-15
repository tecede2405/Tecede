import { useState, useEffect } from "react";
import { 
  convertSolar2Lunar, 
  getCanChiYear, 
  getCanChiDay, 
  getCanChiMonth, 
  getSolarTerm 
} from "../../utils/lunarCalendar";
import { FaClock, FaCalendarDay, FaCompass, FaStar } from "react-icons/fa";
import "./style.scss";

const VIETNAM_DAYS = [
  "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
];

export default function VietnamClock({ activeTheme = "default" }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Đảm bảo lấy chính xác theo giờ Việt Nam (Asia/Ho_Chi_Minh)
  const vnTimeString = time.toLocaleTimeString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const [hours, minutes, seconds] = vnTimeString.split(":");

  // Ngày Dương lịch
  const day = time.getDate();
  const month = time.getMonth() + 1;
  const year = time.getFullYear();
  const dayOfWeek = VIETNAM_DAYS[time.getDay()];

  // Ngày Âm lịch
  const [lunarDay, lunarMonth, lunarYear, isLeap] = convertSolar2Lunar(day, month, year);
  const { canChi: canChiYear, conGiap } = getCanChiYear(lunarYear);
  const canChiDay = getCanChiDay(day, month, year);
  const canChiMonth = getCanChiMonth(lunarMonth, lunarYear);
  const solarTerm = getSolarTerm(day, month, year);

  return (
    <div className={`vn-clock-wrapper vn-clock-wrapper--${activeTheme}`}>
      <div className="vn-clock-card">
        
        {/* TOP STATUS PILL */}
        <div className="vn-clock-top">
          <div className="vn-timezone-pill">
            <span className="live-dot" />
            <FaClock className="icon" />
            <span>Múi Giờ Việt Nam (ICT • GMT+7)</span>
          </div>
          <div className="vn-solar-term-pill" title="Tiết khí thiên văn">
            <FaCompass className="icon" />
            <span>Tiết khí: <strong>{solarTerm}</strong></span>
          </div>
        </div>

        {/* MAIN DIGITAL CLOCK DISPLAY */}
        <div className="vn-digital-clock">
          <div className="digit-box hours">
            <span className="digit-number">{hours}</span>
            <span className="digit-label">GIỜ</span>
          </div>

          <div className="colon-separator">:</div>

          <div className="digit-box minutes">
            <span className="digit-number">{minutes}</span>
            <span className="digit-label">PHÚT</span>
          </div>

          <div className="colon-separator">:</div>

          <div className="digit-box seconds">
            <span className="digit-number">{seconds}</span>
            <span className="digit-label">GIÂY</span>
          </div>
        </div>

        {/* DATE & LUNAR DUAL DISPLAY (2 BOX NẰM NGANG CẠNH NHAU) */}
        <div className="vn-date-dual-grid">
          
          {/* CỘT DƯƠNG LỊCH */}
          <div className="date-tile solar-tile">
            <div className="tile-badge">
              <FaCalendarDay className="icon" /> DƯƠNG LỊCH
            </div>
            <div className="tile-day-name">{dayOfWeek}</div>
            <div className="tile-main-date">
              Ngày <strong>{day}</strong> Tháng <strong>{month}</strong>, {year}
            </div>
            <div className="tile-sub">Lịch chuẩn quốc tế</div>
          </div>

          {/* CỘT ÂM LỊCH VIỆT NAM */}
          <div className="date-tile lunar-tile">
            <div className="tile-badge lunar">
              <FaStar className="icon" /> ÂM LỊCH TRUYỀN THỐNG
            </div>
            <div className="tile-day-name">
              Năm {canChiYear} ({conGiap})
            </div>
            <div className="tile-main-date">
              Ngày <strong>{lunarDay}</strong> Tháng <strong>{lunarMonth}</strong> {isLeap ? "(Nhuận)" : ""}
            </div>
            <div className="tile-sub">
              Ngày {canChiDay} • Tháng {canChiMonth}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
