import { useParams, useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";
import ComicCard from "../../component/MangaCard";
import MangaSearch from "../../component/SearchComic/index";
import { IoIosArrowDropleft } from "react-icons/io";
export default function SearchResult(){

  const {slug} = useParams();
  const [data,setData] = useState([]);
  const navigate = useNavigate();
  useEffect(()=>{

    const keyword = slug.replace(/-/g," ");

    fetch(`${process.env.REACT_APP_TRUYEN_API}/tim-kiem?keyword=${keyword}`)
      .then(res=>res.json())
      .then(res=>{
        setData(res.data.items || []);
      });

  },[slug]);

  return(

    <div className="searchResult mb-3 ps-3 pe-3">
      <MangaSearch />
      <h3 className="text-light mb-3 mt-3"><IoIosArrowDropleft onClick={()=>navigate("/truyen")}/> Kết quả tìm cho: {slug}</h3>

      <div className="comicGrid">

        {data.map(item=>(
          <ComicCard key={item._id} comic={item}/>
        ))}

      </div>

    </div>

  )

}