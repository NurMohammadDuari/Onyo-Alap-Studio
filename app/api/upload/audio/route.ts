import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { NextRequest, NextResponse } from 'next/server';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing audio file field' }, { status: 400 });
    }
    const baseDir = path.resolve(process.cwd(), 'uploads', 'audio');
    fs.mkdirSync(baseDir, { recursive: true });
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.resolve(baseDir, safeName);
    if (!targetPath.startsWith(baseDir + path.sep)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, buf);

    const { stdout } = await execFileAsync('ffprobe', [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      targetPath,
    ]);
    const probe = JSON.parse(stdout);
    const durationSeconds = parseFloat(probe.format?.duration ?? '0');

    return NextResponse.json({
      ok: true,
      audioPath: `uploads/audio/${safeName}`,
      durationSeconds,
      sizeBytes: buf.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Audio upload failed' },
      { status: 500 }
    );
  }
}
