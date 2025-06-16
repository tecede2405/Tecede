import React from "react";

export default function SongList({ songs, currentIndex, onPlay }) {
  return (
    <div className="row">
      {songs.map((song, index) => (
        <div className="col-md-5 mb-4" key={index}>
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
          </div>
        </div>
      ))}
    </div>
  );
}
