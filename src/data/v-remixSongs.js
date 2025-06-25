
const songs = [
    {
      title: '10 Ngàn Năm',
      artist: 'Anh Vu Remix ft PC',
      image: 'https://i.ytimg.com/vi/ukszRMdqqiw/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgVChOMA8=&amp;rs=AOn4CLCdTl_jUgK0H11c09j54gw7ePWqeQ',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873815/10_Ng%C3%A0n_N%C4%83m_-_Anh_Vu_Remix_PC_Nh%E1%BA%A1c_Remix_Hot_TikTok_xfpce7.mp3',
    },
    {
      title: 'Lao Tâm Khổ Tứ',
      artist: 'OXI Remix',
      image: 'https://tse4.mm.bing.net/th?id=OIP.SfkA4sw_RZQEOn-GauPxfQHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873825/Lao_T%C3%A2m_Kh%E1%BB%95_T%E1%BB%A9_OXI_Remix_-_Thanh_H%C6%B0ng_x_H2O_Music_Tr%C3%A1i_Tim_%C4%90%C3%A3_Mang_T%E1%BB%95n_Th%C6%B0%C6%A1ng_Remix_TikTok_znzeiz.mp3',
    },
    {
      title: 'Hẹn Anh Khi Hoa Chưa Tàn',
      artist: 'OXI Remix',
      image: 'https://tse1.mm.bing.net/th?id=OIP.reGS2u8xG4L5snyhK6o_CgHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873815/H%E1%BA%B9n_Anh_Khi_Hoa_Ch%C6%B0a_T%C3%A0n_OXI_Remix_-_Giang_Jolee_x_H2O_Music_Em_V%E1%BA%ABn_Lu%C3%B4n_Ch%E1%BB%9D_Ng%C6%B0%E1%BB%9Di_%E1%BB%9E_%C4%90%C3%B3_qistlf.mp3',
    },
    {
      title: 'Hành Lý Trên Tay',
      artist: 'Trung Hoàng Remix',
      image: 'https://i1.sndcdn.com/artworks-BwWp9eLcs4z61yzJ-4pBhTA-t1080x1080.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873820/H%C3%A0nh_L%C3%BD_Tr%C3%AAn_Tay-Trung_Ho%C3%A0ng_Remix_tf2b6y.mp3',
    },
    {
      title: 'SXACDD x Lần Cuối',
      artist: 'LinhAnh ft. TranVinh Remix',
      image: 'https://tse3.mm.bing.net/th?id=OIP.rPcjLbVw4EIaT_jfbxY2KwHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873840/S%E1%BB%90NG_XA_ANH_CH%E1%BA%B2NG_D%E1%BB%84_D%C3%80NG_x_L%E1%BA%A6N_CU%E1%BB%90I_-_LinhAnh_ft._TranVinh_Remix_no8nmw.mp3',
    },
    {
      title: 'Vô Tình',
      artist: 'HychuL x Đông Remix',
      image: 'https://tse1.mm.bing.net/th?id=OIP.aJqS0TGtmIudtaYoG6P7AwHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873867/V%C3%B4_T%C3%ACnh_Remix_B%E1%BA%A3n_Full_TikTok_-_HychuL_x_%C4%90%C3%B4ng_Remix_%C4%90%C3%B4i_Khi_T%C3%B4i_V%C3%B4_T%C3%ACnh_Nh%C3%ACn_Th%E1%BA%A5y_Anh_Remix_zfadmh.mp3',
    },
    {
      title: 'Chỉ Muốn Bên Em Lúc Này',
      artist: 'Ness Remix',
      image: 'https://tse1.mm.bing.net/th?id=OIP.aJqS0TGtmIudtaYoG6P7AwHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873823/Ch%E1%BB%89_Mu%E1%BB%91n_B%C3%AAn_Em_L%C3%BAc_N%C3%A0y_Ness_Remix_-_Jiki_X_ft_Huy_V%E1%BA%A1c_Th%E1%BA%BF_Gian_%C4%90%E1%BB%95i_Thay_Nh%C6%B0ng_C%C3%B2n_%C4%90%C3%A2y_Remix_xvceyy.mp3',
    },
     {
      title: 'Hẹn Em Kiếp Sau',
      artist: 'PBQA ft. Nguyễn Hoàng Remix',
      image: 'https://i.ytimg.com/vi/ubu6rOyxRjg/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGCMgOCh_MA8=&amp;rs=AOn4CLCSTVcW_gkHBM70nfAP6Zn0qFG6PQ',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873837/H%E1%BA%B9n_Em_Ki%E1%BA%BFp_Sau_-_Dunghoangpham_x_PBQA_ft._Nguy%E1%BB%85n_Ho%C3%A0ng_Remix_Hot_Tik_Tok_2023_-_Exclusive_Music_fznmyd.mp3',
    },
     {
      title: 'Em Gái Mưa',
      artist: 'Kiều Thị Sơn',
      image: 'https://tse1.mm.bing.net/th?id=OIP.7mPHdXh1lL3Xi3l_4xWpHwHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873872/Em_G%C3%A1i_M%C6%B0a_Remix_-_H%C6%B0%C6%A1ng_Tr%C3%A0m_Ki%E1%BB%81u_Th%E1%BB%8B_S%C6%A1n_M%C6%B0a_Tr%C3%B4i_C%E1%BA%A3_B%E1%BA%A7u_Tr%E1%BB%9Di_N%E1%BA%AFng_Remix_Nh%E1%BA%A1c_N%E1%BB%81n_Hot_TikTok_k0kkvv.mp3',
    },
     {
      title: 'YÊU 5',
      artist: 'ORINN X GUANG',
      image: 'https://tse2.mm.bing.net/th?id=OIP.gyP2cZKpO_R4LjlC4ragnQHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873802/Y%C3%8AU_5_ORINN_X_GUANG_-_RHYMASTIC_NH%E1%BA%A0C_REMIX_HOUSE_LAK_2023_v5cu5c.mp3',
    },
     {
      title: 'Thu Cuối',
      artist: 'Lucy Remix',
      image: 'https://i.ytimg.com/vi/-YCh-B_GXF8/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGD8gEyh_MA8=&rs=AOn4CLDVfoRYOaPkPTPSPLUXZs1ob_NfvQ',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873802/Thu_Cu%E1%BB%91i_Remix_Lucy_Remix_-_Mr.T_ft_Yanbi_x_H%E1%BA%B1ng_Bingboong_Nh%E1%BA%A1c_Remix_B%E1%BA%A5t_H%E1%BB%A7_%C4%90i_C%C3%B9ng_Th%E1%BB%9Di_Gian_za1tbc.mp3',
    },
     {
      title: 'Cẩm Tú Cầu',
      artist: 'Anh Khoa Remix',
      image: 'https://i.ytimg.com/vi/P2dEZT9-GDA/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873846/C%E1%BA%A9m_T%C3%BA_C%E1%BA%A7u_Anh_Khoa_Remix_-_Rayo_x_Hu%E1%BB%B3nh_V%C4%83n_Hot_TikTok_2024_-_Audio_Lyrics_Video_yejdpx.mp3',
    },
     {
      title: 'Níu Duyên',
      artist: 'Hoàng Bảo Châu x MINH PROD',
      image: 'https://i.ytimg.com/vi/XyXoaFMoma0/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873897/N%C3%ADu_Duy%C3%AAn_Remix_-_Ho%C3%A0ng_B%E1%BA%A3o_Ch%C3%A2u_x_MINH_PROD_Nh%E1%BA%A1c_Hot_Trend_T%C3%B3p_T%C3%B3p_C%C4%83ng_%C4%90%C3%A9t._gb0djr.mp3',
    },
     {
      title: 'Hạt Mưa Vương Vấn',
      artist: 'Minh Phùng Remix',
      image: 'https://i.ytimg.com/vi/M0a8kakSs9o/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873838/H%E1%BA%A1t_M%C6%B0a_V%C6%B0%C6%A1ng_V%E1%BA%A5n_Minh_Ph%C3%B9ng_Remix_-_DungHoangPham_H%E1%BA%A1t_M%C6%B0a_V%C6%B0%C6%A1ng_V%E1%BA%A5n_Anh_Gi%E1%BB%9D_Nay_%C4%90ang_N%C6%A1i_%C4%90%C3%A2u..._iiffad.mp3',
    },
     {
      title: 'Vạn Sự Tùy Duyên',
      artist: 'Đại Mèo Remix',
      image: 'https://i1.sndcdn.com/artworks-P7gUenVb0MqqvPmZ-y27IXg-t1080x1080.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873797/V%E1%BA%A1n_S%E1%BB%B1_T%C3%B9y_Duy%C3%AAn_Remix_-_Thanh_H%C6%B0ng_x_%C4%90%E1%BA%A1i_M%C3%A8o_Remix___Ph%C3%ADa_Xa_V%E1%BB%9Di_C%C3%B3_Anh_%C4%90ang_Ch%E1%BB%9D_REMIX_HOT_TIKTOK_ey5vwv.mp3',
    },
     {
      title: 'Mỹ Nhân ft Bạn Tình Ơi',
      artist: 'Hương Hà Remix',
      image: 'https://i.ytimg.com/vi/236-vlgY9j0/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGDQgHCh_MA8=&rs=AOn4CLD9k_baE4gKMZEm1MECatAbBYz1Jw',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873852/M%E1%BB%B9_Nh%C3%A2n_ft_B%E1%BA%A1n_T%C3%ACnh_%C6%A0i_H%C6%B0%C6%A1ng_H%C3%A0_Remix_-_Tr%C3%A1i_Tim_N%C3%A0y_%C4%90%C3%A3_L%E1%BB%A1_Y%C3%AAu_Em_T%E1%BB%AB_Bao_L%C3%A2u_-_Audio_Lyrics_lnldej.mp3',
    },
     {
      title: 'Anh Là Ai',
      artist: 'DucBui Remix',
      image: 'https://i.ytimg.com/vi/ayIhvPNuI9s/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873865/Anh_L%C3%A0_Ai_-_Hu%E1%BB%B3nh_C%C3%B4ng_Hi%E1%BA%BFu_DT_feat._Umie_DucBui_Remix_Audio_Lyrics_Video_vmwg3f.mp3',
    },
    {
      title: 'Anh Ơi Ở Lại',
      artist: 'VMT Remix',
      image: 'https://i.ytimg.com/vi/1m742x3DDdA/hqdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873806/Anh_%C6%A0i_%E1%BB%9E_L%E1%BA%A1i_Remix_-_Chi_Pu_nh%E1%BA%A1c_remix_hay_nh%E1%BA%A5t_VMT_Remix_kpo1ip.mp3',
    },
    {
      title: 'Sai Người Sai Thời Điểm',
      artist: 'OXI Remix',
      image: 'https://tse1.mm.bing.net/th?id=OIP.rqu3eXjnjZkWi_MQPjbs3wHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750873803/Sai_Ng%C6%B0%E1%BB%9Di_Sai_Th%E1%BB%9Di_%C4%90i%E1%BB%83m_OXI_Remix_-_Thanh_H%C6%B0ng_x_H2O_Nh%E1%BA%A1c_Tr%E1%BA%BB_Remix_2024_Hay_Nh%E1%BA%A5t_Hi%E1%BB%87n_Nay_zc2xtx.mp3',
    },
  ];

  export default songs;