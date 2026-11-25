import React from 'react';
import { BANGLADESH_POLICE_RANKS, ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';
import { InsigniaIllustration } from './InsigniaIllustration';

const BENGALI_SVG_FONT = "'Noto Sans Bengali', var(--font-bengali), sans-serif";

export const SceneBackground: React.FC<{
  style?: string;
  primaryHex?: string;
  secondaryHex?: string;
  paperTexture?: boolean;
}> = ({
  style = 'thana_daylight',
  primaryHex = ONYO_ALAP_VISUAL_DNA.palette.skyPaperBlue,
  secondaryHex = ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow,
  paperTexture = true,
}) => {
  const safeStyle = style.replace(/[^a-zA-Z0-9_-]/g, '_');
  return (
    <g>
      <defs>
        <linearGradient id={`bg_${safeStyle}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primaryHex} />
          <stop offset="100%" stopColor={secondaryHex} />
        </linearGradient>
        <pattern id={`paperFibers_${safeStyle}`} width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 5 10 L 16 14 M 28 6 L 38 12 M 12 33 L 22 28 M 34 39 L 44 34"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="0.8"
          />
          <path
            d="M 18 18 L 24 23 M 4 40 L 10 44"
            stroke="rgba(123,107,85,0.08)"
            strokeWidth="0.7"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="1280" height="720" fill={`url(#bg_${safeStyle})`} />
      {paperTexture && <rect x="0" y="0" width="1280" height="720" fill={`url(#paperFibers_${safeStyle})`} />}
    </g>
  );
};

export const BuildingIllustration: React.FC<{
  kind?: 'thana_exterior' | 'office_interior' | 'classroom';
}> = ({ kind = 'thana_exterior' }) => {
  if (kind === 'office_interior') {
    return (
      <g>
        {/* Warm textured cardstock wall & wooden floor */}
        <rect x="0" y="0" width="1280" height="445" fill="#E6DFC8" />
        <rect x="0" y="340" width="1280" height="105" fill="#7D4A1E" />
        <rect x="0" y="334" width="1280" height="8" fill="#5C3412" />
        <rect x="0" y="445" width="1280" height="275" fill="#D4C7A8" />
        {/* Fine diagonal craft wall fibers */}
        <g opacity="0.22" stroke="#8C7B65" strokeWidth="0.9">
          {[80, 260, 520, 740, 1080].map((fx, i) => (
            <path key={fx} d={`M ${fx} ${45 + i * 24} L ${fx + 22} ${62 + i * 24} M ${fx + 40} ${120 + i * 18} L ${fx + 56} ${105 + i * 18}`} />
          ))}
        </g>

        {/* Barred office window with atmospheric silhouette */}
        <g transform="translate(185, 84)">
          <rect x="-8" y="-8" width="256" height="236" fill="rgba(15,23,42,0.12)" />
          <rect x="0" y="0" width="240" height="220" fill="#B8D2DD" stroke="#FFFFFF" strokeWidth="8" />
          {/* Soft silhouette behind window glass */}
          <ellipse cx="118" cy="128" rx="22" ry="26" fill="rgba(30,41,59,0.22)" />
          <rect x="92" y="154" width="52" height="66" rx="14" fill="rgba(30,41,59,0.22)" />
          {[48, 96, 144, 192].map((vx) => (
            <line key={vx} x1={vx} y1="0" x2={vx} y2="220" stroke="#1F1B18" strokeWidth="4" />
          ))}
          <line x1="0" y1="110" x2="240" y2="110" stroke="#1F1B18" strokeWidth="4" />
        </g>

        {/* Bookshelf on right matching t_540 */}
        <g transform="translate(820, 118)">
          <rect x="6" y="8" width="260" height="328" fill="rgba(15,23,42,0.16)" />
          <rect x="0" y="0" width="260" height="328" fill="#2A464C" stroke="#537A7B" strokeWidth="6" />
          {[76, 156, 236].map((sy) => (
            <rect key={sy} x="6" y={sy} width="248" height="8" fill="#537A7B" />
          ))}
          {[18, 52, 86, 126, 166, 204, 228].map((bx, i) => (
            <rect
              key={bx}
              x={bx}
              y={18 + (i % 3) * 6}
              width="22"
              height={55 - (i % 3) * 6}
              fill={i % 3 === 0 ? '#9E6E24' : i % 3 === 1 ? '#1E44B8' : '#EFE8D5'}
              stroke="#475569"
              strokeWidth="0.9"
            />
          ))}
          {[22, 66, 118, 174, 212].map((bx, i) => (
            <rect
              key={`r2_${bx}`}
              x={bx}
              y={96 + (i % 2) * 8}
              width="28"
              height={56 - (i % 2) * 8}
              fill={i % 2 === 0 ? '#16339B' : '#FAF6EB'}
              stroke="#475569"
              strokeWidth="0.9"
            />
          ))}
        </g>

        {/* Foreground officer desk & warm lamp glow */}
        <g transform="translate(80, 490)">
          <rect x="0" y="0" width="660" height="190" fill="#5A2E0E" stroke="#3E1E07" strokeWidth="3" />
          <rect x="18" y="-12" width="624" height="16" fill="#7A461C" />
          {/* Warm desk lamp */}
          <g transform="translate(110, -76)">
            <ellipse cx="0" cy="48" rx="75" ry="24" fill="rgba(253, 224, 71, 0.25)" />
            <rect x="-3" y="20" width="6" height="44" fill="#D4A843" />
            <ellipse cx="0" cy="64" rx="18" ry="4.5" fill="#F8FAFC" />
            <polygon points="-24,24 24,24 12,-4 -12,-4" fill="#FAF6EB" stroke="#E5C07B" strokeWidth="1.5" />
          </g>
        </g>
      </g>
    );
  }

  if (kind === 'classroom') {
    return (
      <g>
        <rect x="0" y="0" width="1280" height="440" fill="#E6DFC8" />
        <rect x="0" y="360" width="1280" height="80" fill="#4B745D" />
        <rect x="0" y="440" width="1280" height="280" fill="#DFC39B" />
        {/* Wooden wainscot rail */}
        <rect x="0" y="354" width="1280" height="8" fill="#7A461C" />
        {/* Green chalkboard with drop shadow & chalk tray */}
        <g transform="translate(320, 48)">
          <rect x="8" y="10" width="640" height="214" fill="rgba(15,23,42,0.18)" />
          <rect x="0" y="0" width="640" height="214" fill={ONYO_ALAP_VISUAL_DNA.palette.chalkboardGreen} stroke="#7A461C" strokeWidth="10" />
          <rect x="-8" y="212" width="656" height="12" rx="2" fill="#925D19" />
          <rect x="80" y="206" width="28" height="6" fill="#F8FAFC" />
          <rect x="122" y="206" width="20" height="6" fill="#FDE68A" />
          <text
            x="320"
            y="134"
            textAnchor="middle"
            fill="#F8FAFC"
            fontSize="66"
            fontWeight="700"
            fontFamily={BENGALI_SVG_FONT}
          >
            বিসিএস
          </text>
        </g>
      </g>
    );
  }

  // Default: Authentic Colonial 3-arch Thana exterior diorama (modeled directly after t_2.png)
  return (
    <g>
      {/* Distant rolling paper hills */}
      <path d="M 0 432 Q 160 388 360 426 Q 640 380 940 422 Q 1120 392 1280 430 L 1280 480 L 0 480 Z" fill="#9ECA95" />
      {/* Ground courtyard & tiled verandah apron */}
      <rect x="0" y="468" width="1280" height="252" fill="#D8BA85" />
      <polygon points="105,498 1175,498 1225,552 55,552" fill="#F4EFE2" stroke="#D6CCB2" strokeWidth="1.5" />
      <rect x="0" y="562" width="1280" height="64" fill="#9A8E80" />
      {/* Foreground soft-focus ivory parapet rail at frame bottom */}
      <rect x="0" y="638" width="1280" height="82" fill="#F3EFE4" />
      <rect x="0" y="630" width="1280" height="12" fill="#E5DEC9" />

      {/* Krishnachura tree on left with layered blossom canopy */}
      <g transform="translate(95, 108)">
        <rect x="-15" y="155" width="32" height="215" fill="#5D320E" />
        <path d="M -15 245 L -34 195 M 14 210 L 36 168" stroke="#5D320E" strokeWidth="9" strokeLinecap="round" />
        <circle cx="-12" cy="112" r="80" fill="#3B8E26" />
        <circle cx="48" cy="122" r="66" fill="#2F7A1C" />
        <circle cx="14" cy="76" r="56" fill="#4BA132" />
        {[
          [-38, 86],
          [10, 68],
          [44, 112],
          [-22, 142],
          [26, 148],
          [-6, 104],
        ].map(([cx, cy], idx) => (
          <g key={idx} transform={`translate(${cx}, ${cy})`}>
            <circle cx="0" cy="0" r="10.5" fill="#E0241A" />
            <circle cx="4" cy="-3" r="5.5" fill="#F97316" opacity="0.85" />
            <circle cx="0" cy="0" r="2.2" fill="#FDE047" />
          </g>
        ))}
      </g>

      {/* Main Colonial 3-Arch Thana Building */}
      <g transform="translate(175, 52)">
        {/* Roof parapet balustrade */}
        <rect x="0" y="0" width="930" height="52" fill={ONYO_ALAP_VISUAL_DNA.palette.thanaColumnIvory} />
        <rect x="0" y="46" width="930" height="8" fill="#D5CCB6" />
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={14 + i * 38} y="10" width="18" height="26" fill="#A9CDD6" />
        ))}

        {/* Stucco wall */}
        <rect x="32" y="54" width="866" height="363" fill={ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow} />
        {/* Under-roof shadow */}
        <rect x="32" y="54" width="866" height="22" fill="rgba(120, 90, 35, 0.16)" />

        {/* Brick masonry plinth course */}
        <rect x="32" y="376" width="866" height="42" fill="#B5B2A8" />
        <line x1="32" y1="390" x2="898" y2="390" stroke="#9C988E" strokeWidth="1.2" />
        <line x1="32" y1="404" x2="898" y2="404" stroke="#9C988E" strokeWidth="1.2" />

        {/* Recessed green double doors */}
        <rect x="415" y="176" width="100" height="232" fill="#0B8F45" stroke="#F8FAFC" strokeWidth="5" />
        <line x1="465" y1="176" x2="465" y2="408" stroke="#F8FAFC" strokeWidth="3" />
        <circle cx="456" cy="296" r="3" fill="#FACC15" />
        <circle cx="474" cy="296" r="3" fill="#FACC15" />
        {/* Light fixture above door */}
        <circle cx="465" cy="146" r="7" fill="#FAF6EB" />
        <rect x="460" y="156" width="10" height="7" fill="#1F1B18" />

        {/* Wooden verandah bench left & notice board + small table right */}
        <g transform="translate(88, 344)">
          <rect x="0" y="0" width="112" height="24" fill="#925D19" stroke="#5D320E" strokeWidth="2" />
          <rect x="0" y="24" width="112" height="8" fill="#5D320E" />
          <rect x="8" y="32" width="10" height="22" fill="#5D320E" />
          <rect x="94" y="32" width="10" height="22" fill="#5D320E" />
        </g>
        <g transform="translate(558, 314)">
          <rect x="0" y="0" width="66" height="7" fill="#925D19" />
          <rect x="6" y="7" width="6" height="76" fill="#7A461C" />
          <rect x="54" y="7" width="6" height="76" fill="#7A461C" />
        </g>

        {/* Notice board */}
        <rect x="315" y="218" width="76" height="84" fill="#C48332" stroke="#925D19" strokeWidth="4" />
        <rect x="326" y="228" width="22" height="28" fill="#F8FAFC" />
        <circle cx="337" cy="231" r="2" fill="#D81919" />
        <rect x="356" y="232" width="22" height="28" fill="#F8FAFC" />
        <circle cx="367" cy="235" r="2" fill="#D81919" />

        {/* Shuttered Barred Windows + louvred transoms */}
        {[125, 245, 600, 725].map((wx) => (
          <g key={wx} transform={`translate(${wx}, 188)`}>
            {/* Transom louver above window */}
            <rect x="26" y="-28" width="42" height="16" fill="#1F1B18" stroke="#F8FAFC" strokeWidth="2" />
            <line x1="28" y1="-22" x2="66" y2="-22" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="28" y1="-17" x2="66" y2="-17" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="0" y="0" width="90" height="145" fill="#171412" stroke="#F8FAFC" strokeWidth="4" />
            {[18, 36, 54, 72].map((bx) => (
              <line key={bx} x1={bx} y1="0" x2={bx} y2="145" stroke="#E2E8F0" strokeWidth="3" />
            ))}
            <rect x="-22" y="4" width="22" height="138" fill={ONYO_ALAP_VISUAL_DNA.palette.shutterEmerald} />
            <rect x="90" y="4" width="22" height="138" fill={ONYO_ALAP_VISUAL_DNA.palette.shutterEmerald} />
          </g>
        ))}

        {/* Semicircular Colonial Archways connecting columns */}
        {[
          [40, 300],
          [328, 605],
          [633, 892],
        ].map(([ax1, ax2], idx) => {
          const mid = (ax1 + ax2) / 2;
          return (
            <path
              key={idx}
              d={`M ${ax1} 54 L ${ax2} 54 L ${ax2} 112 Q ${mid} 56 ${ax1} 112 Z`}
              fill={ONYO_ALAP_VISUAL_DNA.palette.thanaColumnIvory}
              stroke="#C9BEA2"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Arched Verandah Columns */}
        {[12, 300, 605, 892].map((cx) => (
          <g key={cx}>
            <rect x={cx + 4} y="54" width="28" height="365" fill="rgba(15,23,42,0.12)" />
            <rect x={cx} y="52" width="28" height="365" fill={ONYO_ALAP_VISUAL_DNA.palette.thanaColumnIvory} />
            <rect x={cx - 4} y="52" width="36" height="12" fill="#DED5BD" />
            <rect x={cx} y="370" width="28" height="47" fill="#7D7A74" />
          </g>
        ))}
        {/* Concrete verandah plinth */}
        <rect x="12" y="417" width="906" height="45" fill="#8C8984" />
        <rect x="330" y="417" width="270" height="45" fill="#9A968F" />
      </g>
    </g>
  );
};

export const HangingSignPlacard: React.FC<{
  title: string;
  year?: string;
  x?: number;
  y?: number;
  swayDeg?: number;
}> = ({ title, year, x = 680, y = 40, swayDeg = 0 }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Brass horizontal rod with end finials */}
    <rect x="-126" y="0" width="252" height="7" rx="3.5" fill="#D4A843" stroke="#926A1B" strokeWidth="1" />
    <circle cx="-126" cy="3.5" r="5" fill="#FDE68A" stroke="#926A1B" strokeWidth="1" />
    <circle cx="126" cy="3.5" r="5" fill="#FDE68A" stroke="#926A1B" strokeWidth="1" />
    <g transform={`translate(0, 7) rotate(${swayDeg})`}>
      {/* Red hanging strings */}
      <line x1="-45" y1="0" x2="-45" y2="28" stroke="#D81919" strokeWidth="2.5" />
      <line x1="45" y1="0" x2="45" y2="28" stroke="#D81919" strokeWidth="2.5" />
      {/* Card drop shadow */}
      <rect x="-90" y="33" width="190" height={year ? 128 : 64} rx="10" fill="rgba(15,23,42,0.22)" />
      {/* Navy top header box */}
      <rect x="-95" y="28" width="190" height="62" rx="10" fill={ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue} stroke="#F8FAFC" strokeWidth="2" />
      <text
        x="0"
        y="68"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="30"
        fontWeight="700"
        fontFamily={BENGALI_SVG_FONT}
      >
        {title}
      </text>
      {year && (
        <>
          <rect x="-95" y="90" width="190" height="66" rx="10" fill={ONYO_ALAP_VISUAL_DNA.palette.cardstockCream} stroke="#94A3B8" strokeWidth="1.5" />
          <text
            x="0"
            y="134"
            textAnchor="middle"
            fill={ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent}
            fontSize="34"
            fontWeight="700"
            fontFamily={BENGALI_SVG_FONT}
          >
            {year}
          </text>
        </>
      )}
    </g>
  </g>
);

export const RankTowerLadder: React.FC<{
  rankIds: string[];
  highlightRankId?: string;
  orientation?: 'vertical' | 'horizontal';
  showPencilPointer?: boolean;
  pencilOffset?: number;
}> = ({
  rankIds,
  highlightRankId,
  orientation = 'horizontal',
  showPencilPointer = true,
  pencilOffset = 0,
}) => {
  const list = rankIds.length > 0 ? rankIds : BANGLADESH_POLICE_RANKS.slice(0, 6).map((r) => r.id);
  const highlightedRank = BANGLADESH_POLICE_RANKS.find((r) => r.id === highlightRankId);

  if (orientation === 'vertical') {
    return (
      <g transform="translate(450, 44)">
        {/* Vertical rail guide matching t_1100 */}
        <rect x="208" y="0" width="14" height="640" rx="4" fill="#F8FAFC" stroke="#16339B" strokeWidth="2.5" />
        {highlightedRank && (
          <g transform="translate(248, 36)">
            <rect x="3" y="4" width="290" height="62" rx="6" fill="rgba(15,23,42,0.18)" />
            <rect x="0" y="0" width="290" height="62" rx="6" fill="#F8FAFC" stroke="#1E3A8A" strokeWidth="2" />
            <text
              x="145"
              y="40"
              textAnchor="middle"
              fill="#1F1B18"
              fontSize="26"
              fontWeight="700"
              fontFamily={BENGALI_SVG_FONT}
            >
              {highlightedRank.nameBn}
            </text>
          </g>
        )}
        {list.slice(0, 3).map((rid, idx) => (
          <g key={rid} transform={`translate(0, ${idx * 212})`}>
            <InsigniaIllustration
              rankId={rid}
              width={146}
              height={210}
              showCardstockSlot
              highlighted={rid === highlightRankId}
            />
          </g>
        ))}
        {showPencilPointer && (
          <g transform={`translate(242, ${120 + pencilOffset}) rotate(-32)`}>
            <rect x="0" y="-7" width="190" height="14" rx="2" fill={ONYO_ALAP_VISUAL_DNA.palette.pencilYellow} stroke="#B45309" strokeWidth="1" />
            <polygon points="0,-7 -24,0 0,7" fill="#FDE68A" />
            <polygon points="-16,-2.3 -24,0 -16,2.3" fill="#1F1B18" />
            <rect x="190" y="-7" width="16" height="14" rx="2" fill="#F87171" />
          </g>
        )}
      </g>
    );
  }

  return (
    <g transform="translate(48, 200)">
      {/* Craft tabletop strip matching t_1210 */}
      <rect x="-48" y="-32" width="1280" height="4" fill="#1E44B8" />
      <rect x="-48" y="-28" width="1280" height="290" fill="#E5D7AE" />
      <rect x="-48" y="262" width="1280" height="260" fill="#F6F3EA" />
      {list.slice(0, 6).map((rid, idx) => (
        <g key={rid} transform={`translate(${idx * 196}, 0)`}>
          <InsigniaIllustration
            rankId={rid}
            width={182}
            height={250}
            showCardstockSlot
            highlighted={rid === highlightRankId}
          />
        </g>
      ))}
    </g>
  );
};

export const ObjectIllustration: React.FC<{
  kind: 'police_jeep' | 'office_desk' | 'open_ledger' | 'counter_machine' | 'cutting_mat' | string;
  x?: number;
  y?: number;
  scale?: number;
  label?: string;
  counterValue?: string;
}> = ({ kind, x = 0, y = 0, scale = 1, label, counterValue }) => {
  if (kind === 'police_jeep') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        <ellipse cx="140" cy="117" rx="138" ry="12" fill="rgba(15,23,42,0.28)" />
        {/* Roof red/blue police lightbar */}
        <rect x="136" y="4" width="26" height="10" rx="2.5" fill="#DC2626" stroke="#F8FAFC" strokeWidth="1" />
        <rect x="162" y="4" width="26" height="10" rx="2.5" fill="#2563EB" stroke="#F8FAFC" strokeWidth="1" />
        {/* Main patrol jeep chassis with white cutout rim */}
        <path
          d="M 10 55 L 70 50 L 95 14 L 240 14 L 255 55 L 270 55 L 270 96 L 10 96 Z"
          fill="#1E3A8A"
          stroke="#F8FAFC"
          strokeWidth="2.2"
        />
        <rect x="10" y="66" width="260" height="14" fill="#FFFFFF" />
        <text x="142" y="77" textAnchor="middle" fill="#1E3A8A" fontSize="11" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
          বাংলাদেশ পুলিশ
        </text>
        {/* Cab windows */}
        <rect x="105" y="22" width="52" height="32" rx="3" fill="#BFDBFE" stroke="#F8FAFC" strokeWidth="1.2" />
        <rect x="168" y="22" width="64" height="32" rx="3" fill="#BFDBFE" stroke="#F8FAFC" strokeWidth="1.2" />
        {/* Headlight & bumper */}
        <rect x="4" y="60" width="8" height="12" rx="2" fill="#FEF08A" />
        <rect x="4" y="88" width="14" height="8" rx="2" fill="#CBD5E1" />
        {/* Wheels */}
        <circle cx="68" cy="96" r="24" fill="#1F1B18" stroke="#94A3B8" strokeWidth="4" />
        <circle cx="68" cy="96" r="9" fill="#CBD5E1" />
        <circle cx="215" cy="96" r="24" fill="#1F1B18" stroke="#94A3B8" strokeWidth="4" />
        <circle cx="215" cy="96" r="9" fill="#CBD5E1" />
      </g>
    );
  }

  if (kind === 'open_ledger') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        <rect x="-234" y="16" width="480" height="220" rx="6" fill="rgba(15,23,42,0.22)" />
        <rect x="-240" y="10" width="480" height="220" rx="6" fill="#7A461C" />
        {/* Red book cover & cream pages */}
        <rect x="-210" y="-40" width="420" height="210" rx="4" fill="#991B1B" />
        <rect x="-196" y="-52" width="184" height="196" fill="#FAF6E8" stroke="#D6CCB2" strokeWidth="2" />
        <rect x="12" y="-52" width="184" height="196" fill="#FAF6E8" stroke="#D6CCB2" strokeWidth="2" />
        <rect x="-12" y="-56" width="24" height="206" fill="#B91C1C" />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <line x1="-175" y1={-25 + i * 20} x2="-35" y2={-25 + i * 20} stroke="#94A3B8" strokeWidth="2" strokeDasharray="18 6" />
            <line x1="35" y1={-25 + i * 20} x2="175" y2={-25 + i * 20} stroke="#94A3B8" strokeWidth="2" strokeDasharray="24 6" />
          </g>
        ))}
      </g>
    );
  }

  if (kind === 'counter_machine') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        {/* Cardstock dispenser box */}
        <rect x="-215" y="-115" width="440" height="84" rx="6" fill="rgba(15,23,42,0.16)" />
        <rect x="-220" y="-120" width="440" height="84" rx="6" fill="#F4EFE2" stroke="#7B6B55" strokeWidth="2" />
        <text
          x="0"
          y="-66"
          textAnchor="middle"
          fill="#1F1B18"
          fontSize="36"
          fontWeight="700"
          fontFamily={BENGALI_SVG_FONT}
        >
          {label ?? 'শিক্ষানবিশ ২ বছর'}
        </text>
        <rect x="-185" y="-36" width="370" height="240" fill="#DFC9A4" />
        <rect x="-135" y="-18" width="270" height="12" fill="#1F1B18" />
        {/* Cascading grid sheets */}
        {[0, 32, 68].map((dy, idx) => (
          <g key={idx} transform={`translate(${(idx - 1) * 8}, ${dy})`}>
            <rect x="-120" y="0" width="240" height="90" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.2" />
            {[30, 60].map((gy) => (
              <line key={gy} x1="-120" y1={gy} x2="120" y2={gy} stroke="#CBD5E1" strokeWidth="1" />
            ))}
            {[-60, 0, 60].map((gx) => (
              <line key={gx} x1={gx} y1="0" x2={gx} y2="90" stroke="#CBD5E1" strokeWidth="1" />
            ))}
          </g>
        ))}
        {/* Dial counter on right */}
        <g transform="translate(310, 40)">
          <rect x="-90" y="-135" width="190" height="270" rx="6" fill="rgba(15,23,42,0.16)" />
          <rect x="-95" y="-140" width="190" height="270" rx="6" fill="#EFE8D5" stroke="#7B6B55" strokeWidth="1.5" strokeDasharray="5 4" />
          <circle cx="0" cy="-20" r="72" fill="#F8FAFC" stroke="#D81919" strokeWidth="2.5" />
          <polygon points="0,-95 -10,-112 10,-112" fill="#D81919" />
          <text x="0" y="-10" textAnchor="middle" fill="#1F1B18" fontSize="34" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
            {counterValue ?? '২'}
          </text>
          <text x="0" y="100" textAnchor="middle" fill="#1F1B18" fontSize="22" fontWeight="600" fontFamily={BENGALI_SVG_FONT}>
            চাকরির বছর
          </text>
        </g>
      </g>
    );
  }

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x="-160" y="0" width="320" height="22" fill="#7A461C" />
      <rect x="-145" y="22" width="18" height="125" fill="#5B3212" />
      <rect x="127" y="22" width="18" height="125" fill="#5B3212" />
      <rect x="-70" y="-68" width="140" height="68" fill="#FAF6E8" stroke="#C49A52" strokeWidth="6" />
      {label && (
        <text x="0" y="-28" textAnchor="middle" fill="#1F1B18" fontSize="20" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
          {label}
        </text>
      )}
    </g>
  );
};

export const MapIllustration: React.FC<{
  activeRegion?: string;
  regions?: Array<{ label: string; sub?: string }>;
}> = ({ activeRegion, regions }) => {
  const defaultRegions = regions ?? [
    { label: 'ঢাকা রেঞ্জ', sub: 'Range 01' },
    { label: 'চট্টগ্রাম রেঞ্জ', sub: 'Range 02' },
    { label: 'রাজশাহী রেঞ্জ', sub: 'Range 03' },
    { label: 'খুলনা রেঞ্জ', sub: 'Range 04' },
    { label: 'সিলেট রেঞ্জ', sub: 'Range 05' },
    { label: 'বরিশাল রেঞ্জ', sub: 'Range 06' },
    { label: 'রংপুর রেঞ্জ', sub: 'Range 07' },
    { label: 'ময়মনসিংহ রেঞ্জ', sub: 'Range 08' },
  ];

  return (
    <g transform="translate(180, 90)">
      {/* Stylized paper-cutout Bangladesh silhouette with drop shadow */}
      <path
        d="M 166 26 L 246 46 L 296 106 L 346 136 L 316 216 L 371 301 L 356 426 L 311 451 L 291 341 L 246 371 L 191 401 L 136 381 L 116 281 L 76 216 L 111 126 L 131 46 Z"
        fill="rgba(15,23,42,0.18)"
      />
      <path
        d="M 160 20 L 240 40 L 290 100 L 340 130 L 310 210 L 365 295 L 350 420 L 305 445 L 285 335 L 240 365 L 185 395 L 130 375 L 110 275 L 70 210 L 105 120 L 125 40 Z"
        fill="#A7D7B8"
        stroke="#0B6B3A"
        strokeWidth="4"
      />
      {defaultRegions.slice(0, 8).map((reg, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const rx = 460 + col * 240;
        const ry = 40 + row * 105;
        const isActive = activeRegion === reg.label;
        return (
          <g key={reg.label} transform={`translate(${rx}, ${ry})`}>
            <rect x="4" y="5" width="215" height="80" rx="6" fill="rgba(15,23,42,0.14)" />
            <rect
              x="0"
              y="0"
              width="215"
              height="80"
              rx="6"
              fill={isActive ? '#16339B' : '#FAF6EB'}
              stroke={isActive ? '#D81919' : '#7B6B55'}
              strokeWidth="2"
              strokeDasharray={isActive ? undefined : '5 3'}
            />
            <text
              x="18"
              y="36"
              fill={isActive ? '#FFFFFF' : '#1F1B18'}
              fontSize="20"
              fontWeight="700"
              fontFamily={BENGALI_SVG_FONT}
            >
              {reg.label}
            </text>
            {reg.sub && (
              <text x="18" y="60" fill={isActive ? '#CBD5E1' : '#64748B'} fontSize="13">
                {reg.sub}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const OnyoAlapLogoBumper: React.FC<{ progress?: number }> = ({ progress = 1 }) => {
  const scale = 0.88 + 0.12 * Math.min(1, progress * 1.4);
  return (
    <g>
      <defs>
        <radialGradient id="cobaltGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid} />
          <stop offset="100%" stopColor={ONYO_ALAP_VISUAL_DNA.palette.royalCobaltDeep} />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1280" height="720" fill="url(#cobaltGlow)" />
      {/* Subtle floating dust motes & organic fiber specks matching t_60 */}
      {[
        [240, 180],
        [410, 490],
        [860, 210],
        [1020, 440],
        [630, 140],
        [320, 290],
        [940, 560],
      ].map(([cx, cy], idx) => (
        <circle key={idx} cx={cx} cy={cy} r={idx % 2 === 0 ? 2.4 : 1.6} fill="rgba(255,255,255,0.34)" />
      ))}
      <g transform={`translate(640, 355) scale(${scale})`}>
        {/* Stacked cutout logo shadow */}
        <g transform="translate(4, 6)" opacity="0.45">
          <text x="-28" y="-18" textAnchor="middle" fill="#020617" fontSize="68" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
            অন্য
          </text>
          <text x="0" y="58" textAnchor="middle" fill="#020617" fontSize="68" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
            আলাপ
          </text>
        </g>
        {/* Stacked cutout logo */}
        <text
          x="-28"
          y="-18"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#1F1B18"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="68"
          fontWeight="700"
          fontFamily={BENGALI_SVG_FONT}
        >
          অন্য
        </text>
        {/* Crimson 3-dot speech bubble */}
        <g transform="translate(56, -68)">
          <rect x="0" y="0" width="76" height="44" rx="8" fill="#D81919" stroke="#1F1B18" strokeWidth="3" />
          <polygon points="10,44 26,44 12,58" fill="#D81919" stroke="#1F1B18" strokeWidth="2.5" />
          <circle cx="20" cy="22" r="5" fill="#FFFFFF" />
          <circle cx="38" cy="22" r="5" fill="#FFFFFF" />
          <circle cx="56" cy="22" r="5" fill="#FFFFFF" />
        </g>
        <text
          x="0"
          y="58"
          textAnchor="middle"
          fill="#FFFFFF"
          stroke="#1F1B18"
          strokeWidth="4"
          paintOrder="stroke"
          fontSize="68"
          fontWeight="700"
          fontFamily={BENGALI_SVG_FONT}
        >
          আলাপ
        </text>
      </g>
    </g>
  );
};

export const Diagram: React.FC<{
  nodes: Array<{ label: string; sub?: string }>;
  x?: number;
  y?: number;
}> = ({ nodes, x = 140, y = 160 }) => (
  <g transform={`translate(${x}, ${y})`}>
    {nodes.map((node, i) => (
      <g key={i} transform={`translate(${i * 250}, 0)`}>
        <rect x="4" y="5" width="210" height="120" rx="8" fill="rgba(15,23,42,0.12)" />
        <rect x="0" y="0" width="210" height="120" rx="8" fill="#FAF6EB" stroke="#7B6B55" strokeWidth="2" strokeDasharray="5 3" />
        <text x="105" y="54" textAnchor="middle" fill="#1F1B18" fontSize="22" fontWeight="700" fontFamily={BENGALI_SVG_FONT}>
          {node.label}
        </text>
        {node.sub && (
          <text x="105" y="88" textAnchor="middle" fill="#64748B" fontSize="14">
            {node.sub}
          </text>
        )}
        {i < nodes.length - 1 && <Arrow x1={215} y1={60} x2={245} y2={60} />}
      </g>
    ))}
  </g>
);

export const Infographic: React.FC<{
  value: string;
  label: string;
  x?: number;
  y?: number;
}> = ({ value, label, x = 640, y = 320 }) => (
  <ObjectIllustration kind="counter_machine" x={x} y={y} label={label} counterValue={value} />
);

export const Typography: React.FC<{
  headline?: string;
  subheadline?: string;
  accentColor?: string;
}> = ({ headline, subheadline, accentColor = ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue }) => {
  if (!headline && !subheadline) return null;
  return (
    <g transform="translate(640, 52)">
      <rect x="-335" y="-32" width="680" height={subheadline ? 78 : 54} rx="8" fill="rgba(15,23,42,0.16)" />
      <rect x="-340" y="-36" width="680" height={subheadline ? 78 : 54} rx="8" fill="#FAF6EB" stroke={accentColor} strokeWidth="2.5" />
      {headline && (
        <text
          x="0"
          y={subheadline ? '-2' : '6'}
          textAnchor="middle"
          fill="#1F1B18"
          fontSize="26"
          fontWeight="700"
          fontFamily={BENGALI_SVG_FONT}
        >
          {headline}
        </text>
      )}
      {subheadline && (
        <text
          x="0"
          y="26"
          textAnchor="middle"
          fill="#475569"
          fontSize="16"
          fontFamily={BENGALI_SVG_FONT}
        >
          {subheadline}
        </text>
      )}
    </g>
  );
};

export const TextLabel: React.FC<{ text: string; x: number; y: number; color?: string }> = ({
  text,
  x,
  y,
  color = '#1F1B18',
}) => (
  <text x={x} y={y} fill={color} fontSize="20" fontWeight="600" fontFamily={BENGALI_SVG_FONT}>
    {text}
  </text>
);

export const Caption: React.FC<{ text?: string }> = ({ text }) => {
  if (!text) return null;
  return (
    <g transform="translate(640, 654)">
      <rect x="-500" y="-28" width="1000" height="52" rx="6" fill="rgba(15, 23, 42, 0.86)" />
      <text
        x="0"
        y="6"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="21"
        fontWeight="500"
        fontFamily={BENGALI_SVG_FONT}
      >
        {text.length > 86 ? text.slice(0, 84) + '…' : text}
      </text>
    </g>
  );
};

export const Icon: React.FC<{ kind: 'star' | 'badge' | 'pin'; x: number; y: number; color?: string }> = ({
  kind,
  x,
  y,
  color = '#D81919',
}) => (
  <g transform={`translate(${x}, ${y})`}>
    {kind === 'pin' && <circle cx="0" cy="0" r="8" fill={color} stroke="#FFFFFF" strokeWidth="2" />}
    {kind === 'star' && <polygon points="0,-12 4,-4 12,0 4,4 0,12 -4,4 -12,0 -4,-4" fill={color} />}
    {kind === 'badge' && <rect x="-10" y="-12" width="20" height="24" rx="4" fill={color} />}
  </g>
);

export const Shape: React.FC<{ kind: 'card' | 'divider'; x: number; y: number; w: number; h: number }> = ({
  kind,
  x,
  y,
  w,
  h,
}) => (
  <rect
    x={x}
    y={y}
    width={w}
    height={h}
    rx={kind === 'card' ? 8 : 0}
    fill={kind === 'card' ? '#FAF6EB' : '#CBD5E1'}
    stroke={kind === 'card' ? '#7B6B55' : 'none'}
    strokeDasharray={kind === 'card' ? '5 3' : undefined}
  />
);

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string }> = ({
  x1,
  y1,
  x2,
  y2,
  color = '#D81919',
}) => (
  <g>
    <line x1={x1} y1={y1} x2={x2 - 8} y2={y2} stroke={color} strokeWidth="3" />
    <polygon points={`${x2},${y2} ${x2 - 10},${y2 - 6} ${x2 - 10},${y2 + 6}`} fill={color} />
  </g>
);

export const GraphicPanel: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, children }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="0" width={w} height={h} rx="8" fill="#FAF6EB" stroke="#7B6B55" strokeWidth="1.8" strokeDasharray="6 4" />
    {children}
  </g>
);

export const LightingEffect: React.FC<{ mode?: 'warm_lamp' | 'daylight' | 'vignette' }> = ({
  mode = 'daylight',
}) => {
  if (mode === 'warm_lamp') {
    return (
      <radialGradient id="lampSpot" cx="25%" cy="55%" r="45%">
        <stop offset="0%" stopColor="rgba(251, 191, 36, 0.22)" />
        <stop offset="100%" stopColor="rgba(15, 23, 42, 0.12)" />
      </radialGradient>
    );
  }
  return null;
};

export const CameraMovement: React.FC<{
  zoom?: number;
  panX?: number;
  children: React.ReactNode;
}> = ({ zoom = 1, panX = 0, children }) => (
  <g transform={`translate(${640 + panX}, 360) scale(${zoom}) translate(-640, -360)`}>
    {children}
  </g>
);

export const AnimationLayer: React.FC<{
  opacity?: number;
  offsetY?: number;
  children: React.ReactNode;
}> = ({ opacity = 1, offsetY = 0, children }) => (
  <g transform={`translate(0, ${offsetY})`} opacity={opacity}>
    {children}
  </g>
);

export const Transition: React.FC<{
  type: 'cut' | 'paper_wipe' | 'dissolve' | 'whip_pan' | 'fade_black';
  progress: number;
}> = ({ type, progress }) => {
  if (type === 'fade_black' && progress > 0 && progress < 0.1) {
    return <rect x="0" y="0" width="1280" height="720" fill={`rgba(4, 12, 32, ${(1 - progress / 0.1) * 0.65})`} />;
  }
  if (type === 'paper_wipe' && progress > 0 && progress < 0.12) {
    const p = progress / 0.12;
    const x = p * 1280;
    return <rect x={x} y="0" width="220" height="720" fill="rgba(244, 239, 226, 0.85)" />;
  }
  return null;
};
