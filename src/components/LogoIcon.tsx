interface LogoIconProps { size?: number; className?: string; }
export function LogoIcon({ size = 40, className = '' }: LogoIconProps) {
  return <span className={'brand-symbol ' + className} style={{ width: size, height: size }}>
    <img style={{ transform: `scale(${size / 66})` }} className="brand-light" src="/brand/symbol-final-light.svg" alt="겜자취 로고" />
    <img style={{ transform: `scale(${size / 66})` }} className="brand-dark" src="/brand/symbol-final-dark.svg" alt="겜자취 로고" />
    <img style={{ transform: `scale(${size / 66})` }} className="brand-retro" src="/brand/symbol-final-retro.svg" alt="겜자취 로고" />
  </span>;
}
