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
      
      <div className="comicDetailContainer">
        
        {/* KHỐI TRÁI: THÔNG TIN TRUYỆN & DANH SÁCH CHƯƠNG */}
        <div className="comicDetailMain">
          {/* HERO */}
          <div className="comicDetailHero">
            <div className="comicDetailLeft">
              <img src={thumb} alt={comic.name} loading="lazy" />
            </div>

            <div className="comicDetailRight">
              <h3>{comic.name}</h3>
              <p className="comicSub">{comic.origin_name || "Đang cập nhật"}</p>

              <div className="comicMeta">
                <span>
                  <IoPersonCircleSharp size={18} color="#a78bfa" /> {comic.author?.length ? comic.author : "Đang cập nhật"}
                </span>

                <span>
                  <IoMdBook size={18} color="#f472b6" /> {chapters.length} Chương
                </span>

                <span>
                  <CiClock1 size={18} color="#38bdf8" /> Cập nhật: {new Date(comic.updatedAt).toISOString().split("T")[0]}
                </span>
              </div>

              <div className="comicButtons">
                <button className="btnPrimary" onClick={readFirst}>
                  Đọc Từ Đầu
                </button>

                <button className="btnDark" onClick={readLatest}>
                  Đọc Mới Nhất
                </button>
              </div>
            </div>
          </div>

          {/* CHAPTER LIST */}
          <div className="comicChapters text-light">
            <h4>Danh sách chương ({chapters.length} chương)</h4>

            <div className="chapterGrid">
              {chapters.map((chap, index) => (
                <div
                  key={index}
                  className="chapterItem"
                  onClick={() => goRead(chap)}
                >
                  <span className="chapter">
                    Chương {chap.chapter_name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KHỐI PHẢI: LỊCH SỬ ĐỌC (SIDEBAR) */}
        <div className="comicDetailSidebar">
          {history.length > 0 && (
            <div className="readingHistory text-light">
              <div className="historyHeader" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '12px' }}>
                <span>Lịch sử đọc</span>
              </div>

              {history.map((item, index) => (
                <div
                  key={index}
                  className="historyRow"
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                  onClick={() => navigate(`/truyen/doc/${item.slug}-${item.chapterId}`)}
                >
                  <img src={item.thumb} alt={item.comicName} loading="lazy" style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div className="historyInfo" style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="historyName text-white" style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                      {item.comicName}
                    </div>
                    <div className="historyChap text-success" style={{ fontSize: '12px' }}>
                      Chương {item.chapter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}