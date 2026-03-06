import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./style.scss";

export default function SearchComic() {

  const [keyword,setKeyword] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = () => {

    if(!keyword.trim()) return;

    const slug = keyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g,"-");

    navigate(`/truyen/tim-kiem/${slug}`);

    // reset input
    setKeyword("");
    if(inputRef.current){
      inputRef.current.value = "";
    }

  };

  const handleEnter = (e) => {

    if(e.key === "Enter"){
      handleSearch();
    }

  };

  return(

    <div className="tecSearchComic">

      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm truyện..."
        value={keyword}
        onChange={(e)=>setKeyword(e.target.value)}
        onKeyDown={handleEnter}
        className="tecSearchComic__input"
      />

      <button
        className="tecSearchComic__btn"
        onClick={handleSearch}
      >
        <FaSearch />
      </button>

    </div>

  )

}