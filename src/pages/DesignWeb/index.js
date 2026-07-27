import { FaCheckCircle, FaRocket, FaMobileAlt, FaSearchDollar, FaHeadset, FaFacebookMessenger } from "react-icons/fa";
import { BsCodeSlash } from "react-icons/bs";
import "./style.scss";

const FANPAGE_URL = "https://www.facebook.com/profile.php?id=100084710083595";

function DesignWeb() {
  const handleContact = () => {
    window.open(FANPAGE_URL, "_blank");
  };

  return (
    <div className="design-web-page">
      {/* HERO SECTION */}
      <div className="dw-hero">
        <div className="dw-hero__bg-glow"></div>
        <div className="dw-hero__content">
          <div className="dw-hero__badge">
            <BsCodeSlash /> Dịch vụ làm web online uy tín
          </div>
          <h1 className="dw-hero__title">
            Thiết Kế Website Đẹp - Tốc Độ - <span>Tối Ưu</span>
          </h1>
          <p className="dw-hero__subtitle">
            Khởi tạo sự hiện diện trực tuyến mạnh mẽ cho cá nhân hoặc doanh nghiệp của bạn với các giải pháp website tùy chỉnh, chi phí hợp lý.
          </p>
          <button className="dw-btn dw-btn--primary" onClick={handleContact}>
            <FaFacebookMessenger className="dw-btn-icon" />
            Nhận Báo Giá & Tư Vấn Miễn Phí
          </button>
        </div>
      </div>

      {/* PRICING SECTION */}
      <div className="dw-pricing">
        <div className="dw-section-header">
          <h2>Bảng Giá Dịch Vụ</h2>
          <p>Lựa chọn gói thiết kế phù hợp với nhu cầu và ngân sách của bạn</p>
        </div>

        <div className="dw-pricing__grid">
          {/* GÓI CƠ BẢN */}
          <div className="dw-pricing-card">
            <div className="dw-pricing-card__header">
              <h3>Gói Cơ Bản</h3>
              <div className="dw-pricing-card__price">
                Từ <span>500.000</span> - <span>1.500.000</span> đ
              </div>
              <p className="dw-pricing-card__desc">Giải pháp nhanh gọn, tiết kiệm chi phí cho nhu cầu hiện diện cơ bản.</p>
            </div>
            <div className="dw-pricing-card__body">
              <ul>
                <li><FaCheckCircle className="check-icon" /> Landing Page đơn giản, Web giới thiệu bán hàng nhỏ,...</li>
                <li><FaCheckCircle className="check-icon" /> Hồ sơ cá nhân (Portfolio/CV Online)</li>
                <li><FaCheckCircle className="check-icon" /> Giao diện Responsive (Mượt trên Mobile)</li>
                <li><FaCheckCircle className="check-icon" /> Demo dự án theo từng giai đoạn</li>
                <li><FaCheckCircle className="check-icon" /> Bàn giao mã nguồn nhanh chóng</li>
                <li><FaCheckCircle className="check-icon" /> Bảo hành hỗ trợ kỹ thuật 12 tháng</li>
              </ul>
            </div>
            <div className="dw-pricing-card__footer">
              <button className="dw-btn dw-btn--outline" onClick={handleContact}>Liên hệ Fanpage để được tư vấn</button>
            </div>
          </div>

          {/* GÓI NÂNG CAO */}
          <div className="dw-pricing-card dw-pricing-card--popular">
            <div className="dw-popular-badge">Được chọn nhiều nhất</div>
            <div className="dw-pricing-card__header">
              <h3>Gói Cao Cấp</h3>
              <div className="dw-pricing-card__price">
                Từ <span>2.000.000</span> - <span>5.000.000</span> đ
              </div>
              <p className="dw-pricing-card__desc">Xây dựng hệ thống quy mô lớn, thương mại điện tử, ứng dụng web phức tạp.</p>
            </div>
            <div className="dw-pricing-card__body">
              <ul>
                <li><FaCheckCircle className="check-icon" /> Website bán hàng (E-commerce) đa năng,...</li>
                <li><FaCheckCircle className="check-icon" /> Quản trị viên (Admin Panel) chuyên sâu</li>
                <li><FaCheckCircle className="check-icon" /> Tối ưu chuẩn SEO & Bảo mật nâng cao</li>
                <li><FaCheckCircle className="check-icon" /> Giao diện Responsive (Mượt trên Mobile)</li>
                <li><FaCheckCircle className="check-icon" /> Demo dự án theo từng giai đoạn</li>
                <li><FaCheckCircle className="check-icon" /> Bàn giao mã nguồn nhanh chóng</li>
                <li><FaCheckCircle className="check-icon" /> Bảo hành hỗ trợ kỹ thuật 24 tháng</li>
              </ul>
            </div>
            <div className="dw-pricing-card__footer">
              <button className="dw-btn dw-btn--primary" onClick={handleContact}>Liên hệ Fanpage để được tư vấn</button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES / LỢI ÍCH */}
      <div className="dw-features">
        <div className="dw-section-header">
          <h2>Vì Sao Chọn Chúng Tôi?</h2>
          <p>Cam kết mang lại chất lượng sản phẩm tốt nhất cho dự án của bạn</p>
        </div>
        <div className="dw-features__grid">
          <div className="dw-feature-item">
            <div className="dw-feature-item__icon"><FaRocket /></div>
            <h3>Tốc Độ Tải Trang Siêu Nhanh</h3>
            <p>Ứng dụng công nghệ ReactJS/NextJS hiện đại, loại bỏ độ trễ, tối ưu trải nghiệm người dùng.</p>
          </div>
          <div className="dw-feature-item">
            <div className="dw-feature-item__icon"><FaSearchDollar /></div>
            <h3>Chuẩn SEO Google</h3>
            <p>Cấu trúc website tối ưu hóa công cụ tìm kiếm, giúp bạn dễ dàng leo top Google hơn.</p>
          </div>
          <div className="dw-feature-item">
            <div className="dw-feature-item__icon"><FaMobileAlt /></div>
            <h3>Hiển Thị Tốt Trên Mọi Thiết Bị</h3>
            <p>Giao diện tự động co giãn đẹp mắt trên cả PC, Tablet và đặc biệt là Mobile.</p>
          </div>
          <div className="dw-feature-item">
            <div className="dw-feature-item__icon"><FaHeadset /></div>
            <h3>Hỗ Trợ Tận Tâm</h3>
            <p>Bảo hành code dài hạn, sẵn sàng hỗ trợ kỹ thuật và giải đáp thắc mắc khi nhận được yêu cầu.</p>
          </div>
        </div>
      </div>


    </div>
  );
}

export default DesignWeb;
