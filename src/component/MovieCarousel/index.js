import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade} from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/free-mode";

import "./style.scss";

const movies = [
    {title: "Mùa Rực Rỡ Của Em", image: "https://phimimg.com/upload/vod/20260223-1/8a44c515d71551459012656dfccf6e31.jpg",thumb:"https://phimimg.com/upload/vod/20260223-1/62667ee973537d0636ed2105c1d16dcc.jpg", path: "mua-ruc-ro-cua-em",
    episode_current: "Luôn cập nhật", lang: "Vietsub",
    content: "Chan sống mỗi ngày như thể đó là kỳ nghỉ hè. Haran thì lại bị mắc kẹt trong một mùa đông cô đơn. Khi quá khứ bị lãng quên đưa họ gặp lại nhau, Chan quyết tâm tặng cô một mùa xuân khác. Qua những tiếng cười và nước mắt, họ cùng nhau đối mặt với mùa đông và tìm thấy mùa xuân của mình trong câu chuyện tình lãng mạn ấm áp này.",
    },
    {title: "Đại Chiến Vận Mệnh", image: "https://phimimg.com/upload/vod/20260227-1/012b0b6ec3011efdac8f32c5c2e81d37.jpg",thumb:"https://phimimg.com/upload/vod/20260227-1/624088b5f00aaac1ceef03c021109c31.jpg", path: "dai-chien-van-menh",
     episode_current: "Luôn cập nhật",lang: "Vietsub",
    content: "Liệu số phận của chúng ta đã được định trước? Và liệu có ai thực sự có thể đọc được nó? Một cuộc thi đột phá dám tìm ra câu trả lời. 49 chuyên gia đọc vận mệnh hàng đầu Hàn Quốc – những bậc thầy về pháp sư, bói toán, bài tarot và xem tướng mặt – sẽ đặt danh dự của mình vào cuộc thi. Chỉ những người thực sự có thể đọc được vận mệnh mới sống sót. Ai sẽ là người chiến thắng?",
    },
    {title: "Bụi Hoa Hồng", image: "https://phimimg.com/upload/vod/20260227-1/8b60d37846e87e2403abdaf5ec396b39.jpg",thumb:"https://phimimg.com/upload/vod/20260227-1/5b9a25050a82a4606d80dd00af9cd35e.jpg", path: "bui-hoa-hong", 
    episode_current: "Luôn cập nhật",lang: "Vietsub",
    content: "Bộ phim kể về cuộc gặp gỡ định mệnh giữa Lý Hiểu Hề – một cô gái luôn nghiêm túc và thận trọng trong chuyện tình cảm – và chàng trai Tiểu Bối, từ đó, họ bắt đầu một mối tình lãng mạn. Chính sự chân thành và kiên định của Tiểu Bối đã tiếp thêm sức mạnh, giúp Lý Hiểu Hề dần vượt qua những cảm giác bất an và lo sợ trong tình yêu. Ngược lại, nhờ sự đồng hành và bao dung của Lý Hiểu Hề, Tiểu Bối cũng chữa lành được những vết thương lòng trong quá khứ, dần dần buông bỏ nỗi đau và học cách trân trọng hiện tại. Hành trình vun đắp tình cảm ấy đã giúp cả hai nhìn thấy nhiều khía cạnh đa dạng hơn của tình yêu. Sau khi cùng nhau trải qua bao khó khăn và thử thách, cuối cùng họ cũng trưởng thành hơn và tìm thấy tình yêu chân thành.",
    },
    {title: "Nghệ Thuật Lừa Dối Của Sarah", image: "https://phimimg.com/upload/vod/20260213-1/6f8288b9cee4ae457be84bf97d951bea.jpg",thumb:"https://phimimg.com/upload/vod/20260213-1/08ce4f760d99001d8594e896c81dd055.jpg", path: "nghe-thuat-lua-doi-cua-sarah",
    episode_current: "Hoàn Tất (8/8)", lang: "Vietsub",
    content: "Một thi thể giữa thị trấn. Một thương hiệu xa xỉ đang lên. Một thanh tra điều tra mọi chi tiết trong câu chuyện liên tục thay đổi của một người phụ nữ. Thực sự đã xảy ra chuyện gì?",
    },
    {title: "Trao Em Cả Vũ Trụ", image: "https://phimimg.com/upload/vod/20260209-1/6244cc481b717b579d553961a2d013fb.jpg",thumb:"https://phimimg.com/upload/vod/20260209-1/e898e1eda8286fc1188ce909123253d4.jpg", path: "trao-em-ca-vu-tru",
    episode_current: "Luôn cập nhật",lang: "Vietsub",
    content: "Hai người họ hàng bên nội và bên ngoại, sau một biến cố đau lòng, bị buộc phải cùng nhau nuôi dạy đứa cháu nhỏ mồ côi. Sống chung dưới một mái nhà, họ dần vượt qua những hiểu lầm và định kiến về nhau. Thông qua hành trình cùng làm cha mẹ, cả hai không chỉ tìm thấy sự trưởng thành cho bản thân mà còn nảy sinh một tình cảm lãng mạn không ngờ tới.",
    }, 
    {title: "Còn Ra Thể Thống Gì Nữa?", image: "https://phimimg.com/upload/vod/20260206-1/e69a8f905dd7f143d7e2f25025a2f433.jpg",thumb:"https://phimimg.com/upload/vod/20260206-1/65bde3b8112ed04109a3d1f15db3d759.jpg", path: "con-ra-the-thong-gi-nua",
     episode_current: "Luôn cập nhật", lang: "Vietsub + Thuyết Minh",
     content: "Vương Thúy Hoa xuyên không vào thế giới tiểu thuyết và hợp tác với Trương Tam để chống lại thiên tai, ổn định biên cương và đánh bại kẻ thù. Khi số phận trêu ngươi buộc họ phải đối mặt với sinh tử, cô chọn cứu anh bằng cách biến chất độc thành thuốc, và cuối cùng cả hai sống sót, chứng kiến thành quả mà họ cùng tạo dựng.",
    }, 
    {title: "Hùng Long Phong Bá (Phần 4)", image: "https://phimimg.com/upload/vod/20260214-1/8bd4eba1068788972aceeae2fa924c28.jpg",thumb:"https://phimimg.com/upload/vod/20260214-1/71cec309dd4be81a09e06e470536ae1d.jpg", path: "hung-long-phong-ba-phan-4", 
    episode_current: "Luôn cập nhật",lang: "Vietsub",
    content: "Sau khi Long trở thành trùm Chợ Lớn, tình bạn giữa Long, Hùng và Phong dần rạn nứt vì mâu thuẫn, lý tưởng đối lập. Căng thẳng bùng lên khi Hoàng xuất hiện với âm mưu thâm độc.",
    },
];
export default function MovieHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgSwiper, setBgSwiper] = useState(null);

  return (
    <div className="movieHero">
      
      {/* ================= BACKGROUND ================= */}
      <Swiper
        modules={[EffectFade]}
        effect="fade"
        grabCursor
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        onSwiper={setBgSwiper}
        onSlideChangeTransitionStart={() => {}}
            onSlideChangeTransitionEnd={(swiper) =>
            setActiveIndex(swiper.activeIndex)
            }
        className="bgSwiper"
      >
        {movies.map((movie, index) => (
          <SwiperSlide key={index}>
            <div
              className="heroBg"
              style={{
                backgroundImage: `url(${movie.thumb})`,
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ================= OVERLAY ================= */}
      <div className="heroContent">

        {/* TEXT */}
        <div className="heroText">
          <h1>{movies[activeIndex]?.title}</h1>

          <p>
            {movies[activeIndex]?.content.slice(0, 180)}...
          </p>

          <div className="heroBtns">
            <button className="playBtn">▶ Xem ngay</button>
            <button className="infoBtn">Chi tiết</button>
          </div>
        </div>

        {/* POSTER SLIDER */}
        <div className="posterWrapper">
          <Swiper
            slidesPerView={7}
            spaceBetween={15}
            speed={600}
          >
            {movies.map((movie, index) => (
              <SwiperSlide key={index}>
                <div
                    className={`poster ${
                    activeIndex === index ? "active" : ""
                    }`}
                    onClick={() => bgSwiper?.slideTo(index)} 
                >
                    <img src={movie.image} alt={movie.title} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </div>
  );
};


