import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios"; 
import avatarList from "../../data/avatarList"; 
import Swal from "sweetalert2";
import { FaCloudArrowUp } from "react-icons/fa6"; // Thêm icon đám mây cho đẹp mắt
import "./style.scss";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(""); 
  const [avatarFile, setAvatarFile] = useState(null);       
  const [original, setOriginal] = useState(null);
  const PREVIEW_COUNT = 8;
  const [showAllAvatars, setShowAllAvatars] = useState(false);

  const displayedAvatars = showAllAvatars
    ? avatarList
    : avatarList.slice(0, PREVIEW_COUNT);

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
    }
  });

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
        console.log(err);
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
        text: "Hệ thống chỉ chấp nhận file Hình ảnh thôi nhé!",
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
        title: "Đang xử lý...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let finalAvatarUrl = selectedAvatar;

      // Nếu có file mới từ máy -> Upload qua router storage cũ
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
          finalAvatarUrl = `${process.env.REACT_APP_API_URL}/api/storage/file/${savedFile._id}`;
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
        title: "Thành công",
        text: "Cập nhật thông tin thành công!",
        timer: 1500,
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

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="profile-page">
      <h2 className="text-center">Chỉnh sửa thông tin</h2>
      <p className="text-center fst-italic">Nghiêm cấm tuyệt đối việc đổi tên bậy bạ hoặc liên quan đến 18+!!</p>
      
      {/* Vòng tròn xem trước Avatar hiện tại */}
      <div className="profile-page__avatar-view">
        {selectedAvatar ? (
          <img src={selectedAvatar} alt="avatar" />
        ) : (
          <div className="fallback">
            {name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>

      {/* Ô nhập tên */}
      <div className="profile-page__field">
        <label>Tên hiển thị</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên hiển thị mới..." />
      </div>

      {/* 🔥 Ô INPUT CHỌN ẢNH ĐƯỢC CUSTOM LẠI ĐẸP MẮT */}
      <div className="profile-page__field">
        <label>Tải ảnh mới từ thiết bị</label>
        <div className="custom-file-upload">
          <label htmlFor="avatar-upload" className="upload-btn-styled">
            <FaCloudArrowUp className="icon" />
            {avatarFile ? `Đang chọn: ${avatarFile.name.substring(0, 20)}...` : "Chọn file ảnh từ máy"}
          </label>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
      </div>

      {/* Danh sách ảnh mẫu mẫu */}
      <div className="profile-page__field">
        <label>Hoặc chọn ảnh đại diện có sẵn</label>
        <div className="profile-page__avatar-list">
          {displayedAvatars.map((img) => (
            <img
              key={img}
              src={img}
              alt="avatar-option"
              onClick={() => handleSelectSampleAvatar(img)}
              className={selectedAvatar === img ? "active" : ""}
            />
          ))}
          {avatarList.length > PREVIEW_COUNT && (
            <div
              className="profile-page__show-more"
              onClick={() => setShowAllAvatars(!showAllAvatars)}
            >
              {showAllAvatars ? "Thu gọn ▲" : `Xem thêm (${avatarList.length - PREVIEW_COUNT}+ ảnh) ▼`}
            </div>
          )}
        </div>
      </div>

      {/* Nút Cập nhật */}
      <button onClick={handleUpdate} disabled={!isChanged} className={`profile-page__btn ${isChanged ? "active" : ""}`}>
        Cập nhật thông tin
      </button>
    </div>
  );
}