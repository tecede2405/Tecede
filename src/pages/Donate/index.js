import { Link } from "react-router-dom";
import {
  FaHandHoldingHeart,
  FaCrown,
  FaCalendarAlt,
  FaQuoteLeft,
  FaHeart,
  FaArrowRight,
  FaGift,
} from "react-icons/fa";
import { useDonates } from "../../context/DonateContext";
import "./style.scss";

function DonatePage() {
  const { donates, loading } = useDonates();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthDonates = donates.filter((item) => {
    if (!item.created_at) return false;

    const donateDate = new Date(
      item.created_at.includes("T")
        ? item.created_at
        : item.created_at.replace(" ", "T")
    );

    return (
      donateDate.getMonth() === now.getMonth() &&
      donateDate.getFullYear() === now.getFullYear()
    );
  });

  const totalAmount = currentMonthDonates.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const GOAL_AMOUNT = 500000;
  const progressPercent = Math.round((totalAmount / GOAL_AMOUNT) * 100);

  const topDonator = currentMonthDonates[0] || null;

  const formatMoney = (money) => {
    return Number(money).toLocaleString("vi-VN") + "đ";
  };

  if (loading) {
    return (
      <div className="donate-page">
        <div className="donate-page-inner">
          <div className="donate-page-header">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>

          <div className="donate-stats-row">
            {[1, 2, 3].map((i) => (
              <div key={i} className="donate-stat-card skeleton-card">
                <div className="skeleton skeleton-text short" />
                <div className="skeleton skeleton-text" />
              </div>
            ))}
          </div>

          <div className="donate-page-list">
            {[...Array(6)].map((_, index) => (
              <div className="donate-pg-card skeleton-card" key={index}>
                <div className="donate-pg-avatar skeleton" />
                <div className="donate-pg-info">
                  <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                  <div className="skeleton skeleton-text short" style={{ width: "85%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <div className="donate-page-inner">
        {/* HEADER SECTION */}
        <div className="donate-page-header">
          <div className="donate-hero-badge">
            <FaHandHoldingHeart className="badge-icon" />
            <span>Bảng Vàng Vinh Danh</span>
          </div>

          <h1 className="donate-hero-title">
            Danh Sách Donate Tháng {currentMonth}/{currentYear}
          </h1>

          <p className="donate-hero-desc">
            Tri ân và cảm ơn tất cả mọi người đã chung tay tiếp sức giúp Tecede có đủ kinh phí duy trì máy chủ mỗi tháng.
          </p>

          {/* STATS OVERVIEW */}
          <div className="donate-stats-row">
            <div className="donate-stat-card">
              <span className="stat-label">Tổng lượt ủng hộ</span>
              <span className="stat-value">
                {currentMonthDonates.length} <small>lượt</small>
              </span>
            </div>
            <div className="donate-stat-card highlight">
              <span className="stat-label">Tổng quỹ tháng {currentMonth}</span>
              <span className="stat-value text-gold">
                {formatMoney(totalAmount)}{" "}
                <small className="stat-progress">({progressPercent}% tiến độ)</small>
              </span>
            </div>
            <div className="donate-stat-card">
              <span className="stat-label">Top 1 vinh danh</span>
              <span className="stat-value text-amber" title={topDonator?.nickname || "Chưa có"}>
                {topDonator?.nickname || "Chưa có"}
              </span>
            </div>
          </div>

          <div className="donate-cta-wrap">
            <Link to="/ung-ho" className="donate-cta-btn">
              <FaHeart className="heart-icon" />
              <span>Tiếp sức duy trì server ngay</span>
              <FaArrowRight className="arrow-icon" />
            </Link>
          </div>
        </div>

        {/* LIST DONATORS */}
        <div className="donate-page-list">
          {currentMonthDonates.length === 0 ? (
            <div className="empty-donate-card">
              <div className="empty-icon-wrap">
                <FaGift className="empty-icon" />
              </div>
              <h3>Chưa có ai donate trong tháng {currentMonth}</h3>
              <p>Hãy là người đầu tiên tiếp sức để bảng vàng tháng này rực rỡ nhất nhé!</p>
              <Link to="/ung-ho" className="empty-donate-btn">
                <FaHeart /> Ủng hộ ngay
              </Link>
            </div>
          ) : (
            currentMonthDonates.map((item, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop = rank <= 3;

              return (
                <div
                  className={`donate-pg-card ${isTop ? `is-top rank-${rank}` : ""}`}
                  key={item.id || index}
                >
                  {/* RANK AVATAR */}
                  <div className={`donate-pg-avatar rank-${isTop ? rank : "default"}`}>
                    {isTop1 ? (
                      <FaCrown className="avatar-crown" />
                    ) : (
                      <span>#{rank}</span>
                    )}
                  </div>

                  {/* CONTENT INFO */}
                  <div className="donate-pg-info">
                    <div className="donate-pg-line1">
                      {/* Tên người donate: nếu dài > 18 ký tự thì chữ tự động chạy marquee */}
                      <div className="donate-pg-name-container">
                        {item.nickname && item.nickname.length > 18 ? (
                          <div className="donate-pg-scroll-name">
                            <span>{item.nickname} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span>{item.nickname} &nbsp;&nbsp;&nbsp;&nbsp;</span>
                          </div>
                        ) : (
                          <span className="donate-pg-name" title={item.nickname}>
                            {item.nickname || "Ẩn danh"}
                          </span>
                        )}
                      </div>

                      {item.created_at && (
                        <span className="donate-pg-date">
                          <FaCalendarAlt className="date-icon" />
                          {item.created_at.split(" ")[0].split("-").reverse().join("/")}
                        </span>
                      )}

                      <div className="donate-pg-amount-badge">
                        <span className="amount-text">{formatMoney(item.amount)}</span>
                      </div>
                    </div>

                    <div className="donate-pg-line2">
                      <FaQuoteLeft className="quote-icon" />
                      {/* Lời nhắn: nếu dài > 28 ký tự thì chữ tự động chạy marquee */}
                      <div className="donate-pg-msg-container">
                        {item.message && item.message.length > 28 ? (
                          <div className="donate-pg-scroll-msg">
                            <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                          </div>
                        ) : (
                          <span className="donate-pg-msg" title={item.message}>
                            {item.message || "Gửi tặng Tecede một ly cà phê ☕"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default DonatePage;
