import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style.scss";
export default function FilmDetail() {
  const { slug } = useParams();   // slug từ URL: /phim/:slug

  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);

  // lấy dữ liệu phim từ slug
  useEffect(() => {
    async function fetchFilm() {
      try {
        const res = await fetch(`https://phimapi.com/phim/${slug}`);
        const data = await res.json();

        // lưu thông tin phim + danh sách tập
        setMovie(data.movie);
        setEpisodes(data.episodes[0].server_data);

        // tập đầu tiên
        setCurrentVideo(data.episodes[0].server_data[0]);

      } catch (error) {
        console.error(error);
      }
    }

    fetchFilm();
  }, [slug]);

  if (!movie || !currentVideo) {
    return <div className="container"><p>Đang tải...</p></div>;
  }

  // tìm index tập hiện tại
  const currentIndex = episodes.findIndex(v => v.slug === currentVideo.slug);

  // lùi tập
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentVideo(episodes[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // kế tiếp tập
  const handleNext = () => {
    if (currentIndex < episodes.length - 1) {
      setCurrentVideo(episodes[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="movie-page pb-5 pt-3">
      <div className="container">

        {/* Title */}
        <h5 className="movie-page__title mb-4">
          <i>
            Bạn đang xem {movie.name} tập: {currentVideo.name}
          </i>
        </h5>

        {/* Player */}
        <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
          <iframe
            src={currentVideo.link_embed}
            title="Movie Player"
            allowFullScreen
            allow="autoplay; encrypted-media; clipboard-write; web-share; accelerometer; gyroscope"
            className="movie-page__iframe rounded shadow"
            frameBorder="0"
          />
        </div>

        {/* Navigation buttons */}
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
            disabled={currentIndex === episodes.length - 1}
          >
            Tập sau
          </button>
        </div>

        {/* Episode List */}
        <h2 className="movie-page__subtitle h5 mb-3">Danh sách tập</h2>

        <div className="movie-page__episodes d-flex flex-wrap gap-2">
          {episodes.map((video) => (
            <button
              key={video.slug}
              onClick={() => {
                setCurrentVideo(video);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`movie-page__episode btn ${
                currentVideo.slug === video.slug
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
            >
              {video.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
