import type { StoryboardShot } from '../packages/shared-types/src/types';

export function formatVideoClock(sec: number): string {
  const clamped = Number.isFinite(sec) ? Math.max(0, sec) : 0;
  const mins = Math.floor(clamped / 60);
  const rem = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${rem.toFixed(1).padStart(4, '0')}`;
}

export function findShotAtTime(shots: StoryboardShot[], timeSec: number): StoryboardShot | null {
  if (shots.length === 0) return null;
  const clamped = Math.max(0, timeSec);
  return (
    shots.find((s) => clamped >= s.startTime && clamped < s.endTime) ??
    shots[shots.length - 1]
  );
}

export function validateContinuousTimeline(shots: StoryboardShot[], targetDurationSec: number): {
  valid: boolean;
  totalDuration: number;
  gaps: string[];
} {
  const gaps: string[] = [];
  let cursor = 0;
  for (const shot of shots) {
    if (Math.abs(shot.startTime - cursor) > 0.01) {
      gaps.push(`${shot.shotId} starts at ${shot.startTime}s expected ${cursor.toFixed(3)}s`);
    }
    if (shot.endTime <= shot.startTime) {
      gaps.push(`${shot.shotId} has invalid range ${shot.startTime}-${shot.endTime}`);
    }
    cursor = shot.endTime;
  }
  const totalDuration = Number(cursor.toFixed(3));
  if (Math.abs(totalDuration - targetDurationSec) > 0.05) {
    gaps.push(`Total duration ${totalDuration}s != target ${targetDurationSec}s`);
  }
  return {
    valid: gaps.length === 0,
    totalDuration,
    gaps,
  };
}
