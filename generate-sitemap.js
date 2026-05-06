require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAllFromSource(baseUrl, limitPage = 50) {
  let page = 1;
  let all = [];
  let hasMore = true;

  while (hasMore) {
    try {
      const url = `${baseUrl}${page}`;
      console.log("Fetching:", url);

      const res = await axios.get(url);

      const items =
        res.data?.items ||
        res.data?.data?.items ||
        [];

      if (!items.length) break;

      console.log(`Page ${page}: ${items.length} phim`);

      all.push(...items);
      page++;

      // tránh spam API
      await sleep(300);

      // giới hạn tránh bị ban IP
      if (page > limitPage) break;

    } catch (err) {
      console.log("❌ Fetch lỗi:", err.message);

      // nếu bị rate limit thì nghỉ lâu hơn
      await sleep(2000);
      break;
    }
  }

  return all;
}

async function generateSitemap() {
  const BASE_URL = process.env.REACT_APP_BASE_URL || 'https://tecede.netlify.app';
  const API_URL = process.env.REACT_APP_FILM_API_URL;

  const staticPages = [''];

  // ✅ tất cả nguồn
  const sources = [
    // 🔥 phim mới (KHÔNG có /v1/api)
    `${API_URL}/danh-sach/phim-moi-cap-nhat?page=`,

    // phim
    `${API_URL}/v1/api/danh-sach/phim-le?page=`,
    `${API_URL}/v1/api/danh-sach/phim-bo?page=`,

    // quốc gia
    `${API_URL}/v1/api/quoc-gia/han-quoc?page=`,
    `${API_URL}/v1/api/quoc-gia/trung-quoc?page=`,
    `${API_URL}/v1/api/quoc-gia/nhat-ban?page=`,
    `${API_URL}/v1/api/quoc-gia/viet-nam?page=`,

    // thể loại
    `${API_URL}/v1/api/the-loai/hoat-hinh?page=`,
  ];

  try {
    console.log("🔥 Bắt đầu build sitemap...");

    let allMovies = [];

    for (const source of sources) {
      console.log("🚀 Fetch nguồn:", source);

      const data = await fetchAllFromSource(source, 50); // limit 50 page / nguồn
      allMovies.push(...data);
    }

    console.log(`📦 Raw: ${allMovies.length}`);

    // remove trùng slug
    const uniqueMovies = Array.from(
      new Map(allMovies.map((item) => [item.slug, item])).values()
    );

    console.log(`✅ Unique: ${uniqueMovies.length}`);

    const today = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // static pages
    staticPages.forEach((page) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '' ? '1.0' : '0.7'}</priority>
  </url>`;
    });

    // movie pages
    uniqueMovies.forEach((movie) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/chi-tiet/${movie.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // category pages
    const categories = ['han-quoc', 'trung-quoc', 'nhat-ban', 'viet-nam'];

    categories.forEach((cat) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}/quoc-gia/${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `\n</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap);

    console.log(`🌍 Total URLs: ${uniqueMovies.length + staticPages.length + categories.length}`);
    console.log("🎉 DONE sitemap!");

  } catch (error) {
    console.error("❌ Lỗi tạo sitemap:", error.message);
  }
}

generateSitemap();