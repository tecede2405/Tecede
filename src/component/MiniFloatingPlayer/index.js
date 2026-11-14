import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useMusic } from "../../context/MusicContext";
import { FaPlay, FaPause, FaStepForward, FaListUl, FaExpandAlt, FaTimes } from "react-icons/fa";
import { MdDevices } from "react-icons/md";
import { FiX } from "react-icons/fi";
import "./style.scss";

export default function MiniFloatingPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);

  const {
    playlist,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handlePlay,
    handleNext,
    currentCategory,
    isMiniPlayerVisible,
    closeMiniPlayer,
  } = useMusic();

  const currentSong = playlist && currentIndex !== null ? playlist[currentIndex] : null;

  // Tự động đóng drawer nếu chuyển sang trang nhạc hoặc youtube
  const isMusicPage = location.pathname.startsWith("/music");
  const isYouTubePage = location.pathname.startsWith("/tecede-yt");
  useEffect(() => {
    if (isMusicPage || isYouTubePage) {
      setShowDrawer(false);
    }
  }, [isMusicPage, isYouTubePage]);

  // Cuộn đến bài hát đang phát trong drawer
  useEffect(() => {
    if (showDrawer) {
      setTimeout(() => {
        const activeItem = document.querySelector(".mini-drawer-item.active");
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [showDrawer, currentIndex]);

  // Ẩn khi:
  // 1. Không có bài hát nào đang phát/chọn
  // 2. Đang ở trong trang phát nhạc /music/... hoặc YouTube Không Quảng Cáo
  // 3. Người dùng chủ động ấn nút đóng (x)
  if (!currentSong || isMusicPage || isYouTubePage || !isMiniPlayerVisible) {
    return null;
  }

  const handleOpenMusicPage = () => {
    const slug = currentCategory?.slug || "nhac-tre";
    navigate(`/music/${slug}`);
  };

  const togglePlaylistDrawer = (e) => {
    e.stopPropagation();
    setShowDrawer(!showDrawer);
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      <div className="header__center">
        <div
          className="mini-floating-player-wrapper"
          onClick={handleOpenMusicPage}
          title="Nhấn để mở trình phát đầy đủ"
        >
          {/* Nền mờ thích ứng theo ảnh bìa bài hát */}
          <div className="mini-floating-bg">
            <img
              src={currentSong.image || "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"}
              alt=""
              aria-hidden="true"
              className="mini-floating-bg-img"
            />
            <div className="mini-floating-bg-overlay" />
          </div>

          {/* Ảnh thumbnail vuông bo góc */}
          <img
            src={currentSong.image || "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"}
            alt={currentSong.title}
            className="mini-floating-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
            }}
          />

          {/* Thông tin bài hát */}
          <div className="mini-floating-info">
            <h6 className="mini-floating-title">{currentSong.title}</h6>
            <p className="mini-floating-artist">{currentSong.artist || "Nhiều nghệ sĩ"}</p>
          </div>

          {/* Cụm nút điều khiển kiểu widget */}
          <div className="mini-floating-controls" onClick={(e) => e.stopPropagation()}>
            {/* 1. Thiết bị / Danh sách phát (MdDevices) */}
            <button
              className={`mini-floating-ctrl-btn device-btn ${showDrawer ? "active" : ""}`}
              onClick={togglePlaylistDrawer}
              title="Danh sách phát"
            >
              <MdDevices size={18} />
            </button>

            {/* 2. Nút Phát / Tạm dừng (FaPlay / FaPause) */}
            <button
              className="mini-floating-ctrl-btn play-btn"
              onClick={togglePlay}
              title={isPlaying ? "Tạm dừng" : "Phát tiếp"}
            >
              {isPlaying ? <FaPause size={13} /> : <FaPlay size={13} style={{ marginLeft: "1.5px" }} />}
            </button>

            {/* 3. Nút Chuyển bài tiếp theo (FaStepForward) */}
            <button
              className="mini-floating-ctrl-btn next-btn"
              onClick={handleNext}
              title="Bài tiếp theo"
            >
              <FaStepForward size={13} />
            </button>

            {/* 4. Nút Đóng widget (FiX) */}
            <button
              className="mini-floating-ctrl-btn close-btn"
              title="Đóng widget"
              onClick={(e) => {
                e.stopPropagation();
                setShowDrawer(false);
                closeMiniPlayer();
              }}
            >
              <FiX size={17} />
            </button>
          </div>

          {/* Thanh tiến trình chạy ở đáy viên thuốc */}
          <div className="mini-floating-progress-track">
            <div
              className="mini-floating-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── BACKDROP & SIDEBAR DRAWER (PORTAL RA BODY ĐỂ MỜ TOÀN TRANG) ── */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {showDrawer && (
              <div
                className="mini-drawer-backdrop"
                onClick={() => setShowDrawer(false)}
              />
            )}

            <div className={`mini-playlist-drawer ${showDrawer ? "open" : ""}`}>
              <div className="mini-drawer-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <FaListUl style={{ color: "#c084fc", fontSize: "15px" }} />
                  <h6 className="m-0 text-white fw-bold">Danh sách phát</h6>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className="mini-drawer-action-btn"
                    onClick={handleOpenMusicPage}
                    title="Phóng to mở trang phát"
                  >
                    <FaExpandAlt size={14} />
                  </button>
                  <button
                    className="mini-drawer-close-btn"
                    onClick={() => setShowDrawer(false)}
                    title="Đóng"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              {/* Danh sách bài hát */}
              <div className="mini-drawer-body custom-scrollbar">
                {playlist && playlist.length > 0 ? (
                  playlist.map((song, index) => {
                    const isCurrent = currentIndex === index;
                    return (
                      <div
                        key={song.id || song._id || index}
                        className={`mini-drawer-item d-flex align-items-center gap-3 ${isCurrent ? "active" : ""}`}
                        onClick={() => handlePlay(index)}
                      >
                        <div className="mini-drawer-index">
                          {isCurrent && isPlaying ? (
                            <img
                              src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/icon-playing.gif"
                              alt="playing"
                              className="mini-drawer-gif"
                            />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>

                        <img
                          src={song.image || "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"}
                          alt={song.title}
                          className="mini-drawer-thumb flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
                          }}
                        />

                        <div className="mini-drawer-song-info flex-grow-1 overflow-hidden">
                          <h6 className="mini-drawer-song-title text-truncate m-0">
                            {song.title}
                          </h6>
                          <p className="mini-drawer-song-artist text-truncate m-0">
                            {song.artist || "Nhiều nghệ sĩ"}
                          </p>
                        </div>

                        {isCurrent && (
                          <div className="mini-drawer-playing-tag">
                            {isPlaying ? "Đang hát" : "Tạm dừng"}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-5 text-muted">Không có bài hát nào</div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
