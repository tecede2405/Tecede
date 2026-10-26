import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdBook } from "react-icons/io";
import { IoPersonCircleSharp } from "react-icons/io5";
import { CiClock1 } from "react-icons/ci";
import {
  FaArrowLeft,
  FaStar,
  FaEye,
  FaImage,
  FaFeatherAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaBookmark,
  FaExclamationTriangle
} from "react-icons/fa";
import { fetchStoryDetail, getCoverUrl } from "../../utils/truyenApi";
import "./style.scss";

export default function ComicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleGoBack = () => {
    try {
      const lastListUrl = sessionStorage.getItem("lastMangaListUrl");
      if (
        lastListUrl &&
        !lastListUrl.includes("/chi-tiet/") &&
        !lastListUrl.includes("/doc/")
      ) {
        navigate(lastListUrl);
        return;
      }
    } catch (e) {}

    // Dự phòng nếu không có trong sessionStorage
    navigate("/truyen");
  };

  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sortAsc, setSortAsc] = useState(false); // false: Mới nhất trước, true: Cũ nhất trước
  const [chapterFilter, setChapterFilter] = useState("");

  // Đọc lịch sử từ localStorage
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("readingHistory")) || [];
      setHistory(data);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  // Tải chi tiết truyện
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchStoryDetail(slug)
      .then((data) => {
        setComic(data);
      })
      .catch(() => {
        setComic(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  const chapters = useMemo(() => {
    if (!comic || !Array.isArray(comic.chapters)) return [];
    return comic.chapters;
  }, [comic]);

  // Các chương sắp xếp theo thứ tự số tăng dần để tìm chương đầu / mới nhất
  const chaptersAsc = useMemo(() => {
    return [...chapters].sort((a, b) => (Number(a.num) || 0) - (Number(b.num) || 0));
  }, [chapters]);

  // Tìm chương đã đọc gần nhất trong lịch sử của bộ truyện này
  const lastReadItem = useMemo(() => {
    return history.find((item) => item.slug === slug);
  }, [history, slug]);

  // Danh sách chương hiển thị theo bộ lọc & đảo chiều sắp xếp
  const displayedChapters = useMemo(() => {
    let list = sortAsc ? [...chaptersAsc] : [...chaptersAsc].reverse();
    if (chapterFilter.trim()) {
      const q = chapterFilter.trim().toLowerCase();
      list = list.filter((c) => {
        const titleStr = `${c.title || ""} ${c.numberText || ""} ${c.num || ""} ${c.slug || ""}`.toLowerCase();
        return titleStr.includes(q);
      });
    }
    return list;
  }, [chaptersAsc, sortAsc, chapterFilter]);

  if (loading) {
    return (
      <div className="comicDetail" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center text-light">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <h5>Đang tải thông tin truyện...</h5>
        </div>
      </div>
    );
  }

  if (!comic) {
    return (
      <div className="comicDetail" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center text-light p-4" style={{ maxWidth: 480, background: "rgba(15,23,42,0.8)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
          <FaExclamationTriangle className="text-warning mb-3" size={40} />
          <h4>Truyện Không Khả Dụng</h4>
          <p className="text-secondary small">
            Nội dung này không tồn tại hoặc đã bị ẩn theo tiêu chuẩn an toàn cộng đồng.
          </p>
          <button className="btnPrimary mt-2" onClick={handleGoBack}>
            <FaArrowLeft className="me-2" /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const title = comic.title || comic.name || "Không có tiêu đề";
  const coverUrl = getCoverUrl(comic.cover || comic.thumb_url);
  const hasImageChapters = Array.isArray(comic.chapters) && comic.chapters.some((c) => c.mediaType === "image");
  const isNovel = !hasImageChapters && (comic.type === "novel" || comic.sync?.contentType === "novel");
  const status = comic.status || "Đang cập nhật";
  const author = comic.author || "Đang cập nhật";

  const goRead = (chap) => {
    if (!chap || !chap.slug) return;
    navigate(`/truyen/doc/${slug}/${chap.slug}`);
  };

  const readFirst = () => {
    if (!chaptersAsc.length) return;
    goRead(chaptersAsc[0]);
  };

  const readLatest = () => {
    if (!chaptersAsc.length) return;
    goRead(chaptersAsc[chaptersAsc.length - 1]);
  };

  const continueRead = () => {
    if (!lastReadItem) return;
    navigate(`/truyen/doc/${slug}/${lastReadItem.chapterSlug || lastReadItem.chapterId}`);
  };

  return (
    <div className="comicDetail" style={{ "--comic-bg": `url(${coverUrl})` }}>
      <div className="comicDetailContainer">
        {/* KHỐI TRÁI: THÔNG TIN TRUYỆN & DANH SÁCH CHƯƠNG */}
        <div className="comicDetailMain">
          {/* Nút quay lại */}
          <button className="btn-back-truyen mb-3" onClick={handleGoBack} title="Quay lại trang trước">
            <FaArrowLeft className="me-2" /> Quay lại
          </button>

          {/* HERO BANNER */}
          <div className="comicDetailHero">
            <div className="comicDetailLeft">
              <img
                src={coverUrl}
                alt={title}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60";
                }}
              />
              <span className={`manga-type-tag ${isNovel ? "novel" : "manga"}`}>
                {isNovel ? <><FaFeatherAlt className="me-1" /> Truyện Chữ</> : <><FaImage className="me-1" /> Truyện Tranh</>}
              </span>
            </div>

            <div className="comicDetailRight">
              <h3 className="comicDetailTitle">{title}</h3>

              <div className="comicMeta">
                <span>
                  <IoPersonCircleSharp size={18} color="#a78bfa" /> {author}
                </span>

                <span>
                  <IoMdBook size={18} color="#f472b6" /> {chapters.length} Chương
                </span>

                <span>
                  <CiClock1 size={18} color="#38bdf8" /> {status}
                </span>

                {comic.rating > 0 && (
                  <span>
                    <FaStar size={14} color="#fbbf24" /> {Number(comic.rating).toFixed(1)} / 10
                  </span>
                )}

                {comic.views > 0 && (
                  <span>
                    <FaEye size={14} color="#10b981" /> {comic.views.toLocaleString()} lượt đọc
                  </span>
                )}
              </div>

              {/* Thể loại chips */}
              {Array.isArray(comic.genres) && comic.genres.length > 0 && (
                <div className="comicGenresList d-flex flex-wrap gap-2 my-2">
                  {comic.genres.map((g, idx) => {
                    const gName = typeof g === "string" ? g : g?.name || "";
                    if (!gName) return null;
                    return (
                      <span key={idx} className="genre-chip">
                        {gName}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Nút đọc */}
              <div className="comicButtons">
                {lastReadItem && (
                  <button className="btnPrimary continue-btn" onClick={continueRead}>
                    <FaBookmark className="me-2" /> Đọc tiếp ({lastReadItem.chapterText || `Chương ${lastReadItem.chapter}`})
                  </button>
                )}

                <button className="btnPrimary" onClick={readFirst}>
                  Đọc Từ Đầu (Chương 1)
                </button>

                <button className="btnDark" onClick={readLatest}>
                  Đọc Mới Nhất
                </button>
              </div>

              {/* Tóm tắt nội dung */}
              {comic.description && (
                <div className="comicDescWrap mt-3">
                  <h5 className="desc-title">Nội dung tóm tắt</h5>
                  <p className={`comicDesc ${descExpanded ? "expanded" : ""}`}>
                    {comic.description}
                  </p>
                  {comic.description.length > 200 && (
                    <button
                      className="btn-toggle-desc"
                      onClick={() => setDescExpanded((prev) => !prev)}
                    >
                      {descExpanded ? "Thu gọn" : "Xem thêm"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DANH SÁCH CHƯƠNG */}
          <div className="comicChapters text-light">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h4 className="m-0">
                Danh sách chương <span className="text-secondary small">({chapters.length} chương)</span>
              </h4>

              <div className="d-flex align-items-center gap-2">
                {/* Thanh tìm chương */}
                <div className="chapter-search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm số chương..."
                    value={chapterFilter}
                    onChange={(e) => setChapterFilter(e.target.value)}
                  />
                </div>

                {/* Đảo chiều sắp xếp */}
                <button
                  className="btn-sort-chapters"
                  onClick={() => setSortAsc((prev) => !prev)}
                  title={sortAsc ? "Đổi sang Mới nhất trước" : "Đổi sang Cũ nhất trước"}
                >
                  {sortAsc ? (
                    <>
                      <FaSortAmountUp className="me-1" /> Cũ nhất
                    </>
                  ) : (
                    <>
                      <FaSortAmountDown className="me-1" /> Mới nhất
                    </>
                  )}
                </button>
              </div>
            </div>

            {displayedChapters.length > 0 ? (
              <div className="chapterGrid custom-scrollbar" style={{ maxHeight: 520, overflowY: "auto" }}>
                {displayedChapters.map((chap, index) => {
                  const chapLabel = chap.numberText || (chap.num !== undefined ? `Chương ${chap.num}` : chap.title || `Chương ${index + 1}`);
                  const isLastRead = lastReadItem && (lastReadItem.chapterSlug === chap.slug || String(lastReadItem.chapter) === String(chap.num));

                  return (
                    <div
                      key={chap.id || chap.slug || index}
                      className={`chapterItem ${isLastRead ? "active-read" : ""}`}
                      onClick={() => goRead(chap)}
                      title={chap.title || chapLabel}
                    >
                      <span className="chapter text-truncate">{chapLabel}</span>
                      {isLastRead && <span className="read-badge">Đang đọc</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-secondary py-4 small">
                Không tìm thấy chương phù hợp với từ khóa "{chapterFilter}"
              </div>
            )}
          </div>
        </div>

        {/* KHỐI PHẢI: LỊCH SỬ ĐỌC (SIDEBAR) */}
        <div className="comicDetailSidebar">
          {history.length > 0 && (
            <div className="readingHistory text-light">
              <div className="historyHeader d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom border-secondary border-opacity-25">
                <span className="fw-bold">Lịch sử đọc gần đây</span>
                <span className="small text-secondary">{history.length} truyện</span>
              </div>

              <div className="historyList custom-scrollbar" style={{ maxHeight: 400, overflowY: "auto" }}>
                {history.slice(0, 8).map((item, index) => (
                  <div
                    key={index}
                    className="historyRow d-flex gap-2 align-items-center py-2 border-bottom border-secondary border-opacity-10"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/truyen/doc/${item.slug}/${item.chapterSlug || item.chapterId}`)}
                  >
                    <img
                      src={item.thumb}
                      alt={item.comicName}
                      loading="lazy"
                      style={{ width: "42px", height: "58px", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <div className="historyInfo flex-grow-1 overflow-hidden">
                      <div className="historyName text-white small fw-bold text-truncate mb-1">
                        {item.comicName}
                      </div>
                      <div className="historyChap text-primary small">
                        {item.chapterText || `Chương ${item.chapter}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}