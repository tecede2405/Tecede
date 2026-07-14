import { FaAndroid, FaShieldAlt, FaBolt, FaCloudDownloadAlt, FaCheckCircle } from "react-icons/fa";
import { MdPhoneAndroid } from "react-icons/md";
import Swal from "sweetalert2";
import "./style.scss";

const APK_DOWNLOAD_URL = "https://docs.google.com/uc?export=download&id=1Nmwsij9uWjkkhh7v-Ta4XGrOMwF2aY2R";

function DownloadApp() {
  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#3ddc84",
    cancelButtonColor: "#444",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    }
  });

  const handleDownload = () => {
    DarkSwal.fire({
      title: 'Bạn có chắc chắn muốn tải?',
      text: "File APK sẽ được tải xuống thiết bị của bạn.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Vẫn tải xuống',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        // Sử dụng iframe ẩn để tải ngầm, tránh bị trình duyệt chuyển hướng (navigate) sang trang khác
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = APK_DOWNLOAD_URL;
        document.body.appendChild(iframe);
        
        // Dọn dẹp iframe sau khi đã bắt đầu tải
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }
    });
  };

  const features = [
    { icon: <FaBolt />, title: "Tiện lợi", desc: "Dễ dàng sử dụng, không cần đăng ký" },
    { icon: <FaShieldAlt />, title: "An toàn", desc: "Không quảng cáo, không mã độc" },
    { icon: <MdPhoneAndroid />, title: "Giao diện web", desc: "Trải nghiệm tương tự như trên trình duyệt" },
  ];

  return (
    <div className="download-page">
      {/* Hero */}
      <div className="download-hero">
        <div className="download-hero__glow" />
        <div className="download-hero__content">
          <div className="download-hero__icon">
            <FaAndroid />
          </div>
          <h1 className="download-hero__title">Tải App Tecede</h1>
          <p className="download-hero__subtitle">
            Trải nghiệm xem phim mượt mà trên điện thoại Android của bạn
          </p>

          <div className="download-hero__badge">
            <FaCheckCircle /> File APK • Android
          </div>

          <button className="download-hero__btn" onClick={handleDownload}>
            <FaCloudDownloadAlt className="btn-icon" />
            <span>Tải ngay</span>
          </button>

          <p className="download-hero__note">
            Phiên bản mới nhất • Miễn phí hoàn toàn
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="download-features">
        <h2 className="download-features__title">Tính năng nổi bật</h2>
        <div className="download-features__grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="download-instructions">
        <h2 className="download-instructions__title">Hướng dẫn cài đặt</h2>
        <div className="download-instructions__steps">
          <div className="step-card">
            <div className="step-card__number">1</div>
            <p>Bấm nút <strong>"Tải ngay"</strong> ở trên để tải file APK về máy</p>
          </div>
          <div className="step-card">
            <div className="step-card__number">2</div>
            <p>Mở file APK vừa tải, nếu hệ thống hỏi quyền cài đặt hãy chọn <strong>"Cho phép"</strong></p>
          </div>
          <div className="step-card">
            <div className="step-card__number">3</div>
            <p>Đợi cài đặt hoàn tất rồi mở app và <strong>tận hưởng</strong> thôi nào!</p>
          </div>
        </div>
      </div>

      {/* CTA bottom */}
      <div className="download-cta">
        <button className="download-cta__btn" onClick={handleDownload}>
          <FaCloudDownloadAlt className="btn-icon" />
          Tải ứng dụng ngay
        </button>
      </div>
    </div>
  );
}

export default DownloadApp;
