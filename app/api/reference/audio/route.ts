import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';

const AUDIO_PATH = path.resolve(
  process.cwd(),
  'projects',
  'police-reference',
  'audio',
  'original_audio.aac'
);

export async function GET(req: NextRequest) {
  if (!fs.existsSync(AUDIO_PATH)) {
    return NextResponse.json({ error: 'Reference audio file not found' }, { status: 404 });
  }

  const stat = fs.statSync(AUDIO_PATH);
  const total = stat.size;
  const range = req.headers.get('range');

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    const start = match ? parseInt(match[1], 10) : 0;
    const end = match && match[2] ? Math.min(total - 1, parseInt(match[2], 10)) : total - 1;
    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(AUDIO_PATH, { start, end });
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': 'audio/aac',
      },
    });
  }

  const data = fs.readFileSync(AUDIO_PATH);
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Length': String(total),
      'Accept-Ranges': 'bytes',
      'Content-Type': 'audio/aac',
    },
  });
}
