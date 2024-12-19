import logo from '../../img/home-image.png';
import {NavLink, Outlet } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import './layout.scss';
function Layout(){
    return (
        <>
            <header className="header">
                <div className="header__logo">
                    <FaBars className="header__fabar" />
                    <a href="https://www.facebook.com/profile.php?id=100084710083595" target="_blank" >
                    <img src={logo} alt="logo-Page" className="header__image"/>
                    </a>
                </div>

                <div className="header__menu">
                    <ul>
                        <li>
                            <NavLink to="/" className="menu__page">
                                Trang Chủ 
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="about" className="menu__page">
                                Về chúng tôi 
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="contact" className="menu__page">
                                Liên hệ 
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </header>
            <div className="layout-main">
                <Outlet />
            </div>

            <footer>
                <p> <strong> &copy; Copyright @2024 by Tecede. All right reserved </strong></p>
            </footer>
        </>
    )
}

export default Layout;