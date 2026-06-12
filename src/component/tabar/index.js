import { useEffect, useState } from "react";
import {
  FaChevronDown,
  FaFilm,
  FaMusic,
  FaGlobeAsia,
  FaBook
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./style.scss";
// 1. Import hook useAuth và Swal để phục vụ chặn quyền truy cập
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

function Tabbar({ isOpen, onClose }) {
  const [openTab, setOpenTab] = useState("genre");
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  
  // 2. Lấy thông tin user từ AuthContext
  const { user } = useAuth();

  // 3. Cấu hình SweetAlert dạng tối (Dark Mode) giống như bên Layout của bạn
  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#e50914",
    cancelButtonColor: "#444",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown"
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp"
    }
  });

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

    // FETCH THỂ LOẠI
    fetch(`${process.env.REACT_APP_FILM_API_URL}/the-loai`)
      .then((res) => res.json())
      .then((data) => {
        const safeGenres = data.filter(
          (genre) => !isBlockedGenre(genre)
        );
        setGenres(safeGenres);
      })
      .catch(console.error);

    // FETCH QUỐC GIA
    fetch(`${process.env.REACT_APP_FILM_API_URL}/quoc-gia`)
      .then((res) => res.json())
      .then((data) => {
        const filteredCountries = data.filter(
          (country) => country.slug !== "ha-lan"
        );
        setCountries(filteredCountries);
      })
      .catch(console.error);

  }, []);

  const handleLinkClick = () => {
    onClose?.(); // Đóng drawer khi click link thành công
  };

  // 4. Hàm kiểm tra quyền admin cho các link nhạc
  const handleMusicLinkClick = (e) => {
    if (!user || user.role !== "admin") {
      // Chặn không cho NavLink chuyển trang
      e.preventDefault(); 
      
      // Hiển thị thông báo lỏ lỏ màu tối uy tín
      DarkSwal.fire({
        icon: "error",
        title: "Oh no!",
        text: "Chỉ có Admin truy cập được trang này.",
        confirmButtonText: "OK sếp !",
        timer: 5000,
        showConfirmButton: true
      });
    } else {
      // Nếu là Admin thì cho phép đóng drawer và chuyển trang bình thường
      handleLinkClick();
    }
  };

  return (
    <>
      {/* TABBAR DRAWER */}
      <div className={`tabbar ${isOpen ? "show" : ""}`}>

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
            {/* Tất cả các link nhạc ở đây đều được bọc bởi hàm kiểm tra quyền handleMusicLinkClick */}
            <li>
              <NavLink to="/music/nhac-tre" className="tab-link" onClick={handleMusicLinkClick}> 
                Nhạc Trẻ
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/usuk" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Âu Mỹ
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/trung-quoc" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Trung Quốc
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/nhactre-remix" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Remix
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/edm" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc EDM
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/phonk" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Phonk
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/mood" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Không Lời
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/nhac-douyin" className="tab-link" onClick={handleMusicLinkClick}>
                Nhạc Douyin
              </NavLink>
            </li>
            <li>
              <NavLink to="/music/nhac-lofi" className="tab-link">
                Nhạc Lofi
              </NavLink>
            </li>
          </ul>
        </div>
        
        {/* COMIC */}
        <div className={`tab-parent ${openTab === "comic" ? "open" : ""}`}>
          <button onClick={() => toggleTab("comic")}>
            <span className="title">
              <FaBook />
              <span className="tab-label">Đọc truyện</span>
            </span>
            <FaChevronDown className="arrow" />
          </button>

          <ul className="tab-child">
            <li>
              <NavLink to="/truyen" className="tab-link" onClick={handleLinkClick}>
                Đọc truyện
              </NavLink>
            </li>
          </ul>
        </div>

        {/* COUNTRY */}
        <div className={`tab-parent ${openTab === "country" ? "open" : ""}`}>
          <button onClick={() => toggleTab("country")}>
            <span className="title">
              <FaGlobeAsia />
              <span className="tab-label">Quốc gia</span>
            </span>
            <FaChevronDown className="arrow" />
          </button>

          <ul className="tab-child">
            {countries.map((country) => (
              <li key={country.slug}>
                <NavLink
                  to={`/quoc-gia/${country.slug}`}
                  className="tab-link"
                  onClick={handleLinkClick}
                >
                  {country.name}
                </NavLink>
              </li>
            ))}
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