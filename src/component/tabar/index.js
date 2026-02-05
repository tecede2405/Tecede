import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaFilm,
  FaShareAlt,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaGithub,
  FaMusic
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./style.scss";

function Tabbar({ isOpen, onClose }) {
  const [openTab, setOpenTab] = useState("genre");
  const [genres, setGenres] = useState([]);

  const toggleTab = (key) => {
    setOpenTab(openTab === key ? null : key);
  };

  useEffect(() => {
  const BLOCKED_KEYWORDS = [
    "18",
    "18+",
    "adult",
    "sex",
    "sexy",
    "erotic",
    "xxx"
  ];

  const isBlockedGenre = (genre) => {
    const text = `${genre.slug} ${genre.name}`.toLowerCase();
    return BLOCKED_KEYWORDS.some((k) => text.includes(k));
  };

  fetch(`${process.env.REACT_APP_FILM_API_URL}/the-loai`)
    .then((res) => res.json())
    .then((data) => {
      const safeGenres = data.filter(
        (genre) => !isBlockedGenre(genre)
      );
      setGenres(safeGenres);
    })
    .catch(console.error);
}, []);



  const handleLinkClick = () => {
    onClose?.(); // Đóng drawer khi click link
  };

  return (
    <>

      {/* TABBAR DRAWER */}
      <div className={`tabbar ${isOpen ? "show" : ""}`}>
        {/* SOCIAL */}
        <div className={`tab-parent ${openTab === "social" ? "open" : ""}`}>
          <button onClick={() => toggleTab("social")}>
            <span className="title">
              <FaShareAlt />
              <span className="tab-label">Mạng xã hội</span>
            </span>
            <FaChevronDown className="arrow" />
          </button>

          <ul className="tab-child">
            <li>
              <a
                href="https://www.facebook.com/thoaidz.vx"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaFacebook /> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/p.qthoai_/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaInstagram /> Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@tecede24.5"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaTiktok /> TikTok
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com/@Tecede2405"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaYoutube /> YouTube
              </a>
            </li>
            <li>
              <a
                href="https://github.com/tecede2405"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaGithub /> GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@tecede_vn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
              >
                <FaTiktok /> TikTok 2
              </a>
            </li>
          </ul>
        </div>

        {/* MUSIC */}
        <div className={`tab-parent ${openTab === "music" ? "open" : ""}`}>
          <button onClick={() => toggleTab("music")}>
            <span className="title">
              <FaMusic />
              <span className="tab-label">Thể loại nhạc</span>
            </span>
            <FaChevronDown className="arrow" />
          </button>

          <ul className="tab-child">
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Trẻ
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Âu Mỹ
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Trung Quốc
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Remix
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc EDM
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Phonk
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Không Lời
              </NavLink>
            </li>
            <li>
              <NavLink to="/404" className="tab-link" onClick={handleLinkClick}>
                Nhạc Douyin
              </NavLink>
            </li>
          </ul>
        </div>

        {/* FILM */}
        <div className={`tab-parent ${openTab === "genre" ? "open" : ""}`}>
          <button onClick={() => toggleTab("genre")}>
            <span className="title">
              <FaFilm />
              <span className="tab-label">Thể loại phim</span>
            </span>
            <FaChevronDown className="arrow" />
          </button>

          <ul className="tab-child">
            {genres.map((genre) => (
              <li key={genre.slug}>
                <NavLink
                  to={`/the-loai/${genre.slug}`}
                  className="tab-link"
                  onClick={handleLinkClick}
                >
                  {genre.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Tabbar;