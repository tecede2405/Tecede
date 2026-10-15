import { useEffect, useRef, memo } from "react";
import "./style.scss";

/**
 * Visual Canvas Engine hiệu năng cao (60fps, Zero-dependency)
 * Tự động chuyển đổi hiệu ứng 3D/hạt sống động theo Theme:
 * - pink: Cánh hoa hồng 3D xoay rơi & Trái tim phát sáng (20/10 & 8/3)
 * - tet: Pháo hoa đại hội nổ đa sắc & Hoa mai hoa đào bay
 * - noel: Bông tuyết 3D xoay lơ lửng & Tinh thể băng lấp lánh
 * - national: Chùm sao vàng & Ánh hào quang thiêng liêng
 * - midautumn: Đom đóm dạ quang & Lồng đèn trăng rằm
 * - halloween: Đốm lửa ma thuật & Dơi bay huyền bí
 * - default: Trường sao 3D vũ trụ chiều sâu
 */
function EventThemeCanvas({ theme = "default", isEnabled = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isEnabled) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Xử lý Resize
    const handleResize = () => {
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // MOUSE INTERACTION
    let mouse = { x: width / 2, y: height / 2, moved: false };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.moved = true;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // =========================================================================
    // 1. PARTICLES INITIALIZATION BASED ON THEME
    // =========================================================================
    let particles = [];
    let fireworks = [];
    let sparklers = [];
    let timer = 0;

    // --- A. THEME PINK: Cánh hoa hồng 3D & Trái tim ---
    const initPink = () => {
      const count = width < 768 ? 28 : 55;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          z: Math.random() * 200 + 50,
          size: Math.random() * 12 + 10,
          speedY: Math.random() * 1.4 + 0.8,
          speedX: Math.sin(Math.random() * Math.PI) * 1.2,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          rotSpeedX: (Math.random() - 0.5) * 0.04,
          rotSpeedY: (Math.random() - 0.5) * 0.04,
          rotSpeedZ: (Math.random() - 0.5) * 0.04,
          color: Math.random() > 0.4 ? "#f43f5e" : (Math.random() > 0.5 ? "#fb7185" : "#fda4af"),
          alpha: Math.random() * 0.6 + 0.35,
          type: Math.random() > 0.8 ? "heart" : "petal"
        });
      }
    };

    // --- B. THEME TET: Pháo hoa đại hội ---
    class Rocket {
      constructor() {
        this.x = Math.random() * (width - 160) + 80;
        this.y = height;
        this.targetY = Math.random() * (height * 0.45) + 60;
        this.speed = Math.random() * 3 + 8;
        this.hue = Math.floor(Math.random() * 360);
        this.trail = [];
        this.exploded = false;
      }
      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 7) this.trail.shift();
        this.y -= this.speed;
        this.speed *= 0.985;
        if (this.y <= this.targetY || this.speed <= 2) {
          this.exploded = true;
          this.createBurst();
        }
      }
      createBurst() {
        const count = width < 768 ? 40 : 65;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
          const velocity = Math.random() * 4.5 + 2;
          sparklers.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.012,
            gravity: 0.065,
            hue: this.hue + (Math.random() * 40 - 20),
            size: Math.random() * 2.2 + 1.2
          });
        }
      }
      draw() {
        ctx.save();
        this.trail.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${idx / this.trail.length})`;
          ctx.fill();
        });
        ctx.restore();
      }
    }

    // --- C. THEME NOEL: Bông tuyết 3D ---
    const initNoel = () => {
      const count = width < 768 ? 45 : 85;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 300 + 50,
          radius: Math.random() * 3.5 + 1.5,
          speedY: Math.random() * 1.2 + 0.6,
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayDist: Math.random() * 2 + 1,
          angle: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    };

    // --- D. THEME NATIONAL: Sao vàng & Ánh sáng ---
    const initNational = () => {
      const count = width < 768 ? 25 : 45;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 8 + 4,
          speedY: -(Math.random() * 0.9 + 0.4),
          speedX: (Math.random() - 0.5) * 0.6,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.03,
          color: Math.random() > 0.3 ? "#facc15" : "#fef08a",
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    };

    // --- E. THEME MIDAUTUMN: Đom đóm & Ánh trăng ---
    const initMidautumn = () => {
      const count = width < 768 ? 30 : 60;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 2,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.04 + 0.02,
          glowColor: Math.random() > 0.4 ? "245, 158, 11" : "251, 191, 36"
        });
      }
    };

    // --- F. THEME HALLOWEEN: Lửa cam/tím ma thuật ---
    const initHalloween = () => {
      const count = width < 768 ? 35 : 70;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 4 + 2,
          speedY: -(Math.random() * 1.5 + 0.8),
          speedX: (Math.random() - 0.5) * 0.8,
          color: Math.random() > 0.5 ? "249, 115, 22" : "168, 85, 247",
          alpha: Math.random() * 0.8 + 0.2
        });
      }
    };

    // --- G. THEME DEFAULT: Vũ trụ 3D Warp Starfield ---
    const initDefault = () => {
      const count = width < 768 ? 70 : 130;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: (Math.random() - 0.5) * width * 1.5,
          y: (Math.random() - 0.5) * height * 1.5,
          z: Math.random() * 800 + 1,
          size: Math.random() * 1.8 + 0.8,
          color: Math.random() > 0.3 ? "#ffffff" : (Math.random() > 0.5 ? "#38bdf8" : "#818cf8")
        });
      }
    };

    // Khởi tạo theo theme
    if (theme === "pink") initPink();
    else if (theme === "tet") fireworks = [];
    else if (theme === "noel") initNoel();
    else if (theme === "national") initNational();
    else if (theme === "midautumn") initMidautumn();
    else if (theme === "halloween") initHalloween();
    else initDefault();

    // =========================================================================
    // 2. MAIN RENDER LOOP (60 FPS OPTIMIZED)
    // =========================================================================
    const render = () => {
      timer++;

      // Xóa canvas
      ctx.clearRect(0, 0, width, height);

      // --- THEME PINK: RENDER PETALS & HEARTS ---
      if (theme === "pink") {
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += Math.sin(p.rotZ) * 1.1;
          p.rotX += p.rotSpeedX;
          p.rotY += p.rotSpeedY;
          p.rotZ += p.rotSpeedZ;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotZ);
          // Scale 3D mô phỏng góc quay
          ctx.scale(Math.cos(p.rotX), Math.sin(p.rotY));
          ctx.globalAlpha = p.alpha;

          if (p.type === "heart") {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            const topCurveHeight = p.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
            ctx.bezierCurveTo(-p.size / 2, (p.size + topCurveHeight) / 2, 0, (p.size + topCurveHeight) / 2, 0, p.size);
            ctx.bezierCurveTo(0, (p.size + topCurveHeight) / 2, p.size / 2, (p.size + topCurveHeight) / 2, p.size / 2, topCurveHeight);
            ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
            ctx.fill();
          } else {
            // Cánh hoa hồng hình elip giọt nước
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size * 0.8, p.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        });
      }

      // --- THEME TET: RENDER PHÁO HOA ---
      else if (theme === "tet") {
        // Tự động bắn pháo hoa theo chu kỳ
        if (timer % 40 === 0 && fireworks.length < 5) {
          fireworks.push(new Rocket());
        }

        // Cập nhật và vẽ rocket
        for (let i = fireworks.length - 1; i >= 0; i--) {
          fireworks[i].update();
          fireworks[i].draw();
          if (fireworks[i].exploded) {
            fireworks.splice(i, 1);
          }
        }

        // Cập nhật và vẽ tàn hoa lấp lánh (sparklers)
        for (let i = sparklers.length - 1; i >= 0; i--) {
          const s = sparklers[i];
          s.x += s.vx;
          s.y += s.vy;
          s.vy += s.gravity;
          s.vx *= 0.98;
          s.alpha -= s.decay;

          if (s.alpha <= 0) {
            sparklers.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, 100%, 65%, ${s.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = `hsl(${s.hue}, 100%, 60%)`;
          ctx.fill();
          ctx.restore();
        }
      }

      // --- THEME NOEL: BÔNG TUYẾT 3D ---
      else if (theme === "noel") {
        particles.forEach((p) => {
          p.y += p.speedY;
          p.angle += p.swaySpeed;
          p.x += Math.sin(p.angle) * p.swayDist;

          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
          ctx.shadowBlur = p.radius > 2.5 ? 6 : 0;
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
          ctx.fill();
          ctx.restore();
        });
      }

      // --- THEME NATIONAL: CHÙM SAO VÀNG BAY ---
      else if (theme === "national") {
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rot += p.rotSpeed;

          if (p.y < -20) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          // Vẽ ngôi sao 5 cánh
          ctx.beginPath();
          const spikes = 5;
          const outerR = p.size;
          const innerR = p.size * 0.45;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerR);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
            rot += step;
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      // --- THEME MIDAUTUMN: ĐOM ĐÓM DẠ QUANG ---
      else if (theme === "midautumn") {
        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;
          p.pulse += p.pulseSpeed;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentAlpha = 0.3 + Math.sin(p.pulse) * 0.4;

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.glowColor}, ${Math.max(0.1, currentAlpha)})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${p.glowColor}, 0.8)`;
          ctx.fill();
          ctx.restore();
        });
      }

      // --- THEME HALLOWEEN: LỬA CAM / TÍM ---
      else if (theme === "halloween") {
        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.alpha -= 0.003;

          if (p.y < -10 || p.alpha <= 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
            p.alpha = Math.random() * 0.8 + 0.2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${p.color}, 0.8)`;
          ctx.fill();
          ctx.restore();
        });
      }

      // --- THEME DEFAULT: 3D WARP STARFIELD ---
      else {
        ctx.save();
        ctx.translate(width / 2, height / 2);

        particles.forEach((p) => {
          p.z -= 1.8;
          if (p.z <= 0) {
            p.z = 800;
            p.x = (Math.random() - 0.5) * width * 1.5;
            p.y = (Math.random() - 0.5) * height * 1.5;
          }

          const k = 300 / p.z;
          const px = p.x * k;
          const py = p.y * k;
          const pSize = Math.max(0.5, p.size * k);

          if (px > -width / 2 && px < width / 2 && py > -height / 2 && py < height / 2) {
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.min(1, (800 - p.z) / 400);
            ctx.fill();
          }
        });

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Tự động tạm dừng khi ẩn tab để tiết kiệm CPU/RAM
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [theme, isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className={`theme-canvas-container theme-canvas--${theme}`}>
      <canvas ref={canvasRef} className="theme-canvas-element" />
    </div>
  );
}

export default memo(EventThemeCanvas);
