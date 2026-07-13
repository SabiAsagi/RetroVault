interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.415;
  const ringW = size * 0.095;
  const innerR = outerR - ringW;
  const hubR = size * 0.055;
  const dpadLong = size * 0.3;
  const dpadShort = size * 0.125;
  const spokeDegrees = [45, 135, 225, 315];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="RetroVault 로고"
    >
      <rect x={0} y={0} width={size} height={size} rx={size * 0.22} fill="#0D1117" />
      <circle cx={cx} cy={cy} r={outerR} fill="#F5A320" />
      <circle cx={cx} cy={cy} r={innerR} fill="#0D1117" />
      {spokeDegrees.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx + (hubR + size * 0.02) * Math.cos(rad)}
            y1={cy + (hubR + size * 0.02) * Math.sin(rad)}
            x2={cx + (innerR - size * 0.025) * Math.cos(rad)}
            y2={cy + (innerR - size * 0.025) * Math.sin(rad)}
            stroke="#F5A320"
            strokeWidth={size * 0.042}
            strokeLinecap="round"
          />
        );
      })}
      <rect
        x={cx - dpadLong / 2}
        y={cy - dpadShort / 2}
        width={dpadLong}
        height={dpadShort}
        rx={size * 0.028}
        fill="#F5A320"
      />
      <rect
        x={cx - dpadShort / 2}
        y={cy - dpadLong / 2}
        width={dpadShort}
        height={dpadLong}
        rx={size * 0.028}
        fill="#F5A320"
      />
      <circle cx={cx} cy={cy} r={hubR} fill="#0D1117" />
    </svg>
  );
}
