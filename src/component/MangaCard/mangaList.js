import { useEffect, useState } from "react";
import ComicCard from "./ComicCard";
import ComicCardSkeleton from "./ComicCardSkeleton";
import "./style.scss";

export default function ComicList() {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://otruyenapi.com/v1/api/danh-sach/truyen-moi")
      .then((res) => res.json())
      .then((data) => {
        setComics(data.data.items);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="comicList">

      {/* Skeleton */}
      {loading &&
        Array.from({ length: 12 }).map((_, i) => (
          <ComicCardSkeleton key={i} />
        ))}

      {/* Real data */}
      {!loading &&
        comics.map((item) => (
          <ComicCard key={item._id} comic={item} />
        ))}

    </div>
  );
}