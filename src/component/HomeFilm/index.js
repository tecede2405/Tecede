import MusicCarousel from "../Carousel/FilmCarousel";
import 'animate.css';
const filmData = [
    {title: "onepiece", image: "https://ik.imagekit.io/yuki/20240310-1/31e6c244a0673838a46732d3b4f0b190.jpg", path: "one-piece"},
    {title: "conan", image: "https://ik.imagekit.io/yuki/20240310-1/025424cf62248b9a7b54279ef5416e26.jpg", path: "tham-tu-lung-danh-conan"},
    {title: "dragonball", image: "https://ik.imagekit.io/yuki/20240718-1/6bba5797d9c0e92a2984f07933dc151b.jpg", path: "bay-vien-ngoc-rong-sieu-cap"},
    {title: "Bảy Viên Ngọc Rồng Siêu Cấp: Huyền Thoại Broly", image: "https://ik.imagekit.io/yuki/20240827-1/f3c5b869a3fb9334ebf92f4e2a1c1540.jpg", path: "bay-vien-ngoc-rong-sieu-cap-huyen-thoai-broly"},
    {title: "naruto", image: "https://ik.imagekit.io/yuki1/20250604-1/4d040231dadbce1a312340480c69cfb2.jpg?tr=w-300,h-450,c-at_max,q-80,f-auto", path: "naruto-shippuden"},
    {title: "thanh gươm diệt quỷ", image: "https://ik.imagekit.io/yuki1/20250722-1/66ee196318069c6ede9450a5f76a4648.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "thanh-guom-diet-quy-phan-1-kamado-tanjiro-lap-chi"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20250419-1/50cf359f6ed6307597fc160044132ac3.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-1"},
    {title: "thuật chú hồi chiến", image: "https://ik.imagekit.io/yuki1/20240326-1/c0630a29c6ddbf44f405ee877e51ef31.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "chu-thuat-hoi-chien-phan-1"},
    {title: "Dragon Ball: Super Hero", image: "https://ik.imagekit.io/yuki/20231018-1/a6eaa55e7fa6529b8b8c9846a9d4a847.jpg", path: "dragon-ball-super-hero"},
    {title: "Kamen Rider: Geats", image: "https://ik.imagekit.io/yuki/20241013-1/d5ec292d0d52fca910dcbb5181dbe0f4.jpg", path: "hiep-si-mat-na-dau-truong-tham-vong"},
    {title: "Kamen Rider ZERO-ONE", image: "https://ik.imagekit.io/yuki/20241219-1/beb1d3a687da61a7340194ba0777751b.jpg", path: "hiep-si-mat-na-hiem-hoa-ai"},
];

function HomeFilm() {


  return (
    <>
        <div className="mb-1">
            <h2 className="music-box-title">Kho Anime + Tokusatsu</h2>
        </div>
        <div className="container mt-1 mb-1">
            <MusicCarousel items={filmData} />
        </div>  
    </>
   )
}

export default HomeFilm;