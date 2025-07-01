import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./admin.scss";
function Admin() {

    return (
        <>
           <div className="admin">
                <Tabbar />
                <div className="admin-layout">
                    <p className="admin-desc">Trang admin</p>
                    <nav className="admin-nav">
                        <NavLink to="/admin/add" className="nav-item">Thêm bài hát</NavLink>
                        <NavLink to="/admin/manage" className="nav-item">Quản lý bài hát</NavLink>
                    </nav>
                    <main>
                        <Outlet />
                    </main>
                </div>
           </div>
        </>
    )
}

export default Admin;