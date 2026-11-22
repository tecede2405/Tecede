// src/component/PlaylistModal/index.js
import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaMusic,
  FaSpinner,
  FaFolderPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getMyPlaylists,
  createPlaylist,
  addSongToPlaylist,
} from "../../services/playlistApi";
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

export default function PlaylistModal({
  isOpen,
  onClose,
  songToAdd = null,
  userToken,
  onPlaylistCreated = null,
}) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form tạo playlist
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addingPlaylistId, setAddingPlaylistId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setName("");
      setDescription("");
      setThumbnail("");
      setAddingPlaylistId(null);
      return;
    }

    if (!userToken) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getMyPlaylists(userToken)
      .then((res) => {
        if (!isMounted) return;
        const list = res?.success && Array.isArray(res?.data) ? res.data : [];
        setPlaylists(list);
        // Nếu chưa có playlist nào, tự động chuyển sang chế độ tạo playlist mới
        if (list.length === 0) {
          setIsCreating(true);
        } else {
          setIsCreating(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Lỗi lấy danh sách playlist:", err);
        setPlaylists([]);
        setIsCreating(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userToken]);

  if (!isOpen) return null;

  // Xử lý tạo playlist mới (và tùy chọn thêm bài hát ngay)
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      DarkSwal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập tên cho danh sách phát!",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPlaylist(userToken, {
        name,
        description,
        thumbnail: thumbnail.trim() || (songToAdd?.image || ""),
      });

      if (res?.success && res?.data) {
        const newPlaylist = res.data;
        DarkSwal.fire({
          icon: "success",
          title: "Tạo playlist thành công!",
          text: `Đã tạo playlist "${newPlaylist.name}"`,
          timer: 1500,
          showConfirmButton: false,
        });

        // Nếu có bài hát cần thêm -> thêm luôn vào playlist mới
        if (songToAdd) {
          await addSongToPlaylist(userToken, newPlaylist.id, songToAdd);
          DarkSwal.fire({
            icon: "success",
            title: "Đã thêm vào danh sách phát!",
            text: `Bài hát "${songToAdd.title}" đã được lưu vào "${newPlaylist.name}".`,
            timer: 2000,
            showConfirmButton: false,
          });
        }

        if (onPlaylistCreated) {
          onPlaylistCreated(newPlaylist);
        }
        onClose();
      } else {
        DarkSwal.fire({
          icon: "error",
          title: "Không thể tạo playlist",
          text: res?.message || "Đã xảy ra lỗi máy chủ, vui lòng thử lại.",
        });
      }
    } catch (err) {
      console.error("Lỗi tạo playlist:", err);
      DarkSwal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý thêm bài hát vào playlist đã chọn
  const handleSelectPlaylist = async (playlist) => {
    if (!songToAdd) return;
    setAddingPlaylistId(playlist.id);

    try {
      const res = await addSongToPlaylist(userToken, playlist.id, songToAdd);
      if (res?.success) {
        DarkSwal.fire({
          icon: "success",
          title: "Đã thêm vào danh sách phát!",
          text: `Bài hát "${songToAdd.title}" đã được lưu vào "${playlist.name}".`,
          timer: 2000,
          showConfirmButton: false,
        });
        onClose();
      } else {
        DarkSwal.fire({
          icon: "info",
          title: "Thông báo",
          text: res?.message || "Không thể thêm bài hát vào playlist.",
        });
      }
    } catch (err) {
      console.error("Lỗi thêm bài hát:", err);
      DarkSwal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối đến máy chủ.",
      });
    } finally {
      setAddingPlaylistId(null);
    }
  };

  return (
    <div className="tc-plm-backdrop" onClick={onClose}>
      <div
        className="tc-plm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="tc-plm-header">
          <div className="d-flex align-items-center gap-2">
            <FaFolderPlus className="tc-plm-header-icon" />
            <h5 className="tc-plm-title m-0">
              {isCreating
                ? "Tạo danh sách phát mới"
                : songToAdd
                ? "Thêm vào danh sách phát"
                : "Danh sách phát của bạn"}
            </h5>
          </div>
          <button className="tc-plm-btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* SONG TO ADD PREVIEW */}
        {songToAdd && (
          <div className="tc-plm-song-preview">
            <img
              src={
                songToAdd.image ||
                "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"
              }
              alt={songToAdd.title}
              className="tc-plm-song-img"
            />
            <div className="tc-plm-song-info">
              <span className="tc-plm-song-badge">Bài hát đã chọn</span>
              <div className="tc-plm-song-title">{songToAdd.title}</div>
              <div className="tc-plm-song-artist">{songToAdd.artist}</div>
            </div>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="tc-plm-body">
          {loading ? (
            <div className="tc-plm-loading-box">
              <FaSpinner className="tc-plm-spinning-icon" />
              <span>Đang tải danh sách phát...</span>
            </div>
          ) : isCreating ? (
            /* FORM TẠO PLAYLIST MỚI */
            <form onSubmit={handleCreatePlaylist} className="tc-plm-form">
              {playlists.length === 0 && songToAdd && (
                <div className="tc-plm-first-notice">
                  💡 Bạn chưa có danh sách phát nào. Hãy tạo danh sách phát đầu tiên
                  để lưu bài hát này nhé!
                </div>
              )}

              <div className="tc-plm-field mb-3">
                <label className="tc-plm-label">
                  Tên danh sách phát <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="tc-plm-input"
                  placeholder="Ví dụ: Nhạc Chill Đêm Khuya..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="tc-plm-field mb-3">
                <label className="tc-plm-label">Mô tả (tùy chọn)</label>
                <textarea
                  className="tc-plm-textarea"
                  rows={2}
                  placeholder="Mô tả về danh sách phát của bạn..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="tc-plm-field mb-3">
                <label className="tc-plm-label">Link ảnh bìa (tùy chọn)</label>
                <input
                  type="url"
                  className="tc-plm-input"
                  placeholder="Để trống sẽ tự động lấy ảnh của bài hát đầu tiên"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </div>

              <div className="tc-plm-actions d-flex justify-content-end gap-2 mt-4">
                {playlists.length > 0 && (
                  <button
                    type="button"
                    className="tc-plm-btn-cancel"
                    onClick={() => setIsCreating(false)}
                    disabled={submitting}
                  >
                    Quay lại chọn
                  </button>
                )}
                <button
                  type="submit"
                  className="tc-plm-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="tc-plm-spinning-icon me-2" /> Đang tạo...
                    </>
                  ) : (
                    <>
                      <FaPlus className="me-2" /> Tạo playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* DANH SÁCH PLAYLIST ĐỂ CHỌN */
            <div className="tc-plm-picker-list">
              <button
                className="tc-plm-btn-create-toggle"
                onClick={() => setIsCreating(true)}
              >
                <div className="tc-plm-plus-circle">
                  <FaPlus />
                </div>
                <span>Tạo danh sách phát mới</span>
              </button>

              <div className="tc-plm-picker-scroll">
                {playlists.map((pl) => {
                  const isAddingThis = addingPlaylistId === pl.id;
                  return (
                    <div
                      key={pl.id}
                      className={`tc-plm-picker-item ${
                        isAddingThis ? "is-adding" : ""
                      }`}
                      onClick={() => !isAddingThis && handleSelectPlaylist(pl)}
                    >
                      <div className="tc-plm-item-thumb-wrapper">
                        {pl.thumbnail ? (
                          <img
                            src={pl.thumbnail}
                            alt={pl.name}
                            className="tc-plm-item-thumb"
                          />
                        ) : (
                          <div className="tc-plm-item-thumb-fallback">
                            <FaMusic />
                          </div>
                        )}
                      </div>

                      <div className="tc-plm-item-details">
                        <div className="tc-plm-item-title">{pl.name}</div>
                        <div className="tc-plm-item-meta">
                          {pl.song_count || 0} bài hát
                          {pl.description ? ` • ${pl.description}` : ""}
                        </div>
                      </div>

                      <div className="tc-plm-item-action">
                        {isAddingThis ? (
                          <FaSpinner className="tc-plm-spinning-icon text-purple" />
                        ) : (
                          <button className="tc-plm-btn-add-circle" title="Thêm vào đây">
                            <FaPlus />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
