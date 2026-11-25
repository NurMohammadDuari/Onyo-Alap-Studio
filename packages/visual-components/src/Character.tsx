import React from 'react';
import { ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';

export type CharacterPoseType =
  | 'standing'
  | 'walking'
  | 'saluting'
  | 'tea_sipping'
  | 'seated_reading'
  | 'guarding_rifle';

export interface CharacterProps {
  role: string;
  pose?: CharacterPoseType;
  facing?: 'left' | 'right';
  uniformColor?: string;
  trouserColor?: string;
  skinTone?: string;
  hatType?: 'beret' | 'peaked_cap' | 'none';
  holdingItem?: 'paper' | 'teacup' | 'rifle' | 'none';
  scale?: number;
  x?: number;
  y?: number;
  animationPhase?: number; // 0..1 continuous motion phase
  blurred?: boolean;
}

export const CharacterFace: React.FC<{
  skinTone: string;
  mustache?: boolean;
  expression?: 'neutral' | 'speaking' | 'focused';
}> = ({ skinTone, mustache = true, expression = 'neutral' }) => (
  <g>
    {/* Cutout head silhouette with white cardstock rim */}
    <path
      d="M -12 -18 C -12 -32 14 -32 14 -16 C 14 -12 18 -9 17 -6 C 16 -4 14 -4 14 0 C 14 7 6 10 -2 9 L -8 12 L -12 2 Z"
      fill={skinTone}
      stroke="#F8FAFC"
      strokeWidth="1.4"
    />
    {/* Subtle cheekbone paper shading */}
    <path d="M 1 -10 C 6 -10 11 -7 11 0 C 8 4 2 4 -1 1 Z" fill="rgba(74, 37, 17, 0.14)" />
    {/* Hair */}
    <path
      d="M -13 -16 C -14 -30 4 -33 13 -24 C 8 -23 2 -23 -2 -18 C -5 -13 -9 -10 -12 -10 Z"
      fill="#1F1B18"
    />
    {/* Ear detail */}
    <circle cx="-4" cy="-12" r="2.8" fill="#7D5238" opacity="0.65" />
    {/* Eye */}
    <ellipse cx="9" cy="-15" rx="2.5" ry="1.7" fill="#FFFFFF" />
    <circle cx="9.6" cy="-15" r="1.15" fill="#1F1B18" />
    {/* Eyebrow */}
    <path d="M 6.5 -18.5 Q 9.5 -19.8 12.2 -18.2" stroke="#1F1B18" strokeWidth="1.2" fill="none" />
    {/* Mustache (authentic senior officer motif from reference) */}
    {mustache && <path d="M 8 -7 Q 13 -9.5 16.5 -6 Q 12 -4.8 8 -6 Z" fill="#1F1B18" />}
    {/* Mouth */}
    <path
      d={expression === 'speaking' ? 'M 9 -3 Q 13 -0.8 14 -3' : 'M 9 -3 L 14 -3'}
      stroke="#4A2511"
      strokeWidth="1.4"
      fill="none"
    />
  </g>
);

export const PoliceUniformIllustration: React.FC<{
  uniformColor: string;
  trouserColor: string;
  isCivilian?: boolean;
}> = ({ uniformColor, trouserColor, isCivilian = false }) => (
  <g>
    {/* Paper shadow under torso */}
    <path d="M -15 2 L 15 2 L 18 60 L -16 60 Z" fill="rgba(15, 23, 42, 0.22)" />
    {/* Torso shirt with white cardstock cutout rim */}
    <path
      d="M -16 0 L 14 0 L 17 58 L -17 58 Z"
      fill={uniformColor}
      stroke="#F8FAFC"
      strokeWidth="1.5"
    />
    {/* Subtle vertical pleat shadow */}
    <path d="M -4 0 L 14 0 L 16 56 L 2 56 Z" fill="rgba(15, 23, 42, 0.1)" />
    {!isCivilian && (
      <>
        {/* Pocket & green shoulder unit shield patch */}
        <rect x="2" y="14" width="10" height="12" rx="1" fill="#16339B" stroke="#93C5FD" strokeWidth="0.7" />
        <path d="M -9 10 L -1 10 L -1 18 L -5 22 L -9 18 Z" fill="#0B6B3A" stroke="#F8FAFC" strokeWidth="0.8" />
        <circle cx="-5" cy="15" r="1.5" fill="#F8FAFC" />
        {/* Shoulder strap */}
        <rect x="-12" y="-3" width="18" height="5" rx="1.5" fill="#16339B" stroke="#E2E8F0" strokeWidth="0.7" />
      </>
    )}
    {/* Belt */}
    <rect x="-17" y="55" width="34" height="6" fill="#1F1B18" />
    {!isCivilian && <rect x="7" y="55" width="7" height="6" fill="#D81919" />}
    {/* Hips / upper pelvis */}
    <path d="M -16 61 L 16 61 L 14 78 L -14 78 Z" fill={trouserColor} stroke="#F8FAFC" strokeWidth="1.2" />
  </g>
);

export const Character: React.FC<CharacterProps> = ({
  role,
  pose = 'standing',
  facing = 'right',
  uniformColor = ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
  trouserColor = ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
  skinTone = '#9B6B4A',
  hatType = 'beret',
  holdingItem = 'none',
  scale = 1,
  x = 0,
  y = 0,
  animationPhase = 0,
  blurred = false,
}) => {
  const isCivilian = role.toLowerCase().includes('civilian');
  const resolvedUniform = isCivilian ? '#C8D3CD' : uniformColor;
  const resolvedTrouser = isCivilian ? '#2B3A55' : trouserColor;
  const walkSwing = pose === 'walking' ? Math.sin(animationPhase * Math.PI * 2) * 18 : 0;
  const breatheY = Math.sin(animationPhase * Math.PI * 2) * 1.4;
  const headTilt = pose === 'tea_sipping' ? -6 : pose === 'saluting' ? 2 : Math.sin(animationPhase * Math.PI * 2) * 1.5;

  const armRaise =
    pose === 'saluting'
      ? -128
      : pose === 'tea_sipping'
        ? -78
        : pose === 'guarding_rifle'
          ? -38
          : walkSwing * 0.6;
  const forearmAngle =
    pose === 'saluting'
      ? -45
      : pose === 'tea_sipping'
        ? -58
        : pose === 'guarding_rifle'
          ? -45
          : -10;

  const backArmAngle =
    pose === 'walking'
      ? -walkSwing * 0.6
      : pose === 'tea_sipping'
        ? 14
        : pose === 'standing' && holdingItem === 'paper'
          ? -32
          : 10;

  return (
    <g
      transform={`translate(${x}, ${y + breatheY}) scale(${facing === 'left' ? -scale : scale}, ${scale})`}
      opacity={blurred ? 0.84 : 1}
    >
      {/* Ground contact shadow */}
      <ellipse cx="0" cy="176" rx="30" ry="6.5" fill="rgba(15,23,42,0.24)" />

      {/* Back Arm (depth layer behind torso; holds cap when sipping tea like t_8!) */}
      <g transform={`translate(7, 14) rotate(${backArmAngle})`} opacity="0.92">
        <rect x="-5" y="0" width="10" height="25" rx="3.5" fill={resolvedUniform} stroke="#F8FAFC" strokeWidth="1" />
        <g transform="translate(0, 24) rotate(-8)">
          <rect x="-4" y="0" width="8" height="26" rx="3" fill={skinTone} stroke="#F8FAFC" strokeWidth="0.9" />
          <ellipse cx="0.5" cy="28" rx="4" ry="4.5" fill={skinTone} />
          {pose === 'tea_sipping' && !isCivilian && (
            <g transform="translate(0, 30) rotate(25)">
              <ellipse cx="0" cy="0" rx="13" ry="7" fill="#0B194F" stroke="#F8FAFC" strokeWidth="1" />
              <circle cx="6" cy="0" r="2.6" fill="#E2E8F0" />
            </g>
          )}
          {pose === 'standing' && holdingItem === 'paper' && (
            <rect x="1" y="22" width="13" height="17" rx="1" fill="#FAF6EB" stroke="#94A3B8" strokeWidth="0.8" transform="rotate(14)" />
          )}
        </g>
      </g>

      {/* Back Leg */}
      <g transform={`translate(-6, 76) rotate(${-walkSwing})`}>
        <rect x="-7" y="0" width="14" height="50" rx="4" fill={resolvedTrouser} stroke="#F8FAFC" strokeWidth="1.2" />
        <g transform={`translate(0, 48) rotate(${pose === 'walking' ? 14 : 0})`}>
          <rect x="-6.5" y="0" width="13" height="46" rx="3" fill={resolvedTrouser} stroke="#F8FAFC" strokeWidth="1.2" />
          <path d="M -7 44 L 16 44 L 18 53 L -7 53 Z" fill="#1F1B18" />
        </g>
        <circle cx="0" cy="48" r="2.2" fill="#E5C07B" />
      </g>

      {/* Front Leg */}
      <g transform={`translate(6, 76) rotate(${walkSwing})`}>
        <rect x="-7" y="0" width="14" height="50" rx="4" fill={resolvedTrouser} stroke="#F8FAFC" strokeWidth="1.2" />
        <g transform={`translate(0, 48) rotate(${pose === 'walking' ? -10 : 0})`}>
          <rect x="-6.5" y="0" width="13" height="46" rx="3" fill={resolvedTrouser} stroke="#F8FAFC" strokeWidth="1.2" />
          <path d="M -7 44 L 16 44 L 18 53 L -7 53 Z" fill="#1F1B18" />
        </g>
        <circle cx="0" cy="48" r="2.2" fill="#E5C07B" />
      </g>

      {/* Rifle sling when guarding */}
      {(pose === 'guarding_rifle' || holdingItem === 'rifle') && (
        <g transform="translate(-14, -12) rotate(12)">
          <rect x="-4" y="0" width="6" height="92" rx="2" fill="#7A461C" stroke="#F8FAFC" strokeWidth="0.7" />
          <rect x="-3" y="-28" width="3.5" height="40" fill="#475569" />
        </g>
      )}

      {/* Torso */}
      <PoliceUniformIllustration
        uniformColor={resolvedUniform}
        trouserColor={resolvedTrouser}
        isCivilian={isCivilian}
      />

      {/* Head & Hat */}
      <g transform={`translate(2, -4) rotate(${headTilt})`}>
        <CharacterFace
          skinTone={skinTone}
          mustache={!isCivilian}
          expression={pose === 'tea_sipping' ? 'focused' : 'neutral'}
        />
        {!isCivilian && hatType === 'beret' && pose !== 'tea_sipping' && (
          <g transform="translate(-1, -24) rotate(-8)">
            <ellipse cx="0" cy="0" rx="16.5" ry="8.5" fill="#0B194F" stroke="#F8FAFC" strokeWidth="1.1" />
            <circle cx="8" cy="1" r="3.4" fill="#E2E8F0" stroke="#1E3A8A" strokeWidth="0.7" />
            <circle cx="8" cy="1" r="1.4" fill="#1E3A8A" />
          </g>
        )}
        {!isCivilian && hatType === 'peaked_cap' && (
          <g transform="translate(2, -26)">
            <path d="M -15 0 L 16 -4 L 14 7 L -14 7 Z" fill="#0F1F5C" stroke="#F8FAFC" strokeWidth="1" />
            <circle cx="4" cy="1" r="3" fill="#E2E8F0" />
            <path d="M 6 6 L 23 9 L 6 9 Z" fill="#1F1B18" />
          </g>
        )}
      </g>

      {/* Articulated Front Arm with brass rivet joints */}
      <g transform={`translate(-4, 12) rotate(${armRaise})`}>
        <rect x="-6" y="0" width="12" height="26" rx="4" fill={resolvedUniform} stroke="#F8FAFC" strokeWidth="1.2" />
        <circle cx="0" cy="25" r="2.8" fill="#E5C07B" stroke="#7A461C" strokeWidth="0.6" />
        <g transform={`translate(0, 25) rotate(${forearmAngle})`}>
          <rect x="-4.5" y="0" width="9" height="28" rx="3" fill={skinTone} stroke="#F8FAFC" strokeWidth="1" />
          <circle cx="0" cy="26" r="2" fill="#E5C07B" />
          <ellipse cx="1" cy="31" rx="4.5" ry="5" fill={skinTone} />
          {(pose === 'tea_sipping' || holdingItem === 'teacup') && (
            <g transform="translate(8, 22) rotate(130)">
              {/* Steam wisps */}
              <path
                d="M -3 -6 Q -6 -16 -2 -24 M 3 -8 Q 7 -18 3 -26"
                fill="none"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <ellipse cx="0" cy="8" rx="10.5" ry="2.6" fill="#F4EFE2" stroke="#CBD5E1" strokeWidth="0.7" />
              <path d="M -6 0 L 6 0 L 4 8 L -4 8 Z" fill="#FFFFFF" stroke="#D81919" strokeWidth="1" />
            </g>
          )}
        </g>
      </g>

      {/* Shoulder rivet */}
      <circle cx="-4" cy="12" r="3.2" fill="#E5C07B" stroke="#7A461C" strokeWidth="0.7" />
    </g>
  );
};
