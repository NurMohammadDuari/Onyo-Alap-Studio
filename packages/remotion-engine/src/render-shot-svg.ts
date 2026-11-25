import React from 'react';
import type { StoryboardShot } from '../../shared-types/src/types';
import { ShotSceneRenderer } from './ShotSceneRenderer';

export async function renderShotFrameToSvg(
  shot: StoryboardShot,
  localFrame: number,
  totalFrames: number,
  fps = 30,
  showCaption = true
): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const markup = renderToStaticMarkup(
    React.createElement(ShotSceneRenderer, {
      shot,
      localFrame,
      totalFrames,
      fps,
      showCaption,
    })
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}
