import { useState } from "react";
import onepiece from "../../data/onepiece"; // import list video
import "./index.scss";

export default function MoviePage() {
  const [currentVideo, setCurrentVideo] = useState(onepiece[0]);

  // lấy index tập hiện tại trong mảng
  const currentIndex = onepiece.findIndex(v => v.id === currentVideo.id);

  // handler lùi tập
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentVideo(onepiece[currentIndex - 1]);
    }
  };

  // handler chuyển tập
  const handleNext = () => {
    if (currentIndex < onepiece.length - 1) {
      setCurrentVideo(onepiece[currentIndex + 1]);
    }
  };

  return (
    <div className="movie-page pb-3 pt-4">
      <div className="container">
        <h3 className="movie-page__title mb-4">
          <i>Bạn đang xem One Piece tập : {currentVideo.episode}</i>
        </h3>

        {/* Video player */}
        <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
          <iframe
            src={currentVideo.src}
            title="Movie Player"
            allowFullScreen
            allow="autoplay; encrypted-media; clipboard-write; web-share; accelerometer; gyroscope"
            className="movie-page__iframe rounded shadow"
          />
        </div>

        {/* Nút điều hướng */}
        <div className="movie-page__nav d-flex justify-content-between mb-4">
          <button
            className="btn btn-outline-secondary"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Tập trước
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleNext}
            disabled={currentIndex === onepiece.length - 1}
          >
            Tập sau
          </button>
        </div>

        {/* Episode list */}
        <h2 className="movie-page__subtitle h5 mb-3">Danh sách tập</h2>
        <div className="movie-page__episodes d-flex flex-wrap gap-2">
          {onepiece.map((video) => (
            <button
              key={video.id}
              onClick={() => {
                setCurrentVideo(video);
                window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu trang
              }}
              className={`movie-page__episode btn ${
                currentVideo.id === video.id
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
            >
              Tập {video.episode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
