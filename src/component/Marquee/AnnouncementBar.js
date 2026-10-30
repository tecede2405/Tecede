import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDonates } from "../../context/DonateContext";
import { FaHeart, FaCrown, FaDonate, FaCoins } from "react-icons/fa";
import "./AnnouncementBar.scss";

export default function AnnouncementBar() {
  const { donates } = useDonates();
  const currentMonth = new Date().getMonth() + 1;

  // Tái sử dụng danh sách donate tháng hiện tại giống component TopList
  const currentMonthDonates = useMemo(() => {
    if (!Array.isArray(donates) || donates.length === 0) return [];
    const now = new Date();
    return donates.filter((item) => {
      if (!item.created_at) return false;
      const dateStr =
        typeof item.created_at === "string"
          ? item.created_at.replace(" ", "T")
          : item.created_at;
      const donateDate = new Date(dateStr);
      if (isNaN(donateDate.getTime())) return false;
      return (
        donateDate.getMonth() === now.getMonth() &&
        donateDate.getFullYear() === now.getFullYear()
      );
    });
  }, [donates]);

  const formatMoney = (money) => `${Number(money || 0).toLocaleString("vi-VN")}đ`;

  // Nếu chưa có donate tháng này hoặc đang tải, hiển thị thông điệp kêu gọi chung
  const donateItems = useMemo(() => {
    if (currentMonthDonates.length === 0) {
      return [
        {
          nickname: "Tecede Supporter",
          amount: 50000,
          message: "Ủng hộ duy trì máy chủ Tecede",
        },
      ];
    }
    // Sắp xếp theo số tiền ủng hộ nhiều nhất
    return [...currentMonthDonates].sort((a, b) => (b.amount || 0) - (a.amount || 0));
  }, [currentMonthDonates]);

  // Nhân đôi mảng để tạo vòng lặp vô tận mượt mà
  const loopList = useMemo(() => {
    if (donateItems.length < 5) {
      return [...donateItems, ...donateItems, ...donateItems, ...donateItems];
    }
    return [...donateItems, ...donateItems];
  }, [donateItems]);

  return (
    <div className="announcementBar announcementBar--gold">
      <div className="announcementBar__badge">
        <FaCrown className="announcementBar__badge-icon" />
        <span className="badge-text-full">Danh sách donate tháng {currentMonth}</span>
        <span className="badge-text-short">Donate T.{currentMonth}</span>
      </div>

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

      <Link to="/ung-ho" className="announcementBar__action" title="Tham gia ủng hộ website">
        <FaDonate />
        <span>Ủng hộ</span>
      </Link>
    </div>
  );
}
