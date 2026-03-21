interface BizentoIconProps {
  size?: number;
  className?: string;
}

export function BizentoIcon({ size = 32, className = "" }: BizentoIconProps) {
  const r = Math.round(size * 0.25);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #a3ff1a 0%, #89E900 55%, #6ec700 100%)",
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 2px ${Math.round(size * 0.25)}px rgba(137,233,0,0.35)`,
      }}
      className={className}
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Thunder bolt */}
        <path
          d="M14 2L6.5 13.5H12L10 22L18.5 10H13L14 2Z"
          fill="#0D0F14"
          fillOpacity="0.9"
        />
        {/* Sparkle top-right */}
        <path
          d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z"
          fill="#0D0F14"
          fillOpacity="0.55"
        />
        {/* Sparkle bottom-left */}
        <path
          d="M4 16L4.4 17.2L5.5 17.6L4.4 18L4 19.2L3.6 18L2.5 17.6L3.6 17.2L4 16Z"
          fill="#0D0F14"
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
}

export function BizentoIconOutline({ size = 32, className = "" }: BizentoIconProps) {
  const r = Math.round(size * 0.25);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "rgba(137,233,0,0.1)",
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(137,233,0,0.3)",
        flexShrink: 0,
      }}
      className={className}
    >
      <svg
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 2L6.5 13.5H12L10 22L18.5 10H13L14 2Z"
          fill="#89E900"
          fillOpacity="0.9"
        />
        <path
          d="M19 3L19.5 4.5L21 5L19.5 5.5L19 7L18.5 5.5L17 5L18.5 4.5L19 3Z"
          fill="#89E900"
          fillOpacity="0.6"
        />
        <path
          d="M4 16L4.4 17.2L5.5 17.6L4.4 18L4 19.2L3.6 18L2.5 17.6L3.6 17.2L4 16Z"
          fill="#89E900"
          fillOpacity="0.5"
        />
      </svg>
    </div>
  );
}
