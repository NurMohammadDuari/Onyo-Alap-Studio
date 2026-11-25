import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAuthorizeFinalRender,
  createRevisedStoryboardVersion,
  transitionApprovalState,
} from './approval-machine';
import type { StoryboardShot, StoryboardVersion } from '../../shared-types/src/types';

function makeShot(id: string, duration = 5): StoryboardShot {
  return {
    shotId: id,
    sceneId: 'SCENE_01',
    order: 1,
    title: 'Opening Thana Diorama',
    startTime: 0,
    endTime: duration,
    duration,
    narration: 'মনে করেন একটা কাজে থানায় গেছেন।',
    scenePurpose: 'Hook viewer with scenario',
    visualObjective: 'Establish Thana diorama',
    templateType: 'diorama_thana_exterior',
    mainSubject: 'Thana Verandah',
    secondaryElements: ['Krishnachura tree'],
    background: { style: 'Paper sky', primaryHex: '#A9CDD6', secondaryHex: '#E5D79F', paperTexture: true },
    foreground: 'Out-of-focus railing',
    characters: [],
    objects: [],
    typography: { accentColor: '#D81919' },
    graphics: {},
    composition: { focalAnchor: 'center', depthLayers: 4 },
    camera: { movement: 'push_in', zoomStart: 1, zoomEnd: 1.08, panXStart: 0, panXEnd: 0 },
    animation: { entranceStyle: 'paper_drop', speedMultiplier: 1, easing: 'easeOut' },
    transitions: { in: 'fade_black', out: 'cut' },
    sfx: [],
    music: { mood: 'curious_investigative', bpm: 92, volumeDb: -18 },
    continuityNotes: 'Match day lighting',
    reactComponents: ['SceneBackground', 'BuildingIllustration'],
    assetDependencies: [],
  };
}

test('blocks final render until explicit user approval on latest version', () => {
  assert.equal(
    canAuthorizeFinalRender({
      approvalState: 'READY_FOR_APPROVAL',
      currentStoryboardVersion: 1,
      approvedVersionNumber: null,
    }).allowed,
    false
  );

  assert.equal(
    canAuthorizeFinalRender({
      approvalState: 'USER_APPROVED',
      currentStoryboardVersion: 2,
      approvedVersionNumber: 1,
    }).allowed,
    false
  );

  assert.equal(
    canAuthorizeFinalRender({
      approvalState: 'USER_APPROVED',
      currentStoryboardVersion: 2,
      approvedVersionNumber: 2,
    }).allowed,
    true
  );
});

test('editing an approved storyboard invalidates approval and recomputes shot timing', () => {
  const v1: StoryboardVersion = {
    versionId: 'proj_v1',
    projectId: 'proj',
    versionNumber: 1,
    createdAt: '2026-11-23T00:00:00Z',
    createdBy: 'ai_director',
    changeSummary: 'Initial AI Director draft',
    approvalState: 'USER_APPROVED',
    shots: [makeShot('SHOT_01', 4), makeShot('SHOT_02', 6)],
    totalDurationSeconds: 10,
  };

  const { newVersion, invalidatedPreviousApproval } = createRevisedStoryboardVersion({
    previousVersion: v1,
    updatedShots: [makeShot('SHOT_01', 5.5), makeShot('SHOT_02', 6)],
    changeSummary: 'Extended opening shot duration',
    createdBy: 'user_edit',
  });

  assert.equal(invalidatedPreviousApproval, true);
  assert.equal(newVersion.versionNumber, 2);
  assert.equal(newVersion.approvalState, 'READY_FOR_APPROVAL');
  assert.equal(newVersion.shots[0].startTime, 0);
  assert.equal(newVersion.shots[0].endTime, 5.5);
  assert.equal(newVersion.shots[1].startTime, 5.5);
  assert.equal(newVersion.shots[1].endTime, 11.5);
  assert.equal(newVersion.totalDurationSeconds, 11.5);
});

test('rejects invalid state transitions', () => {
  assert.throws(() => transitionApprovalState('DRAFT', 'FINAL_RENDER_AUTHORIZED'));
  assert.equal(transitionApprovalState('USER_APPROVED', 'FINAL_RENDER_AUTHORIZED'), 'FINAL_RENDER_AUTHORIZED');
});
