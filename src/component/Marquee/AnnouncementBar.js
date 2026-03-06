import "./AnnouncementBar.scss";
import { FaFire } from "react-icons/fa";

export default function AnnouncementBar() {
  return (
    <div className="announcementBar">
      <div className="announcementTrack">

        <div className="announcementItem">
          <FaFire /> Mình Vừa Cập Nhật Trang Đọc Truyện
        </div>

        <div className="announcementItem">
          <FaFire /> Ai Có Đam Mê Vào Đọc Nhé
        </div>

        <div className="announcementItem">
          <FaFire /> Mình Sẽ Update Dần Dần
        </div>

      </div>
    </div>
  );
}