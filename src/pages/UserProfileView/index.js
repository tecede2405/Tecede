import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { VerifiedBadge, PremiumBadge } from "../../component/VerifiedBadge";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaCrown,
  FaUserCheck,
  FaCalendarAlt,
  FaIdCard,
  FaUser,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";
import "../ProfilePage/style.scss";
import "./style.scss";

export default function UserProfileView() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAvatarLetter = (str) => {
    if (!str) return "U";
    const words = str.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetchUserById = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const headers = {};
        if (currentUser?.token) {
          headers.Authorization = `Bearer ${currentUser.token}`;
        }

        let res = await fetch(
          `${process.env.REACT_APP_SERVER_API_URL}/auth/users/${encodeURIComponent(id)}`,
          { headers }
        );

        let data = await res.json();

        // Fallback endpoint nếu cần
        if (!res.ok && res.status === 404) {
          const fallbackRes = await fetch(
            `${process.env.REACT_APP_SERVER_API_URL}/auth/${encodeURIComponent(id)}`,
            { headers }
          );
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
            res = fallbackRes;
          }
        }

        if (isMounted) {
          if (res.ok && (data.success || data.user)) {
            setUserData(data.user || data.data || data);
          } else {
            setError(data.message || "Không tìm thấy thông tin người dùng này.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Lỗi lấy thông tin user theo ID:", err);
          setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserById();

    return () => {
      isMounted = false;
    };
  }, [id, currentUser?.token]);

  // Yêu cầu đăng nhập nếu chưa có token
  if (!currentUser?.token) {
    return (
      <div className="fb-profile-page view-only-profile">
        <div className="view-profile-notice-box">
          <FaLock className="notice-icon" />
          <h2>Yêu cầu đăng nhập</h2>
          <p>
            Vui lòng đăng nhập vào hệ thống Tecede để xem thông tin trang cá nhân của thành viên này.
          </p>
          <div className="notice-actions">
            <button
              className="view-btn view-btn--primary"
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </button>
            <button
              className="view-btn view-btn--secondary"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fb-profile-loading">
        <div className="loading-spinner" />
        <p>Đang tải thông tin thành viên #{id}...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="fb-profile-page view-only-profile">
        <div className="view-profile-notice-box">
          <FaUser className="notice-icon" />
          <h2>Không tìm thấy người dùng</h2>
          <p>{error || "Người dùng không tồn tại hoặc đã bị khóa tài khoản."}</p>
          <div className="notice-actions">
            <button
              className="view-btn view-btn--secondary"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = userData.role || "user";
  const isAdmin = userRole === "admin";
  const isPremium = userRole === "premium";
  const displayName = userData.display_name || (isAdmin ? "Quản trị viên" : userData.username) || "Thành viên";
  const displayUsername = userData.username || "user";
  const displayId = userData.id ?? id;

  return (
    <div className={`fb-profile-page view-only-profile ${isAdmin ? "fb-profile-page--admin" : isPremium ? "fb-profile-page--premium" : ""}`}>
      {/* ẢNH BÌA COVER BANNER */}
      <div className={`fb-cover-banner ${isAdmin ? "fb-cover-banner--admin" : isPremium ? "fb-cover-banner--premium" : ""}`}>
        <div className="fb-cover-overlay" />
        <div className="fb-cover-particles" />
        <div className="fb-cover-shine" />
        <div className="fb-cover-badge">
          {isAdmin ? (
            <>
              <FaShieldAlt className="cover-admin-icon" />
              <span>Quản Trị Viên Hệ Thống</span>
            </>
          ) : isPremium ? (
            <>
              <FaCrown className="cover-crown-icon" />
              <span>Thành viên VIP Premium</span>
            </>
          ) : (
            <>
              <span className="cover-glow-dot" />
              <span>Hồ sơ thành viên</span>
            </>
          )}
        </div>
      </div>

      {/* HEADER PROFILE */}
      <div className="fb-profile-header-bar">
        <div className="fb-container fb-profile-header">
          <div className="fb-profile-header__left">
            {/* AVATAR KHÔNG CÓ NÚT EDIT */}
            <div className="fb-avatar-container">
              <div className="fb-avatar-ring">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={displayName}
                    className="fb-avatar-img"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=User&background=111827&color=fff";
                    }}
                  />
                ) : (
                  <div className="fb-avatar-fallback">
                    {getAvatarLetter(displayName)}
                  </div>
                )}
              </div>
            </div>

            {/* THÔNG TIN USER */}
            <div className="fb-user-details">
              <div className="fb-user-name-row">
                <h1 className="fb-user-name" title={displayName}>
                  {displayName}
                </h1>
                {isAdmin && (
                  <span className="fb-verified-wrap" title="Quản trị viên đã xác minh">
                    <VerifiedBadge />
                  </span>
                )}
                {isPremium && (
                  <span className="fb-verified-wrap" title="Thành viên Premium">
                    <PremiumBadge showText={true} />
                  </span>
                )}
              </div>

              <div className="fb-user-meta">
                {!isAdmin && (
                  <div className="fb-meta-item fb-username-item" title="Tên đăng nhập">
                    <span className="meta-at">@</span>
                    <span className="meta-text">{displayUsername}</span>
                  </div>
                )}

                {displayId && (
                  <div className="fb-meta-item fb-id-item" title={`ID tài khoản: #${displayId}`}>
                    <span className="meta-hash">#</span>
                    <span className="meta-text">{displayId}</span>
                  </div>
                )}

                {!isAdmin && <span className="fb-meta-dot">•</span>}

                <span
                  className={`fb-role-badge ${
                    isAdmin
                      ? "fb-role-badge--admin"
                      : isPremium
                      ? "fb-role-badge--premium"
                      : "fb-role-badge--member"
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <FaShieldAlt className="role-icon" />
                      <span>Quản trị viên</span>
                    </>
                  ) : isPremium ? (
                    <>
                      <FaCrown className="role-icon" />
                      <span>Thành viên Premium</span>
                    </>
                  ) : (
                    <>
                      <FaUserCheck className="role-icon" />
                      <span>Thành viên</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="fb-profile-header__actions">
            <button
              type="button"
              className="fb-action-btn fb-action-btn--secondary"
              onClick={() => navigate(-1)}
              title="Quay lại trang trước"
            >
              <FaArrowLeft className="icon" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* NỘI DUNG ONLY-READ: THÔNG TIN TÀI KHOẢN */}
      <div className="fb-container fb-profile-body">
        <div className="view-profile-card">
          <div className="view-profile-card__header">
            <div className="header-title-wrap">
              <FaIdCard className="header-icon" />
              <h2>Thông tin tài khoản</h2>
            </div>
            <span className="read-only-badge">
              <FaCheckCircle className="check-icon" /> Hồ sơ công khai
            </span>
          </div>

          <div className="view-profile-grid">
            <div className="info-item">
              <div className="info-label">Biệt danh hiển thị</div>
              <div className="info-value">{displayName}</div>
            </div>

            {!isAdmin && (
              <div className="info-item">
                <div className="info-label">Tên tài khoản</div>
                <div className="info-value">@{displayUsername}</div>
              </div>
            )}

            <div className="info-item">
              <div className="info-label">Mã ID hệ thống</div>
              <div className="info-value text-blue">#{displayId}</div>
            </div>

            <div className="info-item">
              <div className="info-label">Vai trò tài khoản</div>
              <div className="info-value">
                {isAdmin ? (
                  <span className="role-text role-admin">Quản trị viên (Admin)</span>
                ) : isPremium ? (
                  <span className="role-text role-premium">Thành viên Premium (VIP)</span>
                ) : (
                  <span className="role-text role-user">Thành viên chính thức</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">Ngày tham gia hệ thống</div>
              <div className="info-value">
                {userData.created_at ? (
                  <span className="created-text">
                    <FaCalendarAlt className="me-1 opacity-75" />
                    {new Date(userData.created_at.replace(" ", "T")).toLocaleDateString(
                      "vi-VN",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                ) : (
                  <span className="text-secondary">-</span>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">Trạng thái tài khoản</div>
              <div className="info-value">
                <span className="status-online-pill">
                  <span className="online-dot" /> Đang hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
