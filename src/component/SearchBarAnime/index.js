import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/search?query=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="search-bar-anime">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm anime..."
      />
      <button onClick={handleSearch}>Tìm kiếm</button>
    </div>
  );
}

export default SearchBar;