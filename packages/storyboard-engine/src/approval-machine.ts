import type { ApprovalState, StoryboardShot, StoryboardVersion } from '../../shared-types/src/types';

export const ALLOWED_TRANSITIONS: Record<ApprovalState, ApprovalState[]> = {
  DRAFT: ['STORYBOARD_GENERATION'],
  STORYBOARD_GENERATION: ['STORYBOARD_READY', 'DRAFT'],
  STORYBOARD_READY: ['AWAITING_USER_REVIEW', 'READY_FOR_APPROVAL'],
  AWAITING_USER_REVIEW: ['CHANGES_REQUESTED', 'READY_FOR_APPROVAL', 'USER_APPROVED'],
  CHANGES_REQUESTED: ['REGENERATING', 'READY_FOR_APPROVAL'],
  REGENERATING: ['READY_FOR_APPROVAL', 'AWAITING_USER_REVIEW'],
  READY_FOR_APPROVAL: ['USER_APPROVED', 'CHANGES_REQUESTED'],
  USER_APPROVED: ['FINAL_RENDER_AUTHORIZED', 'CHANGES_REQUESTED'],
  FINAL_RENDER_AUTHORIZED: ['CHANGES_REQUESTED'],
};

export function transitionApprovalState(current: ApprovalState, next: ApprovalState): ApprovalState {
  if (current === next) return current;
  const valid = ALLOWED_TRANSITIONS[current] ?? [];
  if (!valid.includes(next)) {
    throw new Error(`Invalid approval transition from ${current} to ${next}`);
  }
  return next;
}

export function canAuthorizeFinalRender(params: {
  approvalState: ApprovalState;
  currentStoryboardVersion: number;
  approvedVersionNumber: number | null;
}): { allowed: boolean; reason?: string } {
  const { approvalState, currentStoryboardVersion, approvedVersionNumber } = params;
  if (approvalState !== 'USER_APPROVED' && approvalState !== 'FINAL_RENDER_AUTHORIZED') {
    return {
      allowed: false,
      reason: `Render locked: storyboard is currently in ${approvalState}. Explicit user approval is required.`,
    };
  }
  if (approvedVersionNumber === null || approvedVersionNumber !== currentStoryboardVersion) {
    return {
      allowed: false,
      reason: `Render locked: latest storyboard v${currentStoryboardVersion} has not been approved (approved version: ${approvedVersionNumber ?? 'none'}).`,
    };
  }
  return { allowed: true };
}

export function createRevisedStoryboardVersion(params: {
  previousVersion: StoryboardVersion;
  updatedShots: StoryboardShot[];
  changeSummary: string;
  createdBy: 'ai_director' | 'user_edit';
}): {
  newVersion: StoryboardVersion;
  invalidatedPreviousApproval: boolean;
} {
  const { previousVersion, updatedShots, changeSummary, createdBy } = params;
  const reorderedShots = recomputeShotTimeline(updatedShots);
  const totalDurationSeconds = Number(
    reorderedShots.reduce((acc, s) => acc + s.duration, 0).toFixed(3)
  );
  const wasApproved =
    previousVersion.approvalState === 'USER_APPROVED' ||
    previousVersion.approvalState === 'FINAL_RENDER_AUTHORIZED';

  return {
    newVersion: {
      versionId: `${previousVersion.projectId}_v${previousVersion.versionNumber + 1}`,
      projectId: previousVersion.projectId,
      versionNumber: previousVersion.versionNumber + 1,
      createdAt: new Date().toISOString(),
      createdBy,
      changeSummary,
      approvalState: 'READY_FOR_APPROVAL',
      shots: reorderedShots,
      totalDurationSeconds,
    },
    invalidatedPreviousApproval: wasApproved,
  };
}

export function recomputeShotTimeline(shots: StoryboardShot[]): StoryboardShot[] {
  let cursor = 0;
  return shots.map((shot, idx) => {
    const duration = Number(Math.max(0.5, shot.duration).toFixed(3));
    const startTime = Number(cursor.toFixed(3));
    const endTime = Number((cursor + duration).toFixed(3));
    cursor = endTime;
    return {
      ...shot,
      order: idx + 1,
      startTime,
      endTime,
      duration,
    };
  });
}
