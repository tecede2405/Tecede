import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios"; 
import avatarList from "../../data/avatarList"; 
import Swal from "sweetalert2";
import { 
  FaCamera, 
  FaCheck, 
  FaShieldAlt, 
  FaUserCheck, 
  FaUser, 
  FaIdCard, 
  FaImages, 
  FaLock, 
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUndoAlt
} from "react-icons/fa";
import { FaCloudArrowUp, FaPenToSquare } from "react-icons/fa6";
import { VerifiedBadge } from "../../component/VerifiedBadge/index";
import "./style.scss";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(""); 
  const [avatarFile, setAvatarFile] = useState(null);       
  const [original, setOriginal] = useState(null);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" | "avatars" | "account"
  
  const PREVIEW_COUNT = 10;
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const fileInputRef = useRef(null);

  const displayedAvatars = showAllAvatars
    ? avatarList
    : avatarList.slice(0, PREVIEW_COUNT);

  const DarkSwal = Swal.mixin({
    background: "#151a27",
    color: "#fff",
    confirmButtonColor: "#e50914",
    cancelButtonColor: "#334155",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    }
  });

  const getAvatarLetter = (str) => {
    if (!str) return "U";
    const words = str.trim().split(" ");
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setName(data.display_name || "");
        setSelectedAvatar(data.avatar || "");
        setOriginal(data);
      } catch (err) {
        console.error("Lỗi tải thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [user]);

  // Kiểm tra file ảnh khi click chọn từ máy
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      DarkSwal.fire({
        icon: "error",
        title: "Sai định dạng",
        text: "Hệ thống chỉ chấp nhận file hình ảnh thôi nhé!",
      });
      return;
    }

    setAvatarFile(file);
    setSelectedAvatar(URL.createObjectURL(file)); 
  };

  // Chọn avatar mẫu
  const handleSelectSampleAvatar = (imgUrl) => {
    setAvatarFile(null); 
    setSelectedAvatar(imgUrl); 
  };

  // Khôi phục thay đổi chưa lưu
  const handleReset = () => {
    setName(original?.display_name || "");
    setSelectedAvatar(original?.avatar || "");
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    DarkSwal.fire({
      icon: "info",
      title: "Đã hoàn tác",
      text: "Đã khôi phục thông tin ban đầu.",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleUpdate = async () => {
    if (!isChanged) {
      return DarkSwal.fire({
        icon: "info",
        title: "Chưa có thay đổi",
        text: "Bạn chưa chỉnh sửa gì cả!",
      });
    }

    try {
      DarkSwal.fire({
        title: "Đang lưu thay đổi...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let finalAvatarUrl = selectedAvatar;

      // Nếu có file mới từ máy -> Upload qua router storage và lấy link ảnh thật (ImgBB)
      if (avatarFile) {
        const formData = new FormData();
        const safeName = encodeURIComponent(`avatar_${Date.now()}_${avatarFile.name}`);
        formData.append("files", avatarFile, safeName);

        const uploadRes = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/storage/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if ((uploadRes.status === 200 || uploadRes.status === 201) && Array.isArray(uploadRes.data) && uploadRes.data.length > 0) {
          const savedFile = uploadRes.data[0];
          
          let realImageUrl = savedFile.url || savedFile.directUrl || savedFile.imgbb_url || savedFile.display_url || savedFile.link;

          if (!realImageUrl || !realImageUrl.startsWith("http") || realImageUrl.includes("/api/storage/file/")) {
            try {
              const fileCheck = await fetch(`${process.env.REACT_APP_API_URL}/api/storage/file/${savedFile._id}`);
              if (fileCheck.ok && fileCheck.url) {
                realImageUrl = fileCheck.url;
              }
            } catch (fetchErr) {
              console.warn("Không lấy được redirect link từ storage:", fetchErr);
            }
          }

          finalAvatarUrl = realImageUrl || `${process.env.REACT_APP_API_URL}/api/storage/file/${savedFile._id}`;
        } else {
          throw new Error("Không lấy được thông tin file sau khi upload");
        }
      }

      // Cập nhật thông tin User dạng JSON thường
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          display_name: name,
          avatar: finalAvatarUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return DarkSwal.fire({
          icon: "error",
          title: "Update thất bại",
          text: data.message || "Có lỗi xảy ra",
        });
      }

      setUser((prev) => ({ ...prev, ...data.user }));
      setOriginal(data.user);
      setAvatarFile(null); 

      DarkSwal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật hồ sơ cá nhân thành công!",
        timer: 1600,
        showConfirmButton: false,
      });

    } catch (err) {
      console.error("UPDATE ERROR:", err);
      DarkSwal.fire({
        icon: "error",
        title: "Lỗi xử lý",
        text: "Không thể upload ảnh hoặc cập nhật profile. Vui lòng thử lại!",
      });
    }
  };

  const isChanged =
    name !== (original?.display_name || "") ||
    avatarFile !== null ||
    selectedAvatar !== (original?.avatar || "");

  const currentRole = original?.role || user?.role || "member";
  const isAdmin = currentRole === "admin";
  const displayUsername = original?.username || user?.username || "tecede_user";
  const displayName = name || original?.display_name || user?.display_name || displayUsername;

  if (loading) {
    return (
      <div className="fb-profile-loading">
        <div className="loading-spinner" />
        <p>Đang tải hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="fb-profile-page">
      
      {/* ================= KHUNG BACKGROUND ẢNH NỀN (FULL PAGE, DEFAULT MÀU TỐI) ================= */}
      <div className="fb-cover-banner">
        <div className="fb-cover-overlay" />
        <div className="fb-cover-particles" />
        <div className="fb-cover-badge">
          <span className="cover-glow-dot" />
          <span>Trang cá nhân</span>
        </div>
      </div>

      {/* ================= KHU VỰC HEADER PROFILE (GIỐNG FACEBOOK) ================= */}
      <div className="fb-profile-header-bar">
        <div className="fb-container fb-profile-header">
          
          <div className="fb-profile-header__left">
            {/* AVATAR TRÒN BỰ ĐÈ LÊN CẠNH ĐÁY ẢNH NỀN */}
            <div className="fb-avatar-container">
              <div className="fb-avatar-ring">
                {selectedAvatar ? (
                  <img src={selectedAvatar} alt="avatar" className="fb-avatar-img" />
                ) : (
                  <div className="fb-avatar-fallback">
                    {getAvatarLetter(displayName)}
                  </div>
                )}
              </div>

              {/* ICON ĐỔI AVATAR (MÁY ẢNH) ĐÈ LÊN AVATAR - MÀU TỐI THEME WEB */}
              <button
                type="button"
                className="fb-camera-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Thay đổi ảnh đại diện"
                aria-label="Thay đổi ảnh đại diện"
              >
                <FaCamera className="camera-icon" />
              </button>

              {/* Hidden file input */}
              <input 
                id="avatar-file-input"
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: "none" }}
              />
            </div>

            {/* THÔNG TIN: TÊN USER, VAI TRÒ THÀNH VIÊN & TÊN ĐĂNG NHẬP */}
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
              </div>

              <div className="fb-user-meta">
                {/* TÊN ĐĂNG NHẬP */}
                <div className="fb-meta-item fb-username-item" title="Tên đăng nhập tài khoản">
                  <span className="meta-at">@</span>
                  <span className="meta-text">{displayUsername}</span>
                </div>

                <span className="fb-meta-dot">•</span>

                {/* THÀNH VIÊN / QUẢN TRỊ VIÊN (SỬ DỤNG CLASS RIÊNG GỌN GÀNG, KHÔNG DÙNG NAKED ADMIN) */}
                <span className={`fb-role-badge ${isAdmin ? "fb-role-badge--admin" : "fb-role-badge--member"}`}>
                  {isAdmin ? (
                    <>
                      <FaShieldAlt className="role-icon" />
                      <span>Quản trị viên</span>
                    </>
                  ) : (
                    <>
                      <FaUserCheck className="role-icon" />
                      <span>Thành viên</span>
                    </>
                  )}
                </span>
              </div>

              {avatarFile && (
                <div className="fb-avatar-pending-tag">
                  <FaCheck className="icon" />
                  <span>Đã chọn ảnh: <strong>{avatarFile.name.length > 25 ? `${avatarFile.name.slice(0, 22)}...` : avatarFile.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* NÚT THAO TÁC BÊN PHẢI HEADER */}
          <div className="fb-profile-header__actions">
            {isChanged && (
              <button 
                type="button" 
                onClick={handleReset} 
                className="fb-action-btn fb-action-btn--reset"
                title="Hủy các thay đổi chưa lưu"
              >
                <FaUndoAlt className="icon" />
                <span>Hoàn tác</span>
              </button>
            )}

            <button 
              type="button" 
              onClick={handleUpdate} 
              disabled={!isChanged}
              className={`fb-action-btn fb-action-btn--save ${isChanged ? "active" : ""}`}
            >
              <FaCheck className="icon" />
              <span>{isChanged ? "Lưu thay đổi" : "Đã cập nhật"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= FACEBOOK STYLE TABS NAV BAR (FULL WIDTH) ================= */}
      <div className="fb-nav-tabs-bar">
        <div className="fb-container fb-nav-tabs">
          <button 
            type="button"
            className={`fb-tab-btn ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <FaPenToSquare className="tab-icon" />
            <span>Chỉnh sửa hồ sơ</span>
          </button>

          <button 
            type="button"
            className={`fb-tab-btn ${activeTab === "avatars" ? "active" : ""}`}
            onClick={() => setActiveTab("avatars")}
          >
            <FaImages className="tab-icon" />
            <span>Kho avatar ({avatarList.length})</span>
          </button>

          <button 
            type="button"
            className={`fb-tab-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <FaIdCard className="tab-icon" />
            <span>Thông tin tài khoản</span>
          </button>
        </div>
      </div>

      {/* ================= TAB CONTENTS (FULL PAGE WIDTH CONTAINER) ================= */}
      <div className="fb-content-wrap">
        <div className="fb-container">
          
          {/* ================= TAB 1: CHỈNH SỬA HỒ SƠ ================= */}
          {activeTab === "edit" && (
            <div className="fb-tab-content">
              
              {/* LƯU Ý VĂN MINH */}
              <div className="fb-notice-box">
                <FaExclamationTriangle className="notice-icon" />
                <div className="notice-text">
                  <strong>Quy định đặt tên:</strong> Nghiêm cấm tuyệt đối việc sử dụng ngôn từ bậy bạ, phản cảm hoặc liên quan đến nội dung 18+!
                </div>
              </div>

              <div className="fb-form-grid">
                {/* CỘT TRÁI: ĐỔI TÊN & TÊN ĐĂNG NHẬP */}
                <div className="fb-form-col">
                  <div className="fb-field-group">
                    <label htmlFor="fb-display-name">
                      <FaUser className="field-icon" />
                      <span>Tên hiển thị mới</span>
                    </label>
                    <div className="fb-input-wrap">
                      <input 
                        id="fb-display-name"
                        type="text"
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Nhập tên hiển thị bạn muốn..." 
                        maxLength={40}
                      />
                      <span className="char-count">{name.length}/40</span>
                    </div>
                    <span className="field-desc">Tên này sẽ hiển thị công khai khi bạn bình luận và tương tác trên website.</span>
                  </div>

                  <div className="fb-field-group">
                    <label>
                      <FaLock className="field-icon" />
                      <span>Tên đăng nhập (Cố định)</span>
                    </label>
                    <div className="fb-input-wrap fb-input-wrap--disabled">
                      <input 
                        type="text" 
                        value={`@${displayUsername}`} 
                        disabled 
                        readOnly 
                      />
                      <span className="locked-badge"><FaLock /> Cố định</span>
                    </div>
                    <span className="field-desc">Tên đăng nhập dùng để xác thực hệ thống và không thể thay đổi.</span>
                  </div>
                </div>

                {/* CỘT PHẢI: UPLOAD ẢNH TỪ MÁY */}
                <div className="fb-form-col">
                  <div className="fb-field-group">
                    <label>
                      <FaCamera className="field-icon" />
                      <span>Tải ảnh đại diện từ thiết bị</span>
                    </label>
                    
                    <div 
                      className="fb-upload-dropzone" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="dropzone-icon-ring">
                        <FaCloudArrowUp className="dropzone-icon" />
                      </div>
                      <div className="dropzone-title">
                        {avatarFile ? `Đang chọn: ${avatarFile.name}` : "Nhấn để chọn ảnh mới từ máy"}
                      </div>
                      <div className="dropzone-subtitle">
                        Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Khuyến nghị ảnh vuông)
                      </div>
                    </div>
                  </div>

                  {/* GỢI Ý KHO AVATAR NHANH */}
                  <div className="fb-quick-avatars">
                    <div className="quick-avatars-header">
                      <span>Hoặc chọn nhanh avatar mẫu:</span>
                      <button 
                        type="button" 
                        className="view-all-link"
                        onClick={() => setActiveTab("avatars")}
                      >
                        Xem toàn bộ ({avatarList.length}) →
                      </button>
                    </div>
                    <div className="quick-avatars-row">
                      {avatarList.slice(0, 6).map((img, idx) => (
                        <div 
                          key={idx}
                          className={`quick-avatar-item ${selectedAvatar === img ? "active" : ""}`}
                          onClick={() => handleSelectSampleAvatar(img)}
                        >
                          <img src={img} alt="sample" loading="lazy" />
                          {selectedAvatar === img && <span className="item-check"><FaCheck /></span>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="fb-form-footer">
                <button 
                  type="button"
                  onClick={handleUpdate} 
                  disabled={!isChanged} 
                  className={`fb-submit-btn ${isChanged ? "active" : ""}`}
                >
                  <FaCheck className="icon" />
                  <span>{isChanged ? "Lưu thông tin hồ sơ" : "Chưa có thay đổi để lưu"}</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= TAB 2: KHO AVATAR MẪU ================= */}
          {activeTab === "avatars" && (
            <div className="fb-tab-content">
              <div className="fb-avatars-intro">
                <h3>Kho Ảnh Đại Diện Có Sẵn</h3>
                <p>Chọn một hình ảnh yêu thích bên dưới để làm ảnh đại diện của bạn.</p>
              </div>

              <div className="fb-avatars-grid">
                {displayedAvatars.map((img, index) => (
                  <div
                    key={index}
                    className={`fb-avatar-tile ${selectedAvatar === img ? "active" : ""}`}
                    onClick={() => handleSelectSampleAvatar(img)}
                    title="Nhấn để chọn ảnh này"
                  >
                    <img src={img} alt={`avatar-${index}`} loading="lazy" />
                    {selectedAvatar === img && (
                      <div className="tile-check-overlay">
                        <FaCheck className="check-icon" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {avatarList.length > PREVIEW_COUNT && (
                <div className="fb-avatars-toggle">
                  <button 
                    type="button"
                    className="fb-toggle-btn"
                    onClick={() => setShowAllAvatars(!showAllAvatars)}
                  >
                    {showAllAvatars 
                      ? "Thu gọn danh sách ▲" 
                      : `Xem thêm toàn bộ (${avatarList.length - PREVIEW_COUNT}+ ảnh khác) ▼`}
                  </button>
                </div>
              )}

              {isChanged && (
                <div className="fb-floating-save-bar">
                  <span>Bạn vừa chọn một avatar mới!</span>
                  <button 
                    type="button" 
                    onClick={handleUpdate} 
                    className="bar-save-btn"
                  >
                    <FaCheck className="icon" /> Lưu ngay
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: THÔNG TIN TÀI KHOẢN ================= */}
          {activeTab === "account" && (
            <div className="fb-tab-content">
              <div className="fb-account-summary">
                
                <div className="summary-card">
                  <div className="summary-card__icon">
                    <FaUser className="icon" />
                  </div>
                  <div className="summary-card__info">
                    <span className="summary-label">Tên hiển thị</span>
                    <span className="summary-value">{displayName}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-card__icon">
                    <FaIdCard className="icon" />
                  </div>
                  <div className="summary-card__info">
                    <span className="summary-label">Tên đăng nhập</span>
                    <span className="summary-value">@{displayUsername}</span>
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-card__icon">
                    <FaShieldAlt className="icon" />
                  </div>
                  <div className="summary-card__info">
                    <span className="summary-label">Cấp bậc</span>
                    <span className={`summary-value fb-role-${isAdmin ? "admin" : "member"}`}>
                      {isAdmin ? "Quản trị viên hệ thống" : "Thành viên chính thức"}
                    </span>
                  </div>
                </div>

                {original?.created_at && (
                  <div className="summary-card">
                    <div className="summary-card__icon">
                      <FaCalendarAlt className="icon" />
                    </div>
                    <div className="summary-card__info">
                      <span className="summary-label">Ngày gia nhập</span>
                      <span className="summary-value">
                        {new Date(original.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}