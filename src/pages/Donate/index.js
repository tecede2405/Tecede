import "./style.scss";
import { useDonates } from "../../context/DonateContext";

function DonatePage() {
  const { donates, loading } = useDonates();

  const formatMoney = (money) => {
    return (
      Number(money).toLocaleString("vi-VN") +
      "đ"
    );
  };

  if (loading) {
    return (
      <div className="donate-page">
        <div className="donate-page-header">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>

        <div className="donate-page-list">
          {[...Array(10)].map((_, index) => (
            <div
              className="donate-row skeleton-row"
              key={index}
            >
              <div className="rank skeleton" />

              <div className="donate-content">
                <div className="nickname skeleton skeleton-text" />

                <div className="message skeleton skeleton-text short" />
              </div>

              <div className="amount skeleton skeleton-text amount-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <div className="donate-page-header">
        <h1>
          Danh Sách Donate Tháng Này
        </h1>

        <p>
          Cảm ơn tất cả mọi người đã
          ủng hộ để Tecede có kinh phí
          duy trì server
        </p>
      </div>

      <div className="donate-page-list">
        {donates.map((item, index) => (
          <div
            className="donate-row"
            key={item.id}
          >
            <div
              className={`rank rank-${
                index + 1 <= 5
                  ? index + 1
                  : "default"
              }`}
            >
              #{index + 1}
            </div>

            <div className="donate-content">
              <div className="nickname">
                {item.nickname}
              </div>

              <div className="message">
                <span>
                  {item.message ||
                    "Không có nội dung"}
                </span>
              </div>
            </div>

            <div className="amount">
              {formatMoney(item.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonatePage;