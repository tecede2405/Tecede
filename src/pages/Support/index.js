import "./style.scss";

function SupportPage() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1 className="support-title">
          Donate
        </h1>

        <p className="support-description">
          Nếu bạn yêu thích Tecede, hãy ủng
          hộ một ly cà phê để giúp ad có chi phí duy trì
          server nhé. Tự nguyện và tùy tâm nhé, không bắt buộc đâu. Cảm ơn bạn rất nhiều!
        </p>

        <p className="support-description">
        <span className="support-bank">
            STK: 7624052005 MB Bank
        </span>{" "}
        hoặc quét mã bên dưới để donate.
        </p>

        <div className="support-image-wrapper">
          <img
            src="https://i.ibb.co/b5MqbxDR/IMG-0583.jpg"
            alt="Donate QR"
            className="support-image"
          />
        </div>

        <div className="support-note">
          Nội dung chuyển khoản bao gồm biệt danh và nội dung donate sẽ được hiển thị sau vài giờ trên bảng donate trong tháng.
        </div>
      </div>
    </div>
  );
}

export default SupportPage;