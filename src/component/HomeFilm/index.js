import MusicCarousel from "../Carousel/FilmCarousel";
import 'animate.css';
const musicData = [
    {title: "onepiece", image: "https://ik.imagekit.io/yuki/20240310-1/31e6c244a0673838a46732d3b4f0b190.jpg", path: "one-piece"},
    {title: "conan", image: "https://ik.imagekit.io/yuki/20240310-1/025424cf62248b9a7b54279ef5416e26.jpg", path: "tham-tu-lung-danh-conan"},
    {title: "dragonball", image: "https://ik.imagekit.io/yuki/20240718-1/6bba5797d9c0e92a2984f07933dc151b.jpg", path: "bay-vien-ngoc-rong-sieu-cap"},
    {title: "naruto", image: "https://ik.imagekit.io/yuki1/20250604-1/4d040231dadbce1a312340480c69cfb2.jpg?tr=w-300,h-450,c-at_max,q-80,f-auto", path: "naruto-shippuden"},
    {title: "thanh gươm diệt quỷ", image: "https://ik.imagekit.io/yuki1/20250722-1/66ee196318069c6ede9450a5f76a4648.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "thanh-guom-diet-quy-phan-1-kamado-tanjiro-lap-chi"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20250419-1/50cf359f6ed6307597fc160044132ac3.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-1"},
    {title: "thuật chú hồi chiến", image: "https://ik.imagekit.io/yuki1/20240326-1/c0630a29c6ddbf44f405ee877e51ef31.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "chu-thuat-hoi-chien-phan-1"},
    {title: "Kamen Rider: Geats", image: "https://ik.imagekit.io/yuki/20241013-1/d5ec292d0d52fca910dcbb5181dbe0f4.jpg", path: "hiep-si-mat-na-dau-truong-tham-vong"},
    {title: "Kamen Rider ZERO-ONE", image: "https://ik.imagekit.io/yuki/20241219-1/beb1d3a687da61a7340194ba0777751b.jpg", path: "hiep-si-mat-na-hiem-hoa-ai"},
];

function HomeFilm() {


  return (
    <>
        <div>
            <h2 className="music-box-title">Kho phim</h2>
            <p className="music-box-desc">"Phim sẽ luôn được cập nhật thường xuyên.
                <br />Click vào để xem chi tiết"
            </p>
        </div>
        <div className="container mt-4 mb-5">
            <MusicCarousel items={musicData} />
        </div>  
    </>
   )
}

export default HomeFilm;