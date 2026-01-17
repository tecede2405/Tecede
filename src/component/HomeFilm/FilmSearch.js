import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";

function FilmSearch() {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const goSearch = () => {
    if (!search.trim()) return;
    const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/search/${slug}`);
    setSearch("");
    inputRef.current.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") goSearch();
  };

  return (
    <div className="input-search-film">
      <input
        type="text"
        ref={inputRef}
        className="input-film fst-italic"
        placeholder="Tìm kiếm phim..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <CiSearch className="search-film-icon" onClick={goSearch} />
    </div>
  );
}

export default FilmSearch;
