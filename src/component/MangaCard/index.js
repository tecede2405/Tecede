import { useNavigate } from "react-router-dom";
import { FaBookOpen, FaFeatherAlt, FaStar, FaEye, FaImage } from "react-icons/fa";
import { getCoverUrl } from "../../utils/truyenApi";
import "./style.scss";

export default function ComicCard({ comic }) {
  const navigate = useNavigate();
  if (!comic) return null;

  const title = comic.title || comic.name || "Không có tiêu đề";
  const coverUrl = getCoverUrl(comic.cover || comic.thumb_url);
  const hasImageChapters = Array.isArray(comic.chapters) && comic.chapters.some((c) => c.mediaType === "image");
  const isNovel = !hasImageChapters && (comic.type === "novel" || comic.sync?.contentType === "novel");
  const latestChap = Array.isArray(comic.chapters) && comic.chapters.length > 0 ? comic.chapters[0] : null;
  const chapterText =
    latestChap?.numberText ||
    (latestChap?.num !== undefined ? `Chương ${latestChap.num}` : (comic.chaptersLatest?.[0]?.chapter_name ? `Chương ${comic.chaptersLatest[0].chapter_name}` : null));
  const status = comic.status || "";

  return (
    <div
      className="manga-card"
      onClick={() => navigate(`/truyen/chi-tiet/${comic.slug}`)}
      title={title}
    >
      <div className="manga-card__thumb">
        <img
          src={coverUrl}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60";
          }}
        />
        <div className="manga-card__overlay">
          <FaBookOpen className="read-icon" />
        </div>

        {/* Badge Phân Loại: Truyện Chữ vs Truyện Tranh */}
        <span className={`manga-badge manga-badge--type ${isNovel ? "novel" : "manga"}`}>
          {isNovel ? (
            <>
              <FaFeatherAlt className="me-1" /> Chữ
            </>
          ) : (
            <>
              <FaImage className="me-1" /> Tranh
            </>
          )}
        </span>

        {/* Badge Hoàn thành */}
        {status.toLowerCase().includes("hoàn") && (
          <span className="manga-badge manga-badge--status">Full</span>
        )}

        {/* Rating nếu có */}
        {comic.rating > 0 && (
          <span className="manga-badge manga-badge--rating">
            <FaStar className="me-1 text-warning" /> {Number(comic.rating).toFixed(1)}
          </span>
        )}
      </div>

      <div className="manga-card__info">
        <h4 className="manga-title">{title}</h4>
        <div className="manga-meta">
          <span className="manga-chapter text-truncate">
            {chapterText || "Đang cập nhật"}
          </span>
          {comic.views > 0 && (
            <span className="manga-views" title={`${comic.views} lượt xem`}>
              <FaEye className="me-1" />
              {comic.views >= 1000 ? `${(comic.views / 1000).toFixed(1)}k` : comic.views}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}