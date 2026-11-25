'use client';

import React from 'react';
import { Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { StoryboardShot } from '../../shared-types/src/types';
import { ShotSceneRenderer } from './ShotSceneRenderer';

export interface OnyoAlapCompositionProps {
  shots: StoryboardShot[];
  showCaptions?: boolean;
}

const SingleRemotionShot: React.FC<{
  shot: StoryboardShot;
  durationInFrames: number;
  showCaptions: boolean;
}> = ({ shot, durationInFrames, showCaptions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <ShotSceneRenderer
      shot={shot}
      localFrame={frame}
      totalFrames={durationInFrames}
      fps={fps}
      showCaption={showCaptions}
    />
  );
};

export const OnyoAlapComposition: React.FC<OnyoAlapCompositionProps> = ({
  shots,
  showCaptions = true,
}) => {
  const { fps } = useVideoConfig();

  const timelineItems = React.useMemo(() => {
    return shots.reduce<Array<{ shot: StoryboardShot; from: number; durationInFrames: number }>>(
      (acc, shot) => {
        const prev = acc[acc.length - 1];
        const from = prev ? prev.from + prev.durationInFrames : 0;
        const durationInFrames = Math.max(15, Math.round(shot.duration * fps));
        return [...acc, { shot, from, durationInFrames }];
      },
      []
    );
  }, [shots, fps]);

  return (
    <div className="w-full h-full bg-[#041664] relative overflow-hidden">
      {timelineItems.map(({ shot, from, durationInFrames }) => (
        <Sequence key={shot.shotId} from={from} durationInFrames={durationInFrames}>
          <SingleRemotionShot
            shot={shot}
            durationInFrames={durationInFrames}
            showCaptions={showCaptions}
          />
        </Sequence>
      ))}
    </div>
  );
};
