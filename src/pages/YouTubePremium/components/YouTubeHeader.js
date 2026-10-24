import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import {
  FaYoutube,
  FaSearch,
  FaTimes,
  FaServer,
  FaCheck,
  FaArrowLeft,
  FaHistory,
  FaTrash,
} from "react-icons/fa";
import {
  fetchSuggestions,
  getInstancesList,
  getCurrentInstance,
  setCustomInstance,
  parseYouTubeInput,
} from "../../../services/pipedApi";

const STORAGE_SEARCH_HISTORY_KEY = "tecede_yt_search_history";

export default function YouTubeHeader({
  currentRegion = "VN",
  onRegionChange,
}) {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [activeInstance, setActiveInstance] = useState(getCurrentInstance());

  // Mobile & Tablet full search mode
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef(null);

  // Lịch sử tìm kiếm lưu trong localStorage
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_SEARCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const searchWrapRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeVideo, minimizePlayer } = useTecedeYtPlayer();

  const handleNavWithMinimize = (e, targetPath) => {
    const isWatch =
      location.pathname.startsWith("/tecede-yt/watch/") ||
      location.pathname.startsWith("/youtube-premium/watch/");
    if (isWatch && activeVideo) {
      e.preventDefault();
      minimizePlayer(activeVideo);
      navigate(targetPath);
    }
  };

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Tự động đóng mobile search khi chuyển trang
  useEffect(() => {
    setIsMobileSearchOpen(false);
    setShowSuggestions(false);
  }, [location.pathname, location.search]);

  // Tự động focus ô input khi mở search trên mobile / tablet
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const list = await fetchSuggestions(query.trim());
        setSuggestions(list);
      } catch (e) {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close desktop suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý thực thi tìm kiếm & lưu lịch sử
  const executeSearch = (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;
    const term = searchTerm.trim();

    // 1. Lưu vào lịch sử tìm kiếm (tối đa 15 mục, đưa lên đầu, loại bỏ trùng lặp)
    try {
      const raw = localStorage.getItem(STORAGE_SEARCH_HISTORY_KEY);
      let list = raw ? JSON.parse(raw) : [];
      list = [
        term,
        ...list.filter((x) => x.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 15);
      localStorage.setItem(STORAGE_SEARCH_HISTORY_KEY, JSON.stringify(list));
      setSearchHistory(list);
    } catch (e) {
      console.warn("Lỗi lưu lịch sử:", e);
    }

    setShowSuggestions(false);
    setIsMobileSearchOpen(false);

    // 2. Nhận diện nếu dán trực tiếp link YouTube hoặc mã video ID
    const parsed = parseYouTubeInput(term);
    if (parsed && parsed.type === "video") {
      navigate(`/tecede-yt/watch/${parsed.id}`);
      return;
    }

    // 3. Nếu đang ở trang xem video, thu nhỏ video xuống góc
    const isWatch =
      location.pathname.startsWith("/tecede-yt/watch/") ||
      location.pathname.startsWith("/youtube-premium/watch/");
    if (isWatch && activeVideo) {
      minimizePlayer(activeVideo);
    }
    navigate(`/tecede-yt/search?q=${encodeURIComponent(term)}`);
  };

  // Xóa 1 mục khỏi lịch sử
  const handleRemoveHistoryItem = (e, itemToRemove) => {
    e.stopPropagation();
    try {
      const updated = searchHistory.filter((x) => x !== itemToRemove);
      localStorage.setItem(STORAGE_SEARCH_HISTORY_KEY, JSON.stringify(updated));
      setSearchHistory(updated);
    } catch (e) {}
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllHistory = (e) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(STORAGE_SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (e) {}
  };

  const handleSelectInstance = (url) => {
    setCustomInstance(url);
    setActiveInstance(url);
    setShowServerModal(false);
    window.location.reload();
  };

  return (
    <header
      className={`yt-header ${isMobileSearchOpen ? "mobile-search-active" : ""}`}
    >
      {/* KHI MOBILE/TABLET MỞ TÌM KIẾM: CHIẾM TRỌN FULL HEADER */}
      {isMobileSearchOpen ? (
        <div className="yt-header-mobile-search-full">
          <button
            type="button"
            className="yt-mobile-back-btn"
            onClick={() => setIsMobileSearchOpen(false)}
            title="Quay lại"
          >
            <FaArrowLeft />
          </button>

          <form
            className="yt-mobile-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch(query);
            }}
          >
            <div className="yt-mobile-input-wrap">
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Tìm kiếm video hoặc dán link / ID YouTube..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="yt-mobile-search-input"
              />
              {query && (
                <button
                  type="button"
                  className="yt-mobile-clear-btn"
                  onClick={() => setQuery("")}
                  title="Xóa nội dung"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="yt-mobile-submit-btn"
              title="Tìm kiếm"
            >
              <FaSearch />
            </button>
          </form>

          {/* PANEL LỊCH SỬ TÌM KIẾM HOẶC GỢI Ý BÊN DƯỚI HEADER TRÊN MOBILE */}
          <div className="yt-mobile-search-dropdown">
            {query.trim().length >= 2 && suggestions.length > 0 ? (
              <ul className="yt-mobile-search-list">
                {suggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="yt-mobile-search-item"
                    onClick={() => executeSearch(sug)}
                  >
                    <div className="item-left">
                      <FaSearch className="item-icon item-icon-search" />
                      <span className="item-text">{sug}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : searchHistory.length > 0 ? (
              <div className="yt-history-container">
                <div className="yt-history-header">
                  <span className="yt-history-title">
                    <FaHistory className="me-2" /> Lịch sử tìm kiếm
                  </span>
                  <button
                    type="button"
                    className="yt-btn-clear-history"
                    onClick={handleClearAllHistory}
                  >
                    <FaTrash className="me-1" /> Xóa tất cả
                  </button>
                </div>
                <ul className="yt-mobile-search-list">
                  {searchHistory.map((item, idx) => (
                    <li
                      key={idx}
                      className="yt-mobile-search-item history-item"
                      onClick={() => executeSearch(item)}
                    >
                      <div className="item-left">
                        <FaHistory className="item-icon item-icon-history" />
                        <span className="item-text">{item}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-remove-single-history"
                        onClick={(e) => handleRemoveHistoryItem(e, item)}
                        title="Xóa tìm kiếm này"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="yt-history-empty">
                <FaHistory className="empty-icon" />
                <p>Chưa có lịch sử tìm kiếm</p>
                <span>
                  Nhập từ khóa hoặc dán link/ID video YouTube để xem ngay
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HEADER BÌNH THƯỜNG */
        <div className="yt-header__inner">
          {/* LOGO & BACK TO TECEDE */}
          <div className="yt-header__left">
            <Link
              to="/"
              className="yt-back-to-tecede"
              title="Quay lại Tecede (Phim & Truyện)"
              onClick={(e) => handleNavWithMinimize(e, "/")}
            >
              <FaArrowLeft className="me-1" />
              <span className="d-none d-sm-inline">Tecede</span>
            </Link>
            <div className="yt-brand-divider" />
            <Link
              to="/tecede-yt"
              className="yt-logo"
              title="TecedeYT - Không quảng cáo"
              onClick={(e) => handleNavWithMinimize(e, "/tecede-yt")}
            >
              <div className="yt-logo__icon-wrap">
                <FaYoutube className="yt-logo__icon" />
              </div>
              <div className="yt-logo__text-wrap">
                <span className="yt-logo__text">
                  Tecede<span className="yt-logo__accent">YT</span>
                </span>
                <span className="yt-logo__badge">Premium</span>
              </div>
            </Link>
          </div>

          {/* SEARCH BAR (DESKTOP) */}
          <div className="yt-header__center" ref={searchWrapRef}>
            <form
              className="yt-search-form"
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(query);
              }}
            >
              <div className="yt-search-input-wrap">
                <input
                  type="text"
                  placeholder="Tìm kiếm video hoặc dán link / ID YouTube..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="yt-search-input"
                />
                {query && (
                  <button
                    type="button"
                    className="yt-search-clear"
                    onClick={() => setQuery("")}
                    title="Xóa chữ"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="yt-search-submit"
                title="Tìm kiếm"
              >
                <FaSearch />
              </button>
            </form>

            {/* AUTO-SUGGESTIONS & HISTORY DROPDOWN (DESKTOP) */}
            {showSuggestions && (
              <div className="yt-suggestions-dropdown">
                {query.trim().length >= 2 && suggestions.length > 0 ? (
                  <ul className="yt-suggestions-list">
                    {suggestions.map((sug, idx) => (
                      <li
                        key={idx}
                        className="yt-suggestion-item"
                        onMouseDown={() => executeSearch(sug)}
                      >
                        <div className="item-left">
                          <FaSearch className="yt-sug-icon" />
                          <span className="item-text">{sug}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : searchHistory.length > 0 ? (
                  <div className="yt-history-container">
                    <div className="yt-history-header">
                      <span className="yt-history-title">
                        <FaHistory className="me-2" /> Lịch sử tìm kiếm
                      </span>
                      <button
                        type="button"
                        className="yt-btn-clear-history"
                        onMouseDown={handleClearAllHistory}
                      >
                        <FaTrash className="me-1" /> Xóa tất cả
                      </button>
                    </div>
                    <ul className="yt-suggestions-list">
                      {searchHistory.map((item, idx) => (
                        <li
                          key={idx}
                          className="yt-suggestion-item history-item"
                          onMouseDown={() => executeSearch(item)}
                        >
                          <div className="item-left">
                            <FaHistory className="yt-sug-icon item-icon-history" />
                            <span className="item-text">{item}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-remove-single-history"
                            onMouseDown={(e) =>
                              handleRemoveHistoryItem(e, item)
                            }
                            title="Xóa tìm kiếm này"
                          >
                            <FaTimes />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* RIGHT CONTROLS */}
          <div className="yt-header__right">
            {/* NÚT TÌM KIẾM TRÊN MOBILE VÀ TABLET */}
            <button
              type="button"
              className="yt-mobile-search-trigger"
              onClick={() => setIsMobileSearchOpen(true)}
              title="Tìm kiếm"
            >
              <FaSearch />
            </button>

            {/* REGION SELECTOR */}
            {onRegionChange && (
              <div className="yt-region-select-wrap">
                <select
                  value={currentRegion}
                  onChange={(e) => onRegionChange(e.target.value)}
                  className="yt-region-select"
                  title="Chọn khu vực thịnh hành"
                >
                  <option value="VN">🇻🇳 VN</option>
                  <option value="US">🇺🇸 US</option>
                  <option value="JP">🇯🇵 JP</option>
                  <option value="KR">🇰🇷 KR</option>
                  <option value="GB">🇬🇧 GB</option>
                </select>
              </div>
            )}

            {/* INSTANCE SWITCHER */}
            <button
              type="button"
              className="yt-btn-server"
              onClick={() => setShowServerModal(true)}
              title="Đổi máy chủ phát"
            >
              <FaServer className="me-1" />
              <span className="d-none d-md-inline">Máy chủ</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL ĐỔI SERVER */}
      {showServerModal && (
        <div
          className="yt-modal-backdrop"
          onClick={() => setShowServerModal(false)}
        >
          <div className="yt-server-modal" onClick={(e) => e.stopPropagation()}>
            <div className="yt-server-modal__header">
              <h5>Chọn máy chủ phát video</h5>
              <button
                onClick={() => setShowServerModal(false)}
                className="btn-close-modal"
              >
                <FaTimes />
              </button>
            </div>
            <p className="yt-server-modal__desc">
              Hệ thống tự động chuyển máy chủ dự phòng khi gặp sự cố. Bạn cũng
              có thể chọn thủ công bên dưới:
            </p>
            <ul className="yt-server-list">
              {getInstancesList().map((inst, index) => {
                const isSelected = activeInstance === inst;
                return (
                  <li
                    key={index}
                    className={`yt-server-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectInstance(inst)}
                  >
                    <span className="server-url">
                      Máy chủ {index + 1}{" "}
                      {index === 0 ? "(Tối ưu - Mặc định)" : "(Dự phòng)"}
                    </span>
                    {isSelected && <FaCheck className="server-check" />}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
