import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./layout.scss";
import Tabbar from "../../component/tabar/index";
import LoginForm from "../../component/ShowForm/showForm";

import { useState, useEffect } from "react";
import {
  FaPhoneVolume,
  FaEnvelope,
  FaHashtag,
  FaBars,
  FaTimes
} from "react-icons/fa";

function Layout() {
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showTabbar, setShowTabbar] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      setShowDropdown(!showDropdown);
    } else {
      setShowForm(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowTabbar(false); // 🔥 RESET MOBILE STATE
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header__left">
          {/* HAMBURGER (bên trái logo, chỉ mobile) */}
          <button
          className="hamburger-btn"
          onClick={() => setShowTabbar(!showTabbar)}
          aria-label="Toggle menu"
        >
          {showTabbar ? <FaTimes /> : <FaBars />}
        </button>

          {/* LOGO */}
          <img
            src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png"
            alt="logo-Page"
            className="header__image"
            onClick={handleHomeClick}
          />
        </div>

        {/* MENU DESKTOP */}
        <div className="header__menu">
          <ul>
            <li>
              <NavLink to="/" className="menu__page">
                Trang Chủ
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className="menu__page">
                Về chúng tôi
              </NavLink>
            </li>
            <li>
              <NavLink className="menu__page" onClick={handleLoginClick}>
                {isLoggedIn ? "Tài khoản" : "Đăng nhập"}
              </NavLink>

              {showForm && (
                <LoginForm
                  onClose={() => setShowForm(false)}
                  onLoginSuccess={() => setIsLoggedIn(true)}
                />
              )}

              {showDropdown && (
                <div className="dropdown-logout">
                  <i>Lối tắt :</i>

                  {!location.pathname.startsWith("/admin") && (
                    <button onClick={() => navigate("/admin")}>
                      Trang admin
                    </button>
                  )}

                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </li>
          </ul>
        </div>
      </header>

      {/* ===== TABBAR DRAWER (MOBILE) ===== */}
      {showTabbar && (
        <>
          <div
            className="tabbar-overlay"
            onClick={() => setShowTabbar(false)}
          />
          <Tabbar isOpen={showTabbar} onClose={() => setShowTabbar(false)} />
        </>
      )}

      {/* ===== MAIN ===== */}
      <div className="layout-main">
        <Outlet />
      </div>

      {/* ===== FOOTER ===== */}
      <footer>
        <div className="footer-contact">
          <ul>
            <li>
              <FaPhoneVolume className="icon" /> Số điện thoại: +84 384577121
            </li>
            <li>
              <FaEnvelope className="icon" /> Email: thoaixd123@gmail.com
            </li>
            <li>
              <FaHashtag className="icon" /> Hashtag: #tecede, #tecede blog
            </li>
          </ul>
        </div>
        <p>Copyright © 2024 by Tecede. All right reserved.</p>
      </footer>
    </>
  );
}

export default Layout;