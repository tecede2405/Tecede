import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import LatestMovies from "../../component/LatestMovies.js/index";
import { GoChevronLeft } from "react-icons/go";
import { saveToHistory } from "../../utils/history";
import "./style.scss";

export default function FilmDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [servers, setServers] = useState([]);      // chứa toàn bộ server
  const [currentServer, setCurrentServer] = useState(0); // index server đang chọn
  const [episodes, setEpisodes] = useState([]);    // các tập theo server
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // Fetch dữ liệu phim
  useEffect(() => {
    async function fetchFilm() {
      try {
        const res = await fetch(`${process.env.REACT_APP_FILM_API_URL}/phim/${slug}`);
        const data = await res.json();

        setMovie(data.movie);
        setServers(data.episodes);

        // Mặc định lấy server đầu tiên
        const defaultServer = data.episodes[0];
        setEpisodes(defaultServer.server_data);
        setCurrentVideo(defaultServer.server_data[0]);

      } catch (err) {
        console.error(err);
      }
    }

    fetchFilm();
  }, [slug]);

  // lưu lại lịch sử xem
  useEffect(() => {
    if (movie) {
      saveToHistory({
        title: movie.name,
        image: movie.poster_url,
        path: movie.slug,
      });
    }
  }, [movie]);

  // Khi đổi server → đổi danh sách tập + chọn tập đầu
  const handleChangeServer = (serverIndex) => {
    setCurrentServer(serverIndex);
    const newList = servers[serverIndex].server_data;
    setEpisodes(newList);
    setCurrentVideo(newList[0]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!movie || !currentVideo || servers.length === 0) {
    return <div className="container"><p>Đang tải...</p></div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const currentIndex = episodes.findIndex(v => v.slug === currentVideo.slug);
 

  return (
    <div className="movie-page pb-5 pt-3" style={{ "--bg-url": `url(${movie.poster_url})`}}>
      <div className="container container-film">

        {/* Title */}
        <h5 className="movie-page__title mb-4">
          <GoChevronLeft 
          onClick={handleBack} 
          style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }} 
          />
          <i className="ms-2">Bạn đang xem : {movie.name} – {currentVideo.name}</i>
        </h5>

        {/* Player */}
        <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
          <iframe
            key={currentVideo.slug}
            src={currentVideo.link_embed}
            title="Movie Player"
            allow="autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            frameBorder="0"
          />

        </div>

        {/* Server selector */}
        <h5 className="mb-3 text-info fst-italic">Chọn server</h5>
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {servers.map((s, idx) => (
            <button
              key={idx}
              className={`btn fst-italic ${idx === currentServer ? "btn-info" : "btn-outline-light"}`}
              onClick={() => handleChangeServer(idx)}
            >
              {s.server_name}
            </button>
          ))}
        </div>

        <p className="film-policy border-top pt-2 mt-3 fst-italic">
          Nếu bạn không load được phim hãy thử bật 1.1.1.1 tải ở CH play hoặc App store rồi thử lại nha.
        </p>
        {/* Navigation buttons */}
        <div className="movie-page__nav d-flex justify-content-between mb-4">
          <button
            className="btn btn-outline-info"
            onClick={() => currentIndex > 0 && setCurrentVideo(episodes[currentIndex - 1])}
            disabled={currentIndex === 0}
          >
            Tập trước
          </button>

          <button
            className="btn btn-outline-info"
            onClick={() => currentIndex < episodes.length - 1 && setCurrentVideo(episodes[currentIndex + 1])}
            disabled={currentIndex === episodes.length - 1}
          >
            Tập sau
          </button>
        </div>

        {/* Episode List */}
        <h2 className="movie-page__subtitle h5 mb-3">
          Danh sách tập – {servers[currentServer].server_name}
        </h2>

        <div className="movie-page__episodes d-flex flex-wrap gap-2 mb-3">
          {episodes.map((video) => (
            <button
              key={video.slug}
              onClick={() => {
                setCurrentVideo(video);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`movie-page__episode btn ${
                currentVideo.slug === video.slug ? "btn-primary" : "btn-outline-secondary"
              }`}
            >
              {video.name}
            </button>
          ))}
        </div>
        <p className="film-policy border-top pt-3 mt-5 fst-italic">Lưu ý: Chúng tôi từ chối mọi trách nhiệm liên quan đến nội dung hiển thị/tồn tại trên trang. Tất cả video và dữ liệu tại đây đều được tổng hợp từ các nguồn phổ biến trên Internet,
          và không thuộc quyền sở hữu hay kiểm soát của chúng tôi. Chúng tôi không cung cấp dịch vụ phát trực tuyến chính thức. 
          Nếu bạn cho rằng quyền lợi của mình bị ảnh hưởng, vui lòng liên hệ ngay cho chúng tôi sẽ xử lý và gỡ bỏ nội dung vi phạm kịp thời.
          Xin cảm ơn sự thông cảm và hợp tác của bạn.
        </p>
        <div className="Home__music">
                <LatestMovies />
        </div>
      </div>
    </div>
  );
}
