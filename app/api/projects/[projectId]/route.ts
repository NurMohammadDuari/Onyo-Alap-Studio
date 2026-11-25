import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestStoryboard,
  getProject,
  listApprovalHistory,
  listStoryboardVersions,
  saveNewStoryboardVersion,
} from '../../../../lib/db';
import { createRevisedStoryboardVersion } from '../../../../packages/storyboard-engine/src/approval-machine';
import { StoryboardShotSchema } from '../../../../packages/schemas/src/index';
import type { StoryboardShot } from '../../../../packages/shared-types/src/types';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params;
  const project = getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  const latestStoryboard = getLatestStoryboard(projectId);
  const versions = listStoryboardVersions(projectId);
  const approvalHistory = listApprovalHistory(projectId);

  return NextResponse.json({
    project,
    latestStoryboard,
    versions,
    approvalHistory,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const project = getProject(projectId);
    const latest = getLatestStoryboard(projectId);
    if (!project || !latest) {
      return NextResponse.json({ error: 'Project or storyboard not found' }, { status: 404 });
    }

    const body = await req.json();
    const action = String(body.action ?? 'update_shot');
    let nextShots: StoryboardShot[] = [...latest.shots];
    let changeSummary = String(body.changeSummary ?? 'Updated storyboard');

    if (action === 'update_shot') {
      const shotId = String(body.shotId);
      const patch = body.patch as Partial<StoryboardShot>;
      const idx = nextShots.findIndex((s) => s.shotId === shotId);
      if (idx === -1) {
        return NextResponse.json({ error: `Shot ${shotId} not found` }, { status: 404 });
      }
      const merged: StoryboardShot = {
        ...nextShots[idx],
        ...patch,
        background: { ...nextShots[idx].background, ...(patch.background ?? {}) },
        typography: { ...nextShots[idx].typography, ...(patch.typography ?? {}) },
        graphics: { ...nextShots[idx].graphics, ...(patch.graphics ?? {}) },
        camera: { ...nextShots[idx].camera, ...(patch.camera ?? {}) },
        animation: { ...nextShots[idx].animation, ...(patch.animation ?? {}) },
        transitions: { ...nextShots[idx].transitions, ...(patch.transitions ?? {}) },
      };
      StoryboardShotSchema.parse(merged);
      nextShots[idx] = merged;
      changeSummary = body.changeSummary || `Edited ${shotId} (${merged.title})`;
    } else if (action === 'delete_shot') {
      const shotId = String(body.shotId);
      if (nextShots.length <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only remaining shot' }, { status: 400 });
      }
      nextShots = nextShots.filter((s) => s.shotId !== shotId);
      changeSummary = `Deleted shot ${shotId}`;
    } else if (action === 'add_shot') {
      const base = nextShots[nextShots.length - 1];
      const newNum = nextShots.length + 1;
      const newShot: StoryboardShot = {
        ...base,
        shotId: `SHOT_${String(Date.now()).slice(-4)}`,
        order: newNum,
        title: String(body.title ?? 'নতুন দৃশ্য'),
        narration: String(body.narration ?? 'নতুন দৃশ্যের বর্ণনা এখানে যুক্ত করুন।'),
        duration: Number(body.duration ?? 5),
      };
      nextShots.push(newShot);
      changeSummary = `Added shot ${newShot.shotId}`;
    } else if (action === 'move_shot') {
      const shotId = String(body.shotId);
      const direction = body.direction === 'up' ? -1 : 1;
      const idx = nextShots.findIndex((s) => s.shotId === shotId);
      const swapIdx = idx + direction;
      if (idx !== -1 && swapIdx >= 0 && swapIdx < nextShots.length) {
        const tmp = nextShots[idx];
        nextShots[idx] = nextShots[swapIdx];
        nextShots[swapIdx] = tmp;
        changeSummary = `Moved ${shotId} ${direction < 0 ? 'earlier' : 'later'}`;
      }
    }

    const { newVersion, invalidatedPreviousApproval } = createRevisedStoryboardVersion({
      previousVersion: latest,
      updatedShots: nextShots,
      changeSummary,
      createdBy: 'user_edit',
    });

    saveNewStoryboardVersion({
      projectId,
      newVersion,
      invalidatedPreviousApproval,
      previousState: project.approvalState,
    });

    return NextResponse.json({
      project: getProject(projectId),
      latestStoryboard: newVersion,
      versions: listStoryboardVersions(projectId),
      approvalHistory: listApprovalHistory(projectId),
      invalidatedPreviousApproval,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update storyboard' },
      { status: 400 }
    );
  }
}
