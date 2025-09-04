export async function subscribeUser() {
  if ("serviceWorker" in navigator) {
    try {
      // Đăng ký service worker
      const register = await navigator.serviceWorker.register("/worker.js", { scope: "/" });

      // Đăng ký push
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_PUBLIC_VAPID_KEY)
      });

      // Gửi subscription về server
      await fetch(`${process.env.REACT_APP_API_URL}/api/songs/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });

      alert("✅ Đã đăng ký nhận thông báo!");
    } catch (err) {
      console.error("❌ Lỗi khi đăng ký push:", err);
    }
  }
}

// helper để convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
