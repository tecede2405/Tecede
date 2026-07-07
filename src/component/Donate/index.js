import { useNavigate } from "react-router-dom";
import "./style.scss";
import { useDonates } from "../../context/DonateContext";

function DonateLeaderboard() {
  const navigate = useNavigate();
  const { donates, loading } = useDonates();
  const now = new Date();
  const GOAL_AMOUNT = 500000; // Mục tiêu 500.000đ của tháng

  // 1. Lọc tất cả donate trong tháng hiện tại
  const currentMonthDonates = donates.filter((item) => {
    if (!item.created_at) return false;
    const donateDate = new Date(item.created_at.replace(" ", "T"));
    return (
      donateDate.getMonth() === now.getMonth() &&
      donateDate.getFullYear() === now.getFullYear()
    );
  });

  // 2. Tính TỔNG TIỀN donate đã nhận được trong tháng
  const totalMonthAmount = currentMonthDonates.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  // 3. Tính % tiến độ (giới hạn tối đa 100% nếu vượt chỉ tiêu)
  const goalPercentage = Math.min(Math.round((totalMonthAmount / GOAL_AMOUNT) * 100), 100);

  // 4. Sắp xếp lấy Top 5 người donate nhiều nhất để hiển thị bảng
  const topDonates = [...currentMonthDonates]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const formatMoney = (money) => {
  return `${Number(money).toLocaleString("vi-VN")}đ`;
};

  const currentMonth = new Date().toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="donate-board">
        <div className="donate-skeleton donate-header-skeleton" />
        <div className="donate-list">
          {[...Array(5)].map((_, index) => (
            <div className="donate-item" key={index}>
              <div className="rank donate-skeleton" />
              <div className="donate-info">
                <div className="nickname donate-skeleton donate-skeleton-text" />
                <div className="message donate-skeleton donate-skeleton-text short" />
              </div>
              <div className="amount donate-skeleton donate-skeleton-text amount-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="donate-wrapper">
      <div className="donate-board">
        
        {/* KHU VỰC TIÊU ĐỀ & THANH TIẾN ĐỘ TỔNG */}
        <div className="donate-header-container">
          <div className="donate-header-title">
            #5 Donate trong {currentMonth}
          </div>
          
          <div className="donate-goal-wrapper">
            <div className="donate-goal-bar">
              <div className="donate-goal-fill" style={{ width: `${goalPercentage}%` }} />
            </div>
            <span className="donate-goal-percent">Tiến độ: {goalPercentage}%</span>
          </div>
        </div>

        {/* DANH SÁCH BẢNG XẾP HẠNG */}
        <div className="donate-list">
          {topDonates.length === 0 ? (
            <div className="empty-donate">
              Chưa có ai donate trong tháng này
            </div>
          ) : (
            topDonates.map((item, index) => (
              <div className={`donate-item item-rank-${index + 1}`} key={item.id}>
                <div className={`rank rank-${index + 1}`}>
                  #{index + 1}
                </div>

                <div className="donate-info">
                  <div className="nickname-container">
                    <span className="nickname">{item.nickname}</span>
                    {item.created_at && (
                      <span className="donate-date">
                        {/* Cắt chuỗi lấy YYYY-MM-DD rồi lật ngược thành DD/MM/YYYY */}
                        {item.created_at.split(" ")[0].split("-").reverse().join("/")}
                      </span>
                    )}
                  </div>

                  {item.message && (
                    <div className="message">
                      <span className={item.message.length > 35 ? "scroll-text" : ""}>
                        {item.message.length > 35 ? (
                          // Nếu tin nhắn dài, nhân đôi chuỗi và cách nhau bằng khoảng trống (hoặc dấu gạch)
                          <>“{item.message}” &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; “{item.message}”</>
                        ) : (
                          // Nếu tin nhắn ngắn thì hiển thị bình thường
                          <>“{item.message}”</>
                        )}
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
          <button className="support-btn" onClick={() => navigate("/ung-ho")}>
            Donate giúp ad duy trì web
          </button>
          <button className="view-more-btn" onClick={() => navigate("/donates")}>
            Xem danh sách
          </button>
        </div>
      </div>
    </div>
  );
}

export default DonateLeaderboard;