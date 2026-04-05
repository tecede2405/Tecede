import MusicCarousel from "../Carousel/MusicCarousel";
import { MdLibraryMusic } from "react-icons/md";
import "./homemusic.scss";

const musicData = [
    {title: "mood", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/85ea2a41bcba853ca1656f17b54d6a71", path: "mood"},
    {title: "nhacdouyin", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/bb95fae35b14b87ed5d6d2d15791e3f2", path: "nhac-douyin"},
    {title: "nhactre", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/f8067e4d176cf42261c0b2789a1a1035", path: "nhac-tre"},
    {title: "usuk", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/1a5d4aca0654d716f9ec965dbafc8bf2", path: "usuk"},
    {title: "china", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/9cb9409ff6db5a3e70ca628f2be2b3ee", path: "trung-quoc"},
    {title: "nhactreremix", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/87926809501fe62e67a56602a7cb7823", path: "nhactre-remix"},
    {title: "edm", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/6659861e5f2cb99d7a210d2b258ec8f5", path: "edm"},
    {title: "phonk", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/71e005cb391b2557e066432f5b2c7d4c", path: "phonk"},
    {title: "nhac-lofi", image: "https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/b865a58f5977be30a5a2094a8ad71c6c", path: "nhac-lofi"},
];

function HomeMusic() {

  return (
    <>
        <div className="mb-1">
        <h2 className="film-category ms-3">
          Trạm Phát Nhạc <MdLibraryMusic />
        </h2>
      </div>
        <div className="container container-film mt-4 mb-2">
            <MusicCarousel items={musicData} />
        </div>  
    </>
   )
}

export default HomeMusic;