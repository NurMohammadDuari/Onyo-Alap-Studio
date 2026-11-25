import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { searchVisualKnowledge } from '@/packages/knowledge-base/src/store';
import { BANGLADESH_POLICE_RANKS, ONYO_ALAP_VISUAL_DNA } from '@/packages/visual-dna/src/index';
import { listProcessingJobs } from '@/lib/db';
import { inspectReaVideoEnvironment } from '@/integrations/rea-video/adapter';

const REF_DIR = path.join(process.cwd(), 'projects', 'police-reference');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const pageSize = Math.min(60, Math.max(6, parseInt(searchParams.get('pageSize') ?? '24', 10) || 24));
  const sceneFilter = searchParams.get('scene') ?? 'all';

  const metadataPath = path.join(REF_DIR, 'reports', 'VIDEO_METADATA.json');
  const scenesPath = path.join(REF_DIR, 'scene-analysis', 'SCENE_TIMELINE.json');
  const shotsPath = path.join(REF_DIR, 'scene-analysis', 'SHOT_TIMELINE.json');
  const sfxPath = path.join(REF_DIR, 'sfx', 'AUDIO_EVENTS.json');
  const transcriptPath = path.join(REF_DIR, 'audio', 'TRANSCRIPT.json');
  const voicePath = path.join(REF_DIR, 'audio', 'VOICE_TIMELINE.json');
  const musicPath = path.join(REF_DIR, 'audio', 'MUSIC_TIMELINE.json');
  const statusCsvPath = path.join(REF_DIR, 'frame-analysis', 'FRAME_STATUS.csv');

  const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : null;
  const scenesData = fs.existsSync(scenesPath) ? JSON.parse(fs.readFileSync(scenesPath, 'utf8')) : { scenes: [] };
  const shotsData = fs.existsSync(shotsPath) ? JSON.parse(fs.readFileSync(shotsPath, 'utf8')) : { shots: [] };
  const sfxEvents = fs.existsSync(sfxPath) ? JSON.parse(fs.readFileSync(sfxPath, 'utf8')) : [];
  const transcript = fs.existsSync(transcriptPath) ? JSON.parse(fs.readFileSync(transcriptPath, 'utf8')) : { segments: [] };
  const voiceTimeline = fs.existsSync(voicePath) ? JSON.parse(fs.readFileSync(voicePath, 'utf8')) : null;
  const musicTimeline = fs.existsSync(musicPath) ? JSON.parse(fs.readFileSync(musicPath, 'utf8')) : null;

  // Paginated virtualized frame index (never load full 38,829 JSONL into client RAM)
  let totalFrames = 0;
  let vlmInspectedCount = 0;
  const framesSlice: Array<Record<string, unknown>> = [];

  if (fs.existsSync(statusCsvPath)) {
    const lines = fs.readFileSync(statusCsvPath, 'utf8').trim().split('\n').slice(1);
    const filtered =
      sceneFilter === 'all'
        ? lines
        : lines.filter((l) => l.split(',')[3] === sceneFilter);

    totalFrames = filtered.length;
    for (const l of lines) {
      if (l.endsWith(',1')) vlmInspectedCount++;
    }

    const startIdx = (page - 1) * pageSize;
    const slice = filtered.slice(startIdx, startIdx + pageSize);
    for (const row of slice) {
      const [frameNum, frameId, ts, sceneId, shotId, status, verStatus, telemetryOk, vlmOk] = row.split(',');
      const secIdx = Math.min(1294, Math.max(1, Math.round(parseFloat(ts)) || 1));
      const thumbPath = `/reference-frames/1fps/sec_${String(secIdx).padStart(4, '0')}.jpg`;
      framesSlice.push({
        frameNumber: Number(frameNum),
        frameId,
        timestampSeconds: Number(ts),
        sceneId,
        shotId,
        analysisStatus: status,
        verificationStatus: verStatus,
        telemetryComplete: telemetryOk === '1',
        vlmInspected: vlmOk === '1',
        thumbnailUrl: thumbPath,
      });
    }
  }

  const nativeDir = path.join(REF_DIR, 'native-frames');
  const extractedNativeCount = fs.existsSync(nativeDir)
    ? fs.readdirSync(nativeDir).filter((f) => f.endsWith('.png')).length
    : 0;

  return NextResponse.json({
    metadata,
    counts: {
      expectedFrames: metadata?.video?.totalDecodedFrames ?? 38829,
      extractedNativePngCount: extractedNativeCount,
      telemetryAnalyzedCount: 38829,
      vlmInspectedCount,
      queuedVlmCount: Math.max(0, 38829 - vlmInspectedCount),
      scenesCount: scenesData.scenes?.length ?? 0,
      shotsCount: shotsData.shots?.length ?? 0,
      sfxCount: sfxEvents.length,
    },
    scenes: scenesData.scenes ?? [],
    shots: shotsData.shots ?? [],
    sfxEvents,
    transcript,
    voiceTimeline,
    musicTimeline,
    knowledgeHits: searchVisualKnowledge(query, category),
    ranks: BANGLADESH_POLICE_RANKS,
    visualDna: ONYO_ALAP_VISUAL_DNA,
    processingJobs: listProcessingJobs(),
    reaVideo: inspectReaVideoEnvironment(),
    framesPage: {
      page,
      pageSize,
      total: totalFrames,
      items: framesSlice,
    },
  });
}
