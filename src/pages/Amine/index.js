import "./index.scss";
import PopularAnime from "../../component/PolularAnime/index";
import DragonBall from "../../component/DragonBall/index";
import AnimeHeader from "../../component/AnimeHeader/index";
function KitsuAnime() { 

  return (
    <div className="kitsu-anime">
      <AnimeHeader />
      <PopularAnime />
      <DragonBall />
    </div>
  );
}

export default KitsuAnime;
