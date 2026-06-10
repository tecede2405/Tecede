import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./layout.scss";
import Tabbar from "../../component/tabar/index";
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
import PwaInstallButton from "../../component/PwaInstallButton/index";
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
  console.log("USER CHANGED:", user);
}, [user]);

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
                              border: "1px solid #333",
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
                      <div
                        className="user-menu-overlay"
                        onClick={() => setShowUserMenu(false)}
                      />

                      <div className="user-menu-modal">
                        {/* close */}
                        <button
                          className="close-btn"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaTimes />
                        </button>

                        {/* profile */}
                        <div className="user-profile">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt="avatar"
                              className="user-avatar"
                            />
                          ) : (
                            <div className="avatar-fallback">
                              {getAvatarLetter(user.display_name)}
                            </div>
                          )}

                          <div className="user-profile-info">
                            <div className="user-name">
                              {user.display_name}
                              {user.display_name === "Tecede" && (
                                <VerifiedBadge />
                              )}
                            </div>

                          </div>
                        </div>

                        {/* menu */}
                        <div className="user-menu-actions">
                           {user.role === "admin" && (
                              <button
                                className="menu-action-btn admin-btn"
                                onClick={() => navigate("/admin")}
                              >
                                <FaBars />
                                <span>Trang quản trị</span>
                              </button>
                            )}
                          <button
                            className="menu-action-btn"
                            onClick={() => navigate("/history")}
                          >
                            <FaClockRotateLeft />
                            <span>Lịch sử xem</span>
                          </button>

                          <button
                            className="menu-action-btn"
                            onClick={() => navigate("/profile")}
                          >
                            <MdOutlineAccountCircle />
                            <span>Sửa thông tin</span>
                          </button>

                          <button
                            className="logout-btn"
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
                          >
                            Đăng xuất
                          </button>
                        </div>
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
                Tecede - Website xem phim miễn phí lỏ nhất Việt Nam.
              </p>
            </div>

            {/* Contact */}
            <div className="col-12 col-md-3 col-sm-5">
              <h6 className="footer-subtitle">Liên hệ</h6>
              <ul className="footer-list">
                <li><FaPhoneVolume /> +84 3x4 5x7 xxx</li>
                <li><FaEnvelope /> erenjeager6753@gmail.com</li>
                <li><FaHashtag /> #tecede #tecede blog</li>
              </ul>
            </div>

            {/* About */}
            <div className="col-12 col-md-3 col-sm-5">
              <h6 className="footer-subtitle">Thông tin</h6>
              <ul className="footer-list">
                <li>
                  <a href="/sitemap.xml">Sitemap</a>
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