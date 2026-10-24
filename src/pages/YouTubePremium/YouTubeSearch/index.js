import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import YouTubeHeader from "../components/YouTubeHeader";
import VideoCard from "../components/VideoCard";
import { fetchSearch, parseYouTubeInput } from "../../../services/pipedApi";
import { FaSearch, FaUndo, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import "../style.scss";

export default function YouTubeSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const navigate = useNavigate();

  const [region, setRegion] = useState(() => {
    return localStorage.getItem("tecede_yt_region") || "VN";
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRegionChange = (newReg) => {
    setRegion(newReg);
    localStorage.setItem("tecede_yt_region", newReg);
  };

  const performSearch = async (searchTerm, filterType) => {
    if (!searchTerm || !searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Tự động nhận diện nếu query là link YouTube hoặc video ID -> Chuyển thẳng tới trang xem
    const parsed = parseYouTubeInput(searchTerm.trim());
    if (parsed && parsed.type === "video") {
      navigate(`/tecede-yt/watch/${parsed.id}`, { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSearch(searchTerm.trim(), filterType);
      let items = data?.items || (Array.isArray(data) ? data : []);

      // Đưa các kênh phù hợp lên đầu trang kết quả (giống như YouTube)
      if (filterType === "all") {
        const channels = items.filter((i) => i.type === "channel");
        const others = items.filter((i) => i.type !== "channel");
        items = [...channels, ...others];
      }

      setResults(items);
    } catch (err) {
      console.error("[YouTubeSearch] Lỗi tìm kiếm:", err);
      setError("Không thể tải kết quả tìm kiếm từ máy chủ. Vui lòng thử lại sau.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(query, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter]);

  const handleFilterChange = (newFilter) => {
    setSearchParams({ q: query, filter: newFilter });
  };

  return (
    <div className="yt-page yt-theme-dark">
      <YouTubeHeader currentRegion={region} onRegionChange={handleRegionChange} />

      <main className="yt-search-container">
        {/* SEARCH HEADER & FILTERS */}
        <div className="yt-search-top">
          <div className="yt-search-title-box">
            <FaSearch className="yt-search-icon-title" />
            <h2>Kết quả tìm kiếm cho: <span>"{query}"</span></h2>
          </div>

          <div className="yt-filter-chips">
            {[
              { id: "all", label: "Tất cả" },
              { id: "videos", label: "Video" },
              { id: "channels", label: "Kênh" },
              { id: "playlists", label: "Danh sách phát" }
            ].map((f) => (
              <button
                key={f.id}
                className={`yt-filter-btn ${filter === f.id ? "active" : ""}`}
                onClick={() => handleFilterChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* HINT BANNER CHO ANIME / VIDEO BẢN QUYỀN ĐỘC QUYỀN VIỆT NAM */}
        <div className="yt-search-vietnam-tip">
          <FaInfoCircle className="yt-search-tip-icon" />
          <div className="yt-search-tip-content">
            <span className="yt-search-tip-title">Mẹo xem Anime & Video bản quyền Việt Nam (POPS Anime, Muse VN...):</span>
            <span className="yt-search-tip-desc">
              Một số anime (như <i>Naruto, Conan, One Piece</i>) do vấn đề bản quyền lãnh thổ nên máy chủ tìm kiếm quốc tế không thể lấy danh sách. Bạn chỉ cần <b>copy link video hoặc mã ID trên YouTube dán vào ô tìm kiếm</b> là xem được ngay!
            </span>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="yt-search-results-list">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="yt-search-card-skeleton">
                <div className="skeleton-thumb-list" />
                <div className="skeleton-meta-list">
                  <div className="skeleton-line line-title" />
                  <div className="skeleton-line line-sub" />
                  <div className="skeleton-line line-desc" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="yt-error-card">
            <FaExclamationTriangle className="yt-error-icon" />
            <h3>Tìm kiếm gặp sự cố</h3>
            <p>{error}</p>
            <button className="yt-btn-retry" onClick={() => performSearch(query, filter)}>
              <FaUndo className="me-2" /> Thử tìm lại
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && results.length === 0 && (
          <div className="yt-empty-card">
            <h4>Không tìm thấy kết quả nào cho "{query}"</h4>
            <p>
              Nếu đây là anime hoặc nội dung độc quyền Việt Nam (POPS Anime, Muse VN...), nội dung có thể bị YouTube ẩn khỏi hệ thống tìm kiếm quốc tế.
            </p>
            <p className="mt-2 text-warning">
              👉 <b>Cách xem:</b> Hãy copy link video YouTube hoặc mã ID dán trực tiếp vào ô tìm kiếm ở trên để mở xem ngay nhé!
            </p>
          </div>
        )}

        {/* RESULTS LIST */}
        {!loading && !error && results.length > 0 && (
          <div className="yt-search-results-list">
            {results.map((item, idx) => (
              <VideoCard
                key={item.id || item.url || idx}
                video={item}
                layout="list"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
