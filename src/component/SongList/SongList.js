import React from "react";
import "./style.scss";

export default function SongList({ songs, currentIndex, onPlay }) {
  function isNew(createdAt) {
    if (!createdAt) return false;
    const now = new Date();
    const diffDays = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    return diffDays < 7;
  }

  return (
    <div className="song-list-grid">
      {songs.map((song, index) => (
        <div
          key={song._id || index}
          className={`music-card d-flex align-items-center p-2 px-3 ${
            currentIndex === index ? "active" : ""
          }`}
          onClick={() => onPlay(index)}
        >
          {/* TRÁI: Box chứa Ảnh và Badge "Mới" */}
          <div className="position-relative d-flex align-items-center" style={{ marginRight: '15px' }}>
            {isNew(song.createdAt) && (
              <span className="custom-badge-new">Mới</span>
            )}
            <img
              src={song.image}
              className="song-img rounded"
              alt={song.title}
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          </div>

          {/* GIỮA: Tên bài và Ca sĩ (Đã đổi class mới để chống vỡ khung) */}
          <div className="song-info-center flex-grow-1 text-center overflow-hidden">
            <h5 className="song-title-new">
              {song.title}
            </h5>
            <p className="song-artist-new">
              {song.artist || "Đang cập nhật"}
            </p>
          </div>

          {/* PHẢI: Lượt nghe (Đổi class mới) */}
          <div className="song-listens-new">
            {song.listens || 0} lượt nghe
          </div>
        </div>
      ))}
    </div>
  );
}