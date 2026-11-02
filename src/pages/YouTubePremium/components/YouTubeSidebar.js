import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import { useAuth } from "../../../context/AuthContext";
import {
  FaHome,
  FaFire,
  FaHistory,
  FaMusic,
  FaGamepad,
  FaNewspaper,
  FaFilm,
  FaPodcast,
  FaMobileAlt,
  FaTv,
  FaBookOpen,
  FaCrown,
  FaDonate,
  FaSignInAlt,
  FaTimes
} from "react-icons/fa";

export default function YouTubeSidebar({ onSelectChip, activeChip, currentView, onSelectView }) {
  const { 
    isSidebarCollapsed, 
    setIsSidebarCollapsed, 
    isMobileSidebarOpen, 
    closeMobileSidebar 
  } = useTecedeYtPlayer();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const closeAll = () => {
    closeMobileSidebar();
    setIsSidebarCollapsed(true);
  };

  const handleNav = (targetPath, chipQuery = null, view = "feed") => {
    closeAll();

    if (view === "history") {
      if (onSelectView) {
        onSelectView("history");
      }
      if (location.pathname !== "/tecede-yt") {
        navigate("/tecede-yt?view=history");
      }
      return;
    }

    // Nếu chọn xem feed / chip
    if (onSelectView) {
      onSelectView("feed");
    }

    if (chipQuery && onSelectChip) {
      onSelectChip(chipQuery);
    }

    if (location.pathname !== targetPath) {
      if (chipQuery) {
        navigate(`${targetPath}?chip=${encodeURIComponent(chipQuery)}`);
      } else {
        navigate(targetPath);
      }
    }
  };

  const isHomeActive = location.pathname === "/tecede-yt" && currentView !== "history" && (!activeChip || activeChip === "Tất cả");
  const isTrendingActive = activeChip === "Thịnh hành" && currentView !== "history";
  const isHistoryActive = currentView === "history";

  const getAvatarLetter = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  return (
    <>
      {/* BACKDROP OVERLAY (CẢ MOBILE DRAWER LẪN DESKTOP OVERLAY) */}
      {(isMobileSidebarOpen || !isSidebarCollapsed) && (
        <div 
          className={`yt-sidebar-backdrop ${
            isMobileSidebarOpen ? "is-for-mobile" : "is-for-desktop"
          }`} 
          onClick={closeAll}
          aria-hidden="true" 
        />
      )}

      <aside
        className={`yt-sidebar ${isSidebarCollapsed ? "is-collapsed" : "is-expanded"} ${
          isMobileSidebarOpen ? "is-mobile-open is-expanded" : ""
        }`}
      >
        {/* HEADER BÊN TRONG DRAWER MOBILE */}
        <div className="yt-sidebar__mobile-header d-lg-none">
          <div className="yt-sidebar__brand">
            <span className="yt-sidebar__brand-name">
              Tecede<span className="accent">YT</span>
            </span>
            <span className="yt-sidebar__badge">Menu</span>
          </div>
          <button
            type="button"
            className="yt-sidebar__close-btn"
            onClick={closeAll}
            title="Đóng menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* NỘI DUNG CUỘN CỦA SIDEBAR */}
        <div className="yt-sidebar__scroll-content">
          {/* PHẦN 1: ĐIỀU HƯỚNG CHÍNH */}
          <div className="yt-sidebar__section">
            <button
              type="button"
              className={`yt-sidebar__item ${isHomeActive ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Tất cả", "feed")}
              title="Trang chủ"
            >
              <FaHome className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Trang chủ</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${isTrendingActive ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Thịnh hành", "feed")}
              title="Thịnh hành"
            >
              <FaFire className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Thịnh hành</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${isHistoryActive ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", null, "history")}
              title="Lịch sử xem"
            >
              <FaHistory className="yt-sidebar__icon" />
              <div className="yt-sidebar__label-wrap">
                <span className="yt-sidebar__label">Lịch sử xem</span>
              </div>
            </button>
          </div>

          <div className="yt-sidebar__divider" />

          {/* PHẦN 2: KHÁM PHÁ CHỦ ĐỀ */}
          <div className="yt-sidebar__section">
            <h4 className="yt-sidebar__heading">Khám phá</h4>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Âm nhạc" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Âm nhạc", "feed")}
              title="Âm nhạc"
            >
              <FaMusic className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Âm nhạc</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Gaming" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Gaming", "feed")}
              title="Trò chơi"
            >
              <FaGamepad className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Trò chơi</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Tin tức" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Tin tức", "feed")}
              title="Tin tức"
            >
              <FaNewspaper className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Tin tức</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Phim ảnh" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Phim ảnh", "feed")}
              title="Phim ảnh"
            >
              <FaFilm className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Phim ảnh</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Podcast" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Podcast", "feed")}
              title="Podcast"
            >
              <FaPodcast className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Podcast</span>
            </button>

            <button
              type="button"
              className={`yt-sidebar__item ${activeChip === "Công nghệ" ? "active" : ""}`}
              onClick={() => handleNav("/tecede-yt", "Công nghệ", "feed")}
              title="Công nghệ"
            >
              <FaMobileAlt className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Công nghệ</span>
            </button>
          </div>

          <div className="yt-sidebar__divider" />

          {/* PHẦN 3: HỆ SINH THÁI TECEDE */}
          <div className="yt-sidebar__section">
            <h4 className="yt-sidebar__heading">Hệ sinh thái Tecede</h4>

            <Link
              to="/"
              className="yt-sidebar__item"
              onClick={closeAll}
              title="Xem Phim Miễn Phí"
            >
              <FaTv className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Phim Tecede</span>
            </Link>

            <Link
              to="/truyen"
              className="yt-sidebar__item"
              onClick={closeAll}
              title="Đọc truyện tranh Online"
            >
              <FaBookOpen className="yt-sidebar__icon" />
              <span className="yt-sidebar__label">Truyện tranh</span>
            </Link>

            <Link
              to="/premium"
              className="yt-sidebar__item yt-sidebar__item--gold"
              onClick={closeAll}
              title="Nâng cấp gói Tecede Premium"
            >
              <FaCrown className="yt-sidebar__icon yt-icon--gold" />
              <span className="yt-sidebar__label">Tecede Premium</span>
            </Link>

            <Link
              to="/ung-ho"
              className="yt-sidebar__item"
              onClick={closeAll}
              title="Ủng hộ duy trì máy chủ"
            >
              <FaDonate className="yt-sidebar__icon yt-icon--heart" />
              <span className="yt-sidebar__label">Ủng hộ Server</span>
            </Link>
          </div>

          <div className="yt-sidebar__divider" />

          {/* PHẦN 4: TRẠNG THÁI TÀI KHOẢN */}
          <div className="yt-sidebar__section yt-sidebar__user-box">
            {user ? (
              <div className="yt-sidebar-user-card">
                <div className="user-info">
                  <div className="user-avatar-ring">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.display_name || user.username || "Avatar"}
                        className="user-avatar-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.display_name || user.username || "U"
                          )}&background=2563eb&color=fff&bold=true`;
                        }}
                      />
                    ) : (
                      <div className="user-avatar-fallback">
                        {getAvatarLetter(user.display_name || user.username)}
                      </div>
                    )}
                  </div>
                  <div className="user-meta">
                    <span className="user-name" title={user.display_name || user.username}>
                      {user.display_name || user.username || "Thành viên"}
                    </span>
                    <span className="user-role-label">
                      {user.role === "admin"
                        ? "Quản trị viên"
                        : user.role === "premium"
                        ? "Thành viên Premium"
                        : "Thành viên"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="yt-sidebar-guest-card">
                <p className="guest-prompt">
                  Đăng nhập tài khoản để lưu & đồng bộ lịch sử xem trên mọi thiết bị.
                </p>
                <Link 
                  to="/login" 
                  className="yt-btn-login-sidebar"
                  onClick={closeAll}
                >
                  <FaSignInAlt className="me-2" /> Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
