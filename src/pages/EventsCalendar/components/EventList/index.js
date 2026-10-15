import { useState, useMemo } from "react";
import { VIETNAM_EVENTS, THEMES } from "../../utils/eventsData";
import { FaSearch, FaFilter, FaHeart, FaFire, FaSnowflake, FaFlag, FaMoon, FaGhost, FaStar } from "react-icons/fa";
import { FaWandMagicSparkles } from "react-icons/fa6";
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

const FILTERS = [
  { id: "all", label: "Tất cả sự kiện" },
  { id: "holiday", label: "Ngày Lễ lớn (Nghỉ lễ)" },
  { id: "lunar", label: "Âm lịch truyền thống" },
  { id: "solar", label: "Dương lịch" },
  { id: "love", label: "Phụ nữ & Tình yêu (20/10, 8/3...)" }
];

export default function EventList({ 
  onSelectEvent, 
  onApplyTheme, 
  activeTheme = "default" 
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return VIETNAM_EVENTS.filter((e) => {
      // 1. Filter tab
      if (activeFilter === "holiday" && !e.isOfficialHoliday) return false;
      if (activeFilter === "lunar" && !e.isLunar) return false;
      if (activeFilter === "solar" && e.isLunar) return false;
      if (activeFilter === "love" && e.theme !== "pink") return false;

      // 2. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = e.title.toLowerCase().includes(query);
        const matchShort = e.shortTitle.toLowerCase().includes(query);
        const matchDesc = e.desc.toLowerCase().includes(query);
        const matchDate = `${e.day}/${e.month}`.includes(query);
        return matchTitle || matchShort || matchDesc || matchDate;
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  return (
    <div className={`event-list-section event-list--${activeTheme}`}>
      
      {/* SECTION HEADER & SEARCH */}
      <div className="event-list-header">
        <div>
          <h2 className="section-title">Danh Mục Lễ &amp; Sự Kiện Trong Năm</h2>
          <p className="section-desc">
            Khám phá trọn vẹn các ngày lễ văn hóa truyền thống, kỷ niệm lịch sử và lễ hội quốc tế tại Việt Nam.
          </p>
        </div>

        <div className="search-box-wrap">
          <FaSearch className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm ngày lễ, sự kiện, 20/10, Tết..."
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-search-btn" 
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* FILTER PILLS */}
      <div className="filter-pills-row">
        <FaFilter className="filter-icon" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-pill ${activeFilter === f.id ? "active" : ""}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="empty-events-state">
          <p>Không tìm thấy sự kiện nào khớp với từ khóa "{searchQuery}".</p>
          <button type="button" onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}>
            Xem toàn bộ sự kiện
          </button>
        </div>
      ) : (
        <div className="events-cards-grid">
          {filteredEvents.map((event) => {
            const ItemIcon = THEME_ICONS[event.theme] || FaStar;
            const themeConfig = THEMES[event.theme] || THEMES.default;

            return (
              <div 
                key={event.id} 
                className={`event-card-item card-theme-${event.theme}`}
              >
                <div className="card-top-row">
                  <div className={`card-icon-avatar bg-${event.theme}`}>
                    <ItemIcon />
                  </div>
                  <div className="card-date-badge">
                    <span className="date-number">{event.day}/{event.month}</span>
                    <span className="cal-type-tag">{event.isLunar ? "Âm lịch" : "Dương lịch"}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-category">{event.category}</div>
                  <h3 className="card-title" onClick={() => onSelectEvent?.(event)}>
                    {event.title}
                  </h3>
                  <p className="card-desc">{event.desc}</p>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="btn-theme-experience"
                    onClick={() => onApplyTheme?.(event.theme)}
                    title={`Đổi toàn bộ giao diện theo theme ${themeConfig.shortName}`}
                  >
                    <FaWandMagicSparkles className="icon" />
                    <span>Theme: {themeConfig.shortName}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-details"
                    onClick={() => onSelectEvent?.(event)}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
