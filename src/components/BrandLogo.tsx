/** A single Figma lockup keeps the symbol, wordmark and tagline in proportion. */
export function BrandLogo({ width = 168 }: { width?: number }) {
  const scale = width / 182;
  const style = { transform: `translate(-50%, -50%) scale(${scale})` };
  return <span className="brand-lockup" style={{ width, height: 66 * scale }}>
    <img className="brand-light" style={style} src="/brand/lockup-v3-light.svg" alt="겜자취 — 게임과 추억을 차곡차곡" />
    <img className="brand-dark" style={style} src="/brand/lockup-v3-dark.svg" alt="겜자취 — 게임과 추억을 차곡차곡" />
    <img className="brand-retro" style={style} src="/brand/lockup-v3-retro.svg" alt="겜자취 — 게임과 추억을 차곡차곡" />
  </span>;
}


