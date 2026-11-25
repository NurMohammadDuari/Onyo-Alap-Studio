import React from 'react';
import { BANGLADESH_POLICE_RANKS, ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';

export interface InsigniaIllustrationProps {
  rankId: string;
  width?: number;
  height?: number;
  showCardstockSlot?: boolean;
  orderLabelBn?: string;
  highlighted?: boolean;
  drawProgress?: number; // 0..1 for pencil stencil reveal
}

const BENGALI_SVG_FONT = "'Noto Sans Bengali', var(--font-bengali), sans-serif";

function ShaplaIcon({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {/* Drop shadow for 2.5D embossed metallic look */}
      <g transform="translate(1.2, 1.8)" opacity="0.28">
        <path d="M0 -24 C5 -12 5 -4 0 7 C-5 -4 -5 -12 0 -24 Z" fill="#0F172A" />
        <ellipse cx="0" cy="9" rx="14" ry="3.2" fill="#0F172A" />
      </g>
      {/* 7-petal BD Police Shapla insignia */}
      <path d="M0 -24 C4.5 -12 5 -4 0 6 C-5 -4 -4.5 -12 0 -24 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.7" />
      <path d="M0 6 C-8 -2 -14 -12 -13 -20 C-7 -12 -3 -4 0 6 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.7" />
      <path d="M0 6 C8 -2 14 -12 13 -20 C7 -12 3 -4 0 6 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.7" />
      <path d="M0 7 C-12 2 -20 -4 -22 -12 C-14 -7 -6 0 0 7 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.7" />
      <path d="M0 7 C12 2 20 -4 22 -12 C14 -7 6 0 0 7 Z" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.7" />
      <ellipse cx="0" cy="9.5" rx="14.5" ry="3.2" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.7" />
    </g>
  );
}

function FourPointStar({ cx, cy, size = 14 }: { cx: number; cy: number; size?: number }) {
  const s = size;
  const i = size * 0.4;
  return (
    <g>
      {/* Subtle drop shadow */}
      <polygon
        points={`${cx + 1.2},${cy - s + 1.5} ${cx + i + 1.2},${cy - i + 1.5} ${cx + s + 1.2},${cy + 1.5} ${cx + i + 1.2},${cy + i + 1.5} ${cx + 1.2},${cy + s + 1.5} ${cx - i + 1.2},${cy + i + 1.5} ${cx - s + 1.2},${cy + 1.5} ${cx - i + 1.2},${cy - i + 1.5}`}
        fill="rgba(15, 23, 42, 0.35)"
      />
      {/* Faceted 4-quadrant metallic bevel star matching reference t_970 */}
      <polygon points={`${cx},${cy} ${cx},${cy - s} ${cx + i},${cy - i}`} fill="#FFFFFF" />
      <polygon points={`${cx},${cy} ${cx + i},${cy - i} ${cx + s},${cy}`} fill="#E2E8F0" />
      <polygon points={`${cx},${cy} ${cx + s},${cy} ${cx + i},${cy + i}`} fill="#CBD5E1" />
      <polygon points={`${cx},${cy} ${cx + i},${cy + i} ${cx},${cy + s}`} fill="#94A3B8" />
      <polygon points={`${cx},${cy} ${cx},${cy + s} ${cx - i},${cy + i}`} fill="#CBD5E1" />
      <polygon points={`${cx},${cy} ${cx - i},${cy + i} ${cx - s},${cy}`} fill="#E2E8F0" />
      <polygon points={`${cx},${cy} ${cx - s},${cy} ${cx - i},${cy - i}`} fill="#F8FAFC" />
      <polygon points={`${cx},${cy} ${cx - i},${cy - i} ${cx},${cy - s}`} fill="#FFFFFF" />
      <circle cx={cx} cy={cy} r={size * 0.14} fill="#94A3B8" stroke="#FFFFFF" strokeWidth="0.5" />
    </g>
  );
}

function FourPetalFlower({ cx, cy, size = 12 }: { cx: number; cy: number; size?: number }) {
  const r = size * 0.36;
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <rect x={-size * 0.3 + 1} y={-size * 0.85 + 1.5} width={size * 0.6} height={size * 1.7} rx={r} fill="rgba(15,23,42,0.28)" />
      <rect x={-size * 0.85 + 1} y={-size * 0.3 + 1.5} width={size * 1.7} height={size * 0.6} rx={r} fill="rgba(15,23,42,0.28)" />
      <rect x={-size * 0.3} y={-size * 0.85} width={size * 0.6} height={size * 1.7} rx={r} fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.9" />
      <rect x={-size * 0.85} y={-size * 0.3} width={size * 1.7} height={size * 0.6} rx={r} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.9" />
      <circle cx="0" cy="0" r={size * 0.28} fill="#CBD5E1" stroke="#475569" strokeWidth="0.8" />
      <circle cx="0" cy="0" r={size * 0.11} fill="#FFFFFF" />
    </g>
  );
}

function CrossedSwordBaton({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {/* Drop shadow */}
      <g transform="translate(1.5, 2)" opacity="0.3">
        <rect x="-22" y="-3" width="44" height="6" rx="3" fill="#0F172A" transform="rotate(-42)" />
        <rect x="-24" y="-3" width="48" height="6" rx="3" fill="#0F172A" transform="rotate(42)" />
      </g>
      {/* Baton */}
      <g transform="rotate(-42)">
        <rect x="-24" y="-3" width="48" height="6" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="0.9" />
        <rect x="-28" y="-4" width="6" height="8" rx="2" fill="#CBD5E1" stroke="#475569" strokeWidth="0.6" />
        <rect x="22" y="-4" width="6" height="8" rx="2" fill="#CBD5E1" stroke="#475569" strokeWidth="0.6" />
      </g>
      {/* Sword */}
      <g transform="rotate(42)">
        <path d="M -28 0 L 20 -3.5 L 29 0 L 20 3.5 Z" fill="#FFFFFF" stroke="#475569" strokeWidth="0.9" />
        <rect x="-26" y="-8" width="3.5" height="16" rx="1.5" fill="#CBD5E1" stroke="#475569" strokeWidth="0.7" />
        <circle cx="-30" cy="0" r="3" fill="#F8FAFC" stroke="#475569" strokeWidth="0.6" />
      </g>
    </g>
  );
}

export const InsigniaIllustration: React.FC<InsigniaIllustrationProps> = ({
  rankId,
  width = 140,
  height = 220,
  showCardstockSlot = true,
  orderLabelBn,
  highlighted = false,
  drawProgress = 1,
}) => {
  const rank = BANGLADESH_POLICE_RANKS.find((r) => r.id === rankId) ?? BANGLADESH_POLICE_RANKS[0];
  const ins = rank.insignia;
  const labelBn = orderLabelBn ?? rank.orderBn;
  const uid = rank.id.replace(/[^a-zA-Z0-9]/g, '_');

  const strap = (
    <g transform={showCardstockSlot ? 'translate(42, 16)' : 'translate(16, 10)'}>
      {/* Dark recessed slot background when mounted in cardstock */}
      {showCardstockSlot && (
        <>
          <rect x="-4" y="-2" width="84" height="186" rx="3" fill="#0B0B0D" />
          <rect x="-3" y="-1" width="82" height="184" rx="2" fill="none" stroke="#334155" strokeWidth="0.8" />
        </>
      )}

      {/* Cobalt-blue stitched shoulder strap with subtle cloth depth */}
      <path
        d="M 38 4 L 74 30 L 74 176 L 2 176 L 2 30 Z"
        fill={`url(#strapGrad_${uid})`}
        stroke="#93C5FD"
        strokeWidth="1"
      />
      {/* Left rim highlight */}
      <path d="M 38 6 L 4 31 L 4 174" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
      {/* Dashed white fabric stitch lines */}
      <path
        d="M 38 9 L 69 32 L 69 171 L 7 171 L 7 32 Z"
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.88"
      />
      {/* Top metallic snap button with inner bezel */}
      <circle cx="38" cy="24.8" r="9.2" fill="rgba(15,23,42,0.35)" />
      <circle cx="38" cy="24" r="8.8" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
      <circle cx="38" cy="24" r="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.8" />

      {/* Chevrons (Naik) */}
      {ins.chevrons &&
        Array.from({ length: ins.chevrons }).map((_, idx) => {
          const yOff = 68 + idx * 24;
          const chevOpacity = Math.max(0.15, Math.min(1, drawProgress * 1.3 - idx * 0.2));
          return (
            <g key={idx} opacity={chevOpacity}>
              <path
                d={`M 10 ${yOff + 2} L 38 ${yOff + 18} L 66 ${yOff + 2} L 66 ${yOff + 13} L 38 ${yOff + 29} L 10 ${yOff + 13} Z`}
                fill="rgba(15,23,42,0.35)"
              />
              <path
                d={`M 10 ${yOff} L 38 ${yOff + 16} L 66 ${yOff} L 66 ${yOff + 11} L 38 ${yOff + 27} L 10 ${yOff + 11} Z`}
                fill={ins.chevronColor ?? ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent}
                stroke="#FCA5A5"
                strokeWidth="0.7"
              />
            </g>
          );
        })}

      {/* Translucent stencil tracing-paper + yellow pencil overlay during active reveal (matches t_255) */}
      {drawProgress < 0.96 && (
        <g opacity={1 - Math.max(0, (drawProgress - 0.8) * 5)}>
          <rect
            x="4"
            y="62"
            width="68"
            height="42"
            rx="2"
            fill="rgba(255,255,255,0.45)"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1"
          />
          <polyline
            points="14,74 38,90 62,74"
            fill="none"
            stroke="#1F1B18"
            strokeWidth="2.2"
            strokeDasharray="60"
            strokeDashoffset={60 * (1 - drawProgress)}
          />
          <g transform={`translate(${14 + drawProgress * 48}, ${74 + (drawProgress < 0.5 ? drawProgress * 32 : (1 - drawProgress) * 32)}) rotate(-38)`}>
            <rect x="0" y="-4" width="54" height="8" rx="1.5" fill="#FACC15" stroke="#B45309" strokeWidth="0.7" />
            <polygon points="0,-4 -12,0 0,4" fill="#FDE68A" />
            <polygon points="-8,-1.3 -12,0 -8,1.3" fill="#1F1B18" />
            <rect x="54" y="-4" width="7" height="8" rx="1" fill="#F87171" />
          </g>
        </g>
      )}

      {/* 4-Petal Flowers (ASI / SI / Sergeant) */}
      {ins.flowers === 1 && <FourPetalFlower cx={38} cy={104} size={13} />}
      {ins.flowers === 2 && (
        <>
          <FourPetalFlower cx={38} cy={70} size={12.5} />
          <FourPetalFlower cx={38} cy={108} size={12.5} />
        </>
      )}

      {/* Ribbon (Blue or Red) */}
      {ins.ribbonColor && (
        <g>
          <rect x="8" y="133.5" width="60" height="10" rx="1.5" fill="rgba(15,23,42,0.3)" />
          <rect
            x="8"
            y="132"
            width="60"
            height="10"
            rx="1.5"
            fill={ins.ribbonColor === 'red' ? '#DC2626' : '#2563EB'}
            stroke="#FFFFFF"
            strokeWidth="0.8"
          />
          <line x1="8" y1="135" x2="68" y2="135" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        </g>
      )}

      {/* Shapla (Addl SP -> IGP) */}
      {ins.shapla && (
        <ShaplaIcon
          cx={38}
          cy={ins.crossedSwordBaton || ins.stars ? 56 : 92}
          scale={0.88}
        />
      )}

      {/* Crossed Sword & Baton (Addl IGP / IGP) */}
      {ins.crossedSwordBaton && (
        <CrossedSwordBaton cx={38} cy={ins.stars ? 136 : 114} scale={0.86} />
      )}

      {/* 4-Point Diamond Stars */}
      {ins.stars && !ins.shapla && ins.stars === 1 && <FourPointStar cx={38} cy={98} size={15} />}
      {ins.stars && !ins.shapla && ins.stars === 2 && (
        <>
          <FourPointStar cx={38} cy={72} size={13} />
          <FourPointStar cx={38} cy={112} size={13} />
        </>
      )}
      {ins.stars && !ins.shapla && ins.stars === 3 && (
        <>
          <FourPointStar cx={38} cy={58} size={12} />
          <FourPointStar cx={38} cy={92} size={12} />
          <FourPointStar cx={38} cy={126} size={12} />
        </>
      )}
      {ins.stars && ins.shapla && !ins.crossedSwordBaton && ins.stars === 1 && (
        <FourPointStar cx={38} cy={104} size={14} />
      )}
      {ins.stars && ins.shapla && !ins.crossedSwordBaton && ins.stars === 2 && (
        <>
          <FourPointStar cx={38} cy={96} size={12.5} />
          <FourPointStar cx={38} cy={132} size={12.5} />
        </>
      )}
      {ins.stars && ins.shapla && !ins.crossedSwordBaton && ins.stars === 3 && (
        <>
          <FourPointStar cx={38} cy={94} size={12} />
          <FourPointStar cx={22} cy={130} size={12} />
          <FourPointStar cx={54} cy={130} size={12} />
        </>
      )}
      {ins.stars && ins.shapla && ins.crossedSwordBaton && ins.stars === 1 && (
        <FourPointStar cx={38} cy={94} size={12.5} />
      )}

      {/* Bengali "পুলিশ" word at base */}
      {ins.hasPoliceText && (
        <text
          x="38"
          y="164"
          textAnchor="middle"
          fill="#F8FAFC"
          fontSize="14.5"
          fontWeight="700"
          fontFamily={BENGALI_SVG_FONT}
        >
          পুলিশ
        </text>
      )}
    </g>
  );

  const defs = (
    <defs>
      <linearGradient id={`strapGrad_${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#254EDB" />
        <stop offset="55%" stopColor={ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue} />
        <stop offset="100%" stopColor="#0E2270" />
      </linearGradient>
      <linearGradient id={`cardGrad_${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={highlighted ? '#FCF9F0' : '#EAE1CB'} />
        <stop offset="100%" stopColor={highlighted ? '#EFE6CE' : ONYO_ALAP_VISUAL_DNA.palette.cardstockTan} />
      </linearGradient>
    </defs>
  );

  if (!showCardstockSlot) {
    return (
      <svg width={width} height={height} viewBox="0 0 108 198" className="overflow-visible">
        {defs}
        {strap}
      </svg>
    );
  }

  return (
    <svg width={width} height={height} viewBox="0 0 146 222" className="overflow-visible">
      {defs}
      {/* Layered cardstock 2.5D tabletop drop shadow */}
      <rect x="6" y="7" width="136" height="212" rx="4" fill="rgba(15, 23, 42, 0.2)" />
      {/* Cream cardstock slot tile */}
      <rect
        x="2"
        y="2"
        width="136"
        height="212"
        rx="4"
        fill={`url(#cardGrad_${uid})`}
        stroke={highlighted ? ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent : '#8B7B62'}
        strokeWidth={highlighted ? 2.8 : 1.3}
      />
      {/* Subtle cardstock bevel top highlight */}
      <line x1="4" y1="4" x2="136" y2="4" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
      {/* Outer dashed craft stitch frame */}
      <rect
        x="8"
        y="8"
        width="124"
        height="200"
        rx="2"
        fill="none"
        stroke={ONYO_ALAP_VISUAL_DNA.palette.cardstockStitch}
        strokeWidth="1"
        strokeDasharray="5 4"
      />
      {/* Left Bengali rank numeral */}
      <text
        x="22"
        y="118"
        textAnchor="middle"
        fill={ONYO_ALAP_VISUAL_DNA.palette.inkCharcoal}
        fontSize="26"
        fontWeight="700"
        fontFamily={BENGALI_SVG_FONT}
      >
        {labelBn}
      </text>
      {strap}
    </svg>
  );
};
