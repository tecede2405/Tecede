import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";

const filmData = [
    {title: "DragonBall Daima", image: "https://ik.imagekit.io/yuki/20241013-1/0fae7296f2e1a31e55deb61fe6db7a03.jpg", path: "dragon-ball-daima", episode_current: "Hoàn Tất (20/20)"},
    {title: "One Piece", image: "https://ik.imagekit.io/yuki/20240310-1/31e6c244a0673838a46732d3b4f0b190.jpg", path: "dao-hai-tac",episode_current: "Tập 1154"},
    {title: "Conan", image: "https://ik.imagekit.io/yuki/20240310-1/025424cf62248b9a7b54279ef5416e26.jpg", path: "tham-tu-lung-danh-conan",episode_current: "Tập 1186"},
    {title: "Yugioh", image: "https://phimimg.com/upload/vod/20241124-1/39cae382ef85b1fb744f95ecd2f898e7.jpg", path: "vua-tro-choi-2000",episode_current: "Hoàn Tất (224/224)"},
    {title: "DragonBall Super", image: "https://ik.imagekit.io/yuki/20240718-1/6bba5797d9c0e92a2984f07933dc151b.jpg", path: "bay-vien-ngoc-rong-sieu-cap",episode_current: "Hoàn Tất (131/131)"},
    {title: "Pokemon", image: "https://phimimg.com/upload/vod/20250526-1/44fcb1476d32e4a89e0dd97ea405b100.jpg", path: "pokemon",episode_current: "Hoàn Tất (1237/1237)"},
    {title: "Huyền Thoại Broly", image: "https://ik.imagekit.io/yuki/20240827-1/f3c5b869a3fb9334ebf92f4e2a1c1540.jpg", path: "bay-vien-ngoc-rong-sieu-cap-huyen-thoai-broly",episode_current: "Full"},
    {title: "Thợ Săn Quỷ", image: "https://phimimg.com/upload/vod/20250106-1/cdd0f20f79311a101e87a0ec0edb3d3f.jpg", path: "tho-san-quy-2022",episode_current: "Hoàn Tất (12/12)"},
    {title: "Naruto Shippuden", image: "https://phimimg.com/upload/vod/20240902-1/7eed050b63a25cdde46ac7d4ca1383b7.jpg", path: "naruto-shippuden",episode_current: "Hoàn Tất (500/500)"},
    {title: "Solo Leveling", image: "https://ik.imagekit.io/yuki/20240109-1/7cd20bfff7d6ad42644017bc731a0377.jpg", path: "thang-cap-mot-minh",episode_current: "Hoàn Tất (25/25)"},
    {title: "Thanh Gươm Diệt Quỷ 1", image: "https://ik.imagekit.io/yuki1/20250427-1/a9d8a556f8cb1873f1a40e1d97db255e.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "thanh-guom-diet-quy-phan-1-kamado-tanjiro-lap-chi",episode_current: "Hoàn Tất (26/26)"},
    {title: "Thanh Gươm Diệt Quỷ 2", image: "https://ik.imagekit.io/yuki/20250427-1/d58646e693f31b0775f0fec0b3ea9461.jpg", path: "thanh-guom-diet-quy-phan-2-chuyen-tau-vo-tan",episode_current: "Hoàn Tất (7/7)"},
    {title: "Thanh Gươm Diệt Quỷ 3", image: "https://ik.imagekit.io/yuki/20250427-1/ba01d82e006a7d9c2fb3aca49a0a8b1e.jpg", path: "thanh-guom-diet-quy-phan-3-ky-vien-tran",episode_current: "Hoàn Tất (11/11)"},
    {title: "Thanh Gươm Diệt Quỷ 4", image: "https://ik.imagekit.io/yuki/20250427-1/c1ed81199e77a349d236c842953c9c6a.jpg", path: "thanh-guom-diet-quy-phan-4-lang-tho-ren",episode_current: "Hoàn Tất (11/11)"},
    {title: "Thanh Gươm Diệt Quỷ 5", image: "https://ik.imagekit.io/yuki/20250427-1/f6a0dabb17cd90e280bf8543b9089d8f.jpg", path: "thanh-guom-diet-quy-phan-5-dai-tru-dac-huan",episode_current: "Hoàn Tất (8/8)"},
    {title: "Attack on Titan 1", image: "https://ik.imagekit.io/yuki/20240205-1/90d16f65fb95c2abb6e9f750c8dd4721.jpg", path: "dai-chien-nguoi-khong-lo-phan-1",episode_current: "Hoàn Tất (25/25)"},
    {title: "Attack on Titan 2", image: "https://ik.imagekit.io/yuki1/20240507-1/18d8dca73f5da6d9faca355817808ae7.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-2",episode_current: "Hoàn Tất (12/12)"},
    {title: "Attack on Titan 3", image: "https://ik.imagekit.io/yuki1/20240507-1/027a7afc129a0e43c8a5dec77d806e0e.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-3",episode_current: "Hoàn Tất (22/22)"},
    {title: "Attack on Titan 4", image: "https://ik.imagekit.io/yuki1/20240507-1/5679677b0a2f5a44526be0baf2963138.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-4",episode_current: "Hoàn Tất (30/30)"},
    {title: "Attack on Titan 5", image: "https://ik.imagekit.io/yuki1/20250126-1/06d8a3765295a912ef503ed60dcc2020.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-5",episode_current: "Hoàn Tất (12/12)"},
    {title: "Attack on Titan 6", image: "https://ik.imagekit.io/yuki1/20240520-1/f04f94cd1f41cd77e340e52ee5be4bee.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "dai-chien-nguoi-khong-lo-phan-6",episode_current: "Hoàn Tất (12/12)"},
    {title: "Chú Thuật Hồi Chiến 1", image: "https://ik.imagekit.io/yuki1/20240326-1/c0630a29c6ddbf44f405ee877e51ef31.jpg?tr=w-450,h-675,c-at_max,q-80,f-auto", path: "chu-thuat-hoi-chien-phan-1",episode_current: "Hoàn Tất (24/24)"},
    {title: "Chú Thuật Hồi Chiến 2", image: "https://ik.imagekit.io/yuki/20241110-1/d1abe4b2a3e45d134b93a04bf0f092c4.jpg", path: "chu-thuat-hoi-chien-phan-2",episode_current: "Hoàn Tất (25/25)"},
    {title: "Movie Super Hero", image: "https://ik.imagekit.io/yuki/20231018-1/a6eaa55e7fa6529b8b8c9846a9d4a847.jpg", path: "dragon-ball-super-hero",episode_current: "Full"},
    {title: "Kamen Rider: Geats", image: "https://ik.imagekit.io/yuki/20241013-1/d5ec292d0d52fca910dcbb5181dbe0f4.jpg", path: "hiep-si-mat-na-dau-truong-tham-vong",episode_current: "Hoàn Tất (49/49)"},
    {title: "Ultraman Zero: Belial Báo Thù", image: "https://ik.imagekit.io/yuki/20250727-1/1c0a0211eddd7fdb916c199c6de4274f.jpg", path: "ultraman-zero-belial-bao-thu",episode_current: "Full"},
    {title: "Kamen Rider ZERO-ONE", image: "https://ik.imagekit.io/yuki/20241219-1/beb1d3a687da61a7340194ba0777751b.jpg", path: "hiep-si-mat-na-hiem-hoa-ai",episode_current: "Hoàn Tất (46/46)"},
    {title: "Ultraman Saga", image: "https://ik.imagekit.io/yuki/20251122-1/7dd8c1f43c10975b358bda57a3aa1fd3.jpg", path: "ultraman-saga",episode_current: "Full"},
    {title: "DragonBall GT", image: "https://ik.imagekit.io/yuki/20231207-1/24098b5236e83a9414dbd31967d10bdf.jpg", path: "7-vien-ngoc-rong-gt",episode_current: "Hoàn Tất (64/64)"},
    {title: "Trận Chiến Của Các Vị Thần", image: "https://ik.imagekit.io/yuki/20231020-1/65152e5cb2c07ac3b660d2e4a322d369.jpg", path: "dragon-ball-z-tran-chien-cua-cac-vi-than",episode_current: "Full"},
    {title: "DragonBall Kai", image: "https://ik.imagekit.io/yuki/20240205-1/2204b1a85df9601736715fb0d65657fd.jpg", path: "dragon-ball-kai",episode_current: "Hoàn Tất (167/167)"},
    {title: "Đứa Con Của Thời Tiết", image: "https://ik.imagekit.io/yuki/20250526-1/00b744219355b28bd08540de7433e696.jpg", path: "dua-con-cua-thoi-tiet",episode_current: "Full"},
    {title: "Tên Cậu Là Gì?", image: "https://ik.imagekit.io/yuki/20241103-1/ee4e49dba0d9f22d984267d4c5bde014.jpg", path: "ten-cau-la-gi",episode_current: "Full"},
    {title: "Hunter x Hunter", image: "https://ik.imagekit.io/yuki/20240118-1/90a9ac11c3f3f63fecc4fcf380950da1.jpg", path: "tho-san-ti-hon",episode_current: "Hoàn Tất (148/148)"},
    {title: "Dororo", image: "https://phimimg.com/upload/vod/20251221-1/7afb59bd358d9322305de001ba090964.jpg", path: "dororo-di-tim-48-phan-co-the",episode_current: "Hoàn Tất (24/24)"},

];

function HomeFilm() {
const navigate = useNavigate();

  return (
    <>
        <div className="mb-1">
            <h2 className="film-category ms-3">Anime + Tokusatsu <GoChevronRight /></h2>
        </div>
        <div className="container mt-1 mb-1">
        <FilmCarousel
          items={filmData}
          renderItem={(item) => (
            <div
              className="film-card"
              alt={item.title}
              onClick={() => navigate(`/film/${item.path}`)}
              style={{
                backgroundImage: `url(${item.image})`
              }}
            >
              <div className="film-card__overlay">
                <h6 className="film-card__title">{item.title}</h6>
                <p className="film-card__episode">
                {item.episode_current || "?"}
                </p>
              </div>
            </div>
          )}
        />
      </div>  
    </>
   )
}

export default HomeFilm;