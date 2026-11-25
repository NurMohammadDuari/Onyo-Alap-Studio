import React from 'react';
import { ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';
import { Character, CharacterFace } from './Character';
import {
  BuildingIllustration,
  HangingSignPlacard,
  OnyoAlapLogoBumper,
} from './DioramaElements';
import { InsigniaIllustration } from './InsigniaIllustration';

const BENGALI_SVG_FONT = "'Noto Sans Bengali', var(--font-bengali), sans-serif";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

/** Shared studio lighting, DOF filters, and warm walnut desk backdrop */
export const StudioDofDefs: React.FC = () => (
  <defs>
    <filter id="dofSoft" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="2.6" />
    </filter>
    <filter id="dofMed" x="-12%" y="-12%" width="124%" height="124%">
      <feGaussianBlur stdDeviation="6.5" />
    </filter>
    <filter id="dofHeavy" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="12" />
    </filter>
    <linearGradient id="studioWoodGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#6C411A" />
      <stop offset="55%" stopColor="#4F2E10" />
      <stop offset="100%" stopColor="#351C07" />
    </linearGradient>
    <radialGradient id="studioWarmSpot" cx="48%" cy="42%" r="65%">
      <stop offset="0%" stopColor="rgba(255, 244, 214, 0.20)" />
      <stop offset="65%" stopColor="rgba(255, 244, 214, 0.0)" />
      <stop offset="100%" stopColor="rgba(18, 12, 6, 0.34)" />
    </radialGradient>
    <linearGradient id="skyPaperGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#94C0CC" />
      <stop offset="100%" stopColor="#C9DFE3" />
    </linearGradient>
    <radialGradient id="cobaltBgGrad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stopColor="#1238B8" />
      <stop offset="100%" stopColor="#041664" />
    </radialGradient>
  </defs>
);

const WarmStudioVignette: React.FC = () => (
  <rect x="0" y="0" width="1280" height="720" fill="url(#studioWarmSpot)" pointerEvents="none" />
);

/** Reusable green "থানা" roof signboard matching t_2 / t_11 / t_39 */
const ThanaRoofSign: React.FC<{ x?: number; y?: number; scale?: number }> = ({
  x = 640,
  y = 66,
  scale = 1,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="-106" y="-23" width="216" height="52" rx="4" fill="rgba(15,23,42,0.22)" />
    <rect x="-110" y="-26" width="220" height="50" rx="4" fill="#ECE7D5" stroke="#CBD5E1" strokeWidth="1.5" />
    <rect x="-102" y="-19" width="204" height="36" rx="2" fill="#0B7A43" />
    <text
      x="0"
      y="7"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="24"
      fontWeight="700"
      fontFamily={BENGALI_SVG_FONT}
    >
      থানা
    </text>
  </g>
);

/** Chunky 2.5D Police Jeep modeled directly after t_11 / t_39 */
const DioramaPoliceJeep: React.FC<{
  x: number;
  y: number;
  scale?: number;
  showQuestionPopup?: boolean;
}> = ({ x, y, scale = 1, showQuestionPopup = false }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    {/* Ground drop shadow */}
    <ellipse cx="145" cy="118" rx="146" ry="13" fill="rgba(15,23,42,0.34)" />
    {/* Roof red/blue lightbar */}
    <rect x="128" y="-2" width="32" height="14" rx="2" fill="#E11D48" stroke="#F8FAFC" strokeWidth="1" />
    <rect x="160" y="-2" width="32" height="14" rx="2" fill="#2563EB" stroke="#F8FAFC" strokeWidth="1" />
    {/* Blue jeep 3D cardstock body */}
    <path
      d="M 8 54 L 68 48 L 94 12 L 246 12 L 266 54 L 278 54 L 278 96 L 8 96 Z"
      fill="#182E8A"
      stroke="#E2E8F0"
      strokeWidth="2.2"
    />
    {/* Top roof bevel */}
    <polygon points="94,12 246,12 238,20 102,20" fill="#2948B8" />
    {/* White + crimson police belt stripe */}
    <rect x="8" y="68" width="270" height="10" fill="#FFFFFF" />
    <rect x="8" y="78" width="270" height="4" fill="#DC2626" />
    <text
      x="184"
      y="77"
      textAnchor="middle"
      fill="#182E8A"
      fontSize="12"
      fontWeight="700"
      fontFamily={BENGALI_SVG_FONT}
    >
      পুলিশ
    </text>
    {/* Windshield & side windows */}
    <polygon points="98,20 152,20 152,54 84,54" fill="#A9CDD6" stroke="#F8FAFC" strokeWidth="1.5" />
    <rect x="162" y="20" width="44" height="34" rx="2" fill="#A9CDD6" stroke="#F8FAFC" strokeWidth="1.5" />
    <rect x="214" y="20" width="36" height="34" rx="2" fill="#A9CDD6" stroke="#F8FAFC" strokeWidth="1.5" />
    {/* Door seam lines */}
    <line x1="157" y1="20" x2="157" y2="94" stroke="#0B194F" strokeWidth="1.4" />
    <line x1="210" y1="20" x2="210" y2="94" stroke="#0B194F" strokeWidth="1.4" />
    {/* Headlight */}
    <rect x="2" y="58" width="8" height="12" rx="1.5" fill="#FEF08A" />
    {/* Paper wheels */}
    {[66, 218].map((wx) => (
      <g key={wx} transform={`translate(${wx}, 96)`}>
        <circle cx="0" cy="0" r="24" fill="#181615" stroke="#475569" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="10" fill="#CBD5E1" />
        <circle cx="0" cy="0" r="3.5" fill="#181615" />
      </g>
    ))}
    {showQuestionPopup && (
      <g transform="translate(115, -36)">
        <rect x="0" y="0" width="48" height="42" rx="4" fill="#181615" stroke="#F8FAFC" strokeWidth="2" />
        <circle cx="24" cy="21" r="13" fill="#DC2626" />
        <text x="24" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="700">
          ?
        </text>
      </g>
    )}
  </g>
);

export const PoliceOneMinScene: React.FC<{
  sceneKey: string;
  progress: number;
}> = ({ sceneKey, progress }) => {
  const ease = easeOutCubic(Math.min(1, progress * 1.45));

  // SHOT 1 (0.0 - 3.8s): Thana Exterior Establishing (t_2)
  if (sceneKey === '1min_01') {
    const zoom = 1 + 0.04 * progress;
    const riseProgress = easeOutCubic(Math.min(1, progress / 0.28));
    const thanaScaleY = 0.08 + 0.92 * riseProgress;
    return (
      <g>
        <StudioDofDefs />
        <g transform={`translate(640, 360) scale(${zoom}) translate(-640, -360)`}>
          <rect x="0" y="0" width="1280" height="720" fill="url(#skyPaperGrad)" />
          {/* Soft paper clouds */}
          <g fill="#F4EFE2" opacity="0.72">
            <ellipse cx="260" cy="110" rx="140" ry="38" />
            <ellipse cx="960" cy="95" rx="165" ry="44" />
          </g>
          <g transform={`translate(0, ${500 * (1 - thanaScaleY)}) scale(1, ${thanaScaleY})`}>
            <BuildingIllustration kind="thana_exterior" />
            {/* Right tree trunk matching t_2 */}
            <path d="M 1185 320 L 1220 320 L 1212 480 L 1192 480 Z" fill="#4A2511" />
            <ThanaRoofSign x={640} y={82} scale={1} />
          </g>
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 2 (3.8 - 9.2s): Tight Verandah Conversation + Tea Sipping (t_6 / t_8)
  if (sceneKey === '1min_02') {
    const sipPhase = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5;
    return (
      <g>
        <StudioDofDefs />
        <rect x="0" y="0" width="1280" height="720" fill="#E5D79F" />
        {/* Blurred Thana verandah interior backdrop */}
        <g filter="url(#dofSoft)">
          {/* Wall & masonry plinth */}
          <rect x="0" y="0" width="1280" height="490" fill="#DFCE91" />
          <rect x="0" y="470" width="1280" height="70" fill="#A9A59B" />
          <rect x="0" y="540" width="1280" height="180" fill="#D4CFC4" />
          {/* Notice board far left */}
          <rect x="85" y="135" width="140" height="190" fill="#B87324" stroke="#854D0E" strokeWidth="5" />
          <rect x="108" y="155" width="42" height="54" fill="#F8FAFC" />
          <rect x="164" y="170" width="42" height="54" fill="#F8FAFC" />
          {/* Green double doors */}
          <rect x="255" y="45" width="245" height="450" fill="#0B7B3F" stroke="#F8FAFC" strokeWidth="8" />
          <line x1="377" y1="45" x2="377" y2="495" stroke="#F8FAFC" strokeWidth="4" />
          <circle cx="360" cy="285" r="5" fill="#FACC15" />
          <circle cx="394" cy="285" r="5" fill="#FACC15" />
          {/* Barred shuttered window right */}
          <g transform="translate(880, 90)">
            <rect x="0" y="0" width="240" height="310" fill="#171412" stroke="#F8FAFC" strokeWidth="7" />
            {[48, 96, 144, 192].map((vx) => (
              <line key={vx} x1={vx} y1="0" x2={vx} y2="310" stroke="#E2E8F0" strokeWidth="5" />
            ))}
            <rect x="-42" y="10" width="42" height="290" fill="#0B6B3A" />
          </g>
        </g>

        {/* Blurred foreground ivory pillar on left matching t_6/t_8 */}
        <rect x="160" y="0" width="76" height="580" fill="#ECE7D5" filter="url(#dofSoft)" />

        {/* Wooden tea table on right */}
        <g transform="translate(815, 420)">
          <rect x="0" y="0" width="220" height="16" rx="2" fill="#8C521E" stroke="#5C320D" strokeWidth="2" />
          <rect x="16" y="16" width="14" height="190" fill="#6E3E14" />
          <rect x="190" y="16" width="14" height="190" fill="#6E3E14" />
        </g>

        {/* Civilian visitor holding paper on left */}
        <Character
          role="Civilian Visitor"
          pose="standing"
          holdingItem="paper"
          facing="right"
          x={355}
          y={258}
          scale={2.05}
          uniformColor="#B5C2BE"
          trouserColor="#2B3A55"
          animationPhase={progress}
        />

        {/* Senior Inspector sipping tea & holding beret in lowered hand */}
        <Character
          role="Senior Inspector"
          pose="tea_sipping"
          holdingItem="teacup"
          facing="left"
          x={685}
          y={260}
          scale={2.08}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          animationPhase={sipPhase * 0.4}
        />
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 3 (9.2 - 13.0s): High-Angle Thana + Big Blue Jeep Pulling In (t_11)
  if (sceneKey === '1min_03') {
    const jeepX = 820 - ease * 500;
    return (
      <g>
        <StudioDofDefs />
        {/* Warm tabletop margin right edge matching t_11 */}
        <rect x="0" y="0" width="1280" height="720" fill="url(#skyPaperGrad)" />
        <rect x="1150" y="0" width="130" height="720" fill="#6E441E" />

        {/* Elevated Thana diorama */}
        <g transform="translate(40, -10) scale(0.76)">
          <BuildingIllustration kind="thana_exterior" />
          <ThanaRoofSign x={640} y={82} scale={1.08} />
          {/* Tiny civilian + officer chatting on verandah */}
          <Character
            role="Civilian Visitor"
            pose="standing"
            holdingItem="paper"
            facing="right"
            x={475}
            y={290}
            scale={0.78}
            uniformColor="#B5C2BE"
            trouserColor="#2B3A55"
          />
          <Character
            role="Senior Inspector"
            pose="tea_sipping"
            facing="left"
            x={600}
            y={292}
            scale={0.78}
            uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
            trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          />
          {/* Lush right tree */}
          <g transform="translate(1150, 90)">
            <rect x="-18" y="130" width="36" height="260" fill="#5D320E" />
            <circle cx="0" cy="80" r="95" fill="#2F7A1C" />
            <circle cx="-55" cy="115" r="70" fill="#3B8E26" />
            <circle cx="55" cy="110" r="70" fill="#256515" />
          </g>
        </g>

        {/* Ground road strip */}
        <rect x="0" y="458" width="1150" height="262" fill="#D5BA85" />
        <rect x="0" y="538" width="1150" height="62" fill="#9A8E80" />
        <line x1="0" y1="569" x2="1150" y2="569" stroke="#E2E8F0" strokeWidth="3" strokeDasharray="34 22" />

        {/* Large Blue Police Jeep driving into frame */}
        <DioramaPoliceJeep x={jeepX} y={365} scale={1.95} />

        {/* Gate rifle guard bottom right */}
        <Character
          role="Constable Guard"
          pose="guarding_rifle"
          facing="left"
          x={1160}
          y={530}
          scale={0.75}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
        />
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 4 (13.0 - 16.0s): Macro Close-up of Boot Stepping Out of Jeep (t_14)
  if (sceneKey === '1min_04') {
    const stepDrop = ease * 36;
    return (
      <g>
        <StudioDofDefs />
        <rect x="0" y="0" width="1280" height="720" fill="#D8BA82" />
        {/* Ground shadow strip */}
        <rect x="0" y="465" width="1280" height="255" fill="#BFA472" />
        <rect x="0" y="470" width="1280" height="82" fill="#8C8378" filter="url(#dofMed)" />

        {/* Giant blurred blue jeep chassis & huge tire behind legs */}
        <g filter="url(#dofMed)">
          <rect x="260" y="-40" width="1040" height="390" fill="#182E8A" />
          <rect x="260" y="290" width="1040" height="32" fill="#FFFFFF" />
          <circle cx="-10" cy="340" r="285" fill="#141414" stroke="#475569" strokeWidth="18" />
          <circle cx="910" cy="310" r="145" fill="#141414" />
        </g>

        {/* Ground contact shadow under stepped boot */}
        <ellipse cx="715" cy="542" rx="190" ry="26" fill="rgba(15,23,42,0.42)" filter="url(#dofSoft)" />

        {/* Giant articulated khaki trouser legs + black leather boots stepping out */}
        <g transform="translate(560, 0)">
          {/* Back planted leg */}
          <g transform="translate(150, -35)">
            <rect x="-38" y="0" width="76" height="510" rx="8" fill="#D2BE8A" stroke="#F8FAFC" strokeWidth="3" />
            <path d="M -38 492 L 105 492 L 116 544 L -38 544 Z" fill="#181615" stroke="#475569" strokeWidth="2" />
          </g>
          {/* Front stepping-down leg with animated landing */}
          <g transform={`translate(-80, ${-80 + stepDrop}) rotate(12)`}>
            <rect x="-42" y="0" width="84" height="280" rx="8" fill="#DFCE9D" stroke="#F8FAFC" strokeWidth="3" />
            <g transform="translate(0, 270) rotate(-32)">
              <rect x="-38" y="0" width="76" height="215" rx="8" fill="#DFCE9D" stroke="#F8FAFC" strokeWidth="3" />
              <path d="M -42 200 L 125 200 L 135 256 L -42 256 Z" fill="#181615" stroke="#475569" strokeWidth="2" />
            </g>
          </g>
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 5 (16.0 - 23.2s): Young ASP Walking Up Towards Verandah (t_18 / t_21)
  if (sceneKey === '1min_05') {
    const walkX = 760 - ease * 110;
    return (
      <g>
        <StudioDofDefs />
        <rect x="0" y="0" width="1280" height="720" fill="#D8D2C5" />
        {/* Blurred Thana verandah steps & yellow wall background */}
        <g filter="url(#dofSoft)">
          <rect x="0" y="0" width="1280" height="450" fill="#DFCE91" />
          <rect x="0" y="410" width="1280" height="55" fill="#A9A59B" />
          {/* Verandah pillars */}
          <rect x="95" y="0" width="52" height="465" fill="#ECE7D5" />
          <rect x="615" y="0" width="52" height="465" fill="#ECE7D5" />
          {/* Notice board */}
          <rect x="165" y="45" width="145" height="175" fill="#B87324" />
          {/* Green doors */}
          <rect x="330" y="10" width="215" height="430" fill="#0B7B3F" stroke="#F8FAFC" strokeWidth="7" />
          {/* Barred window right */}
          <rect x="765" y="45" width="235" height="280" fill="#171412" stroke="#F8FAFC" strokeWidth="6" />
          {[812, 859, 906, 953].map((vx) => (
            <line key={vx} x1={vx} y1="45" x2={vx} y2="325" stroke="#E2E8F0" strokeWidth="4" />
          ))}
          {/* Verandah steps */}
          <rect x="0" y="465" width="1280" height="100" fill="#B5B1A8" />
          <rect x="180" y="465" width="400" height="46" fill="#C9C5BC" />
          <rect x="145" y="511" width="470" height="46" fill="#B2AEA5" />
          {/* Small table with teacup */}
          <rect x="570" y="340" width="110" height="12" fill="#8C521E" />
          <rect x="582" y="352" width="10" height="113" fill="#6E3E14" />
          <rect x="658" y="352" width="10" height="113" fill="#6E3E14" />
        </g>

        {/* Civilian & Senior Inspector up on verandah */}
        <Character
          role="Civilian Visitor"
          pose="standing"
          holdingItem="paper"
          facing="right"
          x={225}
          y={205}
          scale={1.55}
          uniformColor="#B5C2BE"
          trouserColor="#2B3A55"
          blurred
        />
        <Character
          role="Senior Inspector"
          pose="standing"
          facing="right"
          x={415}
          y={215}
          scale={1.65}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
        />

        {/* Young ASP walking in at lower courtyard */}
        <Character
          role="Young ASP"
          pose="walking"
          hatType="peaked_cap"
          facing="left"
          x={walkX}
          y={330}
          scale={1.95}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          animationPhase={progress * 3}
        />

        {/* Blurred Blue Jeep nose foreground bottom-right */}
        <g transform="translate(930, 390) scale(1.6)" filter="url(#dofSoft)">
          <DioramaPoliceJeep x={0} y={0} />
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 6 (23.2 - 28.0s): Senior Inspector Stepping Forward & Saluting Young ASP (t_25)
  if (sceneKey === '1min_06') {
    const saluteApproach = ease * 36;
    return (
      <g>
        <StudioDofDefs />
        <rect x="0" y="0" width="1280" height="720" fill="#D8D2C5" />
        {/* Blurred Thana verandah steps & yellow wall background */}
        <g filter="url(#dofSoft)">
          <rect x="0" y="0" width="1280" height="450" fill="#DFCE91" />
          <rect x="280" y="0" width="220" height="430" fill="#0B7B3F" stroke="#F8FAFC" strokeWidth="7" />
          <rect x="780" y="20" width="240" height="295" fill="#171412" stroke="#F8FAFC" strokeWidth="6" />
          {[828, 876, 924, 972].map((vx) => (
            <line key={vx} x1={vx} y1="20" x2={vx} y2="315" stroke="#E2E8F0" strokeWidth="4" />
          ))}
          <rect x="0" y="450" width="1280" height="270" fill="#C4C0B7" />
          {/* Steps */}
          <rect x="130" y="470" width="440" height="52" fill="#D4D0C7" />
          <rect x="95" y="522" width="510" height="56" fill="#BDB9B0" />
          {/* Foreground pillar */}
          <rect x="640" y="0" width="54" height="475" fill="#ECE7D5" />
        </g>

        {/* Blurred civilian on far left */}
        <Character
          role="Civilian Visitor"
          pose="standing"
          holdingItem="paper"
          facing="right"
          x={145}
          y={195}
          scale={1.75}
          uniformColor="#B5C2BE"
          trouserColor="#2B3A55"
          blurred
        />

        {/* Senior Inspector crisply saluting Young ASP */}
        <Character
          role="Senior Inspector"
          pose="saluting"
          facing="right"
          x={375 + saluteApproach}
          y={205}
          scale={1.92}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          animationPhase={0.35}
        />

        {/* Young ASP in peaked cap facing left */}
        <Character
          role="Young ASP"
          pose="standing"
          hatType="peaked_cap"
          facing="left"
          x={740}
          y={245}
          scale={2.05}
          uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
          trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
        />

        {/* Blurred blue jeep edge on far right */}
        <rect x="1150" y="340" width="160" height="320" fill="#182E8A" filter="url(#dofMed)" />
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 7 & 8 (28.0 - 38.5s): Grade 9 Balance Scale Seesaw + Hanging "৯ম গ্রেড" Tags (t_31 / t_36)
  if (sceneKey === '1min_07' || sceneKey === '1min_08') {
    const isPush = sceneKey === '1min_08';
    const zoom = isPush ? 1.04 + 0.14 * progress : 1 + 0.04 * progress;
    const beamTilt = isPush ? 0 : Math.sin(progress * Math.PI * 2) * (1 - ease) * 3.5;
    return (
      <g>
        <StudioDofDefs />
        <g transform={`translate(640, 360) scale(${zoom}) translate(-640, -360)`}>
          {/* Heavily blurred Thana facade behind scale matching t_31 */}
          <g filter="url(#dofMed)">
            <rect x="0" y="0" width="1280" height="720" fill="#DFCE91" />
            <rect x="495" y="135" width="180" height="340" fill="#0B7B3F" stroke="#F8FAFC" strokeWidth="6" />
            <rect x="290" y="0" width="52" height="510" fill="#ECE7D5" />
            <rect x="780" y="0" width="52" height="510" fill="#ECE7D5" />
            <rect x="870" y="140" width="220" height="240" fill="#171412" stroke="#F8FAFC" strokeWidth="5" />
            <rect x="0" y="485" width="1280" height="235" fill="#B6B2A8" />
            <rect x="940" y="410" width="360" height="310" fill="#182E8A" />
          </g>

          {/* Wooden Balance Scale Fulcrum + Beam */}
          <g transform="translate(640, 565)">
            <polygon points="-46,155 46,155 0,0" fill="#C48534" stroke="#7A461C" strokeWidth="3" />
            <g transform={`rotate(${beamTilt})`}>
              {/* Wooden balance beam */}
              <rect x="-250" y="-22" width="500" height="26" rx="4" fill="#E3BC78" stroke="#925D19" strokeWidth="2.5" />
              <rect x="-250" y="-6" width="500" height="10" fill="#C7964A" />

              {/* Left Officer: Senior Inspector */}
              <Character
                role="Senior Inspector"
                pose="standing"
                facing="right"
                x={-135}
                y={-268}
                scale={1.4}
                uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
                trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
              />

              {/* Right Officer: Young ASP */}
              <Character
                role="Young ASP"
                pose="standing"
                hatType="peaked_cap"
                facing="left"
                x={135}
                y={-268}
                scale={1.4}
                uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
                trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
              />
            </g>
          </g>

          {/* Hanging "৯ম গ্রেড" Cardstock Tags on Crimson Strings (drop in at ~28.0s) */}
          {(isPush || progress > 0.16) &&
            [505, 775].map((tx, idx) => {
              const drop = isPush ? 1 : easeOutCubic(Math.min(1, (progress - 0.16) / 0.18));
              const yOff = (1 - drop) * -190;
              return (
                <g key={tx} transform={`translate(${tx}, ${yOff})`}>
                  <line x1="0" y1="0" x2="0" y2="112" stroke="#D81919" strokeWidth="3" />
                  <rect x="-92" y="116" width="190" height="68" rx="4" fill="rgba(15,23,42,0.22)" />
                  <rect
                    x="-95"
                    y="112"
                    width="190"
                    height="68"
                    rx="4"
                    fill="#F8F6EE"
                    stroke={isPush && idx === 0 ? '#D81919' : '#CBD5E1'}
                    strokeWidth={isPush ? 3 : 1.5}
                  />
                  <text
                    x="0"
                    y="156"
                    textAnchor="middle"
                    fill="#1F1B18"
                    fontSize="32"
                    fontWeight="700"
                    fontFamily={BENGALI_SVG_FONT}
                  >
                    ৯ম গ্রেড
                  </text>
                </g>
              );
            })}
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 9 (38.5 - 41.5s): Aerial Diorama Overview with "?" Confusion Cards (t_39)
  if (sceneKey === '1min_09') {
    return (
      <g>
        <StudioDofDefs />
        {/* Wooden desk borders + green cutting mat left */}
        <rect x="0" y="0" width="1280" height="720" fill="url(#studioWoodGrad)" />
        <g transform="translate(80, 0) skewX(-6)">
          <rect x="0" y="0" width="1080" height="720" fill="#D5BA85" />
          <rect x="-40" y="340" width="110" height="380" fill="#0F6B4E" />
          {/* Elevated Thana building */}
          <g transform="translate(150, -30) scale(0.68)">
            <BuildingIllustration kind="thana_exterior" />
            <ThanaRoofSign x={640} y={82} scale={1.12} />
          </g>
          {/* Bangladesh Red-Green Flag on Pole left */}
          <g transform="translate(115, 220)">
            <rect x="-3" y="-180" width="6" height="310" fill="#E2E8F0" />
            <rect x="3" y="-175" width="96" height="58" fill="#006A4E" />
            <circle cx="46" cy="-146" r="18" fill="#F42A41" />
          </g>
          {/* Miniature officers facing each other */}
          <Character
            role="Senior Inspector"
            pose="standing"
            facing="right"
            x={465}
            y={285}
            scale={0.62}
            uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
            trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          />
          <Character
            role="Young ASP"
            pose="standing"
            hatType="peaked_cap"
            facing="left"
            x={565}
            y={288}
            scale={0.62}
            uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
            trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          />
          {/* Courtyard road */}
          <rect x="0" y="455" width="1080" height="68" fill="#8C8378" />
          <line x1="0" y1="489" x2="1080" y2="489" stroke="#F8FAFC" strokeWidth="3" />
          {/* Blue Police Jeep right with "?" popup */}
          <DioramaPoliceJeep x={635} y={405} scale={1.45} showQuestionPopup />

          {/* Pop-up Question Cards "?" matching t_39 */}
          <g transform="translate(135, 385)">
            <rect x="0" y="0" width="76" height="58" rx="4" fill="#F8F6EE" stroke="#1F1B18" strokeWidth="2" />
            <text x="38" y="42" textAnchor="middle" fill="#1F1B18" fontSize="34" fontWeight="700">
              ?
            </text>
          </g>
          <g transform="translate(385, 195)">
            <rect x="0" y="0" width="84" height="56" rx="4" fill="#181615" stroke="#F8FAFC" strokeWidth="2" />
            <circle cx="42" cy="28" r="16" fill="#DC2626" />
            <text x="42" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="700">
              ?
            </text>
          </g>
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 10 (41.5 - 47.0s): Constable Guard at Thana Gate Left + Rising "পুলিশ" Cardstock Stand Right (t_43)
  if (sceneKey === '1min_10') {
    const cardSlideY = 260 + (1 - ease) * 140;
    return (
      <g>
        <StudioDofDefs />
        {/* Warm walnut studio table bokeh background matching t_43 */}
        <rect x="0" y="0" width="1280" height="720" fill="url(#studioWoodGrad)" />
        <g filter="url(#dofMed)">
          {/* Blurred green tree canopy top-left */}
          <circle cx="170" cy="40" r="135" fill="#2F7A1C" />
          {/* Blurred vertical rank tower strip in mid-distance */}
          <rect x="495" y="0" width="102" height="580" fill="#ECE7D5" />
          {[35, 120, 205, 290, 375].map((ry) => (
            <rect key={ry} x="525" y={ry} width="42" height="65" fill="#181615" />
          ))}
          {/* Out-of-focus yellow pencil & red cap on desk */}
          <rect x="780" y="560" width="380" height="22" rx="4" fill="#E8B923" transform="rotate(-8 900 570)" />
          <ellipse cx="860" cy="635" rx="42" ry="18" fill="#DC2626" />
        </g>

        {/* Left foreground: Thana Gate Pillars + Iron Gate + Jeep + Rifle Constable */}
        <g transform="translate(0, 120)">
          {/* Blue Police Jeep nose behind gate pillar */}
          <DioramaPoliceJeep x={-165} y={135} scale={1.55} />
          {/* Courtyard slab & green cutting mat edge */}
          <rect x="0" y="450" width="660" height="150" fill="#EFE8D5" />
          <rect x="450" y="520" width="340" height="80" fill="#0F6B4E" />
          {/* Black iron gate */}
          <rect x="330" y="295" width="125" height="155" fill="none" stroke="#181615" strokeWidth="4" />
          {[350, 370, 390, 410, 430].map((gx) => (
            <line key={gx} x1={gx} y1="295" x2={gx} y2="450" stroke="#181615" strokeWidth="2.5" />
          ))}
          {/* Gate pillars */}
          <rect x="75" y="235" width="58" height="230" fill="#F8F6EE" stroke="#D6CCB2" strokeWidth="2" />
          <rect x="440" y="255" width="44" height="205" fill="#F8F6EE" stroke="#D6CCB2" strokeWidth="2" />
          {/* Constable standing guard with rifle */}
          <Character
            role="Constable"
            pose="guarding_rifle"
            holdingItem="rifle"
            facing="right"
            x={195}
            y={180}
            scale={1.45}
            uniformColor={ONYO_ALAP_VISUAL_DNA.palette.uniformBlue}
            trouserColor={ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser}
          />
        </g>

        {/* Right foreground: Vertical Constable "পুলিশ" Cardstock Stand matching t_43 */}
        <g transform={`translate(795, ${cardSlideY})`}>
          <rect x="65" y="280" width="46" height="180" fill="#D5C8AD" />
          <rect x="8" y="8" width="180" height="325" rx="3" fill="rgba(15,23,42,0.28)" />
          <rect x="0" y="0" width="180" height="325" rx="3" fill="#EAE1CB" stroke="#8B7B62" strokeWidth="1.5" />
          {/* Vertical slider track on right */}
          <rect x="148" y="55" width="4" height="190" fill="#1F1B18" />
          <rect x="141" y="110" width="18" height="36" rx="2" fill="#FAF6EB" stroke="#7B6B55" strokeWidth="1" />
          {/* Constable Epaulette (ONLY "পুলিশ", no stars/shapla) */}
          <g transform="translate(18, 42)">
            <InsigniaIllustration rankId="constable" width={118} height={240} showCardstockSlot={false} />
          </g>
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 11 (47.0 - 56.0s): SP 20-Year Gold-Ring Portrait Dial + Epaulette Upgrade Stand (t_51 / t_55)
  if (sceneKey === '1min_11') {
    const isUpgraded = progress > 0.52;
    const dialSweep = ease * 360;
    return (
      <g>
        <StudioDofDefs />
        <rect x="0" y="0" width="1280" height="720" fill="url(#studioWoodGrad)" />
        {/* Blurred desk accents */}
        <g filter="url(#dofMed)">
          <rect x="640" y="560" width="460" height="24" fill="#E8B923" transform="rotate(-7 800 570)" />
          <ellipse cx="780" cy="645" rx="58" ry="20" fill="#DC2626" />
        </g>

        {/* Left: Cream Dashed-Stitch Dial Card with "২০" & Officer Head Portrait (t_51) */}
        <g transform="translate(115, 38)">
          <rect x="8" y="10" width="540" height="635" rx="8" fill="rgba(15,23,42,0.34)" />
          <rect x="0" y="0" width="540" height="635" rx="8" fill="#EAE1CB" stroke="#8B7B62" strokeWidth="2" />
          <rect x="14" y="14" width="512" height="607" rx="4" fill="none" stroke="#7B6B55" strokeWidth="1.5" strokeDasharray="7 5" />

          {/* Red triangle dial pointer at 12 o'clock */}
          <polygon points="270,32 256,6 284,6" fill="#D81919" />

          {/* Dial circle with radial ticks */}
          <g transform="translate(270, 290)">
            <circle cx="0" cy="0" r="218" fill="#F4EFE2" stroke="#D81919" strokeWidth="3.2" />
            <circle
              cx="0"
              cy="0"
              r="186"
              fill="none"
              stroke="#E2D7BA"
              strokeWidth="22"
              strokeDasharray={`${(dialSweep / 360) * 1168} 1168`}
              transform="rotate(-90)"
            />
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15;
              const isMajor = i % 6 === 0;
              return (
                <line
                  key={i}
                  x1="0"
                  y1={isMajor ? -212 : -208}
                  x2="0"
                  y2={isMajor ? -186 : -194}
                  stroke="#1F1B18"
                  strokeWidth={isMajor ? 3 : 1.8}
                  transform={`rotate(${deg})`}
                />
              );
            })}

            {/* Top red-rimmed oval badge "২০" */}
            <ellipse cx="0" cy="-148" rx="44" ry="26" fill="#F8F6EE" stroke="#D81919" strokeWidth="2.5" />
            <text
              x="0"
              y="-138"
              textAnchor="middle"
              fill="#1F1B18"
              fontSize="36"
              fontWeight="700"
              fontFamily={BENGALI_SVG_FONT}
            >
              ২০
            </text>

            {/* Golden ring portrait aperture with Officer Face */}
            <circle cx="0" cy="4" r="96" fill="#DDD2B4" stroke="#D4A843" strokeWidth="7" />
            <g transform="translate(-8, 22) scale(3.5)">
              <CharacterFace skinTone="#9B6B4A" mustache={false} expression="neutral" />
            </g>
          </g>

          {/* Bottom bold text: "চাকরির বছর" */}
          <text
            x="270"
            y="578"
            textAnchor="middle"
            fill="#1F1B18"
            fontSize="40"
            fontWeight="700"
            fontFamily={BENGALI_SVG_FONT}
          >
            চাকরির বছর
          </text>
        </g>

        {/* Right: "এসপি" Hanging Card + Epaulette Badge Stand upgrading from SP -> Addl DIG */}
        <g transform="translate(765, 118)">
          <rect x="6" y="8" width="235" height="520" rx="4" fill="rgba(15,23,42,0.3)" />
          <rect x="0" y="0" width="235" height="520" rx="4" fill="#EAE1CB" stroke="#8B7B62" strokeWidth="1.5" />
          <rect x="10" y="10" width="215" height="500" rx="2" fill="none" stroke="#7B6B55" strokeWidth="1.2" strokeDasharray="6 4" />
          <g transform="translate(36, 95)">
            <InsigniaIllustration
              rankId={isUpgraded ? 'addl_dig' : 'sp'}
              width={158}
              height={325}
              showCardstockSlot={false}
            />
          </g>
          {/* Hanging "এসপি" white tag at top */}
          <HangingSignPlacard title="এসপি" x={118} y={-118} swayDeg={isUpgraded ? 2.5 : -1.5} />
        </g>

        {/* Mechanical dark blue badge counter on far right (t_55) */}
        <g transform="translate(1135, 360)">
          <rect x="-12" y="45" width="24" height="280" fill="#D5C8AD" />
          <polygon points="-72,-35 72,-35 55,48 -55,48" fill="#1E3A8A" stroke="#F8FAFC" strokeWidth="2" />
          <rect x="-52" y="-12" width="104" height="32" rx="3" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
          <text x="0" y="11" textAnchor="middle" fill="#F8FAFC" fontSize="18" fontFamily="monospace" fontWeight="700">
            {isUpgraded ? '0000020' : '0000019'}
          </text>
        </g>
        <WarmStudioVignette />
      </g>
    );
  }

  // SHOT 12 (56.0 - 60.0s): 3D Royal Cobalt Tabletop Stage ("চেনা" -> "অন্য আলাপ") (t_57 / t_58 / t_60)
  const showLogo = progress > 0.68;
  const cardSlide = easeOutCubic(Math.min(1, progress * 2.2));
  return (
    <g>
      <StudioDofDefs />
      {/* Warm wood outer border */}
      <rect x="0" y="0" width="1280" height="720" fill="url(#studioWoodGrad)" />
      {/* Cream/tan tabletop floor plane */}
      <rect x="0" y="475" width="1280" height="245" fill="#F2EDE0" />
      <rect x="0" y="475" width="1280" height="58" fill="#D8C89B" />

      {/* Standing Royal Cobalt Backdrop Board */}
      <g transform="translate(95, 0)">
        <rect x="0" y="0" width="1090" height="478" fill="#0A2A9F" />
        <rect x="0" y="0" width="1090" height="478" fill="url(#cobaltBgGrad)" />
        {/* Bottom-left L registration corner mark seen in t_57 */}
        <path d="M 32 415 L 32 448 L 65 448" fill="none" stroke="#FFFFFF" strokeWidth="5" />
        <rect x="0" y="468" width="1090" height="10" fill="#F8FAFC" />

        {!showLogo ? (
          /* "চেনা" white-red tag + cardstock envelope sliding in (t_58) */
          <g transform={`translate(${240 + cardSlide * 110}, 320)`}>
            <rect x="0" y="48" width="142" height="96" rx="6" fill="#F8F6EE" stroke="#D81919" strokeWidth="3.5" />
            <text
              x="71"
              y="110"
              textAnchor="middle"
              fill="#1F1B18"
              fontSize="44"
              fontWeight="700"
              fontFamily={BENGALI_SVG_FONT}
            >
              চেনা
            </text>
            <g transform="translate(162, 12)">
              <rect x="0" y="0" width="285" height="162" rx="4" fill="#E8DEC6" stroke="#7B6B55" strokeWidth="1.5" strokeDasharray="5 3" />
              <rect x="0" y="0" width="285" height="22" fill="#1E44B8" />
              <rect x="0" y="22" width="285" height="6" fill="#D81919" />
              <line x1="28" y1="68" x2="180" y2="68" stroke="#94A3B8" strokeWidth="2.5" />
              <line x1="28" y1="92" x2="210" y2="92" stroke="#94A3B8" strokeWidth="2.5" />
            </g>
          </g>
        ) : (
          /* Full Royal Cobalt Onyo Alap Logo Reveal (t_60) */
          <g transform="translate(-95, -45)">
            <OnyoAlapLogoBumper progress={(progress - 0.45) / 0.55} />
          </g>
        )}
      </g>

      {/* 3D Tan Paper Plinth Block in center foreground (t_57) */}
      {!showLogo && (
        <g transform="translate(505, 448)">
          <rect x="6" y="8" width="270" height="66" fill="rgba(15,23,42,0.22)" />
          <rect x="0" y="0" width="270" height="66" fill="#C9B080" stroke="#B29664" strokeWidth="1.5" />
        </g>
      )}
      <WarmStudioVignette />
    </g>
  );
};
