import SearchBarAnime from "../SearchBarAnime/index"; 
import {Link } from "react-router-dom";
import homeImage from "../../img/home-image.png";
function AnimeHeader(){
    return(
        <>
        <div className="anime-header">
            <Link to={`/anime`} className="link-anime">
                <img src={homeImage} className="link-anime__image" alt="Home"/>
                <h1 className="kitsu-anime__title">Demo Trang Xem Anime</h1>
            </Link>
            <SearchBarAnime />
        </div>
      
        </>
    )
}

export default AnimeHeader;