import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./style.scss";
import { useAuth } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
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
    
    if (!username || !password) {
      DarkSwal.fire({
      icon: "warning",
      title: "Thiếu thông tin",
      text: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
    });
      return;
    }
    
    try {
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        login({
          ...data.user,
          token: data.token
        });

        await DarkSwal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        text: "Chúc bạn xem phim vui vẻ!",
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
        <title>Đăng nhập - Tecede</title>
      </Helmet>
      <div className="login-overlay" />

      <div className="login-container">
        <div className="login-header">
          <img
            src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png"
            alt="logo"
          />
          <h2>Đăng nhập</h2>
        </div>

        <form onSubmit={handleSubmit}>
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

          <button type="submit">Đăng nhập</button>
        </form>

        <p className="login-register">
          Chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký</span>
        </p>
      </div>
    </div>
  );
}