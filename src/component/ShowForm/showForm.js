import "./LoginForm.scss";
import { useState} from "react";
import { useNavigate } from "react-router-dom";
import logoPage from '../../img/home-image.png';
import Loading from '../../component/Loading/index';

export default function LoginForm({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://api-music-production-1ad8.up.railway.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

     if (data.message) {
        setMessage("✅ Đăng nhập thành công");

        localStorage.setItem("isLoggedIn", "true");
        //  Chờ 3 giây để hiện loading, sau đó chuyển trang
        setTimeout(() => {
          onClose();         // Ẩn form login
          navigate("/admin");
        }, 3000);
      } else {
        setMessage("❌ " + (data.error || "Đăng nhập thất bại"));
        setLoading(false); // Dừng loading nếu sai
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server!");
      setLoading(false);
    }
  };

  
 return (
  <>
    {loading && <Loading />}
    {!loading && (
      <div className="overlay">
        <div className="form-container">
          <button className="close-btn" onClick={onClose}>×</button>
          <form onSubmit={handleSubmit}>
            <div className="login-title">
              <img src={logoPage} alt="logo-page" className="logo-login" />
              <h3>Đăng nhập Admin</h3>
            </div>

            <div className="mb-3">
              <label>Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tài khoản"
              />
            </div>

            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
              />
            </div>

            <button type="submit" className="btn-login">Đăng nhập</button>

            {message && (
              <p style={{ color: message.includes("✅") ? "green" : "red" }}>{message}</p>
            )}
          </form>
        </div>
      </div>
    )}
  </>
);

}
