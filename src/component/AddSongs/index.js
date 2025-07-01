import { useState } from "react";
import "./add-song.scss";

function AddSongs() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("nhactre");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Bạn chưa chọn file mp3!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("image", image);
    formData.append("category", category);
    formData.append("file", file);

    try {
      const res = await fetch("https://api-music-production-1ad8.up.railway.app/api/songs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Thêm bài hát thành công!");
        setTitle("");
        setArtist("");
        setImage("");
        setFile(null);
        setCategory("nhactre");

        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.error || "Thêm bài hát thất bại"));
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server!");
    }
  };

  return (
    <div className="add-song">
      <div className="addsongs">
        <p className="admin-desc">Thêm bài hát</p>
      </div>

      <form onSubmit={handleSubmit} className="form-add-song">
        <input
          type="text"
          placeholder="Tên bài hát"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Tên ca sĩ"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Link ảnh"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
        />

        <label htmlFor="file-upload" className="custom-upload-btn">
          Tải lên MP3
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".mp3"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: "none" }}
        />
        {file && <small style={{ marginTop: "5px", color: "#ddd", fontSize: "13px"}}>📁 {file.name}</small>}

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="nhactre">Nhạc Trẻ</option>
          <option value="nhacusuk">Nhạc Âu Mỹ</option>
          <option value="nhactrungquoc">Nhạc Trung Quốc</option>
          <option value="nhactreremix">Nhạc Remix</option>
          <option value="nhacedm">Nhạc EDM</option>
          <option value="nhacphonk">Nhạc Phonk</option>
          <option value="nhackhongloi">Nhạc Không lời</option>
        </select>

        <button type="submit">Thêm bài hát</button>
      </form>

      {message && (
        <p style={{ color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AddSongs;
