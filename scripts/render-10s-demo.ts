/**
 * Renders the 10-second Onyo Alap demo cut.
 *
 * Pipeline (same as /api/projects/[projectId]/render):
 *   ShotSceneRenderer (React SSR) -> animated SVG frames -> H.264 MP4 + synthesized bed.
 *
 * Usage:
 *   bun scripts/render-10s-demo.ts
 *   FFMPEG=/path/to/ffmpeg bun scripts/render-10s-demo.ts
 *
 * Output: public/renders/onyo-alap-10s-demo.mp4
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ONE_MINUTE_POLICE_SHOTS } from '../lib/one-min-seed';
import { renderShotFrameToSvg } from '../packages/remotion-engine/src/render-shot-svg';

const FPS = 30;
const SAMPLE_FPS = 10; // React keyframes/sec, interpolated to 30fps by ffmpeg
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';

// 10-second edit: brand bumper -> thana veranda -> police jeep arrives
const EDIT = [
  { shot: 'SHOT_001', duration: 2.8 },
  { shot: 'SHOT_002', duration: 4.2 },
  { shot: 'SHOT_003', duration: 3.0 },
];

const root = path.resolve(import.meta.dir, '..');
const workDir = path.join(root, 'renders_tmp', 'onyo-alap-10s');
const frameDir = path.join(workDir, 'frames');
const publicDir = path.join(root, 'public', 'renders');

fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(frameDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

let index = 0;
let cursor = 0;

for (const item of EDIT) {
  const base = ONE_MINUTE_POLICE_SHOTS.find((s) => s.shotId === item.shot);
  if (!base) throw new Error(`Unknown shot: ${item.shot}`);

  const shot = { ...base, startTime: cursor, endTime: cursor + item.duration, duration: item.duration };
  const totalFrames = Math.max(15, Math.round(shot.duration * FPS));
  const sampleCount = Math.round(shot.duration * SAMPLE_FPS);

  for (let i = 0; i < sampleCount; i++) {
    const svg = await renderShotFrameToSvg(
      shot,
      Math.round((i / SAMPLE_FPS) * FPS),
      totalFrames,
      FPS,
      true
    );
    index += 1;
    fs.writeFileSync(path.join(frameDir, `frame_${String(index).padStart(4, '0')}.svg`), svg, 'utf8');
  }
  console.log(`rendered ${shot.shotId}: ${sampleCount} frames (${item.duration.toFixed(2)}s @ ${cursor.toFixed(2)}s)`);
  cursor = Number((cursor + item.duration).toFixed(3));
}

const totalSec = cursor.toFixed(3);
const videoOnly = path.join(workDir, 'video_only.mp4');
const bed = path.join(workDir, 'bed.m4a');
const finalPath = path.join(publicDir, 'onyo-alap-10s-demo.mp4');

const bedExpr =
  '0.045*(0.5+0.5*cos(2*PI*1.6*t))*sin(2*PI*261.63*t)' +
  '+0.03*(0.5+0.5*sin(2*PI*0.8*t))*sin(2*PI*329.63*t)' +
  '+0.02*sin(2*PI*392.00*t)+0.012*sin(2*PI*130.81*t)';

const rustleAt = (sec: number) => Math.round(sec * 1000);

try {
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(SAMPLE_FPS),
    '-i', path.join(frameDir, 'frame_%04d.svg'),
    '-vf', `fps=${FPS},format=yuv420p`, '-t', totalSec,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-movflags', '+faststart', videoOnly]);

  execFileSync(FFMPEG, ['-y', '-loglevel', 'error',
    '-f', 'lavfi', '-i', `aevalsrc=${bedExpr}|${bedExpr}:s=44100:d=${totalSec}`,
    '-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=0.4:amplitude=0.6',
    '-f', 'lavfi', '-i', 'anoisesrc=color=pink:duration=0.4:amplitude=0.6',
    '-filter_complex',
    `[1:a]highpass=f=1000,volume=0.22,adelay=${rustleAt(2.72)}|${rustleAt(2.72)}[n1];` +
    `[2:a]highpass=f=1000,volume=0.22,adelay=${rustleAt(6.92)}|${rustleAt(6.92)}[n2];` +
    `[0:a][n1][n2]amix=inputs=3:duration=first:normalize=0,` +
    `afade=t=in:st=0:d=0.6,afade=t=out:st=9.0:d=1.0[a]`,
    '-map', '[a]', '-c:a', 'aac', '-b:a', '160k', bed]);

  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', videoOnly, '-i', bed,
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
    '-shortest', finalPath]);

  console.log(`DONE -> ${path.relative(root, finalPath)} (${totalSec}s)`);
} catch (err) {
  console.error('ffmpeg not available. SVG frames are in:', frameDir);
  console.error('Set FFMPEG=/path/to/ffmpeg and re-run.');
  process.exitCode = 1;
}
