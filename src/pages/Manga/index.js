import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComicCard from "../../component/MangaCard/index";
import SearchComic from "../../component/SearchComic/index";
import { FaFire, FaClock, FaCalendarAlt, FaCheckCircle, FaTimes, FaExclamationTriangle, FaHome } from "react-icons/fa";
import "./style.scss";

export default function Manga() {
  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [coming, setComing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [showNoticeModal, setShowNoticeModal] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // mới cập nhật
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/truyen-moi`)
      .then(res => res.json())
      .then(data => setLatest(data?.data?.items?.slice(0, 24) || []))
      .catch(() => {});

    // đang thịnh hành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/dang-phat-hanh`)
      .then(res => res.json())
      .then(data => setTrending(data?.data?.items?.slice(0, 24) || []))
      .catch(() => {});

    // sắp ra mắt
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/sap-ra-mat`)
      .then(res => res.json())
      .then(data => setComing(data?.data?.items?.slice(0, 24) || []))
      .catch(() => {});

    // hoàn thành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/hoan-thanh`)
      .then(res => res.json())
      .then(data => setCompleted(data?.data?.items?.slice(0, 24) || []))
      .catch(() => {});
  }, []);

  return (
    <div className="manga-home">
      {/* POPUP THÔNG BÁO TẠM NGƯNG ĐỌC TRUYỆN */}
      {showNoticeModal && (
        <div className="manga-notice-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="manga-notice-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="manga-notice-close" 
              onClick={() => setShowNoticeModal(false)}
              aria-label="Tắt thông báo"
              title="Tắt thông báo"
            >
              <FaTimes />
            </button>

            <div className="manga-notice-icon-wrap">
              <div className="manga-notice-icon-bg">
                <FaExclamationTriangle className="manga-notice-icon" />
              </div>
            </div>

            <h3 className="manga-notice-title">Thông Báo</h3>
            
            <p className="manga-notice-desc">
              Trang đọc truyện đã ngưng, hãy quay lại trang chủ nhé!
            </p>

            <div className="manga-notice-actions">
              <button 
                className="manga-notice-btn-home" 
                onClick={() => navigate("/")}
              >
                <FaHome className="me-2" /> Về trang chủ
              </button>
              <button 
                className="manga-notice-btn-close" 
                onClick={() => setShowNoticeModal(false)}
              >
                Tắt thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="manga-hero">
        <h1 className="manga-hero__title">Thế Giới Truyện Tranh</h1>
        <p className="manga-hero__desc">Khám phá hàng ngàn bộ truyện tranh siêu hấp dẫn được cập nhật liên tục mỗi ngày.</p>
        <SearchComic />
      </div>

      <div className="manga-sections container-fluid p-0">
        <ComicBlock 
          title="Đang Thịnh Hành" 
          icon={<FaFire className="text-danger" />} 
          data={trending} 
        />
        <ComicBlock 
          title="Mới Cập Nhật" 
          icon={<FaClock className="text-warning" />} 
          data={latest} 
        />
        <ComicBlock 
          title="Sắp Ra Mắt" 
          icon={<FaCalendarAlt className="text-info" />} 
          data={coming} 
        />
        <ComicBlock 
          title="Đã Hoàn Thành" 
          icon={<FaCheckCircle className="text-success" />} 
          data={completed} 
        />
      </div>
    </div>
  );
}

function ComicBlock({ title, icon, data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="manga-block">
      <h3 className="manga-block__title">
        {icon} <span>{title}</span>
      </h3>
      <div className="comicList">
        {data.map(item => (
          <ComicCard key={item._id} comic={item} />
        ))}
      </div>
    </div>
  );
}