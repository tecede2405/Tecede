import MusicCarousel from "../Carousel/FilmCarousel";
import 'animate.css';
const filmData = [
    {title: "Dragon Ball Daima", image: "https://ik.imagekit.io/yuki/20241013-1/0fae7296f2e1a31e55deb61fe6db7a03.jpg", path: "dragon-ball-daima"},
    {title: "onepiece", image: "https://ik.imagekit.io/yuki/20240310-1/31e6c244a0673838a46732d3b4f0b190.jpg", path: "one-piece"},
    {title: "onepiece", image: "https://ik.imagekit.io/yuki1/20231015-1/2ade79773796bd12b5980b9a0d94e71d.jpg?tr=w-300,h-450,c-at_max,q-80,f-auto", path: "dao-hai-tac"},
    {title: "conan", image: "https://ik.imagekit.io/yuki/20240310-1/025424cf62248b9a7b54279ef5416e26.jpg", path: "tham-tu-lung-danh-conan"},
    {title: "dragonball", image: "https://ik.imagekit.io/yuki/20240718-1/6bba5797d9c0e92a2984f07933dc151b.jpg", path: "bay-vien-ngoc-rong-sieu-cap"},
    {title: "Bảy Viên Ngọc Rồng Siêu Cấp: Huyền Thoại Broly", image: "https://ik.imagekit.io/yuki/20240827-1/f3c5b869a3fb9334ebf92f4e2a1c1540.jpg", path: "bay-vien-ngoc-rong-sieu-cap-huyen-thoai-broly"},
    {title: "naruto", image: "https://ik.imagekit.io/yuki1/20250604-1/4d040231dadbce1a312340480c69cfb2.jpg?tr=w-300,h-450,c-at_max,q-80,f-auto", path: "naruto-shippuden"},
    {title: "Thăng Cấp Một Mình", image: "https://ik.imagekit.io/yuki/20240109-1/7cd20bfff7d6ad42644017bc731a0377.jpg", path: "thang-cap-mot-minh"},
    {title: "thanh gươm diệt quỷ phần 1", image: "https://ik.imagekit.io/yuki1/20250427-1/a9d8a556f8cb1873f1a40e1d97db255e.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "thanh-guom-diet-quy-phan-1-kamado-tanjiro-lap-chi"},
    {title: "thanh gươm diệt quỷ phần 2", image: "https://ik.imagekit.io/yuki/20250427-1/d58646e693f31b0775f0fec0b3ea9461.jpg", path: "thanh-guom-diet-quy-phan-2-chuyen-tau-vo-tan"},
    {title: "thanh gươm diệt quỷ phần 3", image: "https://ik.imagekit.io/yuki/20250427-1/ba01d82e006a7d9c2fb3aca49a0a8b1e.jpg", path: "thanh-guom-diet-quy-phan-3-ky-vien-tran"},
    {title: "thanh gươm diệt quỷ phần 4", image: "https://ik.imagekit.io/yuki/20250427-1/c1ed81199e77a349d236c842953c9c6a.jpg", path: "thanh-guom-diet-quy-phan-4-lang-tho-ren"},
    {title: "thanh gươm diệt quỷ phần 5", image: "https://ik.imagekit.io/yuki/20250427-1/f6a0dabb17cd90e280bf8543b9089d8f.jpg", path: "thanh-guom-diet-quy-phan-5-dai-tru-dac-huan"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki/20240205-1/90d16f65fb95c2abb6e9f750c8dd4721.jpg", path: "dai-chien-nguoi-khong-lo-phan-1"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20240507-1/18d8dca73f5da6d9faca355817808ae7.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-2"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20240507-1/027a7afc129a0e43c8a5dec77d806e0e.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-3"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20240507-1/5679677b0a2f5a44526be0baf2963138.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-4"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20250126-1/06d8a3765295a912ef503ed60dcc2020.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-5"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki1/20240520-1/f04f94cd1f41cd77e340e52ee5be4bee.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-6"},
    {title: "Chú thuật hồi chiến phần 1", image: "https://ik.imagekit.io/yuki1/20240326-1/c0630a29c6ddbf44f405ee877e51ef31.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "chu-thuat-hoi-chien-phan-1"},
    {title: "Chú thuật hồi chiến phần 2", image: "https://ik.imagekit.io/yuki/20241110-1/d1abe4b2a3e45d134b93a04bf0f092c4.jpg", path: "chu-thuat-hoi-chien-phan-2"},
    {title: "Dragon Ball: Super Hero", image: "https://ik.imagekit.io/yuki/20231018-1/a6eaa55e7fa6529b8b8c9846a9d4a847.jpg", path: "dragon-ball-super-hero"},
    {title: "Kamen Rider: Geats", image: "https://ik.imagekit.io/yuki/20241013-1/d5ec292d0d52fca910dcbb5181dbe0f4.jpg", path: "hiep-si-mat-na-dau-truong-tham-vong"},
    {title: "Ultraman Zero: Belial Báo Thù", image: "https://ik.imagekit.io/yuki/20250727-1/1c0a0211eddd7fdb916c199c6de4274f.jpg", path: "ultraman-zero-belial-bao-thu"},
    {title: "Kamen Rider ZERO-ONE", image: "https://ik.imagekit.io/yuki/20241219-1/beb1d3a687da61a7340194ba0777751b.jpg", path: "hiep-si-mat-na-hiem-hoa-ai"},
    {title: "Ultraman Saga", image: "https://ik.imagekit.io/yuki/20251122-1/7dd8c1f43c10975b358bda57a3aa1fd3.jpg", path: "ultraman-saga"},
    {title: "7 Viên Ngọc Rồng GT", image: "https://ik.imagekit.io/yuki/20231207-1/24098b5236e83a9414dbd31967d10bdf.jpg", path: "7-vien-ngoc-rong-gt"},
    {title: "Dragon Ball Z: Trận Chiến Của Các Vị Thần", image: "https://ik.imagekit.io/yuki/20231020-1/65152e5cb2c07ac3b660d2e4a322d369.jpg", path: "dragon-ball-z-tran-chien-cua-cac-vi-than"},
    {title: "Dragon Ball Kai", image: "https://ik.imagekit.io/yuki/20240205-1/2204b1a85df9601736715fb0d65657fd.jpg", path: "dragon-ball-kai"},
    {title: "Đứa Con Của Thời Tiết", image: "https://ik.imagekit.io/yuki/20250526-1/00b744219355b28bd08540de7433e696.jpg", path: "dua-con-cua-thoi-tiet"},
    {title: "Tên Cậu Là Gì?", image: "https://ik.imagekit.io/yuki/20241103-1/ee4e49dba0d9f22d984267d4c5bde014.jpg", path: "ten-cau-la-gi"},
    {title: "Hunter X Hunter", image: "https://ik.imagekit.io/yuki/20240118-1/90a9ac11c3f3f63fecc4fcf380950da1.jpg", path: "tho-san-ti-hon"},
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