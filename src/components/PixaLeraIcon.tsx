interface PixaLeraIconProps {
  size?: number;
  className?: string;
}

export function PixaLeraIcon({ size = 32, className = "" }: PixaLeraIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="24" fill="#89E900" />
      <defs>
        <linearGradient id={`gloss-${size}`} x1="20" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.18" />
          <stop offset="1" stopColor="black" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill={`url(#gloss-${size})`} />
      <path d="M60 10 L31 53 H51 L40 90 L73 47 H53 Z" fill="#0D2000" opacity="0.92" />
    </svg>
  );
}

export function PixaLeraIconOutline({ size = 32, className = "" }: PixaLeraIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="24" fill="#89E900" opacity="0.12" />
      <path d="M60 10 L31 53 H51 L40 90 L73 47 H53 Z" fill="#89E900" />
    </svg>
  );
}
