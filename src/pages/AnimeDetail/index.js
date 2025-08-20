import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./style.scss";
import Loading from "../../component/Loading/index";
import AnimeHeader from "../../component/AnimeHeader/index";

export default function AnimeDetail() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [categories, setCategories] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);

  const fetchAnime = fetch(`https://kitsu.io/api/edge/anime/${id}`).then(r => r.json());
  const fetchCategories = fetch(`https://kitsu.io/api/edge/anime/${id}/categories?page[limit]=12`).then(r => r.json());
  const fetchCharacters = fetch(`https://kitsu.io/api/edge/anime/${id}/anime-characters?include=character&page[limit]=12`).then(res => res.json());

  Promise.all([fetchAnime, fetchCategories, fetchCharacters])
    .then(([animeData, categoriesData, charactersData]) => {
      setAnime(animeData.data);
      setCategories(categoriesData.data || []);

      // ✅ Lấy nhân vật từ included
      const characters = charactersData.included?.filter(item => item.type === "characters") || [];
      setCharacters(characters);
    })
    .catch(err => {
      console.error(err);
      setAnime(null);
      setCategories([]);
      setCharacters([]);
    })
    .finally(() => {
      setLoading(false);
    });
}, [id]);

  const a = anime?.attributes;
  const isReady = anime && a;

  return (
    <>
    <div className={`detail ${loading ? "loading-mode" : ""}`}>
      {loading || !isReady ? (
        <Loading />
      ) : (
        <> 
          <div className="detail-anime">
          <AnimeHeader />
          <div
            className="detail-hero"
            style={{
              backgroundImage: `url(${a.coverImage?.original || a.coverImage?.large || a.posterImage?.large || a.posterImage?.medium})`,
            }}
          >
            <div className="detail-hero__mask" />
            <div className="detail-hero__inner container">
              <img
                className="detail-hero__poster"
                src={a.posterImage?.large || a.posterImage?.medium}
                alt={a.canonicalTitle}
              />

              <div className="detail-hero__info">
                <h1 className="detail-hero__title">{a.canonicalTitle}</h1>
                {(a.titles?.en || a.titles?.en_jp || a.titles?.ja_jp) && (
                  <div className="detail-hero__subtitle">
                    {a.titles?.en || a.titles?.en_jp || a.titles?.ja_jp}
                  </div>
                )}

                <div className="detail-hero__badges">
                  <span className="badge badge--brand">⭐ {a.averageRating || "N/A"}</span>
                  <span className="badge">{a.ageRatingGuide || a.ageRating || "N/A"}</span>
                  <span className="badge">{a.startDate?.slice(0, 4) || "N/A"}</span>
                  <span className="badge">Tập {a.episodeCount ?? "??"}</span>
                  <span className={`badge ${a.status === "finished" ? "badge--success" : "badge--warning"}`}>
                    {a.status === "finished" ? "Đã hoàn thành" : "Đang phát"}
                  </span>
                </div>

                {categories.length > 0 && (
                  <div className="detail-hero__tags">
                    {categories.map(c => (
                      <span key={c.id} className="tag">
                        {c.attributes.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
          <div className="container detail-body">
            <section className="detail-section">
              <h2 className="section-title">Giới thiệu</h2>
              <p className="section-text">{a.synopsis}</p>
            </section>

            {characters.length > 0 && (
              <section className="detail-section">
                <h2 className="section-title">Diễn viên / Nhân vật</h2>
                <div className="cast-grid">
                  {characters.map(ch => (
                    <div key={ch.id} className="cast">
                      <img
                        src={
                          ch.attributes?.image?.original ||
                          ch.attributes?.image?.small ||
                          ch.attributes?.image?.tiny ||
                          "/avatar-fallback.png"
                        }
                        alt={ch.attributes?.name}
                      />
                      <div className="cast__name">{ch.attributes?.name}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>     
        </>
      )}
    </div>
    </>
    
  );
}