/**
 * Headless renderer for the cinematic 3D+2D diorama.
 *
 *   bun scripts/render-cinematic-3d.mjs                 # full 10s, 1920x1080, 30fps
 *   bun scripts/render-cinematic-3d.mjs --stills 1,5,8  # preview stills at 960x540
 *   bun scripts/render-cinematic-3d.mjs --frames 0:120  # render a frame range only
 *   bun scripts/render-cinematic-3d.mjs --encode        # grade + mux only
 *
 * Rendering is chunked: a fresh headless Chrome every CHUNK frames, because
 * long SwiftShader sessions crash with "Target closed". Existing frames are
 * skipped, so an interrupted render resumes where it stopped.
 *
 * Requirements: Google Chrome, ffmpeg, `bun install three puppeteer-core`.
 * Build the bundle first:  bun build packages/cinematic-engine/src/three-scene.js \
 *                            --outfile packages/cinematic-engine/src/bundle.js --target browser
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ENGINE = path.join(ROOT, 'packages/cinematic-engine/src');
const WORK = path.join(ROOT, 'renders_tmp/onyo-alap-10s-3d');
const PUBLIC = path.join(ROOT, 'public/renders');
const FPS = 30;
const DURATION = 10;
const TOTAL = FPS * DURATION;
const CHUNK = Number(process.env.CHUNK ?? 40);
const CHROME = process.env.CHROME ?? '/usr/bin/google-chrome';
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';

const args = process.argv.slice(2);
const stillsIdx = args.indexOf('--stills');
const stills = stillsIdx >= 0 ? args[stillsIdx + 1].split(',').map(Number) : null;
const framesIdx = args.indexOf('--frames');
const range = framesIdx >= 0 ? args[framesIdx + 1].split(':').map(Number) : null;
const encodeOnly = args.includes('--encode');
const W = stills ? 960 : 1920;
const H = stills ? 540 : 1080;

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });
const framesDir = path.join(WORK, 'frames');
fs.mkdirSync(framesDir, { recursive: true });

const framePath = (i) => path.join(framesDir, `f_${String(i + 1).padStart(4, '0')}.png`);

async function launch() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    protocolTimeout: 180000,
    args: [
      '--no-sandbox', '--disable-dev-shm-usage',
      '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--disable-gpu-sandbox', '--allow-file-access-from-files',
      '--force-device-scale-factor=1', '--hide-scrollbars', '--mute-audio',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGEERROR:', e.message));
  await page.goto(`file://${path.join(ENGINE, 'index.html')}?w=${W}&h=${H}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 90000, polling: 250 });
  return { browser, page };
}

if (stills) {
  const { browser, page } = await launch();
  for (const t of stills) {
    await page.evaluate((tt) => window.renderAt(tt), t);
    const file = path.join(WORK, `still_${t.toFixed(2)}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H }, captureBeyondViewport: false });
    console.log('wrote', file);
  }
  await browser.close();
  process.exit(0);
}

if (!encodeOnly) {
  const from = range ? range[0] : 0;
  const to = range ? range[1] : TOTAL;
  const t0 = Date.now();
  let done = 0;
  for (let start = from; start < to; start += CHUNK) {
    const end = Math.min(start + CHUNK, to);
    const pending = [];
    for (let i = start; i < end; i++) if (!fs.existsSync(framePath(i))) pending.push(i);
    if (!pending.length) continue;

    let attempt = 0;
    while (attempt < 3) {
      attempt++;
      let session;
      try {
        session = await launch();
        for (const i of pending) {
          if (fs.existsSync(framePath(i))) continue;
          await session.page.evaluate((tt) => window.renderAt(tt), i / FPS);
          await session.page.screenshot({
            path: framePath(i), clip: { x: 0, y: 0, width: W, height: H }, captureBeyondViewport: false,
          });
          done++;
        }
        await session.browser.close();
        console.log(`chunk ${start}-${end - 1} ok  (${done} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
        break;
      } catch (err) {
        console.error(`chunk ${start}-${end - 1} attempt ${attempt} failed:`, err.message);
        try { await session?.browser.close(); } catch {}
      }
    }
  }
  console.log(`rendered ${done} new frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// ---------------------------------------------------------------- grade
const score = fs.existsSync(path.join(WORK, 'score.wav')) ? path.join(WORK, 'score.wav') : null;
const videoOnly = path.join(WORK, 'video_only.mp4');
const finalPath = path.join(PUBLIC, 'onyo-alap-10s-cinematic.mp4');

// tilt-shift band -> bloom -> warm film curves -> vignette -> grain -> sharpen
const GRADE =
  "[0:v]split=3[base][b1][b2];" +
  "[b1]gblur=sigma=8[blur];" +
  "[base][blur]blend=all_expr='A*(1-clip((abs(Y-H*0.50)-H*0.16)/(H*0.30),0,1))+B*clip((abs(Y-H*0.50)-H*0.16)/(H*0.30),0,1)'[dof];" +
  "[b2]gblur=sigma=18,eq=brightness=0.04[glow];" +
  "[dof][glow]blend=all_mode=screen:all_opacity=0.10[bloom];" +
  "[bloom]eq=contrast=1.06:saturation=1.20:brightness=0.02," +
  "curves=r='0/0.02 0.5/0.53 1/1.00':g='0/0.01 0.5/0.51 1/0.98':b='0/0.03 0.5/0.47 1/0.94'," +
  "vignette=PI/8,noise=alls=4:allf=t+u,unsharp=5:5:0.28[out]";

execFileSync(FFMPEG, [
  '-y', '-loglevel', 'error', '-framerate', String(FPS),
  '-i', path.join(framesDir, 'f_%04d.png'),
  '-filter_complex', GRADE,
  '-map', '[out]', '-t', String(DURATION), '-r', String(FPS),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', videoOnly,
], { stdio: 'inherit' });

if (score) {
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error', '-i', videoOnly, '-i', score,
    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', finalPath,
  ], { stdio: 'inherit' });
} else {
  fs.copyFileSync(videoOnly, finalPath);
}
console.log('DONE ->', path.relative(ROOT, finalPath));
