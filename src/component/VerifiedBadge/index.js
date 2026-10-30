export const VerifiedBadge = () => (
  <svg
    width="20"
    height="20"
    viewBox="100 915 10 16"
    fill="#1DA1F2"
    style={{
      marginLeft: 3,
      cursor: "pointer",
      transition: "0.2s",
      verticalAlign: "middle",
    }}
    onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
    onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    title="Quản trị viên (Admin)"
  >
    <path d="m106.853 922.354-3.5 3.5a.499.499 0 0 1-.706 0l-1.5-1.5a.5.5 0 1 1 .706-.708l1.147 1.147 3.147-3.147a.5.5 0 1 1 .706.708m3.078 2.295-.589-1.149.588-1.15a.633.633 0 0 0-.219-.82l-1.085-.7-.065-1.287a.627.627 0 0 0-.6-.603l-1.29-.066-.703-1.087a.636.636 0 0 0-.82-.217l-1.148.588-1.15-.588a.631.631 0 0 0-.82.22l-.701 1.085-1.289.065a.626.626 0 0 0-.6.6l-.066 1.29-1.088.702a.634.634 0 0 0-.216.820l.588 1.149-.588 1.15a.632.632 0 0 0 .219.819l1.085.701.065 1.286c.014.33.274.59.6.604l1.29.065.703 1.088c.177.27.53.362.82.216l1.148-.588 1.15.589a.629.629 0 0 0 .82-.22l.701-1.085 1.286-.064a.627.627 0 0 0 .604-.601l.065-1.29 1.088-.703a.633.633 0 0 0 .216-.819" />
  </svg>
);

export const PremiumBadge = ({ showText = true, size = 18, className = "" }) => (
  <span
    className={`premium-badge-wrapper ${className}`}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      verticalAlign: "middle",
      marginLeft: "4px",
    }}
    title="Thành viên Premium"
  >
    <svg
      width={size}
      height={size}
      viewBox="100 915 10 16"
      fill="#eab308"
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease, filter 0.2s ease",
        filter: "drop-shadow(0 0 5px rgba(234, 179, 8, 0.5))",
        flexShrink: 0,
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <path d="m106.853 922.354-3.5 3.5a.499.499 0 0 1-.706 0l-1.5-1.5a.5.5 0 1 1 .706-.708l1.147 1.147 3.147-3.147a.5.5 0 1 1 .706.708m3.078 2.295-.589-1.149.588-1.15a.633.633 0 0 0-.219-.82l-1.085-.7-.065-1.287a.627.627 0 0 0-.6-.603l-1.29-.066-.703-1.087a.636.636 0 0 0-.82-.217l-1.148.588-1.15-.588a.631.631 0 0 0-.82.22l-.701 1.085-1.289.065a.626.626 0 0 0-.6.6l-.066 1.29-1.088.702a.634.634 0 0 0-.216.820l.588 1.149-.588 1.15a.632.632 0 0 0 .219.819l1.085.701.065 1.286c.014.33.274.59.6.604l1.29.065.703 1.088c.177.27.53.362.82.216l1.148-.588 1.15.589a.629.629 0 0 0 .82-.22l.701-1.085 1.286-.064a.627.627 0 0 0 .604-.601l.065-1.29 1.088-.703a.633.633 0 0 0 .216-.819" />
    </svg>
    {showText && (
      <span
        style={{
          fontSize: "11px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #fef08a 0%, #facc15 50%, #eab308 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          textShadow: "0 0 10px rgba(234, 179, 8, 0.3)",
        }}
      >
        Premium
      </span>
    )}
  </span>
);
