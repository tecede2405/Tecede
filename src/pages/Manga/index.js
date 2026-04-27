import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ComicCard from "../../component/MangaCard/index";
import SearchComic from "../../component/SearchComic/index";
import "./style.scss";

export default function Manga() {
  const { chapterId } = useParams();

  const [images, setImages] = useState([]);
  const [domain, setDomain] = useState("");

  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [coming, setComing] = useState([]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    // lấy ảnh chapter
    fetch(`${process.env.REACT_APP_TRUYEN_CDN}/chapter/${chapterId}`)
    .then(res => res.json())
    .then(data => {

        if (!data?.data?.item) return;

        setImages(data.data.item.chapter_image || []);
        setDomain(data.data.domain_cdn || "");

    })
    .catch(err => console.log(err));

    // mới cập nhật
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/truyen-moi`)
      .then(res => res.json())
      .then(data => setLatest(data.data.items.slice(0,24)));

    // đang thịnh hành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/dang-phat-hanh`)
      .then(res => res.json())
      .then(data => setTrending(data.data.items.slice(0,24)));

    // sắp ra mắt
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/sap-ra-mat`)
      .then(res => res.json())
      .then(data => setComing(data.data.items.slice(0,24)));

     // hoàn thành
    fetch(`${process.env.REACT_APP_TRUYEN_API}/danh-sach/hoan-thanh`)
      .then(res => res.json())
      .then(data => setCompleted(data.data.items.slice(0,24)));

  }, [chapterId]);

  return (
    <div className="readerContent">
      
      {/* ảnh chapter */}
      <SearchComic/>
      <div className="chapterImages">
        {images?.map((img,index)=>(
            <img
            key={index}
            src={`${domain}/${img.image_file}`}
            alt=""
            loading="lazy"
            />
        ))}
        </div>


      {/* block truyện */}

      <div className="comicSections">

      <ComicBlock title="Đang thịnh hành" className="text-light" data={trending}/>
      <ComicBlock title="Mới cập nhật" className="text-light" data={latest}/>
      <ComicBlock title="Sắp ra mắt" className="text-light" data={coming}/>
      <ComicBlock title="Hoàn thành" className="text-light" data={completed}/>

      </div>

    </div>
  );
}


function ComicBlock({title,data, className}){

  return(
    <div className="comicBlock">

      <h3 className={className}>{title}</h3>

      <div className="comicGrid">

        {data.map(item=>(
          <ComicCard key={item._id} comic={item}/>
        ))}

      </div>

    </div>
  )

}