import React from 'react';
import type { StoryboardShot } from '../../shared-types/src/types';
import {
  AnimationLayer,
  BuildingIllustration,
  CameraMovement,
  Caption,
  Character,
  Diagram,
  HangingSignPlacard,
  Infographic,
  InsigniaIllustration,
  MapIllustration,
  ObjectIllustration,
  OnyoAlapLogoBumper,
  PoliceOneMinScene,
  RankTowerLadder,
  SceneBackground,
  Transition,
  Typography,
} from '../../visual-components/src/index';

export interface ShotSceneRendererProps {
  shot: StoryboardShot;
  localFrame: number;
  totalFrames: number;
  fps?: number;
  showCaption?: boolean;
  className?: string;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - clamp01(t), 3);
}

export const ShotSceneRenderer: React.FC<ShotSceneRendererProps> = ({
  shot,
  localFrame,
  totalFrames,
  fps = 30,
  showCaption = true,
  className,
}) => {
  const progress = totalFrames > 1 ? clamp01(localFrame / (totalFrames - 1)) : 0;
  const enterProgress = easeOutCubic(clamp01((localFrame / Math.max(1, fps * 0.65)) * shot.animation.speedMultiplier));
  const zoom = shot.camera.zoomStart + (shot.camera.zoomEnd - shot.camera.zoomStart) * progress;
  const panX = shot.camera.panXStart + (shot.camera.panXEnd - shot.camera.panXStart) * progress;
  const swayDeg = Math.sin(progress * Math.PI * 3) * (1 - progress) * 4.5;
  const offsetY = shot.animation.entranceStyle === 'paper_drop' ? (1 - enterProgress) * -28 : 0;
  const opacity = shot.animation.entranceStyle === 'fade_stagger' ? enterProgress : 1;

  if (shot.background.style.startsWith('1min_')) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1280"
        height="720"
        viewBox="0 0 1280 720"
        className={className ?? 'w-full h-full block select-none'}
        role="img"
        aria-label={`${shot.shotId}: ${shot.title}`}
      >
        <PoliceOneMinScene sceneKey={shot.background.style} progress={progress} />
        <Transition type={shot.transitions.in} progress={progress} />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1280"
      height="720"
      viewBox="0 0 1280 720"
      className={className ?? 'w-full h-full block select-none'}
      role="img"
      aria-label={`${shot.shotId}: ${shot.title}`}
    >
      <CameraMovement zoom={zoom} panX={panX}>
        <SceneBackground
          style={shot.background.style}
          primaryHex={shot.background.primaryHex}
          secondaryHex={shot.background.secondaryHex}
          paperTexture={shot.background.paperTexture}
        />

        {/* Template-specific architectural/backdrop layer */}
        {shot.templateType === 'diorama_thana_exterior' && (
          <BuildingIllustration kind="thana_exterior" />
        )}
        {shot.templateType === 'diorama_interior_office' && (
          <BuildingIllustration kind="office_interior" />
        )}
        {shot.templateType === 'diorama_classroom_exam' && (
          <BuildingIllustration kind="classroom" />
        )}
        {shot.templateType === 'brand_bumper' && (
          <OnyoAlapLogoBumper progress={enterProgress} />
        )}
        {shot.templateType === 'bangladesh_range_map' && (
          <MapIllustration
            regions={shot.graphics.diagramNodes}
            activeRegion={
              shot.graphics.diagramNodes?.[
                Math.floor(progress * Math.max(1, (shot.graphics.diagramNodes?.length ?? 1) - 0.01))
              ]?.label
            }
          />
        )}
        {shot.templateType === 'rank_tower_comparison' && (
          <RankTowerLadder
            rankIds={shot.graphics.rankIds ?? ['constable', 'naik', 'asi', 'si', 'inspector', 'asp']}
            highlightRankId={shot.graphics.highlightRankId}
            orientation={(shot.graphics.rankIds?.length ?? 0) <= 3 ? 'vertical' : 'horizontal'}
            showPencilPointer={shot.graphics.showPencilPointer ?? true}
            pencilOffset={progress * 140}
          />
        )}
        {shot.templateType === 'epaulette_macro_showcase' && (
          <g transform="translate(520, 120) scale(1.7)">
            <InsigniaIllustration
              rankId={shot.graphics.highlightRankId ?? 'constable'}
              showCardstockSlot
              drawProgress={enterProgress}
            />
          </g>
        )}
        {shot.templateType === 'infographic_dial_counter' && (
          <Infographic
            value={shot.graphics.counterValue ?? '২'}
            label={shot.graphics.counterLabel ?? shot.title}
            x={500}
            y={340}
          />
        )}
        {shot.templateType === 'historical_archive_ledger' && (
          <g>
            <rect x="0" y="0" width="1280" height="720" fill="#E8DCC2" opacity="0.55" />
            <ObjectIllustration kind="open_ledger" x={640} y={420} scale={1.15} />
          </g>
        )}
        {shot.templateType === 'split_comparison' && (
          <g>
            <rect x="60" y="130" width="540" height="440" rx="10" fill="#FAF6EB" stroke="#7B6B55" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="680" y="130" width="540" height="440" rx="10" fill="#FAF6EB" stroke="#16339B" strokeWidth="2" strokeDasharray="6 4" />
            {shot.graphics.diagramNodes && (
              <Diagram nodes={shot.graphics.diagramNodes.slice(0, 4)} x={120} y={240} />
            )}
          </g>
        )}

        {/* Dynamic objects */}
        <AnimationLayer opacity={opacity} offsetY={offsetY}>
          {shot.objects.map((obj) => (
            <ObjectIllustration
              key={obj.id}
              kind={obj.kind}
              x={obj.x}
              y={obj.y}
              scale={obj.scale}
              label={obj.label}
              counterValue={shot.graphics.counterValue}
            />
          ))}

          {/* Hanging placard if provided */}
          {shot.typography.placardText && (
            <HangingSignPlacard
              title={shot.typography.placardText}
              year={shot.typography.placardYear}
              x={940}
              y={38}
              swayDeg={swayDeg}
            />
          )}

          {/* Articulated paper-cutout characters */}
          {shot.characters.map((ch, idx) => (
            <Character
              key={ch.id}
              role={ch.role}
              pose={ch.pose}
              facing={ch.facing}
              x={ch.x}
              y={ch.y}
              scale={ch.scale}
              uniformColor={ch.uniformColor}
              trouserColor={ch.trouserColor}
              animationPhase={(progress * 2 + idx * 0.3) % 1}
            />
          ))}
        </AnimationLayer>
      </CameraMovement>

      {/* Crisp Typography & Caption Overlay */}
      {shot.templateType !== 'brand_bumper' && (
        <Typography
          headline={shot.typography.headline}
          subheadline={shot.typography.subheadline}
          accentColor={shot.typography.accentColor}
        />
      )}
      {showCaption && <Caption text={shot.typography.caption ?? shot.narration} />}
      <Transition type={shot.transitions.in} progress={progress} />
    </svg>
  );
};
