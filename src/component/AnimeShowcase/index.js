import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import { FaPlay, FaHeart, FaRegHeart, FaInfoCircle, FaFilm } from "react-icons/fa";
import { useMovies } from "../../context/MoviesContext";
import { useAuth } from "../../context/AuthContext";
import { fetchFavorites, addFavorite, removeFavorite } from "../../hooks/useFavorites";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Pagination, A11y, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import "./style.scss";

function AnimeShowcase() {
  const navigate = useNavigate();
  const { grouped, loading } = useMovies();
  const { user } = useAuth();
  const filmData = (grouped["anime-moi"] || []).slice(0, 15);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [liked, setLiked] = useState({});

  // 1. Lấy danh sách yêu thích khi component load
  useEffect(() => {
    if (filmData.length === 0) return;
    
    // Gọi API lấy ds yêu thích của user
    fetchFavorites().then((favs) => {
      const favPaths = new Set(favs.map((f) => f.movie_path));
      const newLiked = {};
      filmData.forEach((film, idx) => {
        if (favPaths.has(film.path)) {
          newLiked[idx] = true;
        }
      });
      setLiked(newLiked);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filmData.length]);

  // 2. Hàm xử lý toggle yêu thích gọi API
  const handleToggleFavorite = async (idx, item) => {
    const isCurrentlyLiked = liked[idx];
    
    // Optimistic UI update (cập nhật UI ngay lập tức cho mượt)
    setLiked((prev) => ({ ...prev, [idx]: !isCurrentlyLiked }));

    try {
      if (isCurrentlyLiked) {
        // Bỏ yêu thích
        await removeFavorite(item.path);
      } else {
        // Thêm yêu thích
        await addFavorite({
          movie_path: item.path,
          movie_name: item.title,
          image: item.image,
        });
      }
    } catch (error) {
      // Nếu API lỗi, revert lại state
      console.error("Lỗi cập nhật yêu thích:", error);
      setLiked((prev) => ({ ...prev, [idx]: isCurrentlyLiked }));
    }
  };

  if (loading || filmData.length === 0) return null;

  const truncate = (str = "", n = 160) =>
    str.length > n ? str.slice(0, n) + "..." : str;

  return (
    <div className="as-wrapper">
      {/* ── Header ── */}
      <div className="mb-1 d-flex justify-content-between align-items-center">
        <h2 className="film-category ms-3">
          <FaFilm className="film-category__icon" />
          <span>Anime Mới</span>
        </h2>
        <div className="watch-more" onClick={() => navigate("/detail/new-anime")}>
          <span style={{ cursor: "pointer", fontWeight: "bold" }}>Xem Thêm</span>
          <GoChevronRight
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              color: "#fff",
              borderRadius: "50%",
              marginLeft: "7px",
            }}
          />
        </div>
      </div>

      {/* ── Main Swiper ── */}
      <Swiper
        modules={[Thumbs, Pagination, A11y, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        pagination={{ clickable: true, el: ".as-custom-pagination" }}
        className="as-main-swiper"
        speed={400}
        grabCursor={true}
        loop={true}
      >
        {filmData.map((item, idx) => (
          <SwiperSlide key={item.path || idx}>
            <div className="as-slide">
              {/* Blurred bg dùng thumb (ảnh ngang) */}
              <div
                className="as-slide__bg"
                style={{ backgroundImage: `url(${item.thumb || item.image})` }}
              />
              <div className="as-slide__overlay" />

              {/* Info — left */}
              <div className="as-slide__info">
                <h1 className="as-info__title">{item.title}</h1>
                {item.original_name && (
                  <p className="as-info__subtitle">{item.original_name}</p>
                )}

                <div className="as-info__badges">
                  {item.lang && (
                    <span className="as-badge">{item.lang}</span>
                  )}
                  
                  {item.year && (
                    <span className="as-badge">{item.year}</span>
                  )}
                  
                  {item.episode_current && (
                    <span className="as-badge">{item.episode_current}</span>
                  )}
                  
                  <span className="as-badge as-badge--imdb">
                    {item.quality || "FHD"}
                  </span>
                </div>

                <p className="as-info__desc">
                  {truncate(item.content || item.description || "")}
                </p>

                <div className="as-info__actions">
                  <button
                    className="as-btn as-btn--play"
                    onClick={() => navigate(`/chi-tiet/${item.path}`)}
                  >
                    <FaPlay />
                  </button>
                  
                  {user && (
                    <button
                      className={`as-btn as-btn--like ${liked[idx] ? "liked" : ""}`}
                      onClick={() => handleToggleFavorite(idx, item)}
                      title={liked[idx] ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                      {liked[idx] ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  )}

                  <button
                    className="as-btn as-btn--info"
                    onClick={() => navigate(`/chi-tiet/${item.path}`)}
                  >
                    <FaInfoCircle />
                  </button>
                </div>
              </div>

              {/* Poster bên phải dùng thumb (ảnh ngang/wide) */}
              <div className="as-slide__poster">
                <img
                  src={item.thumb || item.image}
                  alt={item.title}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ── Mobile pagination dots ── */}
      <div className="as-custom-pagination" />

      {/* ── Thumbnail Swiper ── */}
      <Swiper
        modules={[Thumbs]} /* Đã bỏ FreeMode vì gây lỗi vòng lặp */
        onSwiper={setThumbsSwiper}
        slidesPerView="auto"
        watchSlidesProgress={true}
        className="as-thumb-swiper"
        grabCursor={true}
        centeredSlides={false}
        slideToClickedSlide={true}
        loop={true}
      >
        {filmData.map((film, idx) => (
          <SwiperSlide key={film.path || idx} className="as-thumb-slide">
            <div className="as-thumb-wrap">
              <img
                src={film.image}
                alt={film.title}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default AnimeShowcase;
