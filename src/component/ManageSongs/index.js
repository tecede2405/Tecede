import { useState, useEffect } from "react";
import { Tabs, Empty } from "antd";
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
];

export default function ManageSongs() {
  const [activeTab, setActiveTab] = useState("nhactre");
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/${activeTab}`)
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error("❌ Lỗi fetch:", err));
  }, [activeTab]);

  // Nội dung bài hát theo danh mục
  const renderSongs = () => {
    if (songs.length === 0) return <Empty description="Không có bài hát nào" />;
    return (
      <div className="song-grid">
        <div className="row">
          {songs.map((song) => (
            <div className="col-xxl-3 col-xl-3 col-lg-5 col-md-5 col-sm-5 col-12 mb-3" key={song._id}>
              <div className="music-card d-flex align-items-center p-3 song-item">
                <img
                  src={song.image}
                  className="rounded mr-3"
                  alt={song.title}
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="card-music-body d-flex flex-column">
                  <h5 className="card-title mb-1">{song.title}</h5>
                  <p className="card-text mb-2">{song.artist}</p>
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
