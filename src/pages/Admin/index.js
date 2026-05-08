import { NavLink, Outlet } from "react-router-dom";
import Tabbar from "../../component/tabar";

import "./admin.scss";

function Admin() {
  const navItems = [
    {
      path: "/admin",
      label: "Tổng quan",
    },
    {
    path: "/admin/users",
    label: "Người dùng",
    },
    {
      path: "/admin/add-film",
      label: "Thêm phim",
    },
    {
      path: "/admin/add-song",
      label: "Thêm bài hát",
    },
    {
      path: "/admin/manage",
      label: "Quản lý bài hát",
    },
    {
      path: "/admin/visits",
      label: "Logs truy cập",
    },
  ];

  return (
    <div className="admin">
      <Tabbar />

      <div className="admin-layout">
        {/* TOP NAV */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <h2>Trang Admin</h2>
            <p>Quản lý nội dung hệ thống</p>
          </div>

          <div className="admin-topbar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  isActive
                    ? "topbar-link active"
                    : "topbar-link"
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* ROUTE CONTENT */}
        <Outlet />
      </div>
    </div>
  );
}

export default Admin;