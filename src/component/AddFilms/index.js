import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

const categories = [
  "phim-hot",
  "high-rate-film",
  "phim-moi",
  "anime-moi",
  "phim-hot-2",
  "korea-film",
  "china-film",
  "china3d",
  "anime",
  "phim-noi-bat",
  "phim-chieu-rap",
  "tokusatsu",
];

export default function AddMovie() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    path: "",
    origin_name: "",
    lang: "",
    image: "",
    thumb: "",
    video: "",
    content: "",
    order_index: 0,
    episode_current: "",
    category: "phim-hot",
  });

  /* AUTO SLUG */
  useEffect(() => {
    if (!form.title) return;

    setForm((prev) => ({
      ...prev,

      path:
        prev.path ||
        form.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
    }));
  }, [form.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        name === "order_index"
          ? Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      path: "",
      origin_name: "",
      lang: "",
      image: "",
      thumb: "",
      video: "",
      content: "",
      order_index: 0,
      episode_current: "",
      category: "phim-hot",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      Swal.fire({
        icon: "error",
        title: "Chưa đăng nhập admin",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (!form.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu tiêu đề phim",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (!form.path.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu slug / path",
        background: "#111827",
        color: "#fff",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    const confirm = await Swal.fire({
      title: "Thêm phim?",
      text: "Xác nhận thêm phim vào hệ thống",
      icon: "question",

      background: "#111827",
      color: "#fff",

      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#374151",

      showCancelButton: true,

      confirmButtonText: "Thêm phim",
      cancelButtonText: "Huỷ",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/movies`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${user.token}`,
          },

          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Thêm phim thành công",

          toast: true,
          position: "top-end",

          timer: 2500,
          showConfirmButton: false,

          background: "#111827",
          color: "#fff",
        });

        resetForm();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: data.message || "Lỗi server",

          background: "#111827",
          color: "#fff",

          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối",

        background: "#111827",
        color: "#fff",

        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-movie-page">
      <div className="add-song-header">
        <h2>Thêm phim mới</h2>

        <p>
          Điền thông tin để thêm phim vào hệ
          thống
        </p>
      </div>

      <form
        className="add-movie-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          {/* TITLE */}
          <div className="form-group full">
            <label>Tiêu đề phim</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề..."
            />
          </div>

          {/* SLUG */}
          <div className="form-group">
            <label>Path / Slug</label>

            <input
              type="text"
              name="path"
              value={form.path}
              onChange={handleChange}
              placeholder="vd: thanh-guom-diet-quy"
            />
          </div>

          {/* ORIGIN */}
          <div className="form-group">
            <label>Tên gốc</label>

            <input
              type="text"
              name="origin_name"
              value={form.origin_name}
              onChange={handleChange}
            />
          </div>

          {/* LANG */}
          <div className="form-group">
            <label>Ngôn ngữ</label>

            <input
              type="text"
              name="lang"
              value={form.lang}
              onChange={handleChange}
            />
          </div>

          {/* EP */}
          <div className="form-group">
            <label>Tập hiện tại</label>

            <input
              type="text"
              name="episode_current"
              value={form.episode_current}
              onChange={handleChange}
            />
          </div>

          {/* POSTER + THUMB */}
          <div className="form-row full">
            <div className="form-group">
              <label>Poster</label>

              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
              />

              {form.image && (
                <img
                  src={form.image}
                  alt=""
                  className="preview-img"
                />
              )}
            </div>

            <div className="form-group">
              <label>Thumbnail</label>

              <input
                type="text"
                name="thumb"
                value={form.thumb}
                onChange={handleChange}
              />

              {form.thumb && (
                <img
                  src={form.thumb}
                  alt=""
                  className="preview-img"
                />
              )}
            </div>
          </div>

          {/* VIDEO */}
          <div className="form-group full">
            <label>Video URL</label>

            <input
              type="text"
              name="video"
              value={form.video}
              onChange={handleChange}
            />
          </div>

          {/* CATEGORY */}
          <div className="form-group">
            <label>Danh mục</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* ORDER */}
          <div className="form-group">
            <label>Order index</label>

            <input
              type="number"
              name="order_index"
              value={form.order_index}
              onChange={handleChange}
            />
          </div>

          {/* CONTENT */}
          <div className="form-group full">
            <label>Mô tả</label>

            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Mô tả nội dung..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Đang thêm phim..."
            : "Thêm phim"}
        </button>
      </form>
    </div>
  );
}