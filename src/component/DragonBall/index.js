import { useEffect, useState } from "react";
import "./style.css";
import { Link } from "react-router-dom";
export default function DragonBallSlide() {
  const [animeList, setAnimeList] = useState([]);
  
  useEffect(() => {
    fetch("https://kitsu.io/api/edge/anime?filter[text]=dragon%20ball&page[limit]=20")
      .then(res => res.json())
      .then(data => setAnimeList(data.data));
  }, []);

  // hiệu ứng kéo bằng tay
  useEffect(() => {
    const slider = document.querySelector(".dragonball-slider");
    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    const mouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const mouseUp = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // tốc độ
      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousedown", mouseDown);
    slider.addEventListener("mouseleave", mouseLeave);
    slider.addEventListener("mouseup", mouseUp);
    slider.addEventListener("mousemove", mouseMove);

    return () => {
      slider.removeEventListener("mousedown", mouseDown);
      slider.removeEventListener("mouseleave", mouseLeave);
      slider.removeEventListener("mouseup", mouseUp);
      slider.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <div className="dragonball-wrapper">
      <h1 className="trending-title">Dragon Ball Anime</h1>
      <div className="dragonball-slider">
        {animeList.map(anime => (
          <Link to={`/anime/${anime.id}`} key={anime.id} className="link-anime">
          <div className="dragonball-card" key={anime.id}>
            <div className="dragonball-img">
              <img
                src={anime.attributes.posterImage?.medium}
                alt={anime.attributes.canonicalTitle}
              />
            </div>
            <p className="dragonball-title">{anime.attributes.canonicalTitle}</p>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
