import "./AnnouncementBar.scss";
import { FaFire } from "react-icons/fa";

export default function AnnouncementBar() {
  const items = [
    "Lưu Ý Ở Cuối Web, Mọi Người Nên Đọc Nha",
    "Mọi Người Nên Reload Lại Trang Mỗi Lần Truy Cập Để Nhận Được Những Cập Nhật Mới Nhất",
    "Mình Sẽ Update Liên Tục",
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