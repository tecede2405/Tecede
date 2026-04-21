import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import "./style.scss";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const navigate = useNavigate();

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
    
  const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();
  const cleanDisplayName = displayName.trim();

  if (!cleanUsername || !cleanPassword || !cleanDisplayName) {
    await DarkSwal.fire({
      icon: "warning",
      title: "Thiếu thông tin",
      text: "Vui lòng nhập đầy đủ!",
    });
    return;
  }

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
          text: "Hãy đăng nhập để tiếp tục!",
          timer: 1500,
          showConfirmButton: false,
        });

        navigate("/login");
      } else {
        throw new Error(data?.message || "Đăng ký thất bại");
      }
    } catch (err) {
      await DarkSwal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message,
      });
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage:
          "url(https://assets.nflxext.com/ffe/siteui/vlv3/e393bb3f-261f-43d1-99bb-16a157885615/web/VN-vi-20260105-TRIFECTA-perspective_ec5c484f-840e-4d19-9f35-b9e6a0eef2c7_medium.jpg)",
      }}
    >
      <Helmet>
        <title>Đăng ký - Tecede</title>
      </Helmet>
      <div className="login-overlay" />

     <div className="login-container">
        <div className="login-header">
            <img
            src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png"
            alt="logo"
            />
            <h2>Đăng ký</h2>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="input-group">
            <input
                type="text"
                placeholder=" "
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />
            <label>Tên hiển thị (Biệt danh)</label>
            </div>

            <div className="input-group">
            <input
                type="text"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <label>Tên đăng nhập</label>
            </div>

            <div className="input-group">
            <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <label>Mật khẩu</label>
            </div>

            <button type="submit">Đăng ký</button>
        </form>

        <p className="login-register">
            Đã có tài khoản?{" "}
            <span onClick={() => navigate("/login")}>Đăng nhập</span>
        </p>
        </div>
    </div>
  );
} 