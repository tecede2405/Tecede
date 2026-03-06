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
        <h3>
          Đọc Truyện Tranh Online <br />
          Miễn Phí & Nhanh Nhất
        </h3>

        <p>
          Khám phá hàng nghìn bộ truyện tranh.
          Cập nhật chương mới nhanh chóng mỗi ngày.
        </p>

        <div className="heroButtons">
          <button className="btnPrimary" onClick={() => navigate("/truyen")}>
            ✨ Vào trang
          </button>

          <button className="btnOutline" onClick={() => navigate("/truyen")}>
            Cũng vào trang :))
          </button>
        </div>
      </div>
    </section>
  );
}