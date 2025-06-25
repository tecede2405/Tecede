
const songs = [
  {
      title: 'DRESS!',
      artist: 'Eternxlkz',
      image: 'https://i.scdn.co/image/ab67616d0000b273387d22e3246263ff715077ab',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863779/Eternxlkz_-_DRESS_Official_Audio_mivv4v.mp3',
    },
{
      title: 'BRODYAGA FUNK',
      artist: 'Eternxlkz',
      image: 'https://images.genius.com/a9f94812d3a3d697c338192fadeeb00a.1000x1000x1.png',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863777/Eternxlkz_-_BRODYAGA_FUNK_Official_Audio_l5nuj5.mp3',
    },
{
      title: 'SLAVA FUNK!',
      artist: 'Filip Lackovic',
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/b3/ae/5e/b3ae5e3a-f8c2-55d8-8da8-4677762c5b4d/723277982175.jpg/1200x1200bf-60.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863775/SLAVA_FUNK_weh2ks.mp3',
    },
{
      title: '✻H+3+ЯД✻7luCJIo0T6',
      artist: 'vyrval',
      image: 'https://i.ytimg.com/vi/LG1G8uOvrIk/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863774/H3%D0%AF%D0%947luCJIo0T6..._second_drop_super_slowed_qj3d46.mp3',
    },
{
      title: 'MANASHA',
      artist: 'Ashreveal',
      image: 'https://i.scdn.co/image/ab67616d0000b273b15c0c5096e99e248d8d8853',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863774/MANASHA_-_Ashreveal_v5z05j.mp3',
    },
{
      title: 'STRUCT',
      artist: 'UdieNnx',
      image: 'https://i.scdn.co/image/ab67616d0000b273b15c0c5096e99e248d8d8853',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863777/UdieNnx_-_STRUCT_ja0e77.mp3',
    },
{
      title: 'FUNK INFERNAL',
      artist: 'DYGO & Mxng0',
      image: 'https://i.scdn.co/image/ab67616d0000b273325d15ed76964b2cc4142009',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863778/DYGO_Mxng0_-_FUNK_INFERNAL_Brazilian_Phonk_dkdzvn.mp3',
    },
{
      title: 'Why Not',
      artist: 'Ghostface Playa',
      image: 'https://tse3.mm.bing.net/th?id=OIP.LvQbZava4lvkENdBxEe1sQHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863777/Ghostface_Playa_-_Why_Not_eaaiox.mp3',
    },
{
      title: 'Sahara',
      artist: 'Hensonn',
      image: 'https://soundbank.ru/uploads/posts/2022-04/1650300324_ac31dcee-43ae-4a10-8dac-aa03e6be11d2.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863782/Hensonn-Sahara_x7chdw.mp3',
    },
{
      title: 'RAVE',
      artist: 'Dxrk ダーク',
      image: 'https://is5-ssl.mzstatic.com/image/thumb/Music126/v4/68/46/67/684667e2-eef1-827b-af0e-4d69448db8a4/196626562715.jpg/1200x1200bf-60.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863782/Dxrk_%E3%83%80%E3%83%BC%E3%82%AF_-_RAVE_Official_Audio_g4ji1v.mp3',
    },
{
      title: 'Close Eyes',
      artist: 'DVRST',
      image: 'https://i.ytimg.com/vi/8WiaJAdhZb8/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863798/DVRST_-_Close_Eyes_sknkbt.mp3',
    },
{
      title: 'Parting',
      artist: 'GTR7',
      image: 'https://i.ytimg.com/vi/UmF_JEx1BmQ/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750863777/GTR7_-_Parting_PHONK_nadvcj.mp3',
    },
    {
      title: 'Death is no more x Sleepwalker',
      artist: 'Akiaura, LONOWN, STM',
      image: 'https://i.ytimg.com/vi/HFF8ZIrkej0/maxresdefault.jpg',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790231/DEATH_IS_NO_MORE_x_SLEEPWALKER_P4nMusic_TIKTOK_MASHUP_jdfkuw.mp3',
    },
    {
      title: '2 Phút Hơn Funk',
      artist: 'Pháo',
      image: 'https://tse2.mm.bing.net/th?id=OIP.AE4gQX3W24054xwnVIp4gQHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790230/2_PH%C3%9AT_H%C6%A0N_FUNK_marstx.mp3',
    },
     {
      title: 'Memory Reboot',
      artist: 'VØJ, Narvent',
      image: 'https://tse1.mm.bing.net/th?id=OIP.3iWh3-HH_tWW_atJhxKEawHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790231/V%C3%98J_Narvent_-_Memory_Reboot_4K_Music_Video_t8lcfk.mp3',
    },
  {
      title: 'Avangard',
      artist: 'LONOWN',
      image: 'https://tse4.mm.bing.net/th?id=OIP.1qcPo4yBzqjtjpSj2WMnOAHaHa&pid=Api&P=0&h=180',
      file: 'https://res.cloudinary.com/dr9sdtbzg/video/upload/v1750790231/LONOWN_-_AVANGARD_SLOWED_Version_Official_Visualizer_act4oe.mp3',
    },

  ];

  export default songs;