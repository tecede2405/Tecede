import { useNavigate } from "react-router-dom";
import "./style.scss";

export default function ComicCard({ comic }) {

  const navigate = useNavigate();

  const image = `https://img.otruyenapi.com/uploads/comics/${comic.thumb_url}`;

  return (
    <div
      className="comicCard"
      onClick={() => navigate(`/truyen/chi-tiet/${comic.slug}`)}
    >

      <div className="comicThumb">

        <img src={image} alt={comic.name} />

        <span className="badge">✨ Hot</span>

      </div>

      <div className="comicInfo">

        <h4 className="text-light">{comic.name}</h4>

        <div className="meta">
          <span className="chap">
            Chap {comic.chaptersLatest?.[0]?.chapter_name}
          </span>

        </div>

        <p className="newChap">
          Tập mới: Chapter {comic.chaptersLatest?.[0]?.chapter_name}
        </p>

      </div>

    </div>
  );
}