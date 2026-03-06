import { useEffect, useState } from "react";
import ComicCard from "./ComicCard";
import "./style.scss";

export default function ComicList(){

  const [comics,setComics] = useState([]);

  useEffect(()=>{

    fetch("https://otruyenapi.com/v1/api/danh-sach/truyen-moi")
      .then(res=>res.json())
      .then(data=>{
        setComics(data.data.items);
      })

  },[])

  return(

    <div className="comicList">

      {comics.map(item=>(
        <ComicCard key={item._id} comic={item}/>
      ))}

    </div>

  )

}