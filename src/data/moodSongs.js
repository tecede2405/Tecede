
const songs = [
  {
      title: 'Beanie',
      artist: 'Chezile',
      image: 'https://tse2.mm.bing.net/th?id=OIP.earshvVCJUVEnSvTeu34awHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790254/Chezile_-_Beanie_Lyrics_rpedrd.mp3',
    },
  {
      title: 'Those Time',
      artist: 'Emptiness',
      image: 'https://tse2.mm.bing.net/th?id=OIP.DqrGm-Q5X3npvWWoqtXIGwHaEo&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790252/those_time_piano_vvtmpc.mp3',
    },
  {
      title: 'Track in time',
      artist: 'Dennis Kuo',
      image: 'https://tse2.mm.bing.net/th?id=OIP.3xId3e8J9bi9lNjflGo34QHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790264/Track_in_Time_Piano_Version_ebphwc.mp3',
    },
  {
      title: 'Điều về em',
      artist: 'Trịnh Nhuận Trạch',
      image: 'https://tse2.mm.bing.net/th?id=OIP.5pLzUgzxL227D5UsD2DD-QAAAA&pid=Api&P=0&h=180',
      file: "https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790257/%E5%85%B3%E4%BA%8E%E4%BD%A0_%E4%BC%B4%E5%A5%8F%E7%89%88_jkcja2.mp3",
    },
  {
      title: 'Take Your Hand',
      artist: 'Patrick Smith',
      image: 'https://tse4.mm.bing.net/th?id=OIP.hBNnn-T3HHJ2x_PusOapBQHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790263/Take_Your_Hand_xmmi9q.mp3',
    },
    {
      title: 'Date 2',
      artist: 'Anime Your Name',
      image: 'https://tse1.mm.bing.net/th?id=OIP.59vLJC5R4F6-FGNpqAuQGAHaE4&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790252/Date_2_b5pmlh.mp3',
    },
    {
      title: 'This Love',
      artist: 'Davichi',
      image: 'https://tse2.mm.bing.net/th?id=OIP.Z5gaIx5StFwlGF6YZ2f9xgHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790257/This_Love_Instrumental_%EC%9D%B4_%EC%82%AC%EB%9E%91_Instrumental_zw3ccc.mp3',
    },
    {
      title: 'Because i miss you',
      artist: 'Ariana Grande',
      image: 'https://tse3.mm.bing.net/th?id=OIP.PVFxFdB4l1s6y_D1_66xMgHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790261/Because_I_Miss_You_ijpqrz.mp3',
    },
    {
      title: 'Nop',
      artist: 'ChenYueLong',
      image: 'https://tse2.mm.bing.net/th?id=OIP.xijxrqqDfahyBoz__mFR8gHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790251/Nop_bqwbpm.mp3',
    },
    {
      title: '180도 (180 Degrees)',
      artist: '벤 (Ben)',
      image: 'https://tse1.mm.bing.net/th?id=OIP.jP6cxTLmeDtdCnDemSDYhwHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790258/180_Degree_fwfoft.mp3',
    },
    {
      title: 'Fall Rain',
      artist: 'July',
      image: 'https://tse1.mm.bing.net/th?id=OIP._rBfuIgpN34tItEGCFIJrgHaEo&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790264/Fall_rain_-_July_athhy8.mp3',
    },
    {
      title: 'Xuân kiều và chí minh',
      artist: 'Nhai Đạo Biện, Âu Dương Diệu Oánh',
      image: 'https://tse1.mm.bing.net/th?id=OIP.1fH6vbZ3Nr-rJuoqL0G_lwHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790256/Xu%C3%A2n_ki%E1%BB%81u_v%C3%A0_ch%C3%AD_minh_eths3i.mp3',
    },
    {
      title: 'the SUNset( nếu dự báo lúc đó mưa )',
      artist: '2pillz',
      image: 'https://tse4.mm.bing.net/th?id=OIP.iaY1KKMT9HI7Pe2Lo0lYXwHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790251/the_SUNset_xdqlfs.mp3',
    },
    {
      title: 'Daylight 日光',
      artist: 'Seredris',
      image: 'https://tse1.mm.bing.net/th?id=OIP.SWWqZDBuFMcKBhiNQOsf4gHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790255/Seredris_-_Daylight%E6%97%A5%E5%85%89Slowed_by_xxxCr3_-_DouYin_%E6%8A%96%E9%9F%B3bgm_2022_p4fb32.mp3',
    },
    {
      title: 'Last reunion',
      artist: 'Peter Roe',
      image: 'https://tse1.mm.bing.net/th?id=OIP.dkesrdjFk-vE9MYZAqLs7AAAAA&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790260/Epic_Music_VN_-_LAST_REUNION_Peter_Roe_xpezbq.mp3',
    },
    {
      title: 'Call of silence',
      artist: 'Anime AOT',
      image: 'https://tse4.mm.bing.net/th?id=OIP.UqWDJqrPQKN0kDVueEXpGQHaEK&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790263/Call_of_SilenceClear_Sky_Remix_%E4%BC%B4%E5%A5%8F_Nh%E1%BA%A1c_%C4%91%E1%BB%87m_Clear_Sky_dwnac4.mp3',
    },
    {
      title: '因为不能见所以很想念 ',
      artist: ' zy',
      image: 'https://tse3.mm.bing.net/th?id=OIP.GwC0CKBUb2y1XQ5d1tn79AHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790254/%E5%9B%A0%E4%B8%BA%E4%B8%8D%E8%83%BD%E8%A7%81%E6%89%80%E4%BB%A5%E5%BE%88%E6%83%B3%E5%BF%B5_Beat%E5%AE%BF%E5%91%BD%E7%89%88_xay3xm.mp3',
    },

    // Thêm bài hát vào đây
  ];

  export default songs;