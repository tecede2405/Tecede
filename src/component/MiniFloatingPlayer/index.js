import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMusic } from "../../context/MusicContext";
import { FaPlay, FaPause, FaStepForward, FaTimes, FaListUl, FaMusic, FaExpandAlt } from "react-icons/fa";
import "./style.scss";

export default function MiniFloatingPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDrawer, setShowDrawer] = useState(false);

  const {
    playlist,
    currentIndex,
    isPlaying,
    isLoading,
    togglePlay,
    handlePlay,
    handleNext,
    currentCategory,
    isMiniPlayerVisible,
    closeMiniPlayer,
  } = useMusic();

  const currentSong = playlist && currentIndex !== null ? playlist[currentIndex] : null;

  // Tự động đóng drawer nếu chuyển sang trang nhạc
  const isMusicPage = location.pathname.startsWith("/music");
  useEffect(() => {
    if (isMusicPage) {
      setShowDrawer(false);
    }
  }, [isMusicPage]);

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
  // 2. Đang ở trong trang phát nhạc /music/...
  // 3. Người dùng chủ động ấn nút đóng (x)
  if (!currentSong || isMusicPage || !isMiniPlayerVisible) {
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

  return (
    <>
      {/* ── CỬA SỔ MINI NỔI GÓC PHẢI ── */}
      <div className="mini-floating-player-wrapper" onClick={handleOpenMusicPage}>
        {/* Nút Đóng widget */}
        <button
          className="mini-floating-close-btn"
          title="Thu nhỏ / Đóng"
          onClick={(e) => {
            e.stopPropagation();
            setShowDrawer(false);
            closeMiniPlayer();
          }}
        >
          <FaTimes size={12} />
        </button>

        <div className="mini-floating-content">
          {/* Ảnh xoay xoay đĩa nhạc */}
          <div className="mini-floating-thumb-wrapper">
            <img
              src={currentSong.image || "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"}
              alt={currentSong.title}
              className={`mini-floating-thumb ${isPlaying && !isLoading ? "spinning" : ""}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
              }}
            />
            <div className="mini-floating-disc-center" />
          </div>

          {/* Thông tin bài hát */}
          <div className="mini-floating-info">
            <div className="mini-floating-tag">
              <FaMusic size={10} className="me-1 animate-pulse" /> Đang phát
            </div>
            <h6 className="mini-floating-title text-truncate">{currentSong.title}</h6>
            <p className="mini-floating-artist text-truncate">{currentSong.artist || "Nhiều nghệ sĩ"}</p>
          </div>

          {/* Bộ điều khiển Mini */}
          <div className="mini-floating-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className="mini-floating-btn play-btn"
              onClick={togglePlay}
              title={isPlaying ? "Tạm dừng" : "Phát tiếp"}
            >
              {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} style={{ marginLeft: "2px" }} />}
            </button>

            <button
              className="mini-floating-btn next-btn"
              onClick={handleNext}
              title="Bài tiếp theo"
            >
              <FaStepForward size={12} />
            </button>

            {/* Icon Danh Sách Phát mở Drawer sang phải */}
            <button
              className={`mini-floating-btn playlist-btn ${showDrawer ? "active" : ""}`}
              onClick={togglePlaylistDrawer}
              title="Danh sách phát"
            >
              <FaListUl size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── BACKDROP MỜ KHI MỞ DRAWER ── */}
      {showDrawer && (
        <div
          className="mini-drawer-backdrop"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* ── SIDEBAR DRAWER TRƯỢT TỪ BÊN PHẢI SANG ── */}
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
                  key={song._id || index}
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
    </>
  );
}

