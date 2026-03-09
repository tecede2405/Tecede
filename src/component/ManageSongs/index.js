import { useState, useEffect } from "react";
import {useNavigate} from 'react-router-dom';
import { Tabs, Empty,Button} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import "./ManageSongs.scss";

const categories = [
  { label: "Nhạc Trẻ", value: "nhactre" },
  { label: "Nhạc Âu Mỹ", value: "nhacusuk" },
  { label: "Nhạc Remix", value: "nhactreremix" },
  { label: "Nhạc Trung Quốc", value: "nhactrungquoc" },
  { label: "Nhạc Douyin", value: "nhacdouyin" },
  { label: "Nhạc EDM", value: "nhacedm" },
  { label: "Nhạc Phonk", value: "nhacphonk" },
  { label: "Nhạc Không Lời", value: "nhackhongloi" },
  { label: "Nhạc Lofi", value: "nhac-lofi" },
];

export default function ManageSongs() {
  const [activeTab, setActiveTab] = useState("nhactre");
  const [songs, setSongs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/${activeTab}`)
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error("❌ Lỗi fetch:", err));
  }, [activeTab]);

  const handleEdit = (song) => {
  console.log("Sửa bài hát:", song);
  // 👉 ví dụ:
  navigate(`/admin/songs/edit/${song._id}`);
};

const handleDelete = async (song) => {
  const result = await Swal.fire({
    title: "Xóa bài hát?",
    text: `Bạn có chắc muốn xóa bài hát "${song.title}" không?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  });

  if (!result.isConfirmed) return;

  try {
    await fetch(`${process.env.REACT_APP_API_URL}/api/songs/${song._id}`, {
      method: "DELETE",
    });

    Swal.fire({
      icon: "success",
      title: "Đã xóa!",
      text: "Bài hát đã được xóa thành công.",
      timer: 1500,
      showConfirmButton: false,
    });

    setSongs((prev) => prev.filter((s) => s._id !== song._id));
  } catch (err) {
    Swal.fire("Lỗi!", "Xóa thất bại.", "error");
  }
};


  // Nội dung bài hát theo danh mục
  const renderSongs = () => {
    if (songs.length === 0) return <Empty description="Không có bài hát nào" />;
    return (
      <div className="song-grid">
        <div className="row">
          {songs.map((song) => (
            <div className="col-xxl-3 col-xl-3 col-lg-5 col-md-5 col-sm-5 col-12 mb-3" key={song._id}>
              <div className="music-card d-flex align-items-center justify-content-between p-3 song-item">
              <div className="d-flex align-items-center">
                <img
                  src={song.image}
                  className="rounded me-3"
                  alt={song.title}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="card-music-body d-flex flex-column">
                  <h5 className="card-title mb-1">{song.title}</h5>
                  <p className="card-text mb-0">{song.artist}</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="d-flex gap-2">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(song)}
                />

                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(song)}
                />
              </div>
            </div>

            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tạo mảng items cho Tabs
  const tabItems = categories.map((cat) => ({
    label: (
      <span
        style={{
          maxWidth: 100,
          display: "inline-block",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {cat.label}
      </span>
    ),
    key: cat.value,
    children: renderSongs(), // nội dung cố định, mỗi lần fetch sẽ update theo activeTab
  }));

  return (
    <div className="manage-songs" style={{ padding: "1rem" }}>
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        type="line"
        tabPosition="top"
        centered
        items={tabItems}
      />
    </div>
  );
}
