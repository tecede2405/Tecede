import { useState } from "react";
import axios from "axios";
import "./add-song.scss";

function AddSongs() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("nhactre");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("❌ Bạn chưa chọn file MP3");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("image", image);
    formData.append("category", category);
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/songs/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (event) => {
            const percent = Math.round(
              (event.loaded * 100) / event.total
            );

            setProgress(percent);
          },
        }
      );

      if (res.status === 201) {
        setMessage("✅ Thêm bài hát thành công");

        setTitle("");
        setArtist("");
        setImage("");
        setFile(null);
        setCategory("nhactre");
        setProgress(0);

        document.getElementById("file-upload").value = "";

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (err) {
      console.log(err);

      setMessage("❌ Upload thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-song-page">
      <div className="add-song-header">
        <h2>Thêm bài hát</h2>
        <p>Upload nhạc và quản lý thư viện âm nhạc</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="add-song-form"
      >
        <div className="form-grid">
          <div className="form-group">
            <label>Tên bài hát</label>

            <input
              type="text"
              placeholder="Ví dụ: Em của ngày hôm qua"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Ca sĩ</label>

            <input
              type="text"
              placeholder="Ví dụ: Sơn Tùng MTP"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Ảnh bài hát</label>

          <input
            type="text"
            placeholder="Dán link ảnh..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Thể loại</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {/* Đã đồng bộ chuẩn 100% với dbType mới */}
            <option value="nhactre">Nhạc trẻ</option>
            <option value="nhacusuk">US UK</option>
            <option value="nhactrungquoc">Trung Quốc</option>
            <option value="nhacdouyin">Douyin</option>
            <option value="nhactreremix">Remix</option>
            <option value="nhacedm">EDM</option>
            <option value="nhacphonk">Phonk</option>
            <option value="nhackhongloi">Tâm Trạng / Không lời</option>
            <option value="nhac-lofi">Lofi</option>
          </select>
        </div>

        <div className="upload-box">
          <label
            htmlFor="file-upload"
            className="upload-area"
          >
            <div className="upload-text">
              {file
                ? file.name
                : "Chọn file MP3"}
            </div>

            <span>
              Click để tải file âm thanh
            </span>
          </label>

          <input
            id="file-upload"
            type="file"
            accept=".mp3"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            hidden
          />
        </div>

        {progress > 0 && progress < 100 && (
          <div className="progress-wrapper">
            <div className="progress-info">
              <span>Đang upload...</span>
              <span>{progress}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Đang xử lý..."
            : "Thêm bài hát"}
        </button>

        {message && (
          <div
            className={`message ${
              message.includes("✅")
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default AddSongs;