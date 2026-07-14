import { useEffect, useState } from "react";
import ComicCard from "../../component/MangaCard/index";
import SearchComic from "../../component/SearchComic/index";
import { FaFire, FaClock, FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import "./style.scss";

export default function Manga() {
  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [coming, setComing] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    // mới cập nhật
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/truyen-moi`)
      .then(res => res.json())
      .then(data => setLatest(data.data.items.slice(0, 24)));

    // đang thịnh hành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/dang-phat-hanh`)
      .then(res => res.json())
      .then(data => setTrending(data.data.items.slice(0, 24)));

    // sắp ra mắt
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/sap-ra-mat`)
      .then(res => res.json())
      .then(data => setComing(data.data.items.slice(0, 24)));

    // hoàn thành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/hoan-thanh`)
      .then(res => res.json())
      .then(data => setCompleted(data.data.items.slice(0, 24)));
  }, []);

  return (
    <div className="manga-home">
      <div className="manga-hero">
        <h1 className="manga-hero__title">Thế Giới Truyện Tranh</h1>
        <p className="manga-hero__desc">Khám phá hàng ngàn bộ truyện tranh siêu hấp dẫn được cập nhật liên tục mỗi ngày.</p>
        <SearchComic />
      </div>

      <div className="manga-sections container-fluid p-0">
        <ComicBlock 
          title="Đang Thịnh Hành" 
          icon={<FaFire className="text-danger" />} 
          data={trending} 
        />
        <ComicBlock 
          title="Mới Cập Nhật" 
          icon={<FaClock className="text-warning" />} 
          data={latest} 
        />
        <ComicBlock 
          title="Sắp Ra Mắt" 
          icon={<FaCalendarAlt className="text-info" />} 
          data={coming} 
        />
        <ComicBlock 
          title="Đã Hoàn Thành" 
          icon={<FaCheckCircle className="text-success" />} 
          data={completed} 
        />
      </div>
    </div>
  );
}

function ComicBlock({ title, icon, data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="manga-block">
      <h3 className="manga-block__title">
        {icon} <span>{title}</span>
      </h3>
      <div className="comicList">
        {data.map(item => (
          <ComicCard key={item._id} comic={item} />
        ))}
      </div>
    </div>
  );
}