import "./AnnouncementBar.scss";
import { FaFire } from "react-icons/fa";

export default function AnnouncementBar() {
  const items = [
    "Mình Vừa Cập Nhật Trang Đọc Truyện",
    "Ai Có Đam Mê Vào Đọc Nhé",
    "Mình Sẽ Update Dần Dần",
    "Theo Dõi Fanpage Để Nhận Thông Tin Mới Nhất Nha"
  ];

  return (
    <div className="announcementBar">
      <div className="announcementTrack">
        {[...items, ...items].map((text, index) => (
          <div className="announcementItem" key={index}>
            <FaFire /> {text}
          </div>
        ))}
      </div>
    </div>
  );
}