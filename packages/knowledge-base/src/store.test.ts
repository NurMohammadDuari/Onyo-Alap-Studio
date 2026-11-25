import test from 'node:test';
import assert from 'node:assert/strict';
import { searchVisualKnowledge } from './store';

test('retrieves relevant Visual DNA entries with source frame IDs and timestamps', () => {
  const titleHits = searchVisualKnowledge('logo');
  assert.ok(titleHits.length >= 1);
  assert.equal(titleHits[0].sourceFrameId, 'FRAME_00001800');
  assert.equal(titleHits[0].timestampSeconds, 60.0);

  const hierarchyHits = searchVisualKnowledge('hierarchy');
  assert.ok(hierarchyHits.some((h) => h.reactComponent === 'RankTowerLadder'));

  const filtered = searchVisualKnowledge('', 'character_rig');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].reactComponent, 'Character');
});
