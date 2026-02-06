// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";


const UsingAppIos = () => {

    return(
        <>
            <div className="using-app">
                <Tabbar />
                <div className="using-app__main">
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 1</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1770387498/z7508976666833_2ecc3ec659ef54a24521e8e631f2906c_xme4cw.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Đầu tiên truy cập vào trang web.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 2</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1770388263/z7509022877831_b6262b0d937936bb5aed4e672508390c_noiyza.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Bạn sẽ thấy dấu 3 chấm ở góc phải màn hình. Sau đó click vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 3</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1770388263/z7509022882940_0992d7ced677dcc928f60da07b571fa8_txuzzi.jpg" alt="hướng dẫn" loading="lazy" />
                        <i className="using-app-desc">Sau khi click vào thì sẽ hiện ra 1 box như thế này. Hãy click vào chữ "Chia sẻ".</i>
                        </div>                
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 4</h3>
                        <div className="using-app__main-content">
                            <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1770388263/z7509022892114_f323dc4f6a83299ece741f89ceaf5422_gsqcac.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Hãy kéo lên bạn sẽ thấy 1 ô như này sẽ xuất hiện trên màn hình. Cuối cùng chỉ cần click "Thêm vào màn hình chính".</i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default UsingAppIos;