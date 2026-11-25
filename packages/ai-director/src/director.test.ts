import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDeterministicProductionPlan } from './director';
import { parseScriptInput } from '../../script-engine/src/parser';

test('deterministic AI director maps Bengali police narration into Visual DNA templates', () => {
  const script = `[00:00:00.000 - 00:00:05.000]
আসসালামু আলাইকুম। আজকের অন্য আলাপে স্বাগতম।
[00:00:05.000 - 00:00:11.000]
থানার বারান্দায় এসে থামল একটা পুলিশ জিপ, স্যালুট দিলেন সিনিয়র কর্মকর্তা।
[00:00:11.000 - 00:00:17.000]
প্রথম র্যাঙ্ক কনস্টেবল, ব্যাজে শুধু রুপালি রঙে লেখা একটি শব্দ পুলিশ।
[00:00:17.000 - 00:00:23.000]
১৯০৫ সালের প্রবিধান অনুসারে আটটি বিভাগীয় রেঞ্জের মানচিত্র গঠিত হয়।`;

  const parsed = parseScriptInput(script);
  const shots = buildDeterministicProductionPlan({
    title: 'Test Police Episode',
    segments: parsed.segments,
  });

  assert.equal(shots.length, 4);
  assert.equal(shots[0].templateType, 'brand_bumper');
  assert.equal(shots[1].templateType, 'diorama_thana_exterior');
  assert.equal(shots[2].templateType, 'epaulette_macro_showcase');
  assert.equal(shots[3].templateType, 'bangladesh_range_map');
});
