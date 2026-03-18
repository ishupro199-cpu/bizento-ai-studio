interface PixaLeraIconProps {
  size?: number;
  className?: string;
}

export function PixaLeraIcon({ size = 32, className = "" }: PixaLeraIconProps) {
  return (
    <img
      src="/pixalera-icon.png"
      width={size}
      height={size}
      alt="Pixalera"
      className={`rounded-xl ${className}`}
      style={{ objectFit: "cover", borderRadius: Math.round(size * 0.24) }}
    />
  );
}

export function PixaLeraIconOutline({ size = 32, className = "" }: PixaLeraIconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "rgba(137,233,0,0.12)",
        borderRadius: Math.round(size * 0.24),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(137,233,0,0.3)",
      }}
      className={className}
    >
      <img
        src="/pixalera-icon.png"
        width={size * 0.7}
        height={size * 0.7}
        alt="Pixalera"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
