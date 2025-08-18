function SearchBar({ onSearch }) {
  return (
    <div className="mb-4 mt-2">
      <label htmlFor="search" className="form-label">Tìm kiếm anime 🔍 : </label>
      <input
        type="text"
        className="form-control"
        placeholder="Tìm anime..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div> 
  );
}

export default SearchBar;