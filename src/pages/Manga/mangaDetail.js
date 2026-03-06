import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoMdBook } from "react-icons/io";
import { IoPersonCircleSharp } from "react-icons/io5";
import { CiClock1 } from "react-icons/ci";
import "./style.scss";

export default function ComicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [comic, setComic] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("readingHistory")) || [];
    setHistory(data);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_TRUYEN_API}/truyen-tranh/${slug}`)
      .then(res => res.json())
      .then(data => {
        const item = data.data.item;
        const chapterList =
          data.data.item.chapters?.flatMap(ch => ch.server_data) || [];

        setComic(item);
        setChapters(chapterList);
      });
  }, [slug]);

  if (!comic) return null;

  const thumb = `${process.env.REACT_APP_TRUYEN_IMG}/${comic.thumb_url}`;

  const getChapterId = (chap) => {
    return chap.chapter_api_data.split("/").pop();
  };

  const goRead = (chap) => {
    const id = getChapterId(chap);
    navigate(`/truyen/doc/${slug}-${id}`);
  };

  const readFirst = () => {
    if (!chapters.length) return;
    goRead(chapters[0]);
  };

  const readLatest = () => {
    if (!chapters.length) return;
    goRead(chapters[chapters.length - 1]);
  };

  return (
    <div className="comicDetail" style={{ "--comic-bg": `url(${thumb})` }}>
      
      {/* HERO */}
      <div className="comicDetailHero">
        <div className="comicDetailLeft">
          <img src={thumb} alt={comic.name} />
        </div>

        <div className="comicDetailRight">
          <h4 className="text-light">{comic.name}</h4>
          <p className="comicSub">{comic.origin_name}</p>

          <div className="comicMeta">
            <span className="text-light">
              <IoPersonCircleSharp /> {comic.author?.length ? comic.author : "Đang cập nhật"}
            </span>

            <span className="text-light">
              <IoMdBook /> {chapters.length} chương
            </span>

            <span className="text-light">
              <CiClock1 /> Cập nhật: {new Date(comic.updatedAt).toISOString().split("T")[0]}
            </span>
          </div>

          <div className="comicButtons">
            <button className="btnPrimary" onClick={readFirst}>
              Đọc từ đầu
            </button>

            <button className="btnDark" onClick={readLatest}>
              Đọc mới nhất
            </button>
          </div>
        </div>
      </div>

      {/* CHAPTER LIST */}
      <div className="comicChapters text-light">
        <h3>Danh sách chương ({chapters.length} chương)</h3>

        <div className="chapterGrid">
          {chapters.map((chap, index) => (
            <div
              key={index}
              className="chapterItem"
              onClick={() => goRead(chap)}
            >
              <span className="chapter">
                Chapter {chap.chapter_name}
              </span>
              <span>›</span>
            </div>
          ))}
        </div>
      </div>
      {/* READING HISTORY */}
      <div className="readingHistory text-light">

        <h3>Truyện đã đọc</h3>

        <div className="historyTable">

          <div className="historyHeader">
            <span className="">Ảnh</span>
            <span className="historyCol chapter">Tên truyện</span>
            <span className="historyCol chapter">Chapter</span>
          </div>

          {history.map((item, index) => (

            <div
              key={index}
              className="historyRow"
              onClick={() =>
                navigate(`/truyen/doc/${item.slug}-${item.chapterId}`)
              }
            >

              <div className="historyCol thumb">
                <img
                  src={item.thumb}
                  alt={item.comicName}
                />
              </div>

              <div className="historyCol chapter">
                {item.comicName}
              </div>

              <div className="historyCol chapter">
                Chapter {item.chapter}
              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}