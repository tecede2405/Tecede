import "./style.scss";
import { useDonates } from "../../context/DonateContext";

function DonatePage() {
  const { donates, loading } = useDonates();

  const now = new Date();

  const currentMonthDonates = donates.filter((item) => {
    if (!item.created_at) return false;

    const donateDate = new Date(
      item.created_at.replace(" ", "T")
    );

    return (
      donateDate.getMonth() === now.getMonth() &&
      donateDate.getFullYear() === now.getFullYear()
    );
  });
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
        {currentMonthDonates.length === 0 ? (
          <div className="empty-donate">
            Chưa có ai donate trong tháng này
          </div>
        ) : (
          currentMonthDonates.map((item, index) => (
            <div className="donate-pg-card" key={item.id}>
              <div className={`donate-pg-avatar rank-${index + 1 <= 3 ? index + 1 : 'default'}`}>
                #{index + 1}
              </div>

              <div className="donate-pg-info">
                <div className="donate-pg-line1">
                  <span className="donate-pg-name">{item.nickname}</span>
                  {item.created_at && (
                    <span className="donate-pg-date">
                      {item.created_at.split(" ")[0].split("-").reverse().join("/")}
                    </span>
                  )}
                  <span className="donate-pg-amount">{formatMoney(item.amount)}</span>
                </div>

                <div className="donate-pg-line2">
                  <div className="donate-pg-msg-container">
                    {item.message?.length > 35 ? (
                      <div className="donate-pg-scroll">
                        <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                      </div>
                    ) : (
                      <span className="donate-pg-msg">
                        {item.message || "Không có nội dung"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
      )}
      </div>
    </div>
  );
}

export default DonatePage;