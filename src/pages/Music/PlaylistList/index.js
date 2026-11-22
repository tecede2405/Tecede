// src/pages/Music/PlaylistList/index.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaPlay,
  FaTrash,
  FaMusic,
  FaSignInAlt,
  FaHeadphones,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { getMyPlaylists, deletePlaylist } from "../../../services/playlistApi";
import PlaylistModal from "../../../component/PlaylistModal/index";
import Tabbar from "../../../component/tabar/index";
import "./style.scss";

const DarkSwal = Swal.mixin({
  background: "#1f1f1f",
  color: "#fff",
  confirmButtonColor: "#9b4de0",
  cancelButtonColor: "#444",
  customClass: {
    popup: "swal-dark",
    title: "swal-title",
    htmlContainer: "swal-text",
    confirmButton: "swal-confirm",
  },
});

export default function PlaylistList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlaylists = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getMyPlaylists(user.token);
      if (res?.success && Array.isArray(res?.data)) {
        setPlaylists(res.data);
      } else {
        setPlaylists([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách playlist:", err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleDeletePlaylist = (e, playlist) => {
    e.stopPropagation();

    DarkSwal.fire({
      title: "Xóa danh sách phát?",
      text: `Bạn có chắc chắn muốn xóa playlist "${playlist.name}" không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#333",
      confirmButtonText: "Xóa playlist",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deletePlaylist(user.token, playlist.id);
          if (res?.success) {
            DarkSwal.fire({
              icon: "success",
              title: "Đã xóa!",
              text: `Playlist "${playlist.name}" đã được xóa.`,
              timer: 1500,
              showConfirmButton: false,
            });
            setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
          } else {
            DarkSwal.fire({
              icon: "error",
              title: "Lỗi",
              text: res?.message || "Không thể xóa playlist.",
            });
          }
        } catch (err) {
          console.error("Lỗi xóa playlist:", err);
          DarkSwal.fire({
            icon: "error",
            title: "Lỗi kết nối",
            text: "Không thể kết nối đến máy chủ.",
          });
        }
      }
    });
  };

  return (
    <div className="tc-pl-page-wrapper">
      <Tabbar />
      <div className="tc-pl-main-container">
        <div className="tc-pl-content-wrap">
          {/* HEADER HERO */}
          <div className="tc-pl-hero-banner">
            <div className="tc-pl-hero-body">
              <div className="tc-pl-hero-badge">
                <FaHeadphones className="me-2" /> Bộ sưu tập cá nhân
              </div>
              <h1 className="tc-pl-hero-title">Danh Sách Phát Của Bạn</h1>
              <p className="tc-pl-hero-subtitle">
                Quản lý các danh sách bài hát yêu thích do bạn tạo và thưởng thức bất cứ lúc nào.
              </p>

              {user && (
                <button
                  className="tc-pl-hero-btn-create"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaPlus className="me-2" /> Tạo playlist mới
                </button>
              )}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="tc-pl-content-section">
            {!user ? (
              /* CHƯA ĐĂNG NHẬP */
              <div className="tc-pl-guest-card">
                <div className="tc-pl-guest-icon">
                  <FaSignInAlt />
                </div>
                <h3 className="tc-pl-guest-title">Vui lòng đăng nhập</h3>
                <p className="tc-pl-guest-desc">
                  Đăng nhập tài khoản Tecede để tạo và đồng bộ hóa các danh sách phát yêu thích của riêng bạn trên mọi thiết bị.
                </p>
                <button
                  className="tc-pl-btn-login"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : loading ? (
              /* ĐANG TẢI */
              <div className="tc-pl-loading">
                <FaSpinner className="tc-pl-spinning-icon" />
                <span>Đang tải danh sách phát...</span>
              </div>
            ) : (
              /* DANH SÁCH PLAYLISTS */
              <div className="tc-pl-grid">
                {/* Card tạo mới */}
                <div
                  className="tc-pl-card-create"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="tc-pl-create-icon">
                    <FaPlus />
                  </div>
                  <div className="tc-pl-create-text">Tạo danh sách phát mới</div>
                  <div className="tc-pl-create-subtext">Thêm bài hát bạn yêu thích</div>
                </div>

                {playlists.map((pl) => (
                  <div
                    key={pl.id}
                    className="tc-pl-card"
                    onClick={() => navigate(`/music/playlist/${pl.id}`)}
                  >
                    <div className="tc-pl-cover-wrap">
                      {pl.thumbnail ? (
                        <img
                          src={pl.thumbnail}
                          alt={pl.name}
                          className="tc-pl-cover-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
                          }}
                        />
                      ) : (
                        <div className="tc-pl-cover-placeholder">
                          <FaMusic className="tc-pl-placeholder-icon" />
                        </div>
                      )}

                      {/* Play Button Overlay */}
                      <div className="tc-pl-play-overlay">
                        <div className="tc-pl-play-circle">
                          <FaPlay className="tc-pl-play-icon" />
                        </div>
                      </div>

                      {/* Badge số bài hát */}
                      <span className="tc-pl-song-count-badge">
                        {pl.song_count || 0} bài hát
                      </span>
                    </div>

                    <div className="tc-pl-card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <h4 className="tc-pl-card-title text-truncate" title={pl.name}>
                          {pl.name}
                        </h4>
                        <button
                          className="tc-pl-btn-delete"
                          title="Xóa danh sách phát này"
                          onClick={(e) => handleDeletePlaylist(e, pl)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p
                        className="tc-pl-card-desc text-truncate"
                        title={pl.description || "Danh sách phát bài hát"}
                      >
                        {pl.description || "Danh sách phát bài hát"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL TẠO PLAYLIST */}
      <PlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToken={user?.token}
        onPlaylistCreated={() => fetchPlaylists()}
      />
    </div>
  );
}
