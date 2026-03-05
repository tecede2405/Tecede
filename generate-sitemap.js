require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

async function generateSitemap() {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://tecede.netlify.app'; 
  const API_URL = process.env.REACT_APP_FILM_API_URL; 
  const API_PATH = process.env.REACT_APP_API_LIST_PATH || '/danh-sach/phim-moi-cap-nhat?page=';

  const staticPages = [
    '', '/about', '/film/dao-hai-tac', '/film/tham-tu-lung-danh-co-nan',
    '/film/dai-chien-nguoi-va-than-phan-3', '/film/mai-2024', '/film/quy-cau'
  ];

  try {
    console.log('Đang khởi tạo sơ đồ trang web...');
    let allMovies = [];

    // Crawl nhiều page hơn và tự dừng khi hết phim
    let page = 1;
    let hasMore = true;

    while (hasMore) {

      const response = await axios.get(`${API_URL}${API_PATH}${page}`);

      if (response.data && response.data.items && response.data.items.length > 0) {
        allMovies = allMovies.concat(response.data.items);
        page++;

        //  tránh crawl quá nhiều nếu API thay đổi
        if (page > 150) {
          hasMore = false;
        }

      } else {
        hasMore = false;
      }

    }

    console.log(`Đã lấy ${allMovies.length} phim từ API`);

    const today = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Thêm các trang tĩnh
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '' ? '1.0' : '0.7'}</priority>
  </url>`;
    });

    // Thêm link phim
    allMovies.forEach((movie) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/film/${movie.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemap += `\n</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap);

    console.log(`✅ Sitemap đã được cập nhật kín đáo.`);
    console.log(` Tổng URL trong sitemap: ${allMovies.length + staticPages.length}`);

    // 🔥 Ping Google để crawl lại sitemap
    try {
      await axios.get(`https://www.google.com/ping?sitemap=${BASE_URL}/sitemap.xml`);
      console.log(' Đã ping Google để cập nhật sitemap.');
    } catch (err) {
      console.log(' Không ping được Google, nhưng sitemap vẫn đã tạo.');
    }

  } catch (error) {
    console.error(' Có lỗi xảy ra trong quá trình tạo Sitemap.');
  }
}

generateSitemap();