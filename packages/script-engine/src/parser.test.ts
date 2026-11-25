import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScriptInput } from './parser';

test('parses bracketed timestamp range format accurately', () => {
  const input = `[00:00:00.000 - 00:00:06.500]\nমনে করেন একটা কাজে থানায় গেছেন।\n[00:00:06.500 - 00:00:14.000]\nবারান্দায় দাঁড়িয়ে কথা বলছেন।`;
  const res = parseScriptInput(input, 14.0);
  assert.equal(res.detectedFormat, 'bracket_range');
  assert.equal(res.timingIsEstimated, false);
  assert.equal(res.segments.length, 2);
  assert.equal(res.segments[0].duration, 6.5);
  assert.equal(res.segments[1].startTime, 6.5);
  assert.equal(res.discrepancies.length, 0);
});

test('parses inline MM:SS raw transcript and detects audio discrepancy', () => {
  const input = `00:01 - মনে করেন একটা কাজে থানায় গেছেন। 00:04 - বারান্দায় দাঁড়িয়ে কথা বলছেন। 00:09 - জিপ থামল।`;
  const res = parseScriptInput(input, 30.0);
  assert.equal(res.detectedFormat, 'inline_mmss');
  assert.equal(res.segments.length, 3);
  assert.equal(res.segments[0].startTime, 1);
  assert.equal(res.segments[1].startTime, 4);
  assert.equal(res.language, 'bn');
});

test('marks plain prose without timestamps as estimated', () => {
  const res = parseScriptInput('Bangladesh has sixty-four districts. Each district has a Police Super.');
  assert.equal(res.detectedFormat, 'plain_prose');
  assert.equal(res.timingIsEstimated, true);
  assert.equal(res.language, 'en');
  assert.equal(res.segments.length, 2);
  assert.ok(res.discrepancies[0].includes('estimated'));
});
