import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PosterSwiper from "./PosterSwiper";
import { HotFilm } from "../../data/dataFilm";
import FilmSearch from "../HomeFilm/FilmSearch";
import { FaPlay } from "react-icons/fa";
import "swiper/css";
import "./style.scss";

export default function NewAnimeHero() {
  const navigate = useNavigate();
  const [active, setActive] = useState(HotFilm[0]);
  const [width, setWidth] = useState(window.innerWidth);



  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);



  const isMobile = width < 525;
  const isTablet = width >= 525 && width < 1024;

  return (
    <>
      {/* ================= HERO ================= */}
      <div
        style={{
          height: isMobile ? "380px" : isTablet ? "480px" : "600px",
          position: "relative",
          overflow: "hidden",
        }}
        >
  {/* BACKGROUND */}
 <div
  key={active.thumb} // đổi ảnh → remount → animation chạy
  className="hero-bg"
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,.85), rgba(0,0,0,.35)),
      url(${active.thumb})
    `,
  }}
/>

  {/* ===== GIỮ NGUYÊN TOÀN BỘ JSX CŨ CỦA BẠN DƯỚI ĐÂY ===== */}


        {/* ===== BOTTOM OVERLAY ===== */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              linear-gradient(
                to bottom,
                rgba(18,18,18,0) 50%,
                rgba(18,18,18,.85) 80%,
                rgba(18,18,18,1) 100%
              )
            `,
            pointerEvents: "none",
          }}
        />

        {/* ===== SEARCH ===== */}
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: isMobile ? "0px" : isTablet ? "16px" : "60px",
            width: isMobile ? "100%" : "600px",
          }}
        >
          <FilmSearch fullWidth />
        </div>

        {/* ===== CONTENT ===== */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? "60%" : isTablet ? "45%" : "50%",
            left: isMobile ? "16px" : isTablet ? "16px" : "60px",
            transform: "translateY(-50%)",
            color: "#fff",
            maxWidth: isMobile ? "90%" : "520px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "25px" : isTablet ? "30px" : "50px",
              marginBottom: "20px",
              fontWeight: 900,
              lineHeight: 1.2,
              WebkitTextStroke: "0.5px #000",
              textShadow: `
                -1px -1px 0 #000,
                1px -1px 0 #000,
                -1px  1px 0 #000,
                1px  1px 0 #000
              `,
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
              maxHeight: isMobile ? "3.2em" : "4.8em", // 🔥 clamp 2–3 dòng
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: isMobile ? 2 : 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {active.content}
          </p>
          <div className="d-flex align-items-center gap-4 mb-2">
            {/* ===== INFO ===== */}
            <div>
              <p
                style={{
                  opacity: 0.9,
                  fontSize: "14px",
                  marginBottom: "6px",
                }}
              >
                Tập: <strong>{active.episode_current}</strong>
              </p>

              <span
                style={{
                  display: "inline-block",
                  padding: "4px 0",
                  fontSize: "12px",
                  fontWeight: 500,
                  backdropFilter: "blur(6px)",
                }}
              >
                {active.lang}
              </span>
            </div>

            {/* ===== PLAY BUTTON ===== */}
            <button
              onClick={() => navigate(`/film/${active.path}`)}
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
                boxShadow: "0 8px 24px rgba(29,185,84,.45)",
                transition: "all .25s ease",
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
                <FaPlay
                  style={{
                    color: "#1db954",
                    fontSize: isMobile ? "12px" : "14px",
                    marginLeft: "2px",
                  }}
                />
              </span>

              <span style={{ fontSize: isMobile ? "13px" : "14px" }}>
                Xem ngay
              </span>
            </button>
          </div>

          
        </div>

        {/* ===== SWIPER DESKTOP / TABLET ===== */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              bottom: "45px",
              right: "40px",
              width: isTablet ? "340px" : "460px",
              padding: "10px",
            }}
          >
            <PosterSwiper
              data={HotFilm}
              active={active}
              setActive={setActive}
              isTablet={isTablet}
            />
          </div>
        )}
      </div>

      {/* ===== SWIPER MOBILE ===== */}
      {isMobile && (
          <div
            style={{
              position: "relative",
              marginTop: "-18px", // 🔥 kéo lên
              padding: "12px 12px 16px",
              background: "#121212",
              zIndex: 5,
            }}
          >
            <PosterSwiper
              data={HotFilm}
              active={active}
              setActive={setActive}
              isMobile
            />
          </div>
        )}
    </>
  );
}
