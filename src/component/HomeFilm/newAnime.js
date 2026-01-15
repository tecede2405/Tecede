import FilmCarousel from "../Carousel/FilmCarousel";
import { GoChevronRight } from "react-icons/go";
import {NewAnime} from "../../data/dataFilm";
import { useNavigate } from "react-router-dom";
import 'animate.css';
const filmData = NewAnime;

function NewAnimes() {
const navigate = useNavigate();

  return (
    <>
        <div className="mb-1">
            <h2 className="film-category ms-3">Anime Mới
            <GoChevronRight 
                onClick={() => navigate("/detail/new-anime")} 
                style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%", marginLeft: '7px' }} 
            />

            </h2>
        </div>
        <div className="container container-film mt-1 mb-1">
            <FilmCarousel items={filmData} />
        </div>  
    </>
   )
}

export default NewAnimes;