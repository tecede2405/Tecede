import SearchBarAnime from "../SearchBarAnime/index"; 
import {Link } from "react-router-dom";

function AnimeHeader(){
    return(
        <>
        <div className="anime-header">
            <Link to={`/anime`} className="link-anime">
                <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768991840/home-image_t70nm7.png" className="link-anime__image" alt="Home"/>
                <h1 className="kitsu-anime__title">Demo Trang Xem Anime</h1>
            </Link>
            <SearchBarAnime />
        </div>
      
        </>
    )
}

export default AnimeHeader;