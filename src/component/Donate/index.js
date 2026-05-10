import { useNavigate } from "react-router-dom";
import "./style.scss";
import { useDonates } from "../../context/DonateContext";

function DonateLeaderboard() {
  const navigate = useNavigate();

  const { donates, loading } = useDonates();

  const topDonates = [...donates]
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
        <div className="donate-header skeleton skeleton-text" />

        <div className="donate-list">
          {[...Array(5)].map((_, index) => (
            <div
              className="donate-item"
              key={index}
            >
              <div className="rank skeleton" />

              <div className="donate-info">
                <div className="nickname skeleton skeleton-text" />

                <div className="message skeleton skeleton-text short" />
              </div>

              <div className="amount skeleton skeleton-text amount-skeleton" />
            </div>
          ))}
        </div>

        <div className="view-more-btn skeleton" />
      </div>
    );
  }

  return (
    <div className="donate-wrapper">
      <div className="donate-board">
        <div className="donate-header">
          Ủng Hộ trong {currentMonth}
        </div>

        <div className="donate-list">
          {topDonates.map((item, index) => (
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
                    <span>
                      “{item.message}”
                    </span>
                  </div>
                )}
              </div>

              <div className="amount">
                {formatMoney(item.amount)}
              </div>
            </div>
          ))}
        </div>

        <div className="donate-actions">
          <button
            className="support-btn"
            onClick={() => navigate("/ung-ho")}
          >
            Ủng hộ
          </button>

          <button
            className="view-more-btn"
            onClick={() => navigate("/donates")}
          >
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonateLeaderboard;