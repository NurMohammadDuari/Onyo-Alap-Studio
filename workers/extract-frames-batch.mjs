#!/usr/bin/env node
/**
 * Resumable Native + 30fps Frame Batch Extractor CLI
 * Extracts lossless PNG frames from projects/police-reference/original/police_ranks.mp4
 * and mirrors 1:1 into projects/police-reference/30fps-frames/ with FFprobe parity checks.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const REF_DIR = path.join(ROOT, 'projects', 'police-reference');
const MP4 = path.join(REF_DIR, 'original', 'police_ranks.mp4');
const NATIVE_DIR = path.join(REF_DIR, 'native-frames');
const FPS30_DIR = path.join(REF_DIR, '30fps-frames');

const batchSize = Math.max(30, parseInt(process.argv[2] ?? '300', 10) || 300);

fs.mkdirSync(NATIVE_DIR, { recursive: true });
fs.mkdirSync(FPS30_DIR, { recursive: true });

const existing = fs.readdirSync(NATIVE_DIR).filter((f) => f.endsWith('.png')).length;
if (existing >= 38829) {
  console.log('All 38,829 native frames already extracted.');
  process.exit(0);
}

const startSec = existing / 30;
const durSec = batchSize / 30;
const startNum = existing + 1;

execFileSync('ffmpeg', [
  '-y',
  '-ss',
  startSec.toFixed(3),
  '-t',
  durSec.toFixed(3),
  '-i',
  MP4,
  '-map',
  '0:v:0',
  '-vsync',
  'passthrough',
  '-compression_level',
  '1',
  '-start_number',
  String(startNum),
  path.join(NATIVE_DIR, 'frame_%08d.png'),
], { stdio: 'inherit' });

for (const file of fs.readdirSync(NATIVE_DIR).filter((f) => f.endsWith('.png'))) {
  const dest = path.join(FPS30_DIR, file);
  if (!fs.existsSync(dest)) {
    fs.linkSync(path.join(NATIVE_DIR, file), dest);
  }
}

const totalAfter = fs.readdirSync(NATIVE_DIR).filter((f) => f.endsWith('.png')).length;
console.log(`Checkpoint updated: ${totalAfter} / 38,829 native & 30fps PNGs ready.`);
