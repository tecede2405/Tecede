// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";


const UsingApp = () => {

    return(
        <>
            <div className="using-app">
                <Tabbar />
                <div className="using-app__main">
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 1</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493804/z7508976666833_2ecc3ec659ef54a24521e8e631f2906c_xme4cw_qypyyl.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Đầu tiên truy cập vào trang web.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 2</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493868/1751738997818_terjem_qxn1vv.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Bạn sẽ thấy dấu 3 chấm ở góc phải màn hình. Sau đó click vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 3</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493881/z7508976676606_6d4e6d1a8c22c8bc63ce7c6827bc18d5_fipamz_vmbtpg.jpg" alt="hướng dẫn" loading="lazy" />
                        <i className="using-app-desc">Sau khi click vào thì sẽ hiện ra 1 box như thế này. Hãy click vào chữ "Thêm vào màn hình chính".</i>
                        </div>                
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 4</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493917/1751739073073_un9yhr_nfdpuw.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">1 ô như này sẽ xuất hiện trên màn hình. Cuối cùng chỉ cần click "Cài đặt"</i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default UsingApp;