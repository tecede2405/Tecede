import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import avatarList from "../../data/avatarList";
import Swal from "sweetalert2";
import "./style.scss";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [original, setOriginal] = useState(null);
  
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

  // load user
  useEffect(() => {
  if (!user?.token) {
    setLoading(false);
    return;
  }

  const fetchMe = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
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
      title: "Đang cập nhật...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/users`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        display_name: name,
        avatar: selectedAvatar,
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

    setUser((prev) => ({
      ...prev,
      ...data.user,
    }));

    setOriginal(data.user);

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
      title: "Lỗi hệ thống",
      text: "Không thể cập nhật. Vui lòng thử lại!",
    });
  }
};

  const isChanged =
    name !== (original?.display_name || "") ||
    selectedAvatar !== (original?.avatar || "");

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="profile-page">
    <h2 className="text-center">Chỉnh sửa thông tin</h2>
    <p className="text-center fst-italic">Nghiêm cấm tuyệt đối việc đổi tên bậy bạ hoặc liên quan đến 18+!!</p>
  {/* Avatar preview */}
  <div className="profile-page__avatar-preview">
    {selectedAvatar ? (
      <img src={selectedAvatar} alt="avatar" />
    ) : (
      <div className="fallback">
        {name?.charAt(0)?.toUpperCase() || "U"}
      </div>
    )}
  </div>

  {/* Name */}
  <div className="profile-page__field">
    <label>Tên hiển thị</label>
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  </div>

  {/* Avatar list */}
  <div className="profile-page__field">
    <label>Chọn avatar</label>

    <div className="profile-page__avatar-list">
      {avatarList.map((img) => (
        <img
          key={img}
          src={img}
          alt="avatar-option"
          onClick={() => setSelectedAvatar(img)}
          className={selectedAvatar === img ? "active" : ""}
        />
      ))}
    </div>
  </div>

  {/* Button */}
  <button
    onClick={handleUpdate}
    disabled={!isChanged}
    className={`profile-page__btn ${isChanged ? "active" : ""}`}
  >
    Cập nhật
  </button>
</div>
  );
}