import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaFilm,
  FaHeadphones,
  FaBolt,
  FaPlay,
  FaCheck,
} from "react-icons/fa";
import "./style.scss";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Tự động điền tài khoản nếu trước đó đã bật "Ghi nhớ đăng nhập"
  useEffect(() => {
    try {
      const isRemember = localStorage.getItem("tecede_remember_me") === "true";
      if (isRemember) {
        setRememberMe(true);
        const savedUser = localStorage.getItem("tecede_remember_username") || "";
        const encodedPass = localStorage.getItem("tecede_remember_password") || "";
        let savedPass = "";
        if (encodedPass) {
          try {
            savedPass = decodeURIComponent(escape(atob(encodedPass)));
          } catch {
            savedPass = encodedPass;
          }
        }
        if (savedUser) setUsername(savedUser);
        if (savedPass) setPassword(savedPass);
      }
    } catch (e) {
      // Bỏ qua nếu môi trường chặn localStorage
    }
  }, []);

  const DarkSwal = Swal.mixin({
    background: "#161926",
    color: "#fff",
    confirmButtonColor: "#a855f7",
    cancelButtonColor: "#334155",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      DarkSwal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanUsername,
            password: cleanPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Lưu hoặc xóa thông tin tự động điền dựa trên checkbox "Ghi nhớ đăng nhập"
        try {
          if (rememberMe) {
            localStorage.setItem("tecede_remember_me", "true");
            localStorage.setItem("tecede_remember_username", cleanUsername);
            localStorage.setItem(
              "tecede_remember_password",
              btoa(unescape(encodeURIComponent(cleanPassword)))
            );
          } else {
            localStorage.removeItem("tecede_remember_me");
            localStorage.removeItem("tecede_remember_username");
            localStorage.removeItem("tecede_remember_password");
          }
        } catch (e) {
          // Bỏ qua nếu môi trường chặn localStorage
        }

        login({
          ...data.user,
          token: data.token,
        });

        await DarkSwal.fire({
          icon: "success",
          title: "Đăng nhập thành công!",
          text: `Chào mừng bạn quay trở lại, ${data.user?.display_name || cleanUsername}!`,
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/");
      } else {
        throw new Error(data?.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Đăng nhập - Tecede Giải Trí Đỉnh Cao</title>
      </Helmet>

      <div className="auth-bg-overlay" />

      <div className="auth-card">
        {/* Showcase cột trái (Desktop) */}
        <div className="auth-showcase">
          <div className="auth-brand">
            <div className="brand-logo-wrapper">
              <img
                src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png"
                alt="Tecede Logo"
              />
            </div>
            <div className="brand-text">
              <h1>Tecede</h1>
              <span className="brand-tagline">Cổng Giải Trí Đỉnh Cao</span>
            </div>
          </div>

          <div className="auth-showcase-content">
            <h2 className="showcase-headline">
              Đắm chìm không gian <br />
              <span className="highlight-gradient">Điện Ảnh & Âm Nhạc</span>
            </h2>
            <p className="showcase-desc">
              Khám phá kho nội dung giải trí không giới hạn.
            </p>

            <div className="showcase-features">
              <div className="feature-item">
                <div className="feature-icon-box film">
                  <FaFilm />
                </div>
                <div className="feature-text">
                  <h4>Xem phim miễn phí không quảng cáo</h4>
                  <p>Bom tấn chiếu rạp, anime và series phim cập nhật 24/7</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box audio">
                  <FaHeadphones />
                </div>
                <div className="feature-text">
                  <h4>Nghe nhạc đa dạng thể loại</h4>
                  <p>Trải nghiệm âm thanh xoay 360° đa chiều sống động</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-box speed">
                  <FaBolt />
                </div>
                <div className="feature-text">
                  <h4>Streaming Siêu Tốc</h4>
                  <p>Tối ưu hóa đường truyền xem mượt mà, ổn định</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            <span className="status-dot" />
            <span>Tecede - Website giải trí không giới hạn</span>
          </div>
        </div>

        {/* Cột Form đăng nhập (Phải) */}
        <div className="auth-form-column">
          {/* Top Actions: Back to Home + Mini badge */}
          <div className="auth-top-actions">
            <Link to="/" className="back-home-link" title="Quay lại trang chủ">
              <FaArrowLeft />
              <span>Trang chủ</span>
            </Link>
            <div className="badge-entertainment">
              <FaPlay style={{ fontSize: "9px" }} />
              <span>Đăng nhập</span>
            </div>
          </div>

          {/* Mobile Header (hiện khi màn hình nhỏ) */}
          <div className="auth-mobile-header">
            <div className="mobile-logo">
              <img
                src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png"
                alt="Tecede Logo"
              />
            </div>
            <div className="mobile-brand-info">
              <h3>Tecede</h3>
              <p>Xem Phim & Nghe Nhạc Đỉnh Cao</p>
            </div>
          </div>

          <div className="auth-header">
            <h2>Đăng nhập</h2>
            <p>Chào mừng trở lại! Nhập tài khoản để tiếp tục trải nghiệm.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-username">Tên đăng nhập</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="Nhập tên tài khoản..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="input-wrapper has-toggle">
                <FaLock className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="custom-checkbox">
                  <FaCheck />
                </span>
                <span className="remember-text">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập ngay</span>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Chưa có tài khoản?
            <Link to="/register">Đăng ký tài khoản mới</Link>
          </p>
        </div>
      </div>
    </div>
  );
}