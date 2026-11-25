import test from 'node:test';
import assert from 'node:assert/strict';
import { renderShotFrameToSvg } from './render-shot-svg';
import { parseScriptInput } from '../../script-engine/src/parser';
import { buildDeterministicProductionPlan } from '../../ai-director/src/director';
import { ONE_MINUTE_POLICE_SHOTS } from '../../../lib/one-min-seed';

test('renderShotFrameToSvg produces valid XML SVG with Bengali text and Noto Sans Bengali font stack', async () => {
  const parsed = parseScriptInput(
    '00:01 - আসসালামু আলাইকুম, অন্য আলাপ এ স্বাগতম।\n00:05 - থানার বারান্দায় দাঁড়িয়ে অভিজ্ঞ অফিসার ও জিপ থেকে নামা এএসপি স্যালুট দিচ্ছেন।'
  );
  const shots = buildDeterministicProductionPlan({
    projectId: 'ssr-unit-test',
    projectTitle: 'Police Ranks SSR Test',
    segments: parsed.segments,
  });

  assert.ok(shots.length >= 2);
  for (const shot of shots) {
    const svg = await renderShotFrameToSvg(shot, 15, 90, 30, true);
    assert.ok(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('viewBox="0 0 1280 720"'));
    assert.ok(svg.includes('Noto Sans Bengali'));
  }

  const bumperSvg = await renderShotFrameToSvg(shots[0], 30, 90, 30, true);
  assert.ok(bumperSvg.includes('অন্য'));
  assert.ok(bumperSvg.includes('আলাপ'));
});

test('all 12 1-minute reconstruction shots render cleanly via PoliceOneMinScene without NaN', async () => {
  for (const shot of ONE_MINUTE_POLICE_SHOTS) {
    const svg = await renderShotFrameToSvg(shot, 45, 90, 30, false);
    assert.ok(svg.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(!svg.includes('NaN'), `${shot.shotId} rendered NaN`);
    assert.ok(!svg.includes('undefined'), `${shot.shotId} rendered undefined`);
  }
  const thanaSvg = await renderShotFrameToSvg(ONE_MINUTE_POLICE_SHOTS[0], 30, 90, 30, false);
  assert.ok(thanaSvg.includes('থানা'));
  const scaleSvg = await renderShotFrameToSvg(ONE_MINUTE_POLICE_SHOTS[6], 45, 90, 30, false);
  assert.ok(scaleSvg.includes('৯ম গ্রেড'));
  const dialSvg = await renderShotFrameToSvg(ONE_MINUTE_POLICE_SHOTS[10], 45, 90, 30, false);
  assert.ok(dialSvg.includes('চাকরির বছর'));
  const endSvg = await renderShotFrameToSvg(ONE_MINUTE_POLICE_SHOTS[11], 75, 90, 30, false);
  assert.ok(endSvg.includes('অন্য') && endSvg.includes('আলাপ'));
});
