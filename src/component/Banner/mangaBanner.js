import "./style.scss";
import {useNavigate} from "react-router-dom";

export default function ComicHero() {
  const navigate = useNavigate();

  return (
    <section
      className="comicHero"
      style={{
        backgroundImage:
          "url(https://gamek.mediacdn.vn/133514250583805952/2023/8/17/1-1020-1692246699459-1692246699581620743772.jpg)",
      }}
    >
      <div className="heroOverlay"></div>

      <div className="heroContent">
        <h4 style={{ fontSize: "18px", color: "#ffcc00" }}>
          Đọc Truyện Tranh Online
          Miễn Phí & Nhanh Nhất
        </h4>

        <p style={{ fontSize: "14px", marginTop: "20px", }}>
          Khám phá hàng nghìn bộ truyện tranh.
          Cập nhật chương mới nhanh chóng mỗi ngày.
        </p>

        <div className="heroButtons">
          <button className="btnHeroPrimary" onClick={() => navigate("/truyen")}>
            ✨ Vào trang
          </button>

          <button className="btnHeroSecondary" onClick={() => navigate("/truyen")}>
            Cũng vào trang :))
          </button>
        </div>
      </div>
    </section>
  );
}