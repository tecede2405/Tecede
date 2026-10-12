import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./style.scss";

const BLOCKED_WORDS = ["hentai", "18+", "ecchi", "loan luan", "loạn luân", "dâm", "khiêu dâm", "sex", "sayhentai"];

export default function SearchComic({ placeholder = "Tìm kiếm truyện tranh, truyện chữ..." }) {
  const [keyword, setKeyword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    // Kiểm tra từ khóa cấm
    const lower = trimmed.toLowerCase();
    for (const w of BLOCKED_WORDS) {
      if (lower.includes(w)) {
        setErrorMsg("Từ khóa bị hạn chế theo tiêu chuẩn an toàn");
        setTimeout(() => setErrorMsg(""), 3000);
        return;
      }
    }

    const slug = encodeURIComponent(trimmed.replace(/\s+/g, "-"));
    navigate(`/truyen/tim-kiem/${slug}`);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setKeyword("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="manga-search-bar">
      <div className="manga-search-bar__inner">
        <FaSearch className="manga-search-bar__icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          onKeyDown={handleEnter}
          className="manga-search-bar__input"
        />
        {keyword && (
          <button className="manga-search-bar__clear" onClick={handleClear} type="button" title="Xóa">
            <FaTimes />
          </button>
        )}
        <button className="manga-search-bar__btn" onClick={handleSearch} type="button">
          Tìm Kiếm
        </button>
      </div>
      {errorMsg && <div className="manga-search-error text-danger small mt-1">{errorMsg}</div>}
    </div>
  );
}