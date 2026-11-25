import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { NextRequest, NextResponse } from 'next/server';
import { getDb, getLatestStoryboard, getProject } from '../../../../../lib/db';
import { canAuthorizeFinalRender } from '../../../../../packages/storyboard-engine/src/approval-machine';
import { renderShotFrameToSvg } from '../../../../../packages/remotion-engine/src/render-shot-svg';

const execFileAsync = promisify(execFile);

const OUTPUT_FPS = 30;
const REACT_KEYFRAME_FPS = 6; // 6 real React SVG frames/sec interpolated cleanly to 30fps MP4

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const project = getProject(projectId);
    const latest = getLatestStoryboard(projectId);
    if (!project || !latest) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const gate = canAuthorizeFinalRender({
      approvalState: project.approvalState,
      currentStoryboardVersion: project.currentStoryboardVersion,
      approvedVersionNumber: project.approvedVersionNumber,
    });

    if (!gate.allowed) {
      return NextResponse.json({ error: gate.reason, gate }, { status: 403 });
    }

    const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const workDir = path.resolve(process.cwd(), 'renders_tmp', safeId);
    const publicDir = path.resolve(process.cwd(), 'public', 'renders');
    fs.rmSync(workDir, { recursive: true, force: true });
    fs.mkdirSync(workDir, { recursive: true });
    fs.mkdirSync(publicDir, { recursive: true });

    const clipList: string[] = new Array(latest.shots.length);
    const CONCURRENCY = 4;

    for (let start = 0; start < latest.shots.length; start += CONCURRENCY) {
      const batch = latest.shots.slice(start, start + CONCURRENCY);
      await Promise.all(
        batch.map(async (shot, offset) => {
          const shotIdx = start + offset;
          const shotDir = path.join(workDir, shot.shotId);
          fs.mkdirSync(shotDir, { recursive: true });

          const sampleCount = Math.max(6, Math.round(shot.duration * REACT_KEYFRAME_FPS));
          const totalOutputFrames = Math.max(15, Math.round(shot.duration * OUTPUT_FPS));

          for (let i = 0; i < sampleCount; i++) {
            const mappedFrame = Math.round((i / Math.max(1, sampleCount - 1)) * (totalOutputFrames - 1));
            const svgContent = await renderShotFrameToSvg(shot, mappedFrame, totalOutputFrames, OUTPUT_FPS, true);
            const svgPath = path.join(shotDir, `frame_${String(i + 1).padStart(4, '0')}.svg`);
            fs.writeFileSync(svgPath, svgContent, 'utf8');
          }

          const clipPath = path.join(workDir, `${shot.shotId}.mp4`);
          const effectiveSampleRate = sampleCount / Math.max(0.5, shot.duration);

          await execFileAsync('ffmpeg', [
            '-y',
            '-framerate',
            effectiveSampleRate.toFixed(4),
            '-i',
            path.join(shotDir, 'frame_%04d.svg'),
            '-vf',
            `scale=1280:720:flags=lanczos,fps=${OUTPUT_FPS},format=yuv420p`,
            '-t',
            shot.duration.toFixed(3),
            '-c:v',
            'libx264',
            '-preset',
            'veryfast',
            '-crf',
            '20',
            '-pix_fmt',
            'yuv420p',
            clipPath,
          ]);
          clipList[shotIdx] = clipPath;
        })
      );
    }

    const concatTxt = path.join(workDir, 'concat.txt');
    fs.writeFileSync(concatTxt, clipList.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'));

    const silentOut = path.join(workDir, 'video_only.mp4');
    await execFileAsync('ffmpeg', [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatTxt,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '20',
      '-pix_fmt',
      'yuv420p',
      silentOut,
    ]);

    const finalName = `${safeId}_v${latest.versionNumber}.mp4`;
    const finalPath = path.join(publicDir, finalName);
    const totalDur = latest.totalDurationSeconds;

    // Mux attached audio if available, otherwise synthesize subtle documentary marimba-like harmonic bed + pulse
    const resolvedAudio = project.audioPath ? path.resolve(process.cwd(), project.audioPath) : null;
    if (resolvedAudio && fs.existsSync(resolvedAudio)) {
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        silentOut,
        '-i',
        resolvedAudio,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-t',
        totalDur.toFixed(3),
        finalPath,
      ]);
    } else {
      // Gentle warm documentary tone bed (comma-free lavfi expression for stereo C4-E4 harmonic pulse at ~96 BPM)
      const beatExpr =
        '0.04*(0.5+0.5*cos(2*PI*1.6*t))*sin(2*PI*261.63*t)+0.028*(0.5+0.5*sin(2*PI*0.8*t))*sin(2*PI*329.63*t)+0.015*sin(2*PI*196.0*t)';
      await execFileAsync('ffmpeg', [
        '-y',
        '-i',
        silentOut,
        '-f',
        'lavfi',
        '-i',
        `aevalsrc=${beatExpr}|${beatExpr}:s=44100:d=${totalDur.toFixed(3)}`,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-shortest',
        finalPath,
      ]);
    }

    // Run real QC checks via ffprobe + blackdetect
    const { stdout: probeOut } = await execFileAsync('ffprobe', [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      finalPath,
    ]);
    const probe = JSON.parse(probeOut);

    const { stderr: blackErr } = await execFileAsync('ffmpeg', [
      '-i',
      finalPath,
      '-vf',
      'blackdetect=d=0.2:pix_th=0.10',
      '-f',
      'null',
      '-',
    ]);
    const blackMatches = [...blackErr.matchAll(/black_start:([\d.]+)\s+black_end:([\d.]+)/g)];

    const videoStream = probe.streams?.find((s: { codec_type: string }) => s.codec_type === 'video');
    const audioStream = probe.streams?.find((s: { codec_type: string }) => s.codec_type === 'audio');
    const actualDuration = parseFloat(probe.format?.duration ?? '0');

    const issues: Array<Record<string, unknown>> = [];
    if (blackMatches.length > 0) {
      issues.push({
        issueId: 'QC_BLACK_01',
        sceneId: 'GLOBAL',
        timestamp: blackMatches[0][1],
        severity: 'warning',
        description: `Detected ${blackMatches.length} brief black interval(s)`,
        correction: 'Inspect fade transitions',
        verificationStatus: 'flagged',
      });
    }
    if (Math.abs(actualDuration - totalDur) > 1.5) {
      issues.push({
        issueId: 'QC_DUR_01',
        sceneId: 'GLOBAL',
        timestamp: actualDuration,
        severity: 'warning',
        description: `Rendered duration ${actualDuration.toFixed(2)}s differs from storyboard ${totalDur.toFixed(2)}s`,
        correction: 'Check last clip padding',
        verificationStatus: 'flagged',
      });
    }

    const qaMd = `# FINAL_VIDEO_QA_REPORT — ${project.title}
- Storyboard Version: v${latest.versionNumber} (USER_APPROVED)
- Render Engine: React SSR (ShotSceneRenderer) -> Animated SVG Sequence (${REACT_KEYFRAME_FPS}fps keyframed -> ${OUTPUT_FPS}fps H.264)
- Output File: /renders/${finalName}
- Resolution: ${videoStream?.width}x${videoStream?.height} (${videoStream?.r_frame_rate})
- Duration: ${actualDuration.toFixed(3)}s (Target: ${totalDur.toFixed(3)}s)
- Audio Stream: ${audioStream ? `${audioStream.codec_name} ${audioStream.sample_rate}Hz stereo` : 'MISSING'}
- Black Frame Intervals: ${blackMatches.length}
- Verification Status: ${issues.length === 0 ? 'VERIFIED_COMPLETE' : 'NEEDS_REVIEW'}
`;

    const db = getDb();
    db.prepare(`
      UPDATE projects
      SET approval_state = 'FINAL_RENDER_AUTHORIZED', final_video_path = ?, updated_at = ?
      WHERE project_id = ?
    `).run(`/renders/${finalName}`, new Date().toISOString(), projectId);

    db.prepare(`
      INSERT OR REPLACE INTO qc_reports (report_id, project_id, version_number, status, issues_json, summary_md, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `qc_${safeId}_v${latest.versionNumber}`,
      projectId,
      latest.versionNumber,
      issues.length === 0 ? 'VERIFIED_COMPLETE' : 'NEEDS_REVIEW',
      JSON.stringify(issues),
      qaMd,
      new Date().toISOString()
    );

    return NextResponse.json({
      ok: true,
      videoUrl: `/renders/${finalName}`,
      probe: {
        duration: actualDuration,
        width: videoStream?.width,
        height: videoStream?.height,
        fps: videoStream?.r_frame_rate,
        audioCodec: audioStream?.codec_name,
      },
      issues,
      qaMarkdown: qaMd,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Final render failed' },
      { status: 500 }
    );
  }
}
