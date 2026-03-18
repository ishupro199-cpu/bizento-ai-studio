interface BizentoIconProps {
  size?: number;
  className?: string;
}

export function BizentoIcon({ size = 32, className = "" }: BizentoIconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #89E900 0%, #5cb800 100%)",
        borderRadius: Math.round(size * 0.25),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontWeight: 900,
        fontSize: Math.round(size * 0.58),
        color: "#0D0F14",
        fontFamily: "system-ui, -apple-system, sans-serif",
        letterSpacing: "-0.05em",
        userSelect: "none",
        lineHeight: 1,
      }}
      className={className}
    >
      B
    </div>
  );
}

export function BizentoIconOutline({ size = 32, className = "" }: BizentoIconProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "rgba(137,233,0,0.12)",
        borderRadius: Math.round(size * 0.25),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(137,233,0,0.3)",
        flexShrink: 0,
        fontWeight: 900,
        fontSize: Math.round(size * 0.58),
        color: "#89E900",
        fontFamily: "system-ui, -apple-system, sans-serif",
        letterSpacing: "-0.05em",
        userSelect: "none",
        lineHeight: 1,
      }}
      className={className}
    >
      B
    </div>
  );
}
