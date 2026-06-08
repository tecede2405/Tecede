import React, { useState, useEffect, useRef } from "react";
import "./searchBox.scss";

export default function SearchBar({ songs, onSelectSong }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  // Đóng list gợi ý khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(value.toLowerCase()) ||
        song.artist.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleSelect = (song) => {
    const index = songs.findIndex((s) => s._id === song._id);
    onSelectSong(index);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <h6 className="search-label">Tìm nhạc ở đây nè</h6>
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Tìm bài hát hoặc nghệ sĩ..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
          autoComplete="off"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((song) => (
              <li key={song._id} className="suggestion-item" onClick={() => handleSelect(song)}>
                <img src={song.image} alt={song.title} className="suggestion-img" />
                <div className="suggestion-info">
                  <strong className="suggestion-title">{song.title}</strong>
                  <span className="suggestion-artist">{song.artist}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}