import { useEffect, useState } from "react";
import { FaFilm, FaMusic, FaGlobeAsia, FaBook } from "react-icons/fa";
import { GoChevronDown, GoChevronRight } from "react-icons/go"; 
import { NavLink } from "react-router-dom";
import "./style.scss";

function Tabbar({ isOpen, onClose }) {
  const [openTab, setOpenTab] = useState("genre"); 
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);

  const toggleTab = (key) => {
    setOpenTab(openTab === key ? null : key);
  };

  useEffect(() => {
    const BLOCKED_KEYWORDS = ["18", "18+", "adult", "sex", "sexy", "erotic", "xxx"];
    const isBlockedGenre = (genre) => {
      const text = `${genre.slug} ${genre.name}`.toLowerCase();
      return BLOCKED_KEYWORDS.some((k) => text.includes(k));
    };

    fetch(`${process.env.REACT_APP_FILM_API_URL}/the-loai`)
      .then((res) => res.json())
      .then((data) => {
        const safeGenres = data.filter((genre) => !isBlockedGenre(genre));
        setGenres(safeGenres);
      })
      .catch(console.error);

    fetch(`${process.env.REACT_APP_FILM_API_URL}/quoc-gia`)
      .then((res) => res.json())
      .then((data) => {
        const filteredCountries = data.filter((country) => country.slug !== "ha-lan");
        setCountries(filteredCountries);
      })
      .catch(console.error);
  }, []);

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      <div className={`tabbar ${isOpen ? "show" : ""}`}>

        {/* MUSIC */}
        <div className={`tab-parent ${openTab === "music" ? "open" : ""}`}>
          <button onClick={() => toggleTab("music")} className={openTab === "music" ? "active-btn" : ""}>
            <span className="title">
              <FaMusic />
              <span className="tab-label">Thể loại nhạc</span>
            </span>
            {openTab === "music" ? <GoChevronRight className="arrow" /> : <GoChevronDown className="arrow" />}
          </button>

          <ul className="tab-child">
            <li><NavLink to="/music/nhac-tre" className="tab-link" onClick={handleLinkClick}>Nhạc Trẻ</NavLink></li>
            <li><NavLink to="/music/usuk" className="tab-link" onClick={handleLinkClick}>Nhạc Âu Mỹ</NavLink></li>
            <li><NavLink to="/music/trung-quoc" className="tab-link" onClick={handleLinkClick}>Nhạc Trung Quốc</NavLink></li>
            <li><NavLink to="/music/nhactre-remix" className="tab-link" onClick={handleLinkClick}>Nhạc Remix</NavLink></li>
            <li><NavLink to="/music/edm" className="tab-link" onClick={handleLinkClick}>Nhạc EDM</NavLink></li>
            <li><NavLink to="/music/phonk" className="tab-link" onClick={handleLinkClick}>Nhạc Phonk</NavLink></li>
            <li><NavLink to="/music/mood" className="tab-link" onClick={handleLinkClick}>Nhạc Không Lời</NavLink></li>
            <li><NavLink to="/music/nhac-douyin" className="tab-link" onClick={handleLinkClick}>Nhạc Douyin</NavLink></li>
            <li><NavLink to="/music/nhac-lofi" className="tab-link" onClick={handleLinkClick}>Nhạc Lofi</NavLink></li>
          </ul>
        </div>
        
        {/* COMIC */}
        <div className={`tab-parent ${openTab === "comic" ? "open" : ""}`}>
          <button onClick={() => toggleTab("comic")} className={openTab === "comic" ? "active-btn" : ""}>
            <span className="title">
              <FaBook />
              <span className="tab-label">Đọc truyện</span>
            </span>
            {openTab === "comic" ? <GoChevronRight className="arrow" /> : <GoChevronDown className="arrow" />}
          </button>

          <ul className="tab-child">
            <li><NavLink to="/truyen" className="tab-link" onClick={handleLinkClick}>Đọc truyện</NavLink></li>
          </ul>
        </div>

        {/* COUNTRY */}
        <div className={`tab-parent ${openTab === "country" ? "open" : ""}`}>
          <button onClick={() => toggleTab("country")} className={openTab === "country" ? "active-btn" : ""}>
            <span className="title">
              <FaGlobeAsia />
              <span className="tab-label">Quốc gia</span>
            </span>
            {openTab === "country" ? <GoChevronRight className="arrow" /> : <GoChevronDown className="arrow" />}
          </button>

          <ul className="tab-child">
            {countries.map((country) => (
              <li key={country.slug}>
                <NavLink to={`/quoc-gia/${country.slug}`} className="tab-link" onClick={handleLinkClick}>
                  {country.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* FILM */}
        <div className={`tab-parent ${openTab === "genre" ? "open" : ""}`}>
          <button onClick={() => toggleTab("genre")} className={openTab === "genre" ? "active-btn" : ""}>
            <span className="title">
              <FaFilm />
              <span className="tab-label">Thể loại phim</span>
            </span>
            {openTab === "genre" ? <GoChevronRight className="arrow" /> : <GoChevronDown className="arrow" />}
          </button>

          <ul className="tab-child">
            {genres.map((genre) => (
              <li key={genre.slug}>
                <NavLink to={`/the-loai/${genre.slug}`} className="tab-link" onClick={handleLinkClick}>
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