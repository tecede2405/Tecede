import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PremiumBadge } from "../../component/VerifiedBadge";
import Swal from "sweetalert2";
import {
  FaCrown,
  FaCheck,
  FaShieldAlt,
  FaSearch,
  FaGem,
  FaUsers,
  FaRegClock,
  FaTimes,
  FaExternalLinkAlt,
  FaHandHoldingHeart,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./style.scss";
import {
  fetchCachedPremiumUsersPage,
  clearPremiumUsersCache,
} from "../../services/premiumUsersCache";

const PERKS = [
  {
    id: "user-rights",
    title: "Mọi quyền hạn của User",
  },
  {
    id: "lifetime-vip",
    title: "Thành viên Premium vĩnh viễn",
  },
  {
    id: "tecede-yt",
    title: (
      <>
        Truy cập trang{" "}
        <strong className="brand-yt">
          Tecede<span className="text-yt-red">YT</span>
        </strong>{" "}
        xem YouTube không quảng cáo
      </>
    ),
    link: "/tecede-yt",
    linkLabel: (
      <>
        Mở{" "}
        <strong className="brand-yt">
          Tecede<span className="text-yt-red">YT</span>
        </strong>
      </>
    ),
  },
  {
    id: "audio-tts",
    title: "Nghe truyện chữ audio bằng TTS giọng AI",
    link: "/truyen/doc/giau-giem-anh-em-tot-chiem-co-ay-thanh-nghien/chuong-1",
    linkLabel: "Thử ngay",
  },
  {
    id: "future-features",
    title: "Được truy cập toàn bộ các tính năng mới trong tương lai (nếu có)",
  },
];

const USERS_PER_PAGE = 6;

export default function PremiumPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [premiumUsers, setPremiumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalUsers, setServerTotalUsers] = useState(0);

  const handleAdminReset = async () => {
    if (refreshing) return;
    setRefreshing(true);
    clearPremiumUsersCache();

    try {
      const { users, pagination } = await fetchCachedPremiumUsersPage(
        currentPage,
        USERS_PER_PAGE,
        true, // forceRefresh: bỏ qua cả cache frontend lẫn Cloudflare Edge cache
      );
      setPremiumUsers(users);
      if (pagination) {
        setServerTotalPages(pagination.totalPages || 1);
        setServerTotalUsers(pagination.total || users.length);
      }
      Swal.fire({
        icon: "success",
        title: "Đã làm mới dữ liệu",
        text: "Danh sách thành viên Premium đã được cập nhật trực tiếp từ Database!",
        timer: 1600,
        showConfirmButton: false,
        background: "#18181b",
        color: "#fff",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi làm mới",
        text: "Không thể lấy dữ liệu mới từ máy chủ. Vui lòng thử lại sau.",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch danh sách người dùng Premium theo từng trang (limit=6) có cache 10p & deduplication
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCachedPremiumUsersPage(currentPage, USERS_PER_PAGE)
      .then(({ users, pagination }) => {
        if (isMounted) {
          setPremiumUsers(users);
          if (pagination) {
            setServerTotalPages(pagination.totalPages || 1);
            setServerTotalUsers(pagination.total || users.length);
          }
        }
      })
      .catch((err) => {
        console.warn("Sử dụng danh sách mẫu thành viên VIP:", err);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const handleUpgradeClick = () => {
    if (!currentUser) {
      Swal.fire({
        title: "Cần đăng nhập",
        text: "Vui lòng đăng nhập vào tài khoản Tecede trước khi nâng cấp Premium.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Đến trang Đăng nhập",
        cancelButtonText: "Để sau",
        confirmButtonColor: "#eab308",
        cancelButtonColor: "#334155",
        background: "#18181b",
        color: "#fff",
      }).then((res) => {
        if (res.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (currentUser.role === "premium") {
      Swal.fire({
        icon: "success",
        title: "Tài khoản VIP",
        html: `Bạn hiện đang sở hữu <b style="color:#facc15">Tecede Premium</b>. Cảm ơn bạn đã luôn ủng hộ hệ thống!`,
        confirmButtonColor: "#eab308",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }

    if (currentUser.role === "admin") {
      Swal.fire({
        icon: "info",
        title: "Quản trị viên",
        text: "Bạn đang đăng nhập với tư cách Admin và có toàn bộ quyền hạn cao nhất trong hệ thống.",
        confirmButtonColor: "#3b82f6",
        background: "#18181b",
        color: "#fff",
      });
      return;
    }

    Swal.fire({
      title: "Nâng cấp Tecede Premium",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          <p>Xin chào <b>@${currentUser.username || currentUser.display_name}</b>,</p>
          <p>Để nâng cấp tài khoản lên <b>Premium</b> và mở khóa toàn bộ đặc quyền (TecedeYT không quảng cáo, TTS Audio AI...), vui lòng liên hệ Admin qua Fanpage hoặc kênh hỗ trợ chính thức:</p>
          <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 12px; border-radius: 10px; margin: 12px 0;">
            <p style="margin: 0 0 6px 0; color: #fde047; font-weight: 700;">⭐ Hỗ trợ kích hoạt tức thì:</p>
            <p style="margin: 0; font-size: 13px;">Fanpage: <b>Tecede Media</b></p>
            <p style="margin: 4px 0 0 0; font-size: 13px;">Ghi chú: Gửi kèm <b>Username: ${currentUser.username}</b></p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Nhắn tin qua Fanpage",
      cancelButtonText: "Đóng",
      confirmButtonColor: "#eab308",
      cancelButtonColor: "#334155",
      background: "#18181b",
      color: "#fff",
    }).then((res) => {
      if (res.isConfirmed) {
        window.open(
          "https://www.facebook.com/profile.php?id=100084710083595",
          "_blank",
        );
      }
    });
  };

  // Lọc danh sách user premium theo ô tìm kiếm trên trang hiện tại
  const filteredUsers = premiumUsers.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      String(u.id).includes(q)
    );
  });

  const totalPages = serverTotalPages;
  const displayedUsers = filteredUsers;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="premium-page">
      {/* TOP HERO BANNER */}
      <div className="premium-hero">
        <div className="premium-hero-badge">
          <FaCrown className="hero-crown-icon" />
          <span>Premium Tích Lũy</span>
        </div>
        <h1 className="premium-hero-title">
          Tích lũy donate 100k để mở khóa{" "}
          <span className="gold-gradient-text">Premium</span>
        </h1>
        <i className="premium-hero-desc">
          Mỗi sự ủng hộ từ các bạn đều góp phần giúp duy trì chi phí máy chủ và
          vận hành website, để chúng ta có thể tiếp tục đồng hành cùng nhau lâu
          dài.
        </i>
      </div>

      {/* BOX LÝ DO MỞ PREMIUM (FULL WIDTH TRÊN PC/LAPTOP) */}
      <div className="premium-reason-box">
        <div className="reason-box-header">
          <FaHandHoldingHeart className="reason-icon" />
          <h3>Vì sao Tecede mở Premium?</h3>
        </div>
        <div className="reason-box-content">
          <p>
            Để giữ không gian giải trí sạch sẽ và trọn vẹn nhất, website hoàn
            toàn <strong>không chèn banner quảng cáo hay popup Shopee</strong>{" "}
            phiền toái. Cũng vì thế, Tecede không có bất kỳ nguồn thu nào từ
            quảng cáo và phải gánh toàn bộ chi phí máy chủ (VPS) hàng tháng.
          </p>
          <p>
            Admin rất hy vọng những bạn có điều kiện cùng chung tay góp một phần
            sức nhỏ để duy trì máy chủ.{" "}
            <strong>
              Tiến trình donate và sao kê luôn được công khai minh bạch ngay tại
              Trang chủ
            </strong>
            . Nếu đến cuối tháng mà tiến trình đạt <strong>dưới 50%</strong>,
            đồng nghĩa với việc admin sẽ không đủ kinh phí để tiếp tục duy trì
            hoạt động của server nữa.
          </p>
        </div>
        <div className="reason-box-footer">
          <Link to="/donates" className="reason-link">
            Xem tiến trình donate &amp; sao kê tại Trang chủ{" "}
            <FaExternalLinkAlt className="link-arrow" />
          </Link>
        </div>
      </div>

      {/* MAIN 2-COLUMN GRID */}
      <div className="premium-grid">
        {/* CỘT TRÁI: THẺ PREMIUM & DANH SÁCH ĐẶC QUYỀN */}
        <div className="premium-card perks-card">
          <div className="perks-card__header">
            <div className="perks-card__badge-row">
              <span className="premium-tag">
                <FaGem className="gem-icon" />
                Độc Quyền
              </span>
              <div className="premium-verified-pill">
                <PremiumBadge showText={true} size={20} />
              </div>
            </div>

            <h2 className="perks-card__title">
              Đặc quyền <span className="gold-gradient-text">Premium</span>
            </h2>
            <p className="perks-card__subtitle">
              Bạn nào đã donate đủ 100k ib ad qua fanpage để mở khóa nhé.
            </p>
          </div>

          <div className="perks-list">
            {PERKS.map((perk) => (
              <div key={perk.id} className="perk-item">
                <div className="perk-item-main">
                  <FaCheck className="perk-check-icon" />
                  <span className="perk-heading">{perk.title}</span>
                </div>
                {perk.link && (
                  <Link to={perk.link} className="perk-inline-link">
                    {perk.linkLabel} <FaExternalLinkAlt className="link-icon" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="perks-card__footer">
            <button
              className={`btn-upgrade-action ${
                currentUser?.role === "premium" ? "btn-active-premium" : ""
              }`}
              onClick={handleUpgradeClick}
            >
              <span className="btn-shimmer" />
              {currentUser?.role === "premium" ? (
                <>
                  <FaCheck className="action-icon" />
                  <span>Bạn đang là Thành viên Premium</span>
                </>
              ) : currentUser?.role === "admin" ? (
                <>
                  <FaShieldAlt className="action-icon" />
                  <span>Tài khoản Quản trị viên (Toàn quyền)</span>
                </>
              ) : (
                <>
                  <FaCrown className="action-icon crown-spin" />
                  <span>Ib Ad để mở khóa</span>
                </>
              )}
            </button>
            <p className="footer-note">
              {currentUser?.role === "premium"
                ? "VIP của bạn đang hoạt động đầy đủ trên mọi thiết bị."
                : "Hỗ trợ kích hoạt nhanh chóng qua Admin Fanpage."}
            </p>
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CÁC USER ĐÃ LÀ PREMIUM */}
        <div className="premium-card users-card">
          <div className="users-card__header">
            <div className="users-card__title-row">
              <div className="title-with-icon">
                <FaUsers className="section-users-icon" />
                <h2 className="title-users-heading">Thành viên Premium</h2>
              </div>
              <div className="users-card__header-right">
                {currentUser?.role === "admin" && (
                  <button
                    type="button"
                    className={`btn-admin-reset ${refreshing ? "is-refreshing" : ""}`}
                    onClick={handleAdminReset}
                    disabled={refreshing}
                    title="Xóa cache và làm mới dữ liệu từ Database (Chỉ dành cho Admin)"
                  >
                    <FaSyncAlt
                      className={`reset-icon ${refreshing ? "spin-icon" : ""}`}
                    />
                    <span>{refreshing ? "Đang tải..." : "Làm mới"}</span>
                  </button>
                )}
                <span className="users-count-badge">
                  {serverTotalUsers || premiumUsers.length} VIP
                </span>
              </div>
            </div>
            <p className="users-card__desc">
              Danh sách những người dùng đã sở hữu đặc quyền VIP trên Tecede
            </p>

            <div className="users-search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm thành viên VIP theo tên..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={handleClearSearch}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="users-list-wrapper">
            {loading ? (
              <div className="users-loading-state">
                <div className="spinner" />
                <span>Đang tải danh sách thành viên Premium...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="users-empty-state">
                <FaUsers className="empty-icon" />
                <p>
                  {searchTerm
                    ? `Không tìm thấy thành viên VIP nào khớp với "${searchTerm}"`
                    : "Chưa có thành viên Premium nào"}
                </p>
              </div>
            ) : (
              <div className="users-list">
                {displayedUsers.map((item) => (
                  <div key={item.id} className="premium-user-item">
                    <div
                      className="user-avatar-wrap clickable-profile"
                      onClick={() => navigate(`/profile/${item.id}`)}
                      title={`Xem hồ sơ của ${item.display_name || item.username}`}
                    >
                      <img
                        src={
                          item.avatar ||
                          "https://ui-avatars.com/api/?name=VIP&background=18181b&color=eab308"
                        }
                        alt={item.username || "avatar"}
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?name=VIP&background=18181b&color=eab308";
                        }}
                      />
                      <FaCrown className="avatar-crown-icon" />
                    </div>

                    <div className="user-meta">
                      <div className="user-name-line">
                        <span
                          className="display-name clickable-profile"
                          onClick={() => navigate(`/profile/${item.id}`)}
                          title={`Xem hồ sơ của ${item.display_name || item.username}`}
                        >
                          {item.display_name || item.username || "Thành viên"}
                        </span>
                        {/* ICON SVG TÍCH XANH GIỐNG CỦA ADMIN NHƯNG MÀU VÀNG GOLD KÈM CHỮ PREMIUM */}
                        <PremiumBadge showText={true} size={17} />
                      </div>

                      <div className="user-sub-line">
                        {item.id && (
                          <span
                            className="user-id-tag"
                            title={`ID người dùng: ${item.id}`}
                          >
                            id: {item.id}
                          </span>
                        )}
                        {item.created_at && (
                          <span
                            className="created-date"
                            title={item.created_at}
                          >
                            <FaRegClock className="clock-icon" />
                            {new Date(
                              item.created_at.replace(" ", "T"),
                            ).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PHÂN TRANG 6 USER/TRANG */}
            {!loading && displayedUsers.length > 0 && (
              <div className="users-pagination">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="pagination-btn"
                  title="Trang trước"
                >
                  <FaChevronLeft className="page-arrow-icon" />
                  <span>Trước</span>
                </button>

                <div className="pagination-pages">
                  {Array.from(
                    { length: Math.max(1, totalPages) },
                    (_, i) => i + 1,
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      disabled={totalPages <= 1}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`page-number-btn ${currentPage === pageNum ? "active" : ""}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="pagination-btn"
                  title="Trang tiếp"
                >
                  <span>Tiếp</span>
                  <FaChevronRight className="page-arrow-icon" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
