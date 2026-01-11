// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";


const AdminFeature = () => {

    return(
        <>
            <div className="using-app">
                <Tabbar />
                <div className="using-app__main">
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 1</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751795780/1751738898401_edliti.jpg" alt="hướng dẫn" />
                            <i className="using-app-desc">Đầu tiên truy cập vào trang web này hoặc 1 trang bạn hay vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 2</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751795780/1751738997818_terjem.jpg" alt="hướng dẫn" />
                            <i className="using-app-desc">Bạn sẽ thấy dấu 3 chấm ở góc phải màn hình ( android ). Sau đó click vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 3</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751795780/1751739026152_yarhvm.jpg" alt="hướng dẫn" />
                        <i className="using-app-desc">Sau khi click vào thì sẽ hiện ra 1 box như thế này. Hãy click vào chữ "Thêm vào màn hình chính"</i>
                        </div>                
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 4</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751795780/1751739073073_un9yhr.jpg" alt="hướng dẫn" />
                            <i className="using-app-desc">1 ô như này sẽ xuất hiện trên màn hình. Cuối cùng chỉ cần click "Cài đặt"</i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default AdminFeature;