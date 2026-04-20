// Botanical SVG decorations — used across screens.
// Thin-line vintage-engraving feel. All use currentColor.

const Leaf = ({ size = 64, style = {}, stroke = 1.2 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 64 90" fill="none" style={style}>
    <path d="M32 4 C 10 20, 6 55, 32 86 C 58 55, 54 20, 32 4 Z"
      stroke="currentColor" strokeWidth={stroke} />
    <path d="M32 4 L 32 86" stroke="currentColor" strokeWidth={stroke * 0.8} />
    {[14, 26, 38, 50, 62, 74].map((y, i) => {
      const reach = 16 - Math.abs(i - 2.5) * 2;
      return <g key={i}>
        <path d={`M32 ${y} Q ${32 - reach * 0.6} ${y + 4}, ${32 - reach} ${y + 8}`} stroke="currentColor" strokeWidth={stroke * 0.6} />
        <path d={`M32 ${y} Q ${32 + reach * 0.6} ${y + 4}, ${32 + reach} ${y + 8}`} stroke="currentColor" strokeWidth={stroke * 0.6} />
      </g>;
    })}
  </svg>
);

const Fern = ({ size = 120, style = {}, stroke = 1 }) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160" fill="none" style={style}>
    <path d="M50 155 Q 48 80, 50 10" stroke="currentColor" strokeWidth={stroke} />
    {Array.from({ length: 12 }).map((_, i) => {
      const y = 150 - i * 12;
      const len = 8 + i * 2.5 - (i > 8 ? (i - 8) * 6 : 0);
      return <g key={i}>
        <path d={`M50 ${y} Q ${50 - len * 0.4} ${y - 2}, ${50 - len} ${y - 6}`} stroke="currentColor" strokeWidth={stroke * 0.7} />
        <path d={`M50 ${y} Q ${50 + len * 0.4} ${y - 2}, ${50 + len} ${y - 6}`} stroke="currentColor" strokeWidth={stroke * 0.7} />
      </g>;
    })}
  </svg>
);

const Sprig = ({ size = 80, style = {}, stroke = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={style}>
    <path d="M12 68 Q 30 50, 56 22" stroke="currentColor" strokeWidth={stroke} />
    <ellipse cx="22" cy="58" rx="5" ry="9" transform="rotate(-50 22 58)" stroke="currentColor" strokeWidth={stroke * 0.7} />
    <ellipse cx="34" cy="46" rx="5" ry="9" transform="rotate(-50 34 46)" stroke="currentColor" strokeWidth={stroke * 0.7} />
    <ellipse cx="46" cy="34" rx="5" ry="9" transform="rotate(-50 46 34)" stroke="currentColor" strokeWidth={stroke * 0.7} />
    <ellipse cx="58" cy="22" rx="5" ry="9" transform="rotate(-50 58 22)" stroke="currentColor" strokeWidth={stroke * 0.7} />
  </svg>
);

const Cell = ({ size = 120, style = {}, stroke = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={style}>
    <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth={stroke} strokeDasharray="2 3" />
    <circle cx="60" cy="60" r="42" stroke="currentColor" strokeWidth={stroke * 0.8} />
    <circle cx="58" cy="56" r="14" stroke="currentColor" strokeWidth={stroke * 0.8} />
    <circle cx="58" cy="56" r="5" fill="currentColor" opacity="0.35" />
    {[[42, 76], [74, 72], [48, 40], [80, 50], [36, 60]].map(([x,y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="4" ry="2" stroke="currentColor" strokeWidth={stroke * 0.6} transform={`rotate(${i*30} ${x} ${y})`} />
    ))}
  </svg>
);

const Helix = ({ size = 80, style = {}, stroke = 1 }) => (
  <svg width={size} height={size * 1.8} viewBox="0 0 80 144" fill="none" style={style}>
    {Array.from({ length: 7 }).map((_, i) => {
      const y = 10 + i * 20;
      return <path key={i} d={`M10 ${y} Q 40 ${y - 10}, 70 ${y}`} stroke="currentColor" strokeWidth={stroke * 0.6} />;
    })}
    <path d="M10 10 Q 40 80, 10 134" stroke="currentColor" strokeWidth={stroke} />
    <path d="M70 10 Q 40 80, 70 134" stroke="currentColor" strokeWidth={stroke} />
  </svg>
);

// Decorative placeholder illustration — textbook plate
const PlatePlaceholder = ({ label = "Plantae — Ficus", style = {} }) => (
  <div style={{
    position: "relative",
    background: "var(--cream-100)",
    border: "1px solid var(--border-soft)",
    borderRadius: "var(--r-md)",
    aspectRatio: "4/5",
    display: "grid",
    placeItems: "center",
    color: "var(--green-800)",
    overflow: "hidden",
    ...style,
  }}>
    <Leaf size={120} stroke={0.9} />
    <div style={{
      position: "absolute",
      bottom: 10, left: 0, right: 0,
      textAlign: "center",
      fontFamily: "var(--f-serif)",
      fontStyle: "italic",
      fontSize: 12,
      color: "var(--text-muted)",
      letterSpacing: "0.08em",
    }}>
      Fig. — {label}
    </div>
  </div>
);

// Background with faint fern + cells pattern
const BotanicalBg = ({ intensity = 1, pattern = "mix" }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none",
    opacity: 0.08 * intensity,
    color: "var(--green-900)",
    overflow: "hidden",
  }}>
    {pattern !== "cells" && <Fern size={220} style={{ position: "absolute", top: -30, right: -60 }} />}
    {pattern !== "cells" && <Sprig size={140} style={{ position: "absolute", bottom: 40, left: 20, transform: "rotate(-20deg)" }} />}
    {pattern !== "ferns" && <Cell size={160} style={{ position: "absolute", bottom: -30, right: 60 }} />}
    {pattern !== "ferns" && <Cell size={100} style={{ position: "absolute", top: 80, left: 100 }} />}
  </div>
);

// Leaf fall burst used after correct answer / at results
const LeafBurst = ({ count = 28, go = false }) => {
  const leaves = React.useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 600,
    dx: (Math.random() - 0.5) * 400,
    dr: 180 + Math.random() * 540,
    dur: 1400 + Math.random() * 1600,
    size: 14 + Math.random() * 22,
    color: ["var(--green-500)","var(--green-600)","var(--green-400)","var(--accent)"][i % 4],
  })), [count]);
  if (!go) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      {leaves.map(l => (
        <div key={l.id} style={{
          position: "absolute",
          top: -30,
          left: `${l.left}%`,
          width: l.size, height: l.size * 1.4,
          color: l.color,
          animation: `leaf-fall ${l.dur}ms ${l.delay}ms cubic-bezier(.2,.7,.3,1) forwards`,
          "--dx": `${l.dx}px`,
          "--dr": `${l.dr}deg`,
        }}>
          <svg viewBox="0 0 64 90" style={{ width: "100%", height: "100%" }}>
            <path d="M32 4 C 10 20, 6 55, 32 86 C 58 55, 54 20, 32 4 Z" fill="currentColor" />
            <path d="M32 4 L 32 86" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          </svg>
        </div>
      ))}
    </div>
  );
};

Object.assign(window, { Leaf, Fern, Sprig, Cell, Helix, PlatePlaceholder, BotanicalBg, LeafBurst });
