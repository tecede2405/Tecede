import React, { useState, useEffect, useCallback } from "react"; 
import "./index.scss";
const API_BASES = {
  anime: "https://kitsu.io/api/edge/anime",
  manga: "https://kitsu.io/api/edge/manga",
};

function Anime() {
  const [type, setType] = useState("anime");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");


  // fetchItems dùng useCallback để không bị warning dependency
  const fetchItems = useCallback(async () => {
    setError("");
    setStatus("Đang tải…");
    setData([]);

    const params = new URLSearchParams();
    params.set("page[limit]", String(limit));
    params.set("page[offset]", String(offset));
    if (query.trim()) params.set("filter[text]", query.trim());

    const url = API_BASES[type] + "?" + params.toString();

    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);

      const payload = await res.json();
      const results = payload.data || [];
      setData(results);
    

      setStatus(`Hiển thị ${results.length} ${type} — offset: ${offset}`);
    } catch (err) {
      setError("Lỗi khi gọi API: " + err.message);
      setStatus("Lỗi");
    }
  }, [type, query, limit, offset]);

  // Gọi fetchItems mỗi khi các dependency thay đổi
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="anime-page">
      <header className="anime__header">
        <div>
          <h1 className="anime__title">Kitsu Anime - 100% Do chatgpt tạo</h1>
          <div className="anime__meta">
            Tìm kiếm &amp; hiển thị danh sách anime
          </div>
        </div>

        <div className="anime__controls">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setOffset(0);
            }}
          >
            <option value="anime">Anime</option>
            <option value="manga">Manga</option>
          </select>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Tìm (ví dụ: Naruto, One Piece)"
            onKeyDown={(e) => {
              if (e.key === "Enter") setOffset(0);
            }}
          />

          <button onClick={() => setOffset(0)}>Tìm</button>

          <div className="anime__small">
            Limit:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setOffset(0);
              }}
            >
              <option>10</option>
              <option>5</option>
              <option>20</option>
            </select>
          </div>
        </div>
      </header>

      <main className="anime__main">
        <div className="anime__small">{status}</div>
        {error && <div className="anime__error">{error}</div>}

        <div className="anime__grid">
          {data.length === 0 ? (
            <div className="anime__small">Không tìm thấy kết quả.</div>
          ) : (
            data.map((item) => {
              const a = item.attributes || {};
              const titles = a.titles || {};
              const title =
                titles.en || titles.en_jp || a.canonicalTitle || "Không có tiêu đề";
              const sub = a.averageRating
                ? "Rating: " + a.averageRating
                : a.startDate
                ? "Bắt đầu: " + a.startDate
                : "—";
              const synopsis = a.synopsis || "Không có mô tả";
              const poster =
                (a.posterImage &&
                  (a.posterImage.small ||
                    a.posterImage.medium ||
                    a.posterImage.large)) ||
                "";

              return (
                <div key={item.id} className="anime__card">
                  <img
                    className="anime__poster"
                    alt={title}
                    src={
                      poster ||
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="84" height="120"><rect width="100%" height="100%" fill="#091229"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5b7088" font-size="10">No Image</text></svg>'
                    }
                  />
                  <div className="anime__info">
                    <h3 className="anime__card-title">{title}</h3>
                    <div className="anime__sub">{sub}</div>
                    <div className="anime__syn">{synopsis}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="anime__pager">
          <button onClick={() => setOffset(Math.max(0, offset - limit))}>
            « Trước
          </button>
          <div className="anime__small">
            offset: {offset} • limit: {limit}
          </div>
          <button onClick={() => setOffset(offset + limit)}>Sau »</button>
        </div>
      </main>
    </div>
  );
}

export default Anime;
