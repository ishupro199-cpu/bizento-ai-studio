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
      <rect width="100" height="100" rx="22" fill="#89E900" />
      <rect x="8" y="8" width="8" height="8" rx="2" fill="#111111" opacity="0.25" />
      <rect x="84" y="8" width="8" height="8" rx="2" fill="#111111" opacity="0.25" />
      <rect x="8" y="84" width="8" height="8" rx="2" fill="#111111" opacity="0.25" />
      <rect x="84" y="84" width="8" height="8" rx="2" fill="#111111" opacity="0.25" />
      <rect x="46" y="8" width="8" height="8" rx="2" fill="#111111" opacity="0.18" />
      <rect x="46" y="84" width="8" height="8" rx="2" fill="#111111" opacity="0.18" />
      <path
        d="M57 14 L36 50 H50 L43 86 L70 50 H56 Z"
        fill="#111111"
      />
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
      <rect width="100" height="100" rx="22" fill="#89E900" opacity="0.12" />
      <rect x="8" y="8" width="8" height="8" rx="2" fill="#89E900" opacity="0.3" />
      <rect x="84" y="8" width="8" height="8" rx="2" fill="#89E900" opacity="0.3" />
      <rect x="8" y="84" width="8" height="8" rx="2" fill="#89E900" opacity="0.3" />
      <rect x="84" y="84" width="8" height="8" rx="2" fill="#89E900" opacity="0.3" />
      <rect x="46" y="8" width="8" height="8" rx="2" fill="#89E900" opacity="0.2" />
      <rect x="46" y="84" width="8" height="8" rx="2" fill="#89E900" opacity="0.2" />
      <path
        d="M57 14 L36 50 H50 L43 86 L70 50 H56 Z"
        fill="#89E900"
      />
    </svg>
  );
}
