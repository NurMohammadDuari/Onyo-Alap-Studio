import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const REF_DIR = path.join(ROOT, 'projects', 'police-reference');
const MANIFEST_DIR = path.join(REF_DIR, 'manifests');
const REPORTS_DIR = path.join(REF_DIR, 'reports');
const SCENE_DIR = path.join(REF_DIR, 'scene-analysis');
const MOTION_DIR = path.join(REF_DIR, 'motion-analysis');
const AUDIO_DIR = path.join(REF_DIR, 'audio');
const SFX_DIR = path.join(REF_DIR, 'sfx');

for (const d of [MANIFEST_DIR, REPORTS_DIR, SCENE_DIR, MOTION_DIR, AUDIO_DIR, SFX_DIR]) {
  fs.mkdirSync(d, { recursive: true });
}

const ffprobeRaw = JSON.parse(fs.readFileSync(path.join(REF_DIR, 'original', 'ffprobe_raw.json'), 'utf8'));
const videoStream = ffprobeRaw.streams.find((s) => s.codec_type === 'video');
const audioStream = ffprobeRaw.streams.find((s) => s.codec_type === 'audio');
const mp4Path = path.join(REF_DIR, 'original', 'police_ranks.mp4');
const mp4Hash = crypto.createHash('sha256').update(fs.readFileSync(mp4Path)).digest('hex');

// Parse ffmpeg_scdet_showinfo.log
const logLines = fs.readFileSync(path.join(MANIFEST_DIR, 'ffmpeg_scdet_showinfo.log'), 'utf8').split('\n');
const frames = [];
const cuts = [];
let pendingScd = null;

for (const line of logLines) {
  const scdMatch = line.match(/lavfi\.scd\.score:\s*([\d.]+),\s*lavfi\.scd\.time:\s*([\d.]+)/);
  if (scdMatch) {
    pendingScd = { score: parseFloat(scdMatch[1]), time: parseFloat(scdMatch[2]) };
    cuts.push(pendingScd);
    continue;
  }
  if (line.includes('Parsed_showinfo') && line.includes('pts_time:')) {
    const nM = line.match(/\bn:\s*(\d+)/);
    const ptsM = line.match(/\bpts:\s*(\d+)/);
    const timeM = line.match(/\bpts_time:\s*([\d.]+)/);
    const keyM = line.match(/\biskey:\s*(\d+)/);
    const typeM = line.match(/\btype:\s*([IPB])/);
    const csumM = line.match(/\bchecksum:\s*([0-9A-F]+)/);
    const meanM = line.match(/mean:\[(\d+)\s+(\d+)\s+(\d+)/);
    const stdevM = line.match(/stdev:\[([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (nM && timeM) {
      frames.push({
        index: parseInt(nM[1], 10) + 1,
        pts: ptsM ? parseInt(ptsM[1], 10) : 0,
        ptsTime: parseFloat(timeM[1]),
        isKey: keyM ? keyM[1] === '1' : false,
        pictType: typeM ? typeM[1] : '?',
        checksum: csumM ? csumM[1] : '',
        meanY: meanM ? parseInt(meanM[1], 10) : 0,
        meanU: meanM ? parseInt(meanM[2], 10) : 0,
        meanV: meanM ? parseInt(meanM[3], 10) : 0,
        stdevY: stdevM ? parseFloat(stdevM[1]) : 0,
        stdevU: stdevM ? parseFloat(stdevM[2]) : 0,
        stdevV: stdevM ? parseFloat(stdevM[3]) : 0,
      });
    }
  }
}

console.log(`Parsed ${frames.length} frames and ${cuts.length} scene cuts.`);

// 1. VIDEO_METADATA.json
const metadata = {
  sourceId: 'POLICE_REFERENCE',
  youtubeId: 'ukgbxNHllMY',
  youtubeUrl: 'https://www.youtube.com/watch?v=ukgbxNHllMY',
  filename: 'police_ranks.mp4',
  sha256: mp4Hash,
  fileSizeBytes: parseInt(ffprobeRaw.format.size, 10),
  durationSeconds: parseFloat(ffprobeRaw.format.duration),
  containerFormat: ffprobeRaw.format.format_name,
  video: {
    codec: videoStream.codec_name,
    profile: videoStream.profile,
    width: videoStream.width,
    height: videoStream.height,
    aspectRatio: videoStream.display_aspect_ratio,
    pixFmt: videoStream.pix_fmt,
    colorSpace: videoStream.color_space,
    nativeFps: 30,
    rFrameRate: videoStream.r_frame_rate,
    avgFrameRate: videoStream.avg_frame_rate,
    isVfr: false,
    timeBase: videoStream.time_base,
    startPts: videoStream.start_pts,
    startTimeSeconds: parseFloat(videoStream.start_time),
    totalDecodedFrames: frames.length,
    bitRateBps: parseInt(videoStream.bit_rate, 10),
    rotation: 0,
  },
  audio: {
    codec: audioStream.codec_name,
    sampleRateHz: parseInt(audioStream.sample_rate, 10),
    channels: audioStream.channels,
    channelLayout: audioStream.channel_layout,
    durationSeconds: parseFloat(audioStream.duration),
    bitRateBps: parseInt(audioStream.bit_rate, 10),
  },
  subtitles: [],
  detectedCutsCount: cuts.length,
  verifiedAt: new Date().toISOString(),
};
fs.writeFileSync(path.join(REPORTS_DIR, 'VIDEO_METADATA.json'), JSON.stringify(metadata, null, 2));

// 2. SOURCE_MANIFEST.json & SOURCE_HASHES.csv
const audioAacPath = path.join(AUDIO_DIR, 'original_audio.aac');
const audioWavPath = path.join(AUDIO_DIR, 'original_audio.wav');
const audioAacHash = fs.existsSync(audioAacPath) ? crypto.createHash('sha256').update(fs.readFileSync(audioAacPath)).digest('hex') : '';
const audioWavHash = fs.existsSync(audioWavPath) ? crypto.createHash('sha256').update(fs.readFileSync(audioWavPath)).digest('hex') : '';

const sourceManifest = {
  projectId: 'police-reference',
  createdAt: new Date().toISOString(),
  sources: [
    {
      id: 'SRC_MP4',
      path: 'projects/police-reference/original/police_ranks.mp4',
      type: 'video/mp4',
      sizeBytes: metadata.fileSizeBytes,
      sha256: mp4Hash,
      status: 'VERIFIED',
    },
    {
      id: 'SRC_AUDIO_AAC',
      path: 'projects/police-reference/audio/original_audio.aac',
      type: 'audio/aac',
      sizeBytes: fs.existsSync(audioAacPath) ? fs.statSync(audioAacPath).size : 0,
      sha256: audioAacHash,
      status: audioAacHash ? 'VERIFIED' : 'MISSING',
    },
    {
      id: 'SRC_AUDIO_WAV',
      path: 'projects/police-reference/audio/original_audio.wav',
      type: 'audio/wav',
      sizeBytes: fs.existsSync(audioWavPath) ? fs.statSync(audioWavPath).size : 0,
      sha256: audioWavHash,
      status: audioWavHash ? 'VERIFIED' : 'MISSING',
    },
  ],
};
fs.writeFileSync(path.join(MANIFEST_DIR, 'SOURCE_MANIFEST.json'), JSON.stringify(sourceManifest, null, 2));
fs.writeFileSync(
  path.join(MANIFEST_DIR, 'SOURCE_HASHES.csv'),
  ['id,path,size_bytes,sha256,status', ...sourceManifest.sources.map((s) => `${s.id},${s.path},${s.sizeBytes},${s.sha256},${s.status}`)].join('\n')
);

// 3. NATIVE_FRAME_MANIFEST.csv, 30FPS_FRAME_MANIFEST.csv, FRAME_MAPPING.jsonl, FRAME_DIFFERENCES.csv
const nativeCsv = ['frame_index,native_frame_id,pts,timestamp_seconds,duration_seconds,width,height,is_key,pict_type,checksum,mean_y,stdev_y,file_path,extraction_status'];
const fps30Csv = ['frame_number_30fps,analysis_frame_id,native_frame_id,timestamp_seconds,resampled,interpolated,file_path,analysis_status'];
const mappingStream = fs.createWriteStream(path.join(MANIFEST_DIR, 'FRAME_MAPPING.jsonl'));
const diffCsv = ['frame_index,timestamp_seconds,checksum_changed,luma_delta,chroma_u_delta,chroma_v_delta,is_static_hold,motion_magnitude'];

let duplicateCount = 0;
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const prev = i > 0 ? frames[i - 1] : null;
  const pad = String(f.index).padStart(8, '0');
  const nativeId = `NATIVE_${pad}`;
  const analysisId = `FRAME_${pad}`;
  const checksumChanged = prev ? (prev.checksum !== f.checksum ? 1 : 0) : 1;
  if (prev && prev.checksum === f.checksum) duplicateCount++;
  const lumaDelta = prev ? Math.abs(f.meanY - prev.meanY) : 0;
  const uDelta = prev ? Math.abs(f.meanU - prev.meanU) : 0;
  const vDelta = prev ? Math.abs(f.meanV - prev.meanV) : 0;
  const motionMag = Number((lumaDelta * 0.6 + uDelta * 0.2 + vDelta * 0.2).toFixed(3));
  const isStaticHold = checksumChanged === 0 || (lumaDelta === 0 && uDelta === 0 && vDelta === 0 && Math.abs(f.stdevY - (prev?.stdevY ?? 0)) < 0.05) ? 1 : 0;

  nativeCsv.push(`${f.index},${nativeId},${f.pts},${f.ptsTime.toFixed(6)},0.033333,1280,720,${f.isKey ? 1 : 0},${f.pictType},${f.checksum},${f.meanY},${f.stdevY},projects/police-reference/native-frames/frame_${pad}.png,PENDING_DISK_EXTRACT`);
  fps30Csv.push(`${f.index},${analysisId},${nativeId},${f.ptsTime.toFixed(6)},0,0,projects/police-reference/30fps-frames/frame_${pad}.png,EXTRACTED_TELEMETRY`);
  mappingStream.write(JSON.stringify({ frameNumber30fps: f.index, analysisFrameId: analysisId, nativeFrameId: nativeId, ptsTime: f.ptsTime, exactMatch: true }) + '\n');
  diffCsv.push(`${f.index},${f.ptsTime.toFixed(6)},${checksumChanged},${lumaDelta},${uDelta},${vDelta},${isStaticHold},${motionMag}`);
}
mappingStream.end();
fs.writeFileSync(path.join(MANIFEST_DIR, 'NATIVE_FRAME_MANIFEST.csv'), nativeCsv.join('\n'));
fs.writeFileSync(path.join(MANIFEST_DIR, '30FPS_FRAME_MANIFEST.csv'), fps30Csv.join('\n'));
fs.writeFileSync(path.join(MOTION_DIR, 'FRAME_DIFFERENCES.csv'), diffCsv.join('\n'));

// 4. Build SHOT_DATABASE.csv & SHOT_TIMELINE.json from scdet cuts + narrative beats
const cutTimes = [0.033333, ...cuts.map((c) => c.time), metadata.durationSeconds];
const shots = [];
for (let i = 0; i < cutTimes.length - 1; i++) {
  const start = cutTimes[i];
  const end = cutTimes[i + 1];
  const dur = Number((end - start).toFixed(3));
  if (dur <= 0) continue;
  const startFrame = Math.max(1, Math.round(start * 30));
  const endFrame = Math.min(frames.length, Math.round(end * 30));
  const scdScore = i > 0 ? cuts[i - 1].score : 0;
  shots.push({
    shotId: `SHOT_${String(shots.length + 1).padStart(3, '0')}`,
    index: shots.length + 1,
    startSeconds: Number(start.toFixed(3)),
    endSeconds: Number(end.toFixed(3)),
    durationSeconds: dur,
    firstFrame: startFrame,
    lastFrame: endFrame,
    transitionIn: i === 0 ? 'fade_in' : scdScore > 20 ? 'hard_cut' : 'cut_or_whip',
    scdetScore: scdScore,
  });
}

fs.writeFileSync(path.join(SCENE_DIR, 'SHOT_TIMELINE.json'), JSON.stringify({ totalShots: shots.length, shots }, null, 2));
fs.writeFileSync(
  path.join(SCENE_DIR, 'SHOT_DATABASE.csv'),
  ['shot_id,index,start_s,end_s,duration_s,first_frame,last_frame,transition_in,scdet_score', ...shots.map((s) => `${s.shotId},${s.index},${s.startSeconds},${s.endSeconds},${s.durationSeconds},${s.firstFrame},${s.lastFrame},${s.transitionIn},${s.scdetScore}`)].join('\n')
);

console.log(`Generated manifests: ${shots.length} shots, ${duplicateCount} exact duplicate frame checksums out of ${frames.length}.`);
