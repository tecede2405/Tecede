import React, { useEffect, useState, useMemo } from "react";
import {
  FaBolt,
  FaWifi,
  FaDatabase,
  FaGaugeHigh,
  FaCircleCheck,
  FaTriangleExclamation,
  FaCircleInfo,
  FaServer,
} from "react-icons/fa6";
import "./style.scss";

function formatSpeed(mbps, isConnecting = false) {
  if (!mbps || mbps <= 0) {
    return isConnecting ? "Đang đo..." : "0 Mbps";
  }
  if (mbps < 1) {
    const kbps = Math.round(mbps * 1024);
    return `${kbps} KB/s`;
  }
  return `${Number(mbps).toFixed(1)} Mbps`;
}

export default function NetworkSpeedIndicator({
  isVmServer = false,
  currentServerObj = null,
  servers = [],
  currentServer = 0,
  onSwitchServer,
  stats: externalStats = null,
}) {
  const [internalStats, setInternalStats] = useState({
    speedMbps: 0,
    pingMs: 0,
    bufferAhead: 0,
    qualityLabel: "",
    status: "connecting", // 'connecting' | 'buffering' | 'excellent' | 'good' | 'normal' | 'slow'
    statusText: "Đang kiểm tra...",
    advice: "Đang kết nối tới máy chủ CDN...",
    serverName: "",
    isBuffering: false,
    timestamp: Date.now(),
  });

  // Lắng nghe sự kiện custom event từ HlsPlayer
  useEffect(() => {
    if (isVmServer) return;

    const handleNetworkStats = (e) => {
      if (e?.detail) {
        setInternalStats((prev) => ({
          ...prev,
          ...e.detail,
        }));
      }
    };

    window.addEventListener("mamphim:network-stats", handleNetworkStats);
    return () => {
      window.removeEventListener("mamphim:network-stats", handleNetworkStats);
    };
  }, [isVmServer]);

  // Ưu tiên props truyền vào nếu có
  const activeStats = externalStats || internalStats;

  // Lấy các server khác ngoài server hiện tại để gợi ý đổi server khi lag
  const alternativeServers = useMemo(() => {
    if (!servers || servers.length <= 1) return [];
    return servers
      .map((s, idx) => ({ ...s, index: idx }))
      .filter((s) => s.index !== currentServer);
  }, [servers, currentServer]);

  // Nếu là server không hỗ trợ đo lường trực tiếp
  if (isVmServer) {
    return (
      <div className="network-speed-indicator is-vm-mode">
        <div className="nsi-header">
          <div className="nsi-status-left">
            <span className="nsi-dot nsi-dot--normal" />
            <div className="nsi-title-box">
              <span className="nsi-label">Trạng thái đường truyền:</span>
              <strong className="nsi-status-text text-normal">Nguồn phát này không đo lường</strong>
            </div>
          </div>
          <div className="nsi-speed-badge">
            <FaServer className="speed-icon" />
            <span className="speed-number">Không đo lường</span>
          </div>
        </div>

        <div className="nsi-metrics">
          <div className="nsi-metric-chip">
            <span className="chip-icon"><FaGaugeHigh /></span>
            <span className="chip-label">Tốc độ tải:</span>
            <span className="chip-value">Không đo lường</span>
          </div>
          <div className="nsi-metric-chip">
            <span className="chip-icon"><FaWifi /></span>
            <span className="chip-label">Độ trễ CDN:</span>
            <span className="chip-value">-- ms</span>
          </div>
          <div className="nsi-metric-chip">
            <span className="chip-icon"><FaDatabase /></span>
            <span className="chip-label">Bộ nhớ đệm:</span>
            <span className="chip-value">Tự động</span>
          </div>
        </div>

        <div className="nsi-footer-advice">
          <FaCircleInfo className="advice-icon text-warning" />
          <span className="advice-text">
            Nguồn phát này không đo lường, chỉ đo lường nguồn phát HLS.
          </span>
        </div>
      </div>
    );
  }

  const {
    speedMbps = 0,
    pingMs = 0,
    bufferAhead = 0,
    qualityLabel = "",
    status = "connecting",
    statusText = "Đang kiểm tra...",
    advice = "Đang kết nối tới máy chủ CDN...",
  } = activeStats;

  // Tính phần trăm thanh đệm buffer (tối đa 60s xem như 100%)
  const bufferPercent = Math.min(100, Math.round((bufferAhead / 60) * 100));

  // Phân cấp màu Ping
  let pingStatusClass = "ping-fast";
  if (pingMs > 120) {
    pingStatusClass = "ping-slow";
  } else if (pingMs > 60) {
    pingStatusClass = "ping-medium";
  }

  return (
    <div className={`network-speed-indicator status-${status}`}>
      {/* Hàng trên: Trạng thái & Tốc độ tải chính */}
      <div className="nsi-header">
        <div className="nsi-status-left">
          <span className={`nsi-dot nsi-dot--${status}`} />
          <div className="nsi-title-box">
            <span className="nsi-label">Trạng thái đường truyền:</span>
            <strong className={`nsi-status-text text-${status}`}>{statusText}</strong>
          </div>
        </div>

        <div className={`nsi-speed-badge speed-${status}`}>
          <FaBolt className="speed-icon" />
          <span className="speed-number">
            {formatSpeed(speedMbps, status === "connecting" || status === "buffering")}
          </span>
        </div>
      </div>

      {/* Hàng giữa: 3 thông số chi tiết (Tốc độ, Ping CDN, Bộ đệm) */}
      <div className="nsi-metrics">
        {/* Tốc độ */}
        <div className="nsi-metric-chip">
          <span className="chip-icon"><FaGaugeHigh /></span>
          <span className="chip-label">Tốc độ tải:</span>
          <span className="chip-value text-accent">
            {formatSpeed(speedMbps, status === "connecting" || status === "buffering")}
          </span>
        </div>

        {/* Độ trễ CDN Ping */}
        <div className="nsi-metric-chip">
          <span className="chip-icon"><FaWifi /></span>
          <span className="chip-label">Độ trễ CDN:</span>
          <span className={`chip-value ${pingStatusClass}`}>
            {pingMs > 0 ? `${pingMs} ms` : "-- ms"}
          </span>
        </div>

        {/* Bộ nhớ đệm trước */}
        <div className="nsi-metric-chip chip-buffer">
          <span className="chip-icon"><FaDatabase /></span>
          <span className="chip-label">Đệm trước:</span>
          <span className="chip-value">
            {bufferAhead > 0 ? `${bufferAhead}s` : "0s"}
          </span>
          <div className="mini-buffer-track" title={`Đã nạp trước ${bufferAhead}s video`}>
            <div
              className="mini-buffer-fill"
              style={{ width: `${bufferPercent}%` }}
            />
          </div>
        </div>

        {/* Chất lượng luồng */}
        {qualityLabel && (
          <div className="nsi-metric-chip chip-quality d-none d-sm-inline-flex">
            <span className="chip-label">Chất lượng:</span>
            <span className="chip-value text-info">{qualityLabel}</span>
          </div>
        )}
      </div>

      {/* Hàng dưới: Lời khuyên mượt/lag & Gợi ý đổi server nếu lag */}
      <div className="nsi-footer-advice">
        {status === "excellent" && (
          <FaCircleCheck className="advice-icon text-success" />
        )}
        {status === "good" && (
          <FaCircleCheck className="advice-icon text-info" />
        )}
        {status === "normal" && (
          <FaCircleInfo className="advice-icon text-warning" />
        )}
        {status === "slow" && (
          <FaTriangleExclamation className="advice-icon text-danger" />
        )}
        {(status === "connecting" || status === "buffering") && (
          <FaCircleInfo className="advice-icon text-primary" />
        )}
        <span className="advice-text">{advice}</span>
      </div>

      {/* Nếu mạng chậm hoặc lag và có các server khác -> hiển thị nút chuyển nhanh */}
      {status === "slow" && onSwitchServer && alternativeServers.length > 0 && (
        <div className="nsi-switch-suggestion">
          <span className="switch-text">
            💡 Gợi ý: Video tải chậm, bạn có thể chuyển nhanh sang server khác:
          </span>
          <div className="switch-buttons">
            {alternativeServers.slice(0, 3).map((srv) => (
              <button
                key={srv.index}
                type="button"
                className="switch-btn"
                onClick={() => onSwitchServer(srv.index)}
              >
                <FaServer /> {srv.display_name || srv.server_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
