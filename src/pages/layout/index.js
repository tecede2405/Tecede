import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./layout.scss";
import Tabbar from "../../component/tabar/index";
import AdminAuth from "../../component/AdminAuth/index";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaPhoneVolume,
  FaEnvelope,
  FaHashtag,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdOutlineAccountCircle } from "react-icons/md";
import { FaClockRotateLeft } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import {VerifiedBadge} from "../../component/VerifiedBadge/index";
function Layout() {

  const [showTabbar, setShowTabbar] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

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

    useEffect(() => {
  setShowUserMenu(false);
  setShowTabbar(false);
}, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowTabbar(false); // RESET MOBILE STATE
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getAvatarLetter = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

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
            src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/2c06afde0ebca0c687b0d3add5f4b1f2"
            alt="logo-Page"
            className="header__image"
            onClick={() => navigate("/")}
          />
        </div>

        {/* MENU DESKTOP */}
        <div className="header__menu">
          <ul>
            <li>
              <NavLink to="/history" className="menu__page">
               <FaClockRotateLeft className="me-2" style={{ fontSize: "1.25rem" }}/> Lịch sử
              </NavLink>
            </li>
            <li>
              {user ? (
                  <>
                    <span
                      className="menu__page"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      style={{ cursor: "pointer" }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt="avatar"
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "#e50914",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: "bold",
                            }}
                          >
                            {getAvatarLetter(user.display_name)}
                          </div>
                        )}

                        {user.display_name}
                      </span>
                      {user.display_name === "Tecede" && <VerifiedBadge />}
                    </span>

                    {showUserMenu && (
                      <>
                        {/* overlay click ngoài */}
                        <div
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999,
                          }}
                        />

                        {/* modal */}
                        <div
                          style={{
                            position: "absolute",
                            right: 20,
                            top: "100%",
                            width: 250,
                            background: "#1c1c1c",
                            borderRadius: 10,
                            padding: 15,
                            zIndex: 1000,
                            boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
                            border: "1px solid #333",
                          }}
                        >
                         
                          <div style={{ textAlign: "right" }}>
                            <span
                              onClick={() => setShowUserMenu(false)}
                              style={{
                                cursor: "pointer",
                                color: "#aaa",
                                fontSize: 14,
                              }}
                            >
                              ✕
                            </span>
                          </div>

                         
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 15,
                            }}
                          >
                            {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt="avatar"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#e50914",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    color: "white",
                                    fontSize: 12,
                                  }}
                                >
                                  {getAvatarLetter(user.display_name)}
                                </div>
                              )}

                            <div style={{ color: "#fff", fontWeight: 500 }}>
                              {user.display_name}
                            </div>
                          </div>
                          

                          {/* extra options */}
                          <div style={{ marginBottom: 10 }}>
                            <button
                              onClick={() => navigate("/history")}
                              style={{
                                width: "100%",
                                padding: "8px",
                                background: "#333",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                marginBottom: 8,
                              }}
                            >
                              Lịch sử xem
                            </button>
                          </div>
                              <div style={{ marginBottom: 10 }}>
                            <button
                              onClick={() => navigate("/profile")}
                              style={{
                                width: "100%",
                                padding: "8px",
                                background: "#333",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                marginBottom: 8,
                              }}
                            >
                              Sửa thông tin
                            </button>
                          </div>
                          {/* logout */}
                          <button
                            onClick={() => {
                            logout();
                            setShowUserMenu(false);

                            DarkSwal.fire({
                            icon: "success",
                              title: "Đăng xuất thành công",
                              text: "Hẹn gặp lại bạn nhé!",
                              timer: 1500,
                              showConfirmButton: false,
                          }).then(() => {
                              navigate("/");
                            });
                          }}
                            style={{
                              width: "100%",
                              padding: "8px",
                              background: "#e50914",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                            }}
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                <NavLink to="/login" className="menu__page">
                  <MdOutlineAccountCircle className="me-2" style={{ fontSize: "1.25rem" }} /> Đăng nhập
                </NavLink>
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
      <footer className="footer-custom">
        
          <div className="row text-start gy-4 p-3" style={{ maxWidth: "100vw" }}>

            {/* Brand */}
            <div className="col-12 col-md-4 col-sm-5">
              <h6 className="footer-subtitle">Giới thiệu</h6>
              <p className="footer-desc">
                Tecede - Website xem phim online miễn phí lỏ nhất Việt Nam.
              </p>
            </div>

            {/* Contact */}
            <div className="col-12 col-md-3 col-sm-5">
              <h6 className="footer-subtitle">Liên hệ</h6>
              <ul className="footer-list">
                <li><FaPhoneVolume /> +84 384 577 121</li>
                <li><FaEnvelope /> thoaixd123@gmail.com</li>
                <li><FaHashtag /> #tecede #tecede blog</li>
              </ul>
            </div>

            {/* About */}
            <div className="col-12 col-md-3 col-sm-5">
              <h6 className="footer-subtitle">Thông tin</h6>
              <ul className="footer-list">
                <li>
                  <Link to="/about">Về chúng tôi</Link>
                </li>
                <li>
                  <AdminAuth />
                </li>
                <li>
                  <Link to="/sitemap.xml">Sitemap</Link>
                </li>
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