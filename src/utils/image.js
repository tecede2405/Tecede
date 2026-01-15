export function getWebpImage(url) {
  if (!url) return "";

  // nếu đã là webp qua phimapi rồi thì thôi
  if (url.includes("phimapi.com/image.php")) return url;

  // ảnh đầy đủ
  let fullUrl = url.startsWith("http")
    ? url
    : `https://phimimg.com${url.startsWith("/") ? url : "/" + url}`;

  return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(fullUrl)}`;
}
