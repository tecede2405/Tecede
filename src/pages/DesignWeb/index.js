import React from "react";
import { FaCheckCircle, FaRocket, FaMobileAlt, FaSearchDollar, FaHeadset, FaFacebookMessenger } from "react-icons/fa";
import { BsCodeSlash } from "react-icons/bs";
import "./style.scss";

const FANPAGE_URL = "https://www.facebook.com/profile.php?id=100084710083595";

const plans = [
  {
    id: "basic",
    label: "Gói Cơ Bản",
    price: "Từ 400.000",
    priceNote: "- 750.000đ",
    desc: "Giải pháp nhanh gọn, tiết kiệm chi phí cho nhu cầu hiện diện cơ bản.",
    badge: null,
    highlight: false,
    features: [
      "Landing Page đơn giản, Web giới thiệu",
      "Hồ sơ cá nhân (Portfolio/CV Online)",
      "Giao diện Responsive (Mượt trên Mobile)",
      "Demo dự án theo từng giai đoạn",
      "Bàn giao mã nguồn nhanh chóng",
      "Bảo hành hỗ trợ kỹ thuật 12 tháng",
    ],
  },
  {
    id: "standard",
    label: "Gói Tiêu Chuẩn",
    price: "Từ 1.000.000",
    priceNote: "- 2.000.000đ",
    desc: "Thiết kế website bán hàng cơ bản, đầy đủ tính năng cho shop vừa và nhỏ.",
    badge: "PHỔ BIẾN",
    highlight: true,
    features: [
      "Website bán hàng (E-commerce) cơ bản",
      "Giỏ hàng & Đặt hàng trực tuyến",
      "Quản trị viên (Admin Panel) dễ sử dụng",
      "Giao diện Responsive (Mượt trên Mobile)",
      "Demo dự án theo từng giai đoạn",
      "Bàn giao mã nguồn nhanh chóng",
      "Bảo hành hỗ trợ kỹ thuật 12 tháng",
    ],
  },
  {
    id: "advanced",
    label: "Gói Cao Cấp",
    price: "Từ 2.000.000",
    priceNote: "- 5.000.000đ",
    desc: "Xây dựng hệ thống bán hàng quy mô lớn, tính năng chuyên sâu và mở rộng.",
    badge: "TOÀN DIỆN",
    highlight: false,
    features: [
      "Website bán hàng đa năng, phức tạp",
      "Tối ưu chuẩn SEO & Bảo mật nâng cao",
      "Quản trị viên (Admin Panel) chuyên sâu",
      "Giao diện Responsive (Mượt trên Mobile)",
      "Demo dự án theo từng giai đoạn",
      "Bàn giao mã nguồn nhanh chóng",
      "Bảo hành hỗ trợ kỹ thuật 24 tháng",
    ],
  },
];

function DesignWeb() {
  const handleContact = () => {
    window.open(FANPAGE_URL, "_blank");
  };

  return (
    <div className="dw-wrapper">
      {/* ─── HERO ─── */}
      <section className="dw-hero">
        <div className="dw-hero__glow dw-hero__glow--left" />
        <div className="dw-hero__glow dw-hero__glow--right" />

        <div className="dw-hero__badge">
          <BsCodeSlash className="dw-hero__badge-icon" />
          <span>Dịch vụ làm web online uy tín</span>
        </div>

        <h1 className="dw-hero__title">
          Thiết Kế Website Đẹp
          <br />
          <span className="dw-hero__title--gradient">Tối Ưu - Giá Học Sinh Sinh Viên</span>
        </h1>

        <p className="dw-hero__desc">
          Khởi tạo sự hiện diện trực tuyến mạnh mẽ cho cá nhân hoặc doanh nghiệp của bạn với các giải pháp website tùy chỉnh, chi phí hợp lý.
        </p>

        <button className="dw-hero__cta-btn" onClick={handleContact}>
          <FaFacebookMessenger style={{ marginRight: "8px", fontSize: "18px" }} />
          Nhận Báo Giá & Tư Vấn Miễn Phí
        </button>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="dw-plans">
        <div className="dw-section-header">
          <h2>Bảng Giá Dịch Vụ</h2>
          <p>Lựa chọn gói thiết kế phù hợp với nhu cầu và ngân sách của bạn</p>
        </div>
        
        <div className="dw-plans__grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`dw-card ${plan.highlight ? "dw-card--highlight" : ""}`}
            >
              {plan.badge && (
                <div className={`dw-card__badge dw-card__badge--${plan.id}`}>
                  {plan.badge}
                </div>
              )}

              <div className="dw-card__header">
                <div className="dw-card__icon-wrap">
                  <BsCodeSlash className="dw-card__gemini-icon" />
                </div>
                <h2 className="dw-card__label">{plan.label}</h2>
              </div>
              
              <p className="dw-card__desc">{plan.desc}</p>

              <div className="dw-card__price-wrap">
                <span className="dw-card__price">{plan.price}</span>
                <span className="dw-card__price-note">{plan.priceNote}</span>
              </div>

              <ul className="dw-card__features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <FaCheckCircle className="dw-card__check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleContact}
                className={`dw-card__cta ${plan.highlight ? "dw-card__cta--highlight" : ""}`}
              >
                <FaFacebookMessenger style={{ marginRight: "8px", fontSize: "16px" }} />
                Liên hệ để được tư vấn
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="dw-features">
        <div className="dw-section-header">
          <h2>Vì Sao Chọn Chúng Tôi?</h2>
          <p>Cam kết mang lại chất lượng sản phẩm tốt nhất cho dự án của bạn</p>
        </div>
        <div className="dw-features__grid">
          <div className="dw-feature-box">
            <div className="dw-feature-box__icon"><FaRocket /></div>
            <h3>Tốc Độ Tải Trang Siêu Nhanh</h3>
            <p>Ứng dụng công nghệ ReactJS/NextJS hiện đại, loại bỏ độ trễ, tối ưu trải nghiệm người dùng.</p>
          </div>
          <div className="dw-feature-box">
            <div className="dw-feature-box__icon"><FaSearchDollar /></div>
            <h3>Chuẩn SEO Google</h3>
            <p>Cấu trúc website tối ưu hóa công cụ tìm kiếm, giúp bạn dễ dàng leo top Google hơn.</p>
          </div>
          <div className="dw-feature-box">
            <div className="dw-feature-box__icon"><FaMobileAlt /></div>
            <h3>Hiển Thị Tốt Trên Mọi Thiết Bị</h3>
            <p>Giao diện tự động co giãn đẹp mắt trên cả PC, Tablet và đặc biệt là Mobile.</p>
          </div>
          <div className="dw-feature-box">
            <div className="dw-feature-box__icon"><FaHeadset /></div>
            <h3>Hỗ Trợ Tận Tâm</h3>
            <p>Bảo hành code dài hạn, sẵn sàng hỗ trợ kỹ thuật và giải đáp thắc mắc khi nhận được yêu cầu.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DesignWeb;
