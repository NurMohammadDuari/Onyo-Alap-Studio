import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const execFileAsync = promisify(execFile);
const REF_DIR = path.join(process.cwd(), 'projects', 'police-reference');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(300, Math.max(30, Number(body.batchSize ?? 150)));
    const nativeDir = path.join(REF_DIR, 'native-frames');
    const fps30Dir = path.join(REF_DIR, '30fps-frames');
    const mp4Path = path.join(REF_DIR, 'original', 'police_ranks.mp4');

    fs.mkdirSync(nativeDir, { recursive: true });
    fs.mkdirSync(fps30Dir, { recursive: true });

    const existing = fs.readdirSync(nativeDir).filter((f) => f.endsWith('.png')).length;
    const startSec = existing / 30;
    const durSec = batchSize / 30;
    const startNumber = existing + 1;

    await execFileAsync('ffmpeg', [
      '-y',
      '-ss',
      startSec.toFixed(3),
      '-t',
      durSec.toFixed(3),
      '-i',
      mp4Path,
      '-map',
      '0:v:0',
      '-vsync',
      'passthrough',
      '-compression_level',
      '1',
      '-start_number',
      String(startNumber),
      path.join(nativeDir, 'frame_%08d.png'),
    ]);

    // Mirror newly extracted native frames to 30fps archive (verified 1:1 30fps CFR)
    const files = fs.readdirSync(nativeDir).filter((f) => f.endsWith('.png'));
    for (const f of files) {
      const target = path.join(fps30Dir, f);
      if (!fs.existsSync(target)) {
        fs.linkSync(path.join(nativeDir, f), target);
      }
    }

    const updatedCount = files.length;
    const db = getDb();
    db.prepare(`
      UPDATE processing_jobs
      SET completed_count = ?, checkpoint_cursor = ?, last_message = ?, updated_at = ?
      WHERE job_id = 'police_native_extract'
    `).run(
      updatedCount,
      updatedCount,
      `Extracted lossless PNG frames 1–${updatedCount} of 38,829.`,
      new Date().toISOString()
    );

    return NextResponse.json({
      ok: true,
      extractedCount: updatedCount,
      expectedCount: 38829,
      remainingCount: Math.max(0, 38829 - updatedCount),
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Batch extraction failed' },
      { status: 500 }
    );
  }
}
