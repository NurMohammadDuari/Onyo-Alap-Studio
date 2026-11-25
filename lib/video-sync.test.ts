import test from 'node:test';
import assert from 'node:assert/strict';
import { ONE_MINUTE_POLICE_SHOTS } from './one-min-seed';
import { findShotAtTime, formatVideoClock, validateContinuousTimeline } from './video-sync';

test('1-minute storyboard timeline is continuous and sums to exact 60.0s across 12 shots', () => {
  assert.equal(ONE_MINUTE_POLICE_SHOTS.length, 12);
  const check = validateContinuousTimeline(ONE_MINUTE_POLICE_SHOTS, 60.0);
  assert.equal(check.valid, true, check.gaps.join('; '));
  assert.equal(check.totalDuration, 60.0);
});

test('findShotAtTime maps beat timestamps to exact scenes', () => {
  const salute = findShotAtTime(ONE_MINUTE_POLICE_SHOTS, 24.5);
  assert.equal(salute?.shotId, 'SHOT_006');
  const constable = findShotAtTime(ONE_MINUTE_POLICE_SHOTS, 43.0);
  assert.equal(constable?.shotId, 'SHOT_010');
  const endShot = findShotAtTime(ONE_MINUTE_POLICE_SHOTS, 60.0);
  assert.equal(endShot?.shotId, 'SHOT_012');
});

test('formatVideoClock formats sub-minute and minute timestamps consistently', () => {
  assert.equal(formatVideoClock(0), '00:00.0');
  assert.equal(formatVideoClock(23.2), '00:23.2');
  assert.equal(formatVideoClock(60), '01:00.0');
});
