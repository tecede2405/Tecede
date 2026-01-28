require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

async function generateSitemap() {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://tecede.netlify.app'; 
  const API_URL = process.env.REACT_APP_FILM_API_URL; 
  
  const API_PATH = process.env.REACT_APP_API_LIST_PATH || '/danh-sach/phim-moi-cap-nhat?page=';

  const staticPages = [
    '', '/about', '/music', '/music/nhac-tre', '/music/usuk', 
    '/music/trung-quoc', '/music/nhactre-remix', '/music/edm', '/music/phonk', '/film/dao-hai-tac', '/film/tham-tu-lung-danh-co-nan',
    '/film/dai-chien-nguoi-va-than-phan-3', '/film/mai-2024', '/film/quy-cau'
  ];

  try {
    console.log('Đang khởi tạo sơ đồ trang web...');
    let allMovies = [];

    for (let i = 1; i <= 10; i++) {
      // Nối URL một cách gián tiếp thông qua biến env
      const response = await axios.get(`${API_URL}${API_PATH}${i}`);
      if (response.data && response.data.items) {
        allMovies = allMovies.concat(response.data.items);
      }
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Thêm các trang tĩnh
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page === '' ? '1.0' : '0.7'}</priority>
  </url>`;
    });

    // Thêm link phim
    allMovies.forEach((movie) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/film/${movie.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `\n</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log(`✅ Sitemap đã được cập nhật kín đáo.`);
    
  } catch (error) {
    // Không in chi tiết lỗi URL ra console để bảo mật
    console.error('❌ Có lỗi xảy ra trong quá trình tạo Sitemap.');
  }
}

generateSitemap();