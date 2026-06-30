import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./layout.scss";
import Tabbar from "../../component/tabar/index";
import { useState, useEffect, useRef } from "react";
import {
  FaPhoneVolume,
  FaEnvelope,
  FaHashtag,
  FaBars,
  FaTimes,
  FaHome,
  FaHeart,
  FaHeadphones,
  FaChevronDown,
  FaMusic,
  FaBookOpen
} from "react-icons/fa";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaClockRotateLeft } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { VerifiedBadge } from "../../component/VerifiedBadge/index";

function Layout() {
  const [showTabbar, setShowTabbar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);
  
  const userMenuRef = useRef(null);
  const musicMenuRef = useRef(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#e50914",
    cancelButtonColor: "#444",
    customClass: {
      popup: "swal-dark", title: "swal-title",
      htmlContainer: "swal-text", confirmButton: "swal-confirm",
    },
    showClass: { popup: "animate__animated animate__fadeInDown" },
    hideClass: { popup: "animate__animated animate__fadeOutUp" }
  });

  useEffect(() => {
    setShowUserMenu(false);
    setShowMusicMenu(false);
    setShowTabbar(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowTabbar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (musicMenuRef.current && !musicMenuRef.current.contains(event.target)) {
        setShowMusicMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getAvatarLetter = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  const musicGenres = [
    { name: "Nhạc trẻ", path: "nhac-tre" },
    { name: "Nhạc Âu Mỹ", path: "usuk" },
    { name: "Nhạc Trung", path: "trung-quoc" },
    { name: "Nhạc Remix", path: "nhactre-remix" },
    { name: "Nhạc EDM", path: "edm" },
    { name: "Nhạc Phonk", path: "phonk" },
    { name: "Nhạc Không lời", path: "mood" },
    { name: "Nhạc Douyin", path: "nhac-douyin" },
    { name: "Nhạc Lofi", path: "nhac-lofi" }
  ];

  return (
    <>
      <header className="header">
        <div className="header__left">
          <button className="hamburger-btn" onClick={() => setShowTabbar(!showTabbar)}>
            {showTabbar ? <FaTimes /> : <FaBars />}
          </button>
          <img
            src="https://i.ibb.co/C3PLG9T9/2c06afde0ebca0c687b0d3add5f4b1f2.webp"
            alt="logo-Page"
            className="header__image"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="header__right">
          
          {/* Cụm này sẽ ẨN trên Mobile (Home, Truyện, Nhạc) */}
          <div className="nav-icons">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-icon active" : "nav-icon"}>
              <FaHome />
            </NavLink>
             
            <NavLink to="/truyen" className={({ isActive }) => isActive ? "nav-icon active" : "nav-icon"}>
              <FaBookOpen />
            </NavLink>
           
            <div className="nav-icon music-wrapper" style={{ position: "relative" }} ref={musicMenuRef}>
              <FaHeadphones onClick={() => setShowMusicMenu(!showMusicMenu)} />
              
              {showMusicMenu && (
                <div className="music-menu-modal">
                  <div className="music-menu-scroll">
                    {musicGenres.map((genre, idx) => (
                      <button
                        key={idx}
                        className="menu-action-btn"
                        onClick={() => {
                          setShowMusicMenu(false);
                          navigate(`/music/${genre.path}`);
                        }}
                      >
                        <FaMusic className="icon-purple" style={{ fontSize: "14px" }} />
                        <span>{genre.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cụm này LUÔN HIỆN kể cả trên Mobile (Heart, History) */}
          <div className="action-icons">
            <NavLink to="/ung-ho" className={({ isActive }) => isActive ? "act-icon active" : "act-icon"} title="Ủng hộ">
              <FaHeart />
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? "act-icon active" : "act-icon"} title="Lịch sử xem">
              <FaClockRotateLeft />
            </NavLink>
          </div>

          <div className="user-wrapper" ref={userMenuRef}>
            {user ? (
              <>
                <div className="user-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="user-trigger-avatar" />
                  ) : (
                    <div className="user-trigger-fallback">{getAvatarLetter(user.display_name)}</div>
                  )}
                  <FaChevronDown className={`chevron-icon ${showUserMenu ? 'open' : ''}`} />
                </div>

                {showUserMenu && (
                  <div className="user-menu-modal">
                    <div className="user-profile">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="user-avatar" />
                      ) : (
                        <div className="avatar-fallback">{getAvatarLetter(user.display_name)}</div>
                      )}
                      <div className="user-profile-info">
                        <div className="user-name">
                          {user.display_name}
                          {user.role === "admin" && <VerifiedBadge />}
                        </div>
                        {user.role === "admin" ? <span className="user-role">Admin</span> : <span className="user-role">Thành viên</span>}
                        
                      </div>
                    </div>
                    <div className="user-menu-divider"></div>
                    <div className="user-menu-actions">
                      {user.role === "admin" && (
                        <button className="menu-action-btn" onClick={() => navigate("/admin")}>
                          <FaBars className="icon-purple" /> <span>Trang quản trị</span>
                        </button>
                      )}
                      <button className="menu-action-btn" onClick={() => navigate("/history")}>
                        <FaClockRotateLeft className="icon-purple" /> <span>Lịch sử xem</span>
                      </button>
                      <button className="menu-action-btn" onClick={() => navigate("/profile")}>
                        <MdOutlineAccountCircle className="icon-purple" /> <span>Đổi tên / avatar</span>
                      </button>
                      <button
                        className="logout-btn"
                        onClick={() => {
                          logout(); setShowUserMenu(false);
                          DarkSwal.fire({ icon: "success", title: "Đăng xuất thành công", timer: 1500, showConfirmButton: false }).then(() => navigate("/"));
                        }}
                      >Đăng xuất</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <NavLink to="/login" className="login-btn">
                <MdOutlineAccountCircle style={{ fontSize: "1.25rem", marginRight: "4px" }} /> Đăng nhập
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {showTabbar && (
        <>
          <div className="tabbar-overlay" onClick={() => setShowTabbar(false)} />
          <Tabbar isOpen={showTabbar} onClose={() => setShowTabbar(false)} />
        </>
      )}

      <div className="layout-main">
        <Outlet />
      </div>

      <footer className="footer-custom">
        <div className="row text-start gy-4 p-3" style={{ maxWidth: "100vw", margin: 0 }}>
          <div className="col-12 col-md-4 col-sm-5 footer-brand-section">
            <img src="https://i.ibb.co/C3PLG9T9/2c06afde0ebca0c687b0d3add5f4b1f2.webp" alt="logo-footer" className="footer-logo mb-3" />
            <p className="footer-desc">Tecede - Website xem phim miễn phí lỏ nhất Việt Nam.</p>
          </div>
          <div className="col-12 col-md-4 col-sm-5">
            <h6 className="footer-subtitle">Liên hệ hỗ trợ</h6>
            <ul className="footer-list">
              <li><FaPhoneVolume className="me-2 text-purple" /> +84 3x4 5x7 xxx</li>
              <li><FaEnvelope className="me-2 text-purple" /> erenjeager6753@gmail.com</li>
              <li><FaHashtag className="me-2 text-purple" /> #tecede #tecedeblog</li>
            </ul>
          </div>
          <div className="col-12 col-md-4 col-sm-5">
            <h6 className="footer-subtitle">Liên kết</h6>
            <ul className="footer-list">
              <li><a href="/sitemap.xml">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Tecede. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default Layout;