import { useEffect, useState } from "react";
import { FaFilm, FaMusic, FaGlobeAsia, FaBook, FaFacebook, FaFilter, FaAndroid, FaHandHoldingHeart } from "react-icons/fa";
import { SiGooglegemini } from "react-icons/si";
import { GoChevronDown, GoChevronRight } from "react-icons/go"; 
import { NavLink, useNavigate } from "react-router-dom";
import { MdOutlineAccountCircle, MdLogout } from "react-icons/md";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { VerifiedBadge } from "../VerifiedBadge/index";
import "./style.scss";

function Tabbar({ isOpen, onClose }) {
  const [openTab, setOpenTab] = useState(null); 
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);

  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e50914",
      cancelButtonColor: "#444",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      background: "#1f1f1f",
      color: "#fff",
      customClass: {
        popup: "swal-dark",
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-confirm",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
        onClose?.();
        Swal.fire({
          title: "Đã đăng xuất!",
          text: "Hẹn gặp lại bạn.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "#1f1f1f",
          color: "#fff",
        });
      }
    });
  };

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

  const getAvatarLetter = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  return (
    <>
      <div className={`tabbar ${isOpen ? "show" : ""}`}>
        
        <div className="tabbar-scroll-area">

        {/* MUSIC */}
        <div className={`tab-parent ${openTab === "music" ? "open" : ""}`}>
          <button onClick={() => toggleTab("music")} className={openTab === "music" ? "active-btn" : ""}>
            <span className="title">
              <FaMusic style={{ fontSize: "16px" }} />
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
              <FaBook style={{ fontSize: "16px" }} />
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
              <FaFacebook style={{ fontSize: "16px" }} />
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

        {/* DONATE */}
        <div className="tab-parent">
          <NavLink to="/ung-ho" className="tab-link-direct" onClick={handleLinkClick}>
            <span className="title">
              <FaHandHoldingHeart style={{ fontSize: "16px" }} />
              <span className="tab-label">Donate</span>
            </span>
          </NavLink>
        </div>

        {/* TẢI APP ANDROID */}
        <div className="tab-parent">
          <NavLink to="/tai-app" className="tab-link-direct" onClick={handleLinkClick}>
            <span className="title">
              <FaAndroid style={{ fontSize: "16px" }} />
              <span className="tab-label">Tải app Android</span>
            </span>
          </NavLink>
        </div>
        
        {/* SELL GEMINI PRO */}
        <div className="tab-parent">
          <NavLink to="/ban-gemini-pro" className="tab-link-direct" onClick={handleLinkClick}>
            <span className="title">
              <SiGooglegemini style={{ fontSize: "16px" }} />
              <span className="tab-label">Gemini Pro giá rẻ</span>
            </span>
          </NavLink>
        </div>

        

        <div className={`tab-parent ${openTab === "country" ? "open" : ""}`}>
          <button onClick={() => toggleTab("country")} className={openTab === "country" ? "active-btn" : ""}>
            <span className="title">
              <FaGlobeAsia style={{ fontSize: "16px" }} />
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
              <FaFilter style={{ fontSize: "16px" }} />
              <span className="tab-label">Lọc phim</span>
            </span>
          </NavLink>
        </div>

        {/* FILM */}
        <div className={`tab-parent ${openTab === "genre" ? "open" : ""}`}>
          <button onClick={() => toggleTab("genre")} className={openTab === "genre" ? "active-btn" : ""}>
            <span className="title">
              <FaFilm style={{ fontSize: "16px" }} />
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

        {/* Cụm User dưới đáy Tabbar */}
        <div className="tabbar-user-section">
          <div className="tabbar-divider"></div>
          {user ? (
            <div className="tabbar-user-profile">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, overflow: "hidden" }}>
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="tabbar-user-avatar" />
                ) : (
                  <div className="tabbar-user-fallback">
                    {getAvatarLetter(user.display_name)}
                  </div>
                )}
                <div className="tabbar-user-info">
                  <div className="tabbar-user-name">
                    {user.display_name}
                    {user.role === "admin" && <VerifiedBadge />}
                  </div>
                  <div className="tabbar-user-role">
                    {user.role === "admin" ? "Admin" : "Thành viên"}
                  </div>
                </div>
              </div>
              <button className="tabbar-logout-btn" onClick={handleLogout} title="Đăng xuất">
                <MdLogout size={20} />
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="tabbar-login-btn" onClick={handleLinkClick}>
              <MdOutlineAccountCircle />
              <span>Đăng nhập</span>
            </NavLink>
          )}
        </div>
        
      </div>
    </>
  );
}

export default Tabbar;