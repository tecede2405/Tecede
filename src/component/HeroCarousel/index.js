import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import PosterSwiper from "./PosterSwiper";
import { useMovies } from "../../context/MoviesContext";
import { useMemo } from "react";
import "swiper/css";
import "./style.scss";

export default function NewAnimeHero() {
  const navigate = useNavigate();

  
  const { grouped, loading } = useMovies();

  const movies = useMemo(() => {
    return grouped?.["phim-hot-2"] || [];
  }, [grouped]);

  const [active, setActive] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);

  // resize listener
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // set active khi có data
  useEffect(() => {
    if (movies.length > 0 && !active) {
      setActive(movies[0]);
    }
  }, [movies, active]);

  const isMobile = width < 525;
  const isTablet = width >= 525 && width < 1024;

  // loading từ context luôn
  if (loading || !active) return <p>Đang tải...</p>;

  return (
    <>
      <div
        style={{
          height: isMobile ? "400px" : isTablet ? "500px" : "660px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* BACKGROUND */}
        <div className="hero-bg">
          <img
            key={active.thumb}
            src={active.thumb}
            alt={active.title}
            loading="eager"
            className="hero-bg__img"
          />
        </div>

        {/* OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              to bottom,
              rgba(18,18,18,0) 50%,
              rgba(18,18,18,0.85) 80%,
              rgba(18,18,18,1) 100%
            )`,
            pointerEvents: "none",
          }}
        />

        {/* CONTENT */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "60%" : isTablet ? "45%" : "50%",
            left: isMobile ? "16px" : isTablet ? "16px" : "60px",
            transform: "translateY(-50%)",
            color: "#fff",
            maxWidth: isMobile ? "90%" : "520px",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "30px" : isTablet ? "30px" : "50px",
              marginBottom: "10px",
              fontWeight: 900,
              lineHeight: 1.2,
              WebkitTextStroke: "0.5px #000",
            }}
          >
            {active.title}
          </h1>

          <p
            style={{
              fontSize: isMobile ? "13px" : "14px",
              lineHeight: 1.6,
              opacity: 0.9,
              marginBottom: "16px",
              maxHeight: isMobile ? "3.2em" : "4.8em",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: isMobile ? 2 : 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {active.content}
          </p>

          <div className="d-flex align-items-center gap-4 mb-2">
            <div>
              <p style={{ fontSize: "14px", marginBottom: "6px" }}>
                Tập: <strong>{active.episode_current}</strong>
              </p>
              <span style={{ fontSize: "12px" }}>{active.lang}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chi-tiet/${active.path}`);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: isMobile ? "10px 15px" : "7px 18px",
                borderRadius: "999px",
                border: "none",
                background: "linear-gradient(135deg, #1db954, #1ed760)",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isMobile ? "34px" : "40px",
                  height: isMobile ? "34px" : "40px",
                  borderRadius: "50%",
                  background: "#000",
                }}
              >
                <FaPlay style={{ color: "#1db954" }} />
              </span>
              <span>Xem ngay</span>
            </button>
          </div>
        </div>

        {/* SWIPER DESKTOP */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: "45px",
              right: "40px",
              width: isTablet ? "340px" : "460px",
              padding: "10px",
              zIndex: 3,
            }}
          >
            <PosterSwiper
              data={movies}
              active={active}
              setActive={setActive}
              isTablet={isTablet}
            />
          </div>
        )}
      </div>

      {/* MOBILE SWIPER */}
      {isMobile && (
        <div
          style={{
            marginTop: "-18px",
            padding: "12px",
            background: "#121212",
          }}
        >
          <PosterSwiper
            data={movies}
            active={active}
            setActive={setActive}
            isMobile
          />
        </div>
      )}
    </>
  );
}