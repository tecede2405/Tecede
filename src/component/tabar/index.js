import { useEffect, useState } from "react";
import { FaFilm, FaMusic, FaGlobeAsia, FaBook, FaFacebook, FaFilter} from "react-icons/fa"; // Thêm icon Facebook cho Fanpage
import { SiGooglegemini } from "react-icons/si";
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
    if (!genre) return false;
    const text = `${genre.slug || ""} ${genre.name || ""}`.toLowerCase();
    return BLOCKED_KEYWORDS.some((k) => text.includes(k));
  };

  // 1. Fetch Thể loại phim
  fetch(`${process.env.REACT_APP_FILM_API_URL}/the-loai`)
    .then((res) => res.json())
    .then((resData) => {
      // API của phimapi.com trả về mảng thể loại nằm trong: resData.data.items hoặc resData.items
      const rawGenres = resData?.data?.items || resData?.items || [];
      
      if (Array.isArray(rawGenres)) {
        const safeGenres = rawGenres.filter((genre) => !isBlockedGenre(genre));
        setGenres(safeGenres);
      } else {
        console.error("Dữ liệu thể loại không phải là mảng:", rawGenres);
      }
    })
    .catch((err) => console.error("Lỗi fetch thể loại:", err));

  // 2. Fetch Quốc gia
  fetch(`${process.env.REACT_APP_FILM_API_URL}/quoc-gia`)
    .then((res) => res.json())
    .then((resData) => {
      // Tương tự thể loại, bóc tách chính xác từ data.items hoặc items trực tiếp
      const rawCountries = resData?.data?.items || resData?.items || [];

      if (Array.isArray(rawCountries)) {
        const filteredCountries = rawCountries.filter(
          (country) => country && country.slug !== "ha-lan"
        );
        setCountries(filteredCountries);
      } else {
        console.error("Dữ liệu quốc gia không phải là mảng:", rawCountries);
      }
    })
    .catch((err) => console.error("Lỗi fetch quốc gia:", err));
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

        {/* FANPAGE */}
        <div className={`tab-parent ${openTab === "fanpage" ? "open" : ""}`}>
          <button onClick={() => toggleTab("fanpage")} className={openTab === "fanpage" ? "active-btn" : ""}>
            <span className="title">
              <FaFacebook />
              <span className="tab-label">Follow Fanpage</span>
            </span>
            {openTab === "fanpage" ? <GoChevronRight className="arrow" /> : <GoChevronDown className="arrow" />}
          </button>

          <ul className="tab-child">
            <li>
              {/* Nếu link Fanpage dẫn ra ngoài trang web (ví dụ facebook.com), nên dùng thẻ <a> thông thường */}
              <a href="https://www.facebook.com/profile.php?id=100084710083595" target="_blank" rel="noopener noreferrer" className="tab-link" onClick={handleLinkClick}>
                Fanpage
              </a>
            </li>
          </ul>
        </div>

        {/* SELL GEMINI PRO */}
        <div className="tab-parent">
          <NavLink to="/ban-gemini-pro" className="tab-link-direct" onClick={handleLinkClick}>
            <span className="title">
              <SiGooglegemini style={{ color: "#a855f7", fontSize: "16px" }} />
              <span className="tab-label">Sell Gemini Pro</span>
            </span>
          </NavLink>
        </div>

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

        {/* LỌC PHIM */}
        <div className="tab-parent">
          <NavLink to="/loc-phim" className="tab-link-direct" onClick={handleLinkClick}>
            <span className="title">
              <FaFilter />
              <span className="tab-label">Lọc phim</span>
            </span>
          </NavLink>
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