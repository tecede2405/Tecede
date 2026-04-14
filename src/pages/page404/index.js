
  import { useEffect, useState } from "react";
  import "./style.scss";

  function NotFound() {

    const [show, setShow] = useState(false);

    useEffect(() => {
      // delay để tạo hiệu ứng
      setTimeout(() => setShow(true), 200);
    }, []);

    const handleGoHome = () => {
      window.location.href = "/"; // reload + về trang chủ
    };

    if (!show) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h2>Xin Lỗi Vì Sự Bất Tiện Này</h2>
          <p>
             hãy quay lại trang chủ để reload lại trang nhé!
          </p>

          <button onClick={handleGoHome}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  export default NotFound;