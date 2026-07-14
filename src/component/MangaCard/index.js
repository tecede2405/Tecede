import { useNavigate } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import "./style.scss";

export default function ComicCard({ comic }) {
  const navigate = useNavigate();
  const image = `https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}`;

  return (
    <div
      className="manga-card"
      onClick={() => navigate(`/truyen/chi-tiet/${comic.slug}`)}
    >
      <div className="manga-card__thumb">
        <img src={image} alt={comic.name} loading="lazy" />
        <div className="manga-card__overlay">
          <FaBookOpen className="read-icon" />
        </div>
        <span className="manga-badge manga-badge--hot">🔥 Hot</span>
      </div>

      <div className="manga-card__info">
        <h4 className="manga-title" title={comic.name}>{comic.name}</h4>
        <div className="manga-meta">
          <span className="manga-chapter">
            Chapter {comic.chaptersLatest?.[0]?.chapter_name || "??"}
          </span>
        </div>
      </div>
    </div>
  );
}