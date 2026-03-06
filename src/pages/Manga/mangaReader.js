import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";
import "./style.scss";

export default function ComicReader() {

  const { id } = useParams(); 
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comicThumb, setComicThumb] = useState("");

  const slug = id.split("-").slice(0, -1).join("-");
  const chapterId = id.split("-").pop();

  /* ================= FETCH CHAPTER ================= */

  useEffect(() => {

    if (!slug || !chapterId) return;

    setImages([]);
    setChapter(null);

    fetch(`${process.env.REACT_APP_TRUYEN_API}/truyen-tranh/${slug}`)
      .then(res => res.json())
      .then(data => {

        const item = data?.data?.item;

        const list =
          item?.chapters?.flatMap(ch => ch.server_data) || [];

        setChapters(list);

        const thumb = `${process.env.REACT_APP_TRUYEN_IMG}/${item.thumb_url}`;
        setComicThumb(thumb);

        const chap = list.find(c =>
          c.chapter_api_data.endsWith(chapterId)
        );

        if (!chap) return;

        fetch(chap.chapter_api_data)
          .then(res => res.json())
          .then(data => {

            const chapterData = data.data.item;
            setChapter(chapterData);

            const server = data.data.domain_cdn;
            const path = chapterData.chapter_path;

            const imgs = chapterData.chapter_image.map(img =>
              `${server}/${path}/${img.image_file}`
            );

            setImages(imgs);

          });

      });

  }, [slug, chapterId]);

  /* ================= SAVE HISTORY ================= */

  useEffect(() => {

    if (!chapter) return;

    const history =
      JSON.parse(localStorage.getItem("readingHistory")) || [];

    const newItem = {
      slug: slug,
      comicName: chapter.comic_name,
      chapter: chapter.chapter_name,
      chapterId: chapterId,
      thumb: comicThumb,
      time: Date.now()
    };

    const filtered = history.filter(item => item.slug !== slug);

    const newHistory = [newItem, ...filtered];

    localStorage.setItem(
      "readingHistory",
      JSON.stringify(newHistory.slice(0, 20))
    );

  }, [chapter, slug, chapterId, comicThumb]);

  if (!chapter) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "50px" }}>
        Loading chapter...
      </div>
    );
  }

  /* ================= NAVIGATION ================= */

  const currentIndex = chapters.findIndex(c =>
    c.chapter_api_data.endsWith(chapterId)
  );

  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next =
    currentIndex < chapters.length - 1
      ? chapters[currentIndex + 1]
      : null;

  const getChapterId = chap =>
    chap.chapter_api_data.split("/").pop();

  const goChap = chap => {
    window.scrollTo(0, 0);
    navigate(`/truyen/doc/${slug}-${getChapterId(chap)}`);
  };

  /* ================= UI ================= */

  return (
    <div className="tecReader">

      {/* HEADER */}
      <div className="tecReaderHeader">

        <div className="readerLeft">
          <FaArrowLeft onClick={() => navigate(-1)} />
        </div>

        <div className="readerTitle">
          <h4>{chapter.comic_name}</h4>
          <span>Chapter {chapter.chapter_name}</span>
        </div>

        <div className="readerRight">
          <FaHome onClick={() => navigate("/truyen")} />
        </div>

      </div>

      {/* CONTENT */}
      <div className="tecReaderContent">

        <div className="tecReaderImages">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`page-${index}`}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ))}
        </div>

      </div>

      {/* FOOTER */}
      <div className="tecReaderFooter">

        <button
          className="prevBtn"
          disabled={!prev}
          onClick={() => prev && goChap(prev)}
        >
          ‹
        </button>

        <span className="currentChap">
          Chapter {chapter.chapter_name}
        </span>

        <button
          className="nextBtn"
          disabled={!next}
          onClick={() => next && goChap(next)}
        >
          ›
        </button>

      </div>

    </div>
  );
}