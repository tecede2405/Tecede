import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import {
  FaUser,
  FaLock,
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaHeart,
  FaComments,
  FaHeadphones,
  FaRocket,
} from "react-icons/fa";
import "./style.scss";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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

    const cleanDisplayName = displayName.trim();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanDisplayName || !cleanUsername || !cleanPassword) {
      await DarkSwal.fire({
        icon: "warning",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập đầy đủ tên hiển thị, tên đăng nhập và mật khẩu!",
      });
      return;
    }

    if (cleanUsername.length < 3) {
      await DarkSwal.fire({
        icon: "warning",
        title: "Tài khoản quá ngắn",
        text: "Tên đăng nhập phải có ít nhất 3 ký tự!",
      });
      return;
    }

    if (cleanPassword.length < 4) {
      await DarkSwal.fire({
        icon: "warning",
        title: "Mật khẩu quá ngắn",
        text: "Mật khẩu phải có ít nhất 4 ký tự!",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanUsername,
            password: cleanPassword,
            display_name: cleanDisplayName,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        await DarkSwal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: `Chào mừng ${cleanDisplayName}! Hãy đăng nhập để bắt đầu khám phá.`,
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/login");
      } else {
        throw new Error(data?.message || "Đăng ký không thành công");
      }
    } catch (err) {
      await DarkSwal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>Đăng ký tài khoản - Tecede Giải Trí Đỉnh Cao</title>
      </Helmet>

      <div className="auth-bg-overlay" />

      <div className="auth-card">
        {/* Showcase Cột Trái (Desktop) */}
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
              <span className="brand-tagline">Đặc Quyền Thành Viên</span>
            </div>
          </div>

          <div className="auth-showcase-content">
            <h2 className="showcase-headline">
              Mở khóa đặc quyền <br />
              <span className="highlight-gradient">Giải Trí Không Giới Hạn</span>
            </h2>
            <p className="showcase-desc">
              Tạo tài khoản đồng bộ và cá nhân hóa trải nghiệm.
            </p>

            <div className="showcase-features">
              <div className="feature-item">
                <div className="feature-icon-box film">
                  <FaHeart />
                </div>
                <div className="feature-text">
                  <h4>Lưu & Đồng Bộ Yêu Thích</h4>
                  <p>Lưu phim và tiếp tục theo dõi trên mọi thiết bị</p>
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
                  <FaComments />
                </div>
                <div className="feature-text">
                  <h4>Cộng Đồng Xem Phim</h4>
                  <p>Bình luận, đánh giá và chia sẻ cảm xúc cùng mọt phim</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            <span className="status-dot" />
            <span>Đăng ký hoàn toàn miễn phí • Không gắn thẻ tín dụng</span>
          </div>
        </div>

        {/* Cột Form Đăng Ký (Phải) */}
        <div className="auth-form-column">
          <div className="auth-top-actions">
            <Link to="/" className="back-home-link" title="Quay lại trang chủ">
              <FaArrowLeft />
              <span>Trang chủ</span>
            </Link>
            <div className="badge-entertainment">
              <FaRocket style={{ fontSize: "10px" }} />
              <span>Tạo tài khoản</span>
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
              <p>Khởi Đầu Trải Nghiệm Mới</p>
            </div>
          </div>

          <div className="auth-header">
            <h2>Tạo tài khoản mới</h2>
            <p>Điền thông tin bên dưới để bắt đầu trải nghiệm Tecede.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reg-displayName">Tên hiển thị (Biệt danh)</label>
              <div className="input-wrapper">
                <FaIdCard className="input-icon" />
                <input
                  id="reg-displayName"
                  type="text"
                  placeholder="VD: Kenji, Mèo Con, Hoàng Nam..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="nickname"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-username">Tên đăng nhập</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  placeholder="VD: nguyenvana123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password">Mật khẩu</label>
              <div className="input-wrapper has-toggle">
                <FaLock className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu dễ nhớ nhé..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <span>Đăng ký ngay</span>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Đã có tài khoản?
            <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}