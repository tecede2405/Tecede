import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Film,
  Music,
  ListMusic,
  HeartHandshake,
  ChevronDown,
  Clapperboard
} from "lucide-react";
import { FaUpload} from "react-icons/fa";
import { CiFileOn } from "react-icons/ci";
import Tabbar from "../../component/tabar";
import "./admin.scss";

function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { path: "/admin", label: "Tổng quan", icon: LayoutDashboard },
    { path: "/admin/users", label: "Người dùng", icon: Users },
    { path: "/admin/manage-movie", label: "Sửa Movie", icon: Clapperboard },
    { path: "/admin/add-film", label: "Thêm phim", icon: Film },
    { path: "/admin/add-song", label: "Thêm bài hát", icon: Music },
    { path: "/admin/manage", label: "Quản lý bài hát", icon: ListMusic },
    { path: "/admin/donate", label: "Donate", icon: HeartHandshake },
    { path: "/admin/upload-file", label: "Upload File", icon: FaUpload  },
    { path: "/admin/gallery", label: "Gallery", icon: CiFileOn },
  ];

  // Tìm item hiện tại dựa trên url để hiển thị nhãn trên nút Dropdown mobile
  const currentItem = navItems.find(item => item.path === location.pathname) || navItems[0];
  const CurrentIcon = currentItem.icon;

  // Lắng nghe sự kiện click ngoài vùng dropdown để đóng menu tự động
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMobileNav = (path) => {
    navigate(path);
    setIsDropdownOpen(false); // Đóng menu sau khi điều hướng thành công
  };

  return (
    <div className="admin">
      <div className="tabbar-container">
        <Tabbar />
      </div>

      <div className="admin-layout">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <h2>Dash Board</h2>
            <p>Hệ thống quản lý nội dung</p>
          </div>

          {/* Desktop + Tablet Nav (Giữ nguyên cấu trúc thanh ngang mượt mà) */}
          <div className="admin-topbar-nav desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    isActive ? "topbar-link active" : "topbar-link"
                  }
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile Nav Custom UI - Thay thế cho Select Box cũ */}
          <div className="mobile-nav-custom" ref={dropdownRef}>
            <button 
              className={`dropdown-toggle-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="toggle-left-content">
                <CurrentIcon size={18} />
                <span>{currentItem.label}</span>
              </div>
              <ChevronDown size={16} className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="dropdown-menu-list">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = location.pathname === item.path;
                  return (
                    <div
                      key={item.path}
                      className={`dropdown-menu-item item-color-${index + 1} ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleMobileNav(item.path)}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Nội dung các trang con (Overview, Users...) */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Admin;