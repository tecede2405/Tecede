import { useNavigate } from "react-router-dom";
import "./style.scss";
import { useDonates } from "../../context/DonateContext";

function DonateLeaderboard() {
  const navigate = useNavigate();

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

  const topDonates = [...currentMonthDonates]
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5);

  const formatMoney = (money) => {
    return Number(money).toLocaleString("vi-VN") + "đ";
  };

  const currentMonth = new Date().toLocaleString(
    "vi-VN",
    {
      month: "long",
      year: "numeric",
    }
  );

  if (loading) {
  return (
    <div className="donate-board">
      <div className="donate-header donate-skeleton donate-skeleton-text" />

      <div className="donate-list">
        {[...Array(5)].map((_, index) => (
          <div
            className="donate-item"
            key={index}
          >
            <div className="rank donate-skeleton" />

            <div className="donate-info">
              <div className="nickname donate-skeleton donate-skeleton-text" />

              <div className="message donate-skeleton donate-skeleton-text short" />
            </div>

            <div className="amount donate-skeleton donate-skeleton-text amount-skeleton" />
          </div>
        ))}
      </div>

      <div className="view-more-btn donate-skeleton" />
    </div>
  );
}

  return (
    <div className="donate-wrapper">
      <div className="donate-board">
        <div className="donate-header">
          #5 Donate trong {currentMonth}
        </div>

        <div className="donate-list">
          {topDonates.length === 0 ? (
            <div className="empty-donate">
              Chưa có ai donate trong tháng này
            </div>
          ) : (
            topDonates.map((item, index) => (
              <div
                className="donate-item"
                key={item.id}
              >
                <div className={`rank rank-${index + 1}`}>
                  #{index + 1}
                </div>

                <div className="donate-info">
                  <div className="nickname">
                    {item.nickname}
                  </div>

                  {item.message && (
                    <div className="message">
                      <span
                        className={
                          item.message?.length > 35
                            ? "scroll-text"
                            : ""
                        }
                      >
                        “{item.message}”
                      </span>
                    </div>
                  )}
                </div>

                <div className="amount">
                  {formatMoney(item.amount)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="donate-actions">
          <button
            className="support-btn"
            onClick={() => navigate("/ung-ho")}
          >
            Donate giúp ad duy trì web
          </button>

          <button
            className="view-more-btn"
            onClick={() => navigate("/donates")}
          >
            Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonateLeaderboard;