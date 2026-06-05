import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";

import "./style.scss";

export default function CoverflowHero() {
  const movies = [
    {
      name: "Biệt Đội Siêu Khờ",
      origin_name: "The Wonderfools",
      poster:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c",
      thumb:
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c",
      desc:
        "Một nhóm người bình thường bất ngờ sở hữu năng lực đặc biệt và phải hợp tác để bảo vệ thành phố.",
      current_episode: "Tập 12",
      lang: "Vietsub",
    },
    {
      name: "Khế Ước Hoàng Gia",
      origin_name: "Royal Contract",
      poster:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      thumb:
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      desc:
        "Một câu chuyện tình yêu xen lẫn âm mưu trong hoàng gia hiện đại.",
      current_episode: "Tập 20",
      lang: "Vietsub",
    },
    {
      name: "Mật Ngữ Kỳ",
      origin_name: "The Epoch Of Miyu",
      poster:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
      thumb:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1",
      desc:
        "Cuộc hôn nhân tưởng chừng hoàn hảo bỗng đứng bên bờ vực tan vỡ.",
      current_episode: "Tập 38",
      lang: "Vietsub",
    },
    {
      name: "Avatar 3",
      origin_name: "Avatar Fire and Ash",
      poster:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
      thumb:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1",
      desc:
        "Hành trình mới trên Pandora với những bộ tộc chưa từng xuất hiện.",
      current_episode: "Full HD",
      lang: "Thuyết minh",
    },
    {
      name: "Thám Tử Conan",
      origin_name: "Detective Conan",
      poster:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
      thumb:
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26",
      desc:
        "Những vụ án bí ẩn tiếp tục được Conan phá giải bằng trí tuệ sắc bén.",
      current_episode: "Tập 1160",
      lang: "Vietsub",
    },
    {
      name: "Dragon Ball Super",
      origin_name: "Dragon Ball Super",
      poster:
        "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6",
      thumb:
        "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6",
      desc:
        "Goku và những chiến binh mạnh nhất tiếp tục bảo vệ vũ trụ.",
      current_episode: "Tập 131",
      lang: "Vietsub",
    },
    {
      name: "Doraemon",
      origin_name: "Doraemon Movie",
      poster:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728",
      thumb:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728",
      desc:
        "Chú mèo máy đến từ tương lai cùng những chuyến phiêu lưu đầy cảm xúc.",
      current_episode: "Movie",
      lang: "Lồng tiếng",
    },
  ];

  const [activeMovie, setActiveMovie] = useState(movies[3]);

  return (
    <section className="coverflow-hero">
      <div
        className="coverflow-hero__bg"
        style={{
          backgroundImage: `url(${activeMovie.thumb})`,
        }}
      />

      <div className="coverflow-hero__overlay" />

      <div className="coverflow-hero__content">
        <Swiper
          effect="coverflow"
          modules={[EffectCoverflow]}
          centeredSlides
          grabCursor
          initialSlide={3}
          slidesPerView={1.8}
          onSlideChange={(swiper) =>
            setActiveMovie(movies[swiper.realIndex])
          }
          coverflowEffect={{
            rotate: 22,
            stretch: 0,
            depth: 180,
            modifier: 1,
            scale: 0.85,
            slideShadows: false,
          }}
          breakpoints={{
            768: {
              slidesPerView: 3,
            },
          }}
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={index}>
              <img
                src={movie.poster}
                alt={movie.name}
                className="coverflow-hero__poster"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="coverflow-hero__info">
          <h2>{activeMovie.name}</h2>

          <h4>{activeMovie.origin_name}</h4>

          <div className="coverflow-hero__meta">
            <span>{activeMovie.current_episode}</span>
            <span>{activeMovie.lang}</span>
          </div>

          <p>{activeMovie.desc}</p>

          <div className="coverflow-hero__actions">
            <button className="play-btn">
              ▶ Xem phim
            </button>

            <button className="info-btn">
              ℹ Thông tin
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}