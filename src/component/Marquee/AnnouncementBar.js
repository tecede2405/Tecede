import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDonates } from "../../context/DonateContext";
import { FaHeart, FaCrown, FaDonate, FaCoins } from "react-icons/fa";
import "./AnnouncementBar.scss";

// Chuyển đổi thời gian sang giờ Việt Nam (UTC+7) để lấy tháng và năm
const getVietnamMonthYear = (dateInput) => {
  if (!dateInput) return null;
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === "number") {
    date = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    const raw = dateInput.trim();
    if (!raw) return null;
    const hasTz = raw.endsWith("Z") || /[+-]\d{2}(:?\d{2})?$/.test(raw);
    const isoString = hasTz ? raw : raw.replace(" ", "T") + "Z";
    date = new Date(isoString);
    if (isNaN(date.getTime())) {
      date = new Date(raw.replace(" ", "T"));
    }
  } else {
    date = new Date(dateInput);
  }

  if (!date || isNaN(date.getTime())) return null;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const month = parseInt(parts.find((p) => p.type === "month")?.value, 10);
  const year = parseInt(parts.find((p) => p.type === "year")?.value, 10);

  return { month, year };
};

export default function AnnouncementBar() {
  const { donates } = useDonates();

  const currentVnDate = useMemo(() => getVietnamMonthYear(new Date()), []);
  const currentMonth = currentVnDate?.month || new Date().getMonth() + 1;

  // Lọc danh sách donate theo tháng và năm hiện tại theo giờ Việt Nam
  const currentMonthDonates = useMemo(() => {
    if (!Array.isArray(donates) || donates.length === 0) return [];
    const nowVn = getVietnamMonthYear(new Date());
    if (!nowVn) return [];

    return donates.filter((item) => {
      if (!item.created_at) return false;
      const itemVn = getVietnamMonthYear(item.created_at);
      if (!itemVn) return false;
      return itemVn.month === nowVn.month && itemVn.year === nowVn.year;
    });
  }, [donates]);

  const formatMoney = (money) => `${Number(money || 0).toLocaleString("vi-VN")}đ`;

  // Sắp xếp theo số tiền ủng hộ nhiều nhất
  const donateItems = useMemo(() => {
    return [...currentMonthDonates].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  }, [currentMonthDonates]);

  // Nhân đôi mảng để tạo vòng lặp vô tận mượt mà khi có data
  const loopList = useMemo(() => {
    if (donateItems.length === 0) return [];
    if (donateItems.length < 5) {
      return [...donateItems, ...donateItems, ...donateItems, ...donateItems];
    }
    return [...donateItems, ...donateItems];
  }, [donateItems]);

  // Danh sách lặp vô tận khi chưa có ai donate trong tháng
  const emptyLoopList = useMemo(() => {
    return Array.from({ length: 20 });
  }, []);

  return (
    <div className="announcementBar announcementBar--gold">
      <div className="announcementBar__badge">
        <FaCrown className="announcementBar__badge-icon" />
        <span className="badge-text-full">Danh sách donate tháng {currentMonth}</span>
        <span className="badge-text-short">Donate T.{currentMonth}</span>
      </div>

      {donateItems.length === 0 ? (
        <div className="announcementTrack">
          {emptyLoopList.map((_, index) => (
            <div className="announcementItem announcementItem--empty" key={`empty-${index}`}>
              <span className="announcementItem__avatar-ring">
                <FaHeart className="announcementItem__heart" />
              </span>
              <span className="announcementItem__name">Chưa có ai donate trong tháng này</span>
              <span className="announcementItem__dot">•</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="announcementTrack">
          {loopList.map((item, index) => (
            <div className="announcementItem" key={`${item.id || item.nickname || index}-${index}`}>
              <span className="announcementItem__avatar-ring">
                <FaHeart className="announcementItem__heart" />
              </span>
              <span className="announcementItem__name">{item.nickname || item.name || "Ẩn danh"}</span>
              <span className="announcementItem__amount">
                <FaCoins className="announcementItem__coins" />
                +{formatMoney(item.amount)}
              </span>
              {item.message && (
                <span className="announcementItem__msg" title={item.message}>
                  "{item.message}"
                </span>
              )}
              <span className="announcementItem__dot">•</span>
            </div>
          ))}
        </div>
      )}

      <Link to="/ung-ho" className="announcementBar__action" title="Tham gia ủng hộ website">
        <FaDonate />
        <span>Ủng hộ</span>
      </Link>
    </div>
  );
}
