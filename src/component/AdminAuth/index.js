import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../component/ShowForm/showForm";
import Swal from "sweetalert2";

export default function HeaderAuth() {
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
  }, []);

  const handleClick = () => {
    if (isLoggedIn) {
      setShowDropdown((prev) => !prev);
    } else {
      setShowForm(true);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      
      {/* BUTTON */}
      <span
        className="menu__page"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        {isLoggedIn ? "Tài khoản" : "Quản lý admin"}
      </span>

      {/* LOGIN */}
      {showForm && (
        <LoginForm
          onClose={() => setShowForm(false)}
          onLoginSuccess={() => {
            localStorage.setItem("isLoggedIn", "true");
            setIsLoggedIn(true);
            setShowForm(false);
          }}
        />
      )}

      {/* DROPDOWN */}
      {showDropdown && (
        <div
          style={{
            position: "absolute",
            right: -200,
            bottom: "110%",
            width: 200,
            background: "#1c1c1c",
            borderRadius: 10,
            padding: 10,
            zIndex: 1000,
            boxShadow: "0 5px 20px rgba(0,0,0,0.5)",
            border: "1px solid #333",
          }}
        >
          {/* admin */}
          <button
            onClick={() => {
              navigate("/admin");
              setShowDropdown(false);
            }}
            style={btn}
          >
            Trang admin
          </button>

          {/* logout */}
          <button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              setIsLoggedIn(false);
              setShowDropdown(false);

              Swal.fire({
                icon: "success",
                title: "Đăng xuất thành công",
                timer: 1200,
                showConfirmButton: false,
              }).then(() => navigate("/"));
            }}
            style={{ ...btn, background: "#e50914" }}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

const btn = {
  width: "100%",
  padding: "8px",
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginBottom: 6,
};