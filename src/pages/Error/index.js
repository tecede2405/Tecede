import { useNavigate } from "react-router-dom";
import "./style.scss";

export default function TemporaryClosed404() {
  const navigate = useNavigate();

  return (
    <div className="tc404-wrapper">
      <div className="tc404-overlay"></div>

      <div className="tc404-content">
        <h1 className="tc404-title">404</h1>

        <p className="tc404-desc">
          Xin lỗi, trang nhạc này tạm thời bị đóng trong{" "}
          
          <span className="tc404-highlight">
            18 ngày
          </span>

          {" "}để bảo trì kể từ{" "}

          <span className="tc404-highlight">
            16/5/2026
          </span>
        </p>

        <button
          className="tc404-home-btn"
          onClick={() => navigate("/")}
        >
          <span>Quay lại trang chủ</span>
        </button>
      </div>
    </div>
  );
}