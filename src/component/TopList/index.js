import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../context/MoviesContext";
import { useDonates } from "../../context/DonateContext";
import { FaFilm, FaHeart, FaTimes, FaDonate, FaHandHoldingHeart } from "react-icons/fa";
import { BsGraphUpArrow } from "react-icons/bs";
import "./style.scss";

function TopList() {
  const { grouped, loading: moviesLoading } = useMovies();
  const { donates, loading: donatesLoading } = useDonates();
  const navigate = useNavigate();

  // Lấy data phim
  const activeFilms = grouped["high-rate-film"] ? grouped["high-rate-film"].slice(0, 10) : [];
  const favoriteFilms = grouped["phim-hot"] ? grouped["phim-hot"].slice(0, 10) : [];

  // Lấy data Donate (Top 5 trong tháng)
  const now = new Date();
  const currentMonthDonates = donates.filter((item) => {
    if (!item.created_at) return false;
    const donateDate = new Date(item.created_at.replace(" ", "T"));
    return (
      donateDate.getMonth() === now.getMonth() &&
      donateDate.getFullYear() === now.getFullYear()
    );
  });
  
  const topDonates = [...currentMonthDonates]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const GOAL_AMOUNT = 500000;
  const totalMonthAmount = currentMonthDonates.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const goalPercentage = Math.min(Math.round((totalMonthAmount / GOAL_AMOUNT) * 100), 100);

  const formatMoney = (money) => `${Number(money).toLocaleString("vi-VN")}đ`;

  // modalType: 'active' hoặc 'favorite' hoặc null
  const [modalType, setModalType] = useState(null);

  const handleItemClick = (slug) => {
    setModalType(null); // Đóng modal nếu đang mở
    navigate(`/chi-tiet/${slug}`);
  };

  const renderList = (type, films, limit) => {
    return films.slice(0, limit).map((item, index) => (
      <div 
        className="toplist-item" 
        key={item._id || index}
        onClick={() => handleItemClick(item.path)}
      >
        <div className="toplist-item__rank">{index + 1}.</div>
        <div className="toplist-item__trend">
          <BsGraphUpArrow style={{ color: '#84cc16' }} />
        </div>
        <div className="toplist-item__thumb">
          <img src={item.image} alt={item.title} loading="lazy" />
        </div>
        <div className="toplist-item__title">
          {item.title}
        </div>
      </div>
    ));
  };

  if (moviesLoading) return null;

  return (
    <div className="toplist-wrapper">
      <div className="toplist-container">
        
        {/* KHỐI 1: 2 CỘT PHIM (SCROLL NGANG TRÊN MOBILE) */}
        <div className="toplist-film-wrapper">
          {/* CỘT 1: SÔI NỔI NHẤT */}
          <div className="toplist-column">
            <div className="toplist-header">
              <FaFilm className="toplist-icon active-icon" />
              <span className="toplist-heading">TOP TRONG NGÀY</span>
            </div>
            
            <div className="toplist-body">
              {renderList('active', activeFilms, 5)}
            </div>
            
            <div className="toplist-footer" onClick={() => setModalType('active')}>
              Xem thêm
            </div>
          </div>

          {/* CỘT 2: YÊU THÍCH NHẤT */}
          <div className="toplist-column border-left-desktop">
            <div className="toplist-header">
              <FaHeart className="toplist-icon favorite-icon" />
              <span className="toplist-heading">TOP TRONG TUẦN</span>
            </div>
            
            <div className="toplist-body">
              {renderList('favorite', favoriteFilms, 5)}
            </div>
            
            <div className="toplist-footer" onClick={() => setModalType('favorite')}>
              Xem thêm
            </div>
          </div>
        </div>

        {/* KHỐI 2: CỘT DONATE (NẰM TRÊN CÙNG TRÊN MOBILE) */}
        <div className="toplist-column donate-column border-left-desktop">
          <div className="toplist-header" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaDonate className="toplist-icon donate-icon" style={{color: '#f43f5e'}} />
              <span className="toplist-heading">#5 DONATE THÁNG {now.getMonth() + 1}</span>
            </div>

            <div className="toplist-goal-wrapper-inline">
              <span className="toplist-goal-percent-inline">{goalPercentage}%</span>
              <div className="toplist-goal-bar-inline">
                <div className="toplist-goal-fill" style={{ width: `${goalPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="toplist-body donate-card-list">
            {donatesLoading ? (
               <div style={{color: '#9ca3af', fontSize: '13px'}}>Đang tải...</div>
            ) : topDonates.length === 0 ? (
               <div style={{color: '#9ca3af', fontSize: '13px'}}>Chưa có ai donate trong tháng này</div>
            ) : (
              topDonates.map((item, index) => (
                <div className="donate-card-item" key={item.id || index}>
                  <div className={`donate-card-avatar rank-${index + 1}`}>
                    #{index + 1}
                  </div>
                  <div className="donate-card-info">
                    <div className="donate-card-line1">
                      <span className="donate-card-name">{item.nickname}</span>
                      <FaHandHoldingHeart className="donate-card-icon" />
                      <span className="donate-card-amount">{formatMoney(item.amount)}</span>
                    </div>
                    <div className="donate-card-line2">
                      <div className="donate-msg-container">
                        {(item.message && item.message.length > 35) ? (
                          <div className="donate-scroll-text">
                            <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <span>{item.message} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                          </div>
                        ) : (
                          <span className="donate-card-msg">
                            {item.message || "Ủng hộ web"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="toplist-footer donate-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="donate-btn-mini" onClick={() => navigate("/ung-ho")}>Ủng hộ duy trì web</span>
            <span 
              onClick={() => navigate("/donates")}
              style={{ fontSize: '13px', cursor: 'pointer', color: '#9ca3af' }}
              onMouseOver={(e) => e.target.style.color = '#fff'}
              onMouseOut={(e) => e.target.style.color = '#9ca3af'}
            >
              Xem tất cả
            </span>
          </div>
        </div>

      </div>

      {/* MODAL XEM THÊM (8 items) */}
      {modalType && (
        <div className="toplist-modal-overlay" onClick={() => setModalType(null)}>
          <div className="toplist-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="toplist-modal-header">
              <h3>
                {modalType === 'active' ? (
                  <><FaFilm style={{color: '#fcd34d', marginRight: '8px'}} /> TOP TRONG NGÀY</>
                ) : (
                  <><FaHeart style={{color: '#fcd34d', marginRight: '8px'}} /> TOP TRONG TUẦN</>
                )}
              </h3>
              <button className="toplist-modal-close" onClick={() => setModalType(null)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="toplist-modal-body">
              {renderList(modalType, modalType === 'active' ? activeFilms : favoriteFilms, 8)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopList;
