import { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

export default function AddDonate() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nickname: "",
    amount: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "amount"
          ? Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setForm({
      nickname: "",
      amount: "",
      message: "",
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

    if (!form.nickname.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu biệt danh",

        background: "#111827",
        color: "#fff",

        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (!form.amount || form.amount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Số tiền không hợp lệ",

        background: "#111827",
        color: "#fff",

        confirmButtonColor: "#2563eb",
      });

      return;
    }

    const confirm = await Swal.fire({
      title: "Thêm donate?",
      text: "Xác nhận thêm người donate",

      icon: "question",

      background: "#111827",
      color: "#fff",

      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#374151",

      showCancelButton: true,

      confirmButtonText: "Thêm",
      cancelButtonText: "Huỷ",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/donates`,
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
          title: "Thêm donate thành công",

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
          title:
            data.message || "Lỗi server",

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
    <div className="add-donate-page">
      <div className="add-donate-header">
        <h2>Thêm người donate</h2>

        <p>
          Thêm danh sách donate tháng này
        </p>
      </div>

      <form
        className="add-donate-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          {/* NICKNAME */}
          <div className="form-group">
            <label>Biệt danh</label>

            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Ví dụ: Minh"
            />
          </div>

          {/* AMOUNT */}
          <div className="form-group">
            <label>Số tiền</label>

            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="50000"
            />
          </div>

          {/* MESSAGE */}
          <div className="form-group full">
            <label>Nội dung</label>

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Cảm ơn web..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading
            ? "Đang thêm..."
            : "Thêm donate"}
        </button>
      </form>
    </div>
  );
}