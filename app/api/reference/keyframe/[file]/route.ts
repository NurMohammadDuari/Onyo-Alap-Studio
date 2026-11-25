import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

const SAMPLE_DIR = path.join(process.cwd(), 'projects', 'police-reference', 'assets', 'sample_inspect');

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ file: string }> }
) {
  const { file } = await context.params;
  if (!/^t_\d+\.png$/.test(file)) {
    return NextResponse.json({ error: 'Invalid keyframe filename' }, { status: 400 });
  }

  const target = path.resolve(SAMPLE_DIR, file);
  if (!target.startsWith(SAMPLE_DIR + path.sep) || !fs.existsSync(target)) {
    return NextResponse.json({ error: 'Keyframe not found' }, { status: 404 });
  }

  const buf = fs.readFileSync(target);
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
