import React from "react";
import "./SellGeminiPro.scss";
import { FaGoogle, FaFacebook, FaCheckCircle, FaStar, FaShieldAlt, FaBolt, FaUsers } from "react-icons/fa";
import { SiGooglegemini } from "react-icons/si";

const FANPAGE_URL = "https://www.facebook.com/profile.php?id=100084710083595";

const plans = [
  {
    id: "solo",
    label: "Mua lẻ",
    accounts: 1,
    price: "80.000đ",
    priceNote: "/ 1 tài khoản",
    badge: null,
    highlight: false,
    features: [
      "1 tài khoản Gemini Pro (dùng riêng)",
      "Thời hạn 18 tháng (Jio)",
      "Gemini Advanced đầy đủ",
      "Google One 5TB (chia sẻ 5 thành viên)",
      "Hỗ trợ qua Fanpage",
      "Hỗ trợ kích hoạt nhanh",
      "Bảo hành 12H - không bảo hành nhúng 9Router và ClipProxy",
    ],
  },
  {
    id: "trio",
    label: "Combo 3",
    accounts: 3,
    price: "200.000đ",
    priceNote: "/ 3 tài khoản",
    badge: "PHỔ BIẾN",
    highlight: true,
    features: [
      "3 tài khoản Gemini Pro (dùng riêng)",
      "Thời hạn 18 tháng (Jio)",
      "Gemini Advanced đầy đủ",
      "Google One 5TB (chia sẻ 5 thành viên)",
      "Tiết kiệm ~17% so với mua lẻ",
      "Hỗ trợ kích hoạt nhanh",
      "Bảo hành 12H - không bảo hành nhúng 9Router và ClipProxy",
    ],
  },
  {
    id: "pack5",
    label: "Combo 5",
    accounts: 5,
    price: "300.000đ",
    priceNote: "/ 5 tài khoản",
    badge: "TIẾT KIỆM NHẤT",
    highlight: false,
    features: [
      "5 tài khoản Gemini Pro (dùng riêng)",
      "Thời hạn 18 tháng (Jio)",
      "Gemini Advanced đầy đủ",
      "Google One 5TB (chia sẻ 5 thành viên)",
      "Tiết kiệm 25% so với mua lẻ",
      "Hỗ trợ kích hoạt nhanh",
      "Bảo hành 12H - không bảo hành nhúng 9Router và ClipProxy",
    ],
  },
];

function SellGeminiPro() {
  return (
    <div className="sgp-wrapper">
      {/* ─── HERO ─── */}
      <section className="sgp-hero">
        <div className="sgp-hero__glow sgp-hero__glow--left" />
        <div className="sgp-hero__glow sgp-hero__glow--right" />

        <div className="sgp-hero__badge">
          <SiGooglegemini className="sgp-hero__badge-icon" />
          <span>Gemini Advanced · 18 tháng Jio</span>
        </div>

        <h1 className="sgp-hero__title">
          Nâng cấp trải nghiệm AI
          <br />
          <span className="sgp-hero__title--gradient">với Gemini Pro</span>
        </h1>

        <p className="sgp-hero__desc">
          Tận hưởng Gemini Advanced bảo hành 12h – gói Jio 18 tháng với giá siêu
          tốt. Hỗ trợ kích hoạt nhanh nhanh, hỗ trợ tận tình.
        </p>

        <div className="sgp-hero__stats">
          <div className="sgp-stat">
            <FaBolt className="sgp-stat__icon" />
            <span>Giao ngay</span>
          </div>
          <div className="sgp-stat">
            <FaShieldAlt className="sgp-stat__icon" />
            <span>Uy tín 100%</span>
          </div>
          <div className="sgp-stat">
            <FaUsers className="sgp-stat__icon" />
            <span>Đã bán 40+</span>
          </div>
          <div className="sgp-stat">
            <FaStar className="sgp-stat__icon sgp-stat__icon--star" />
            <span>5.0 đánh giá</span>
          </div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="sgp-plans">
        <div className="sgp-plans__grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`sgp-card ${plan.highlight ? "sgp-card--highlight" : ""}`}
            >
              {plan.badge && (
                <div className={`sgp-card__badge sgp-card__badge--${plan.id}`}>
                  {plan.badge}
                </div>
              )}

              <div className="sgp-card__header">
                <div className="sgp-card__icon-wrap">
                  <SiGooglegemini className="sgp-card__gemini-icon" />
                </div>
                <h2 className="sgp-card__label">{plan.label}</h2>
                <div className="sgp-card__acc-count">
                  <FaGoogle style={{ fontSize: "12px", marginRight: "5px", opacity: 0.7 }} />
                  {plan.accounts} tài khoản
                </div>
              </div>

              <div className="sgp-card__price-wrap">
                <span className="sgp-card__price">{plan.price}</span>
                <span className="sgp-card__price-note">{plan.priceNote}</span>
              </div>

              {plan.accounts > 1 && (
                <div className="sgp-card__per-acc">
                  ≈{" "}
                  <strong>
                    {Math.round(
                      parseInt(plan.price.replace(/\D/g, "")) / plan.accounts
                    ).toLocaleString("vi-VN")}
                    đ
                  </strong>{" "}
                  / acc
                </div>
              )}

              <ul className="sgp-card__features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <FaCheckCircle className="sgp-card__check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={FANPAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`sgp-card__cta ${plan.highlight ? "sgp-card__cta--highlight" : ""}`}
              >
                <FaFacebook style={{ marginRight: "8px", fontSize: "16px" }} />
                Liên hệ mua ngay
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NOTE ─── */}
      <section className="sgp-note">
        <p>
          📌 Ad bán giùm bên thứ 3 để nhận hoa hồng,{" "}
          mọi người ai có nhu cầu mua ủng hộ nhé.
        </p>
      </section>
    </div>
  );
}

export default SellGeminiPro;
