import React from "react";

/* ---- SUNFLOWER (Подсолнух) ---- */
function Sunflower({ s }) {
  const stemTop = [185, 168, 142, 108, 70, 40][s];
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 185 C52 ${stemTop + 55} 58 ${stemTop + 28} 55 ${stemTop}`}
          stroke="#4a8c30" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
      {s === 1 && (
        <>
          <ellipse cx="44" cy="173" rx="11" ry="7" fill="#7ec850" transform="rotate(-35 44 173)" />
          <ellipse cx="66" cy="173" rx="11" ry="7" fill="#7ec850" transform="rotate(35 66 173)" />
        </>
      )}
      {s >= 2 && (
        <>
          <path d="M54 156 C40 144 20 150 16 162 C28 148 46 148 54 157" fill="#5a9e3c" />
          <path d="M56 156 C70 144 90 150 94 162 C82 148 64 148 56 157" fill="#4a8c2e" />
        </>
      )}
      {s >= 3 && (
        <>
          <path d="M53 118 C36 106 14 114 10 128 C24 110 42 108 53 118" fill="#5a9e3c" />
          <path d="M57 118 C74 106 96 114 100 128 C86 110 68 108 57 118" fill="#4a8c2e" />
        </>
      )}
      {s === 4 && (
        <>
          <ellipse cx="55" cy="55" rx="14" ry="18" fill="#3d7a28" />
          <path d="M44 50 C42 44 46 40 50 42" fill="#326222" />
          <path d="M66 50 C68 44 64 40 60 42" fill="#326222" />
        </>
      )}
      {s >= 5 && (
        <>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
            const px = 55 + 30 * Math.cos(a), py = 44 + 30 * Math.sin(a);
            return (
              <ellipse key={i} cx={px} cy={py} rx="12" ry="5.5"
                fill={i % 2 ? "#FCD34D" : "#F59E0B"}
                transform={`rotate(${(i / 16) * 360} ${px} ${py})`} />
            );
          })}
          <circle cx="55" cy="44" r="20" fill="#78350F" />
          <circle cx="55" cy="44" r="14" fill="#5C250C" />
          {Array.from({ length: 32 }, (_, i) => {
            const a = (i / 32) * Math.PI * 2;
            const r = 4 + (i % 3) * 2.8;
            return <circle key={i} cx={55 + r * Math.cos(a)} cy={44 + r * Math.sin(a)} r="1.2" fill="#3d1505" />;
          })}
        </>
      )}
    </svg>
  );
}

/* ---- ROSE (Роза) ---- */
function Rose({ s }) {
  const stemTop = [185, 162, 135, 105, 72, 52][s];
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 185 C50 ${stemTop + 56} 60 ${stemTop + 28} 55 ${stemTop}`}
          stroke="#2e6e20" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {s >= 2 && (
        <>
          <path d="M52 158 L44 150" stroke="#2e6e20" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M57 148 L65 140" stroke="#2e6e20" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M52 150 C37 140 24 146 24 158 C33 144 46 142 52 152" fill="#3d8b28" />
          <path d="M58 162 C73 152 86 158 86 170 C77 156 64 154 58 164" fill="#348022" />
        </>
      )}
      {s >= 3 && (
        <>
          <path d="M51 120 C33 108 18 116 18 130 C29 113 44 111 51 122" fill="#3d8b28" />
          <path d="M59 128 C77 116 92 124 92 138 C81 121 66 119 59 130" fill="#348022" />
        </>
      )}
      {s === 4 && (
        <g>
          <path d="M55 95 C47 88 43 80 47 74 C49 82 52 88 55 92" fill="#2e6e20" />
          <path d="M55 95 C63 88 67 80 63 74 C61 82 58 88 55 92" fill="#256018" />
          <path d="M55 72 C44 72 38 80 38 90 C38 100 46 108 55 108 C64 108 72 100 72 90 C72 80 66 72 55 72" fill="#dc2626" />
          <path d="M48 74 C44 68 48 62 55 72" fill="#b91c1c" />
          <path d="M62 74 C66 68 62 62 55 72" fill="#b91c1c" />
        </g>
      )}
      {s >= 5 && (
        <g>
          <path d="M42 102 C38 90 43 80 50 78" fill="#16a34a" />
          <path d="M68 102 C72 90 67 80 60 78" fill="#15803d" />
          <path d="M55 108 C36 108 28 95 28 80 C28 68 40 60 55 60 C70 60 82 68 82 80 C82 95 74 108 55 108" fill="#ef4444" />
          <path d="M28 80 C25 68 34 58 40 58 C36 66 34 76 38 84" fill="#dc2626" />
          <path d="M82 80 C85 68 76 58 70 58 C74 66 76 76 72 84" fill="#dc2626" />
          <path d="M55 60 C47 54 44 46 50 42 C50 52 52 58 55 62" fill="#dc2626" />
          <path d="M55 60 C63 54 66 46 60 42 C60 52 58 58 55 62" fill="#dc2626" />
          <path d="M55 104 C40 104 33 93 33 80 C33 68 42 61 55 61 C68 61 77 68 77 80 C77 93 70 104 55 104" fill="#f87171" />
          <ellipse cx="55" cy="80" rx="14" ry="16" fill="#fca5a5" />
          <ellipse cx="55" cy="76" rx="9" ry="11" fill="#fecaca" />
          <ellipse cx="55" cy="72" rx="5" ry="6" fill="#fff1f2" />
        </g>
      )}
    </svg>
  );
}

/* ---- CACTUS (Кактус) ---- */
function Cactus({ s }) {
  const bodyTop = [185, 158, 125, 93, 78, 78][s];
  const bodyH = 185 - bodyTop;
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <>
          <rect x="41" y={bodyTop} width="28" height={bodyH} rx="14" fill="#2e8b38" />
          <rect x="43" y={bodyTop} width="8" height={bodyH} rx="4" fill="#3aa844" opacity="0.45" />
        </>
      )}
      {s >= 2 && [0, 1, 2, 3].map(i => (
        <rect key={i} x="40" y={bodyTop + 16 + i * 18} width="30" height="4.5" rx="2.25" fill="#24782e" opacity="0.45" />
      ))}
      {s >= 3 && Array.from({ length: 8 }, (_, i) => {
        const y = bodyTop + 12 + i * 11;
        return (
          <g key={i}>
            <line x1="41" y1={y} x2="31" y2={y - 6} stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="41" y1={y + 5} x2="30" y2={y + 8} stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="69" y1={y} x2="79" y2={y - 6} stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="69" y1={y + 5} x2="80" y2={y + 8} stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      })}
      {s >= 4 && (
        <>
          <path d="M41 150 Q18 150 18 128 Q18 110 27 106" fill="none" stroke="#2e8b38" strokeWidth="18" strokeLinecap="round" />
          <path d="M41 150 Q18 150 18 128 Q18 110 27 106" fill="none" stroke="#3aa844" strokeWidth="9" strokeLinecap="round" />
          <line x1="18" y1="120" x2="10" y2="114" stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="130" x2="10" y2="134" stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M69 142 Q92 142 92 120 Q92 102 83 98" fill="none" stroke="#2e8b38" strokeWidth="18" strokeLinecap="round" />
          <path d="M69 142 Q92 142 92 120 Q92 102 83 98" fill="none" stroke="#3aa844" strokeWidth="9" strokeLinecap="round" />
          <line x1="92" y1="112" x2="100" y2="106" stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="92" y1="122" x2="101" y2="126" stroke="#c8a832" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {s >= 5 && (
        <>
          {[{ cx: 55, cy: 76, c: "#f472b6" }, { cx: 28, cy: 104, c: "#ec4899" }, { cx: 82, cy: 97, c: "#fb7185" }].map(({ cx, cy, c }, fi) => (
            <g key={fi}>
              {[0, 60, 120, 180, 240, 300].map((a, i) => (
                <ellipse key={i}
                  cx={cx + 10 * Math.cos(a * Math.PI / 180)}
                  cy={cy + 10 * Math.sin(a * Math.PI / 180)}
                  rx="6.5" ry="4" fill={c}
                  transform={`rotate(${a} ${cx + 10 * Math.cos(a * Math.PI / 180)} ${cy + 10 * Math.sin(a * Math.PI / 180)})`}
                />
              ))}
              <circle cx={cx} cy={cy} r="5.5" fill="#fde68a" />
              <circle cx={cx} cy={cy} r="2.5" fill="#f59e0b" />
            </g>
          ))}
        </>
      )}
    </svg>
  );
}

/* ---- FERN (Папоротник) ---- */
function Fern({ s }) {
  const frondCount = [0, 1, 2, 4, 5, 7][s];
  const angles = [-90, -130, -50, -160, -20, -175, -5];
  const fLen = [0, 50, 68, 82, 94, 100][s];

  function Frond({ angle, len, flip }) {
    const rad = angle * Math.PI / 180;
    const ex = 55 + len * Math.cos(rad);
    const ey = 175 + len * Math.sin(rad);
    const mx = 55 + len * 0.5 * Math.cos(rad) + (flip ? 18 : -18) * Math.sin(rad);
    const my = 175 + len * 0.5 * Math.sin(rad) - (flip ? 18 : -18) * Math.cos(rad);
    const leafCount = Math.floor(len / 11);
    return (
      <g>
        <path d={`M55 175 Q${mx} ${my} ${ex} ${ey}`}
          stroke="#3a8c28" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {Array.from({ length: leafCount }, (_, i) => {
          const t = (i + 1) / (leafCount + 1);
          const lx = 55 + len * t * Math.cos(rad);
          const ly = 175 + len * t * Math.sin(rad);
          const perp = (angle + (flip ? 70 : -70)) * Math.PI / 180;
          const size = 12 * Math.sin(Math.PI * t) + 4;
          return (
            <ellipse key={i}
              cx={lx + size * 0.5 * Math.cos(perp)} cy={ly + size * 0.5 * Math.sin(perp)}
              rx={size} ry={size * 0.38}
              fill="#4aae35"
              transform={`rotate(${angle + (flip ? 70 : -70)} ${lx + size * 0.5 * Math.cos(perp)} ${ly + size * 0.5 * Math.sin(perp)})`}
            />
          );
        })}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {angles.slice(0, frondCount).map((angle, i) => (
        <Frond key={i} angle={angle} len={fLen} flip={i % 2 === 0} />
      ))}
    </svg>
  );
}

/* ---- ORCHID (Орхидея) ---- */
function Orchid({ s }) {
  const stemTop = [185, 162, 138, 106, 76, 56][s];
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 185 C52 ${stemTop + 52} 58 ${stemTop + 26} 55 ${stemTop}`}
          stroke="#2e6e20" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {s >= 2 && (
        <>
          <ellipse cx="34" cy="174" rx="24" ry="11" fill="#3d8b28" transform="rotate(-22 34 174)" />
          <ellipse cx="76" cy="174" rx="24" ry="11" fill="#348022" transform="rotate(22 76 174)" />
        </>
      )}
      {s >= 3 && (
        <>
          <ellipse cx="27" cy="156" rx="22" ry="9.5" fill="#4aae35" transform="rotate(-32 27 156)" />
          <ellipse cx="83" cy="153" rx="22" ry="9.5" fill="#3d8b28" transform="rotate(32 83 153)" />
        </>
      )}
      {s === 4 && [0, 1, 2].map(i => (
        <g key={i}>
          <line x1="55" y1={stemTop + i * 16} x2={55 + [0, -10, 10][i]} y2={stemTop + i * 16 - 5}
            stroke="#2e6e20" strokeWidth="1.5" />
          <ellipse cx={55 + [0, -10, 10][i]} cy={stemTop + i * 16 - 5} rx="5" ry="7" fill="#a855f7" />
        </g>
      ))}
      {s >= 5 && [0, 1, 2].map(fi => {
        const cy = 64 + fi * 22;
        const cx = 55 + [0, -10, 10][fi];
        return (
          <g key={fi}>
            {[0, 72, 144, 216, 288].map((a, i) => (
              <ellipse key={i}
                cx={cx + 17 * Math.cos(a * Math.PI / 180)}
                cy={cy + 17 * Math.sin(a * Math.PI / 180)}
                rx={i < 2 ? 11 : 9} ry={i < 2 ? 6.5 : 5.5}
                fill={i === 0 ? "#e879f9" : "#d946ef"}
                transform={`rotate(${a} ${cx + 17 * Math.cos(a * Math.PI / 180)} ${cy + 17 * Math.sin(a * Math.PI / 180)})`}
              />
            ))}
            <ellipse cx={cx} cy={cy + 9} rx="7.5" ry="5" fill="#fde68a" />
            <circle cx={cx} cy={cy} r="4.5" fill="#f0abfc" />
            <circle cx={cx - 2.5} cy={cy + 9} r="1.2" fill="#a21caf" />
            <circle cx={cx + 2.5} cy={cy + 9} r="1.2" fill="#a21caf" />
          </g>
        );
      })}
    </svg>
  );
}

/* ---- TULIP (Тюльпан) ---- */
function Tulip({ s }) {
  const stemTop = [185, 162, 135, 105, 68, 58][s];
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 185 C52 ${stemTop + 56} 58 ${stemTop + 28} 55 ${stemTop}`}
          stroke="#2e7a28" strokeWidth="5" fill="none" strokeLinecap="round" />
      )}
      {s >= 2 && (
        <>
          <path d="M53 164 C43 148 40 128 42 110 C46 130 50 150 56 164" fill="#3a8c2e" />
          <path d="M57 158 C67 142 70 122 68 104 C64 124 60 144 54 158" fill="#2e7a28" />
        </>
      )}
      {s >= 3 && (
        <path d="M52 132 C40 112 38 90 42 76 C46 94 50 116 56 132" fill="#3a8c2e" />
      )}
      {s === 4 && (
        <g>
          <path d="M47 90 C44 80 49 70 55 66 C52 76 50 85 49 92" fill="#2e7a28" />
          <path d="M63 90 C66 80 61 70 55 66 C58 76 60 85 61 92" fill="#256020" />
          <path d="M55 66 C44 68 38 78 38 90 C38 102 46 112 55 114 C64 112 72 102 72 90 C72 78 66 68 55 66" fill="#e53935" />
          <path d="M50 68 C48 76 50 88 54 114" fill="#c62828" opacity="0.3" />
        </g>
      )}
      {s >= 5 && (
        <g>
          <path d="M44 102 C38 90 43 78 55 70" fill="#2e7a28" />
          <path d="M66 102 C72 90 67 78 55 70" fill="#256020" />
          <path d="M55 110 C36 110 28 93 30 76 C34 62 44 56 55 56 C66 56 76 62 80 76 C82 93 74 110 55 110" fill="#ef5350" />
          <path d="M55 106 C39 106 33 91 35 76 C39 64 47 59 55 59 C63 59 71 64 75 76 C77 91 71 106 55 106" fill="#f44336" />
          <path d="M55 56 C55 74 53 92 55 110" stroke="#c62828" strokeWidth="1" fill="none" opacity="0.3" />
          <path d="M30 76 C40 82 50 92 55 110" stroke="#c62828" strokeWidth="1" fill="none" opacity="0.2" />
          <path d="M80 76 C70 82 60 92 55 110" stroke="#c62828" strokeWidth="1" fill="none" opacity="0.2" />
          <ellipse cx="55" cy="86" rx="10" ry="16" fill="#ff8a80" opacity="0.28" />
          {[0, 72, 144, 216, 288].map((a, i) => (
            <g key={i}>
              <line x1="55" y1="78" x2={55 + 7 * Math.cos(a * Math.PI / 180)} y2={78 + 7 * Math.sin(a * Math.PI / 180)}
                stroke="#ffd54f" strokeWidth="1.5" />
              <circle cx={55 + 7 * Math.cos(a * Math.PI / 180)} cy={78 + 7 * Math.sin(a * Math.PI / 180)} r="2" fill="#ffd54f" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/* ---- BAMBOO (Бамбук) ---- */
function Bamboo({ s }) {
  const h1 = [0, 40, 80, 120, 152, 178][s];
  const h2 = Math.round(h1 * 0.84);
  const h3 = Math.round(h1 * 0.72);
  const segH = 20;

  function Stalk({ x, h, w = 10 }) {
    const segs = Math.floor(h / segH);
    return (
      <g>
        <rect x={x - w / 2} y={185 - h} width={w} height={h} rx={w / 2} fill="#5d9e3c" />
        <rect x={x - w / 2 + 1} y={185 - h} width={w / 3} height={h} rx={w / 3} fill="#6db84a" opacity="0.45" />
        {Array.from({ length: segs }, (_, i) => (
          <rect key={i} x={x - w / 2 - 1} y={185 - (i + 1) * segH - 2} width={w + 2} height={5} rx="2.5" fill="#4a8c2e" />
        ))}
      </g>
    );
  }

  function Leaves({ x, y, dir = 1 }) {
    return (
      <g>
        <ellipse cx={x + dir * 20} cy={y - 4} rx="18" ry="4" fill="#6ec848"
          transform={`rotate(${dir * -28} ${x + dir * 20} ${y - 4})`} />
        <ellipse cx={x + dir * 24} cy={y + 8} rx="16" ry="3.5" fill="#5ab03c"
          transform={`rotate(${dir * -16} ${x + dir * 24} ${y + 8})`} />
        <ellipse cx={x + dir * 16} cy={y + 18} rx="14" ry="3" fill="#6ec848"
          transform={`rotate(${dir * -40} ${x + dir * 16} ${y + 18})`} />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && <Stalk x={55} h={h1} />}
      {s >= 2 && <Stalk x={42} h={h2} w={9} />}
      {s >= 4 && <Stalk x={68} h={h3} w={8} />}
      {s >= 2 && h1 > 40 && <Leaves x={55} y={185 - h1 + 16} dir={1} />}
      {s >= 3 && h2 > 30 && <Leaves x={42} y={185 - h2 + 16} dir={-1} />}
      {s >= 3 && h1 > 60 && <Leaves x={55} y={185 - h1 + 52} dir={-1} />}
      {s >= 4 && h1 > 80 && <Leaves x={55} y={185 - h1 + 90} dir={1} />}
      {s >= 4 && h2 > 50 && <Leaves x={42} y={185 - h2 + 50} dir={1} />}
      {s >= 5 && <Leaves x={68} y={185 - h3 + 16} dir={1} />}
      {s >= 5 && h1 > 120 && <Leaves x={55} y={185 - h1 + 126} dir={-1} />}
      {s >= 5 && h2 > 80 && <Leaves x={42} y={185 - h2 + 82} dir={-1} />}
    </svg>
  );
}

/* ---- LAVENDER (Лаванда) ---- */
function Lavender({ s }) {
  const baseY = 184;
  const sLen = [0, 48, 80, 110, 135, 148][s];

  function Spike({ x, len, bloomLen }) {
    const topY = baseY - len;
    const pairs = Math.floor(bloomLen / 9);
    return (
      <g>
        <path d={`M${x} ${baseY} C${x - 1} ${baseY - len * 0.6} ${x + 1} ${baseY - len * 0.8} ${x} ${topY}`}
          stroke="#6b8e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {bloomLen === 0 && (
          <ellipse cx={x} cy={topY} rx="4" ry="11" fill="#7c3aed" />
        )}
        {Array.from({ length: pairs }, (_, i) => {
          const y = topY + i * 9 + 4;
          return (
            <g key={i}>
              <ellipse cx={x - 6} cy={y + 3} rx="5.5" ry="3.5" fill={i < 3 ? "#6d28d9" : "#7c3aed"}
                transform={`rotate(-30 ${x - 6} ${y + 3})`} />
              <ellipse cx={x + 6} cy={y + 3} rx="5.5" ry="3.5" fill={i < 3 ? "#7c3aed" : "#8b5cf6"}
                transform={`rotate(30 ${x + 6} ${y + 3})`} />
            </g>
          );
        })}
      </g>
    );
  }

  function LeafPair({ y }) {
    return (
      <>
        <ellipse cx={48} cy={y} rx="10" ry="3.5" fill="#6a8e40" transform={`rotate(-30 48 ${y})`} />
        <ellipse cx={62} cy={y} rx="10" ry="3.5" fill="#5d7c3a" transform={`rotate(30 62 ${y})`} />
      </>
    );
  }

  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 ${baseY} C53 ${baseY - sLen * 0.6} 57 ${baseY - sLen * 0.8} 55 ${baseY - sLen}`}
          stroke="#6b8e3c" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {s >= 2 && Array.from({ length: Math.max(1, Math.floor(sLen / 22)) }, (_, i) => (
        <LeafPair key={i} y={baseY - 14 - i * 22} />
      ))}
      {s >= 3 && (
        <>
          <path d={`M55 ${baseY - sLen * 0.48} Q40 ${baseY - sLen * 0.7} 36 ${baseY - sLen * 0.9}`}
            stroke="#6b8e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M55 ${baseY - sLen * 0.48} Q70 ${baseY - sLen * 0.7} 74 ${baseY - sLen * 0.9}`}
            stroke="#6b8e3c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {s >= 4 && (
        <Spike x={55} len={sLen} bloomLen={s >= 5 ? sLen * 0.38 : 0} />
      )}
      {s >= 5 && (
        <>
          <Spike x={36} len={sLen * 0.88} bloomLen={sLen * 0.3} />
          <Spike x={74} len={sLen * 0.88} bloomLen={sLen * 0.3} />
        </>
      )}
    </svg>
  );
}

/* ---- SUCCULENT (Суккулент) ---- */
function Succulent({ s }) {
  const cx = 55, cy = 168;
  const layers = [
    [],
    [{ n: 5, r: 10, rx: 8, ry: 14, fill: "#7fc97f" }],
    [{ n: 5, r: 10, rx: 8, ry: 14, fill: "#7fc97f" }, { n: 8, r: 24, rx: 10, ry: 17, fill: "#52b052" }],
    [{ n: 5, r: 9, rx: 8, ry: 14, fill: "#8cd48c" }, { n: 8, r: 24, rx: 10, ry: 17, fill: "#6ec86e" }, { n: 11, r: 38, rx: 10, ry: 18, fill: "#3d9c52" }],
    [{ n: 5, r: 9, rx: 7, ry: 13, fill: "#a0dda0" }, { n: 8, r: 23, rx: 9, ry: 16, fill: "#7fc97f" }, { n: 11, r: 37, rx: 10, ry: 18, fill: "#52b052" }, { n: 13, r: 51, rx: 9, ry: 16, fill: "#3d9c52" }],
    [{ n: 5, r: 8, rx: 7, ry: 12, fill: "#b8e8b8" }, { n: 8, r: 22, rx: 9, ry: 15, fill: "#8cd48c" }, { n: 11, r: 36, rx: 9, ry: 17, fill: "#6ec86e" }, { n: 13, r: 50, rx: 8, ry: 15, fill: "#52b052" }, { n: 15, r: 64, rx: 8, ry: 14, fill: "#3d9c52" }],
  ][s];

  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {layers.map((layer, li) =>
        Array.from({ length: layer.n }, (_, i) => {
          const a = (i / layer.n) * Math.PI * 2 - Math.PI / 2;
          const lx = cx + layer.r * Math.cos(a);
          const ly = cy + layer.r * 0.45 * Math.sin(a);
          return (
            <ellipse key={`${li}-${i}`}
              cx={lx} cy={ly} rx={layer.rx} ry={layer.ry}
              fill={layer.fill} stroke="#2e7a28" strokeWidth="0.4"
              transform={`rotate(${a * 180 / Math.PI + 90} ${lx} ${ly})`}
            />
          );
        })
      )}
      {s >= 1 && <circle cx={cx} cy={cy} r={4 + s * 2} fill="#d4f0d4" />}
      {s >= 5 && (
        <g>
          <line x1={cx} y1={cy - 4} x2={cx} y2={cy - 30} stroke="#5a9e3c" strokeWidth="2.5" />
          {[0, 72, 144, 216, 288].map((a, i) => (
            <ellipse key={i}
              cx={cx + 13 * Math.cos(a * Math.PI / 180)}
              cy={cy - 30 + 13 * Math.sin(a * Math.PI / 180)}
              rx="7" ry="4" fill="#fcd34d"
              transform={`rotate(${a} ${cx + 13 * Math.cos(a * Math.PI / 180)} ${cy - 30 + 13 * Math.sin(a * Math.PI / 180)})`}
            />
          ))}
          <circle cx={cx} cy={cy - 30} r="5.5" fill="#f59e0b" />
        </g>
      )}
    </svg>
  );
}

/* ---- CHAMOMILE (Ромашка) ---- */
function Chamomile({ s }) {
  const stemTop = [185, 165, 138, 108, 68, 56][s];
  return (
    <svg viewBox="0 0 110 200" width="110" height="200" overflow="visible">
      {s >= 1 && (
        <path d={`M55 185 C52 ${stemTop + 55} 58 ${stemTop + 28} 55 ${stemTop}`}
          stroke="#4a8c30" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
      {s >= 2 && (
        <>
          <path d="M53 160 C40 148 28 152 26 164 C36 150 48 150 53 160" fill="#5aa838" />
          <path d="M57 150 C70 138 82 142 84 154 C74 140 62 140 57 150" fill="#4a9830" />
        </>
      )}
      {s >= 3 && (
        <>
          <path d="M52 124 C36 110 22 116 20 130 C32 114 46 112 52 124" fill="#5aa838" />
          <path d="M58 132 C74 118 88 124 90 138 C78 122 64 120 58 132" fill="#4a9830" />
        </>
      )}
      {s === 4 && (
        <g>
          <path d="M46 74 C42 66 46 58 55 55" fill="#5aa838" />
          <path d="M64 74 C68 66 64 58 55 55" fill="#4a9830" />
          <circle cx="55" cy="64" r="14" fill="#fbbf24" />
          <circle cx="55" cy="64" r="9" fill="#f59e0b" />
        </g>
      )}
      {s >= 5 && (
        <>
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2 - Math.PI / 2;
            const px = 55 + 28 * Math.cos(a);
            const py = 57 + 28 * Math.sin(a);
            return (
              <ellipse key={i} cx={px} cy={py} rx="10" ry="4.5"
                fill={i % 2 ? "#ffffff" : "#f1f5f9"}
                stroke="#e2e8f0" strokeWidth="0.5"
                transform={`rotate(${(i / 18) * 360} ${px} ${py})`} />
            );
          })}
          <circle cx="55" cy="57" r="18" fill="#fbbf24" />
          <circle cx="55" cy="57" r="12" fill="#f59e0b" />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r = 5 + (i % 3) * 3;
            return <circle key={i} cx={55 + r * Math.cos(a)} cy={57 + r * Math.sin(a)} r="1.5" fill="#d97706" />;
          })}
        </>
      )}
    </svg>
  );
}

const PLANT_COMPONENTS = {
  sunflower: Sunflower,
  rose: Rose,
  cactus: Cactus,
  fern: Fern,
  orchid: Orchid,
  tulip: Tulip,
  bamboo: Bamboo,
  lavender: Lavender,
  succulent: Succulent,
  chamomile: Chamomile,
};

export default function PlantSVG({ plantType, stage }) {
  const Plant = PLANT_COMPONENTS[plantType] || Sunflower;
  return <Plant s={Math.min(Math.max(stage, 0), 5)} />;
}
