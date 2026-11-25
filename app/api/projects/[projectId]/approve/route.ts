import { NextRequest, NextResponse } from 'next/server';
import { approveStoryboardVersion, getLatestStoryboard, getProject, listApprovalHistory } from '../../../../../lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const project = getProject(projectId);
    const latest = getLatestStoryboard(projectId);
    if (!project || !latest) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedVersion = Number(body.versionNumber ?? latest.versionNumber);

    const updated = approveStoryboardVersion(projectId, requestedVersion);
    return NextResponse.json({
      ok: true,
      project: updated,
      latestStoryboard: getLatestStoryboard(projectId),
      approvalHistory: listApprovalHistory(projectId),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Approval failed' },
      { status: 400 }
    );
  }
}
