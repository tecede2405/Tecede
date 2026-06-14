import React, { useState } from "react";
import Swal from "sweetalert2";
import { useMovies } from "../../context/MoviesContext";
import { useAuth } from "../../context/AuthContext"; 
import "./style.scss";

const MovieManager = () => {
  const { grouped } = useMovies();
  const { user } = useAuth(); // Lấy user từ context
  const movies = grouped["phim-hot"] || [];
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({});

  const API_URL = process.env.REACT_APP_SERVER_API_URL || "";

  // 1. CẬP NHẬT INDEX
  const handleUpdateIndex = async (movie, newIndex, inputElement) => {
    const parsedIndex = parseInt(newIndex, 10);
    
    if (isNaN(parsedIndex) || movie.order_index === parsedIndex) return;

    if (!user?.token) {
      Swal.fire({ icon: "error", title: "Chưa đăng nhập admin", background: "#1f2937", color: "#f3f4f6" });
      inputElement.value = movie.order_index;
      return;
    }

    const result = await Swal.fire({
      title: "Xác nhận đổi vị trí?",
      text: `Đổi vị trí của phim "${movie.title}" thành ${parsedIndex}?`,
      icon: "warning",
      showCancelButton: true,
      background: "#1f2937",
      color: "#f3f4f6",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const payload = { ...movie, order_index: parsedIndex };
        const response = await fetch(`${API_URL}/movies/${movie.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}` // Thêm Token vào đây
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          Swal.fire({ title: "Thành công!", text: "Vị trí đã được cập nhật.", icon: "success", background: "#1f2937", color: "#f3f4f6" });
        } else {
          Swal.fire({ title: "Lỗi!", text: "Không thể cập nhật.", icon: "error", background: "#1f2937", color: "#f3f4f6" });
          inputElement.value = movie.order_index;
        }
      } catch (error) {
        Swal.fire({ title: "Lỗi!", text: "Mất kết nối server.", icon: "error", background: "#1f2937", color: "#f3f4f6" });
        inputElement.value = movie.order_index;
      }
    } else {
      inputElement.value = movie.order_index;
    }
  };

  // 2. MỞ FORM SỬA
  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setFormData(movie);
  };

  // 3. XỬ LÝ NHẬP LIỆU
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "order_index" ? parseInt(value, 10) : value,
    }));
  };

  // 4. SUBMIT FORM
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      Swal.fire({ icon: "error", title: "Chưa đăng nhập admin", background: "#1f2937", color: "#f3f4f6" });
      return;
    }

    const result = await Swal.fire({
      title: "Cập nhật phim?",
      text: `Xác nhận cập nhật "${formData.title}"?`,
      icon: "warning",
      showCancelButton: true,
      background: "#1f2937",
      color: "#f3f4f6",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Cập nhật",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/movies/${formData.id}`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}` // Thêm Token vào đây
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          Swal.fire({ title: "Thành công!", text: "Đã cập nhật.", icon: "success", background: "#1f2937", color: "#f3f4f6" });
          setEditingMovie(null);
        } else {
          Swal.fire({ title: "Lỗi!", text: "Không thể cập nhật.", icon: "error", background: "#1f2937", color: "#f3f4f6" });
        }
      } catch (error) {
        Swal.fire({ title: "Lỗi!", text: "Mất kết nối server.", icon: "error", background: "#1f2937", color: "#f3f4f6" });
      }
    }
  };

  return (
    <div className="movie-manager">
      <h2>Quản lý Phim Hot</h2>

      {/* BỌC TABLE TRONG THẺ NÀY ĐỂ RESPONSIVE */}
      <div className="table-responsive">
        <table className="movie-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên phim (Gốc)</th>
              <th className="text-center">Vị trí</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
                <tr key={movie.id}>
                <td>
                    {/* Đổi thứ tự ưu tiên lấy ảnh dọc */}
                    <img src={movie.image || movie.thumb} alt={movie.title} className="movie-img" />
                </td>
                <td>
                    <div className="movie-info">
                    <strong>{movie.title}</strong>
                    <small>{movie.origin_name}</small>
                  </div>
                </td>
                <td className="text-center">
                  <input
                    type="number"
                    className="index-input"
                    defaultValue={movie.order_index}
                    onBlur={(e) => handleUpdateIndex(movie, e.target.value)}
                  />
                </td>
                <td className="text-center">
                  <button className="btn-edit" onClick={() => handleEditClick(movie)}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>Chưa có phim nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL SỬA CHI TIẾT */}
      {editingMovie && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Sửa thông tin: {editingMovie.title}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên phim:</label>
                  <input type="text" name="title" value={formData.title || ""} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Tên gốc:</label>
                  <input type="text" name="origin_name" value={formData.origin_name || ""} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Slug (Path):</label>
                  <input type="text" name="path" value={formData.path || ""} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Tập hiện tại:</label>
                  <input type="text" name="episode_current" value={formData.episode_current || ""} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Ngôn ngữ:</label>
                  <input type="text" name="lang" value={formData.lang || ""} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Vị trí (Order Index):</label>
                  <input type="number" name="order_index" value={formData.order_index || 0} onChange={handleFormChange} />
                </div>
                <div className="form-group full-width">
                  <label>Ảnh Poster (Image URL):</label>
                  <input type="text" name="image" value={formData.image || ""} onChange={handleFormChange} />
                </div>
                <div className="form-group full-width">
                  <label>Ảnh Thumbnail (Thumb URL):</label>
                  <input type="text" name="thumb" value={formData.thumb || ""} onChange={handleFormChange} />
                </div>
                <div className="form-group full-width">
                  <label>Nội dung (Content):</label>
                  <textarea name="content" rows={4} value={formData.content || ""} onChange={handleFormChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingMovie(null)}>Hủy</button>
                <button type="submit" className="btn-save">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManager;