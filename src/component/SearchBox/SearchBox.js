import React, { useState } from "react";
import "./searchBox.scss";

export default function SearchBar({ songs, onSelectSong }) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const filterSongs = (keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    if (!keyword.trim()) return [];
    return songs.filter(
      (song) =>
        song.title.toLowerCase().startsWith(lowerKeyword) ||
        song.artist.toLowerCase().startsWith(lowerKeyword)
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = filterSongs(value);
    setSuggestions(filtered);
  };

  const handleSelect = (song) => {
    const index = songs.indexOf(song);
    onSelectSong(index);
    setSearch("");
    setSuggestions([]);
  };

  return (
    <div className="mb-3 position-relative">
      <input
        type="text"
        placeholder="Tìm bài hát hoặc nghệ sĩ..."
        value={search}
        onChange={handleSearchChange}
        className="form-control"
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((song, index) => (
            <li
              key={song.id || index}
              className="suggestion-item"
              onClick={() => handleSelect(song)}
            >
              <img
                src={song.image}
                alt={song.title}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: "cover",
                  borderRadius: 4,
                  marginRight: 10,
                }}
              />
              <div>
                <div>
                  <strong className="suggestion-song-title">{song.title}</strong>
                </div>
                <small className="suggestion-song-text">{song.artist}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
