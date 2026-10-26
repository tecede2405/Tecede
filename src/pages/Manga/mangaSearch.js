import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ComicCard from "../../component/MangaCard";
import MangaSearch from "../../component/SearchComic/index";
import { IoIosArrowDropleft } from "react-icons/io";
import { FaBookOpen, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { searchStories } from "../../utils/truyenApi";

export default function SearchResult() {
  const { slug } = useParams();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const navigate = useNavigate();
  const rawKeyword = decodeURIComponent(slug || "").replace(/-/g, " ");

  useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  // Lưu URL tìm kiếm để khi xem chi tiết quay lại đúng kết quả
  useEffect(() => {
    try {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("lastMangaListUrl", currentUrl);
    } catch (e) {}
  }, [slug, currentPage]);

  useEffect(() => {
    if (!rawKeyword.trim()) return;

    setLoading(true);
    setIsBlocked(false);

    searchStories(rawKeyword, currentPage, 24)
      .then((res) => {
        if (res.blocked) {
          setIsBlocked(true);
          setData([]);
          setMeta({ page: 1, perPage: 24, total: 0, totalPages: 1 });
        } else {
          setData(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawKeyword, currentPage]);

  return (
    <div className="manga-home searchResult pt-4">
      <div className="container p-0">
        <MangaSearch placeholder="Tìm kiếm truyện khác..." />

        <div className="d-flex align-items-center justify-content-between mb-4 mt-4 flex-wrap gap-2">
          <h3 className="text-light m-0 d-flex align-items-center gap-2" style={{ fontWeight: 700 }}>
            <IoIosArrowDropleft
              style={{ cursor: "pointer", fontSize: "32px", color: "#a78bfa" }}
              onClick={() => navigate("/truyen")}
              title="Quay lại danh sách truyện"
            />
            <span>
              Kết quả tìm kiếm cho: <span className="text-warning">"{rawKeyword}"</span>
            </span>
          </h3>

          {!loading && meta.total > 0 && (
            <span className="text-secondary small">Tìm thấy {meta.total} kết quả phù hợp</span>
          )}
        </div>

        {/* Cảnh báo từ khóa bị chặn / hentai */}
        {isBlocked && (
          <div className="manga-empty-state">
            <FaExclamationTriangle className="text-warning empty-icon" />
            <h4>Từ khóa bị hạn chế</h4>
            <p>Từ khóa này không phù hợp với tiêu chuẩn an toàn cộng đồng của Tecede.</p>
            <button className="btn-empty-reset" onClick={() => navigate("/truyen")}>
              Quay lại kho truyện an toàn
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="comicList">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="manga-card skeleton">
                <div className="skeleton-box manga-card__thumb"></div>
                <div className="manga-card__info">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line small"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Không có kết quả */}
        {!loading && !isBlocked && data.length === 0 && (
          <div className="manga-empty-state">
            <FaBookOpen className="empty-icon" />
            <h4>Không tìm thấy truyện phù hợp</h4>
            <p>Thử tìm kiếm với từ khóa khác hoặc duyệt danh mục truyện tranh / truyện chữ nhé.</p>
            <button className="btn-empty-reset" onClick={() => navigate("/truyen")}>
              Khám phá toàn bộ truyện
            </button>
          </div>
        )}

        {/* Có dữ liệu */}
        {!loading && !isBlocked && data.length > 0 && (
          <>
            <div className="comicList">
              {data.map((item) => (
                <ComicCard key={item.id || item.slug} comic={item} />
              ))}
            </div>

            {/* Phân trang */}
            {meta.totalPages > 1 && (
              <div className="manga-pagination mt-5">
                <button
                  className="page-btn prev"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <FaChevronLeft />
                </button>
                <div className="page-numbers">
                  <span className="page-btn active">{currentPage} / {meta.totalPages}</span>
                </div>
                <button
                  className="page-btn next"
                  disabled={currentPage >= meta.totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}