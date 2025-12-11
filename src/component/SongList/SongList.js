import React from "react";
import { Badge } from "antd";
import "./style.scss";
export default function SongList({ songs, currentIndex, onPlay }) {

  // Thêm Badge cho những bài hát mới
  function isNew(createdAt) {
    if (!createdAt) return false;
    const now = new Date();
    const diffDays = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    return diffDays < 7; // true nếu dưới 7 ngày
  }

  return (
    <div className="row">
      {songs.map((song, index) => (
        <div className="col-md-5 mb-4" key={song._id || index}>
          {isNew(song.createdAt) ? (
            <Badge.Ribbon text="Mới" color="#ea169c8c" placement="start">
              <div
                className={`music-card d-flex align-items-center p-3 song-item ${
                  currentIndex === index ? "active" : ""
                }`}
                onClick={() => onPlay(index)}
              >
                <img
                  src={song.image}
                  className="rounded mr-3"
                  alt={song.title}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="card-music-body d-flex flex-column">
                  <h5 className="card-title mb-1">{song.title}</h5>
                  <p className="card-text mb-2">{song.artist}</p>
                </div>
                <p className="card-render-text mb-0 ">
                  {song.listens || 0} lượt nghe
                </p>
              </div>
            </Badge.Ribbon>
          ) : (
            <div
              className={`music-card d-flex align-items-center p-3 song-item ${
                currentIndex === index ? "active" : ""
              }`}
              onClick={() => onPlay(index)}
            >
              <img
                src={song.image}
                className="rounded mr-3"
                alt={song.title}
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
              <div className="card-music-body d-flex flex-column">
                <h5 className="card-title mb-1">{song.title}</h5>
                <p className="card-text mb-2">{song.artist}</p>
              </div>
              <p className="card-render-text mb-0 ">
                {song.listens || 0} lượt nghe
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
