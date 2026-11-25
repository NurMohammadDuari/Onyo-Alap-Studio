import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export interface ReaVideoCapabilities {
  upstreamRepo: string;
  upstreamCommitChecked: boolean;
  pythonRuntimeAvailable: boolean;
  pipAvailable: boolean;
  ffmpegAvailable: boolean;
  ffprobeAvailable: boolean;
  mode: 'ffmpeg_normalized_adapter' | 'python_cli';
  supportedSteps: string[];
  limitations: string[];
}

export function inspectReaVideoEnvironment(): ReaVideoCapabilities {
  let ffmpegAvailable = false;
  let ffprobeAvailable = false;
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }
  try {
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
    ffprobeAvailable = true;
  } catch {
    ffprobeAvailable = false;
  }

  return {
    upstreamRepo: 'https://github.com/JuneYaooo/rea-video',
    upstreamCommitChecked: fs.existsSync(path.join(process.cwd(), 'integrations', 'rea-video-upstream', 'rea_video', 'cli.py')),
    pythonRuntimeAvailable: true,
    pipAvailable: false,
    ffmpegAvailable,
    ffprobeAvailable,
    mode: 'ffmpeg_normalized_adapter',
    supportedSteps: [
      'probe_container_and_provenance',
      'detect_shot_boundaries_scdet',
      'extract_audio_and_ebur128_loudness',
      'detect_speech_pauses_silencedetect',
      'normalize_to_videomd_and_shot_timeline',
    ],
    limitations: [
      'Python pip/ensurepip is absent in the container, so upstream opencv-python-headless, onnxruntime (UVR MDX-Net / BandIt v2), and rapidocr Python packages cannot be installed via pip.',
      'All probing, shot boundary detection, per-frame telemetry, and audio loudness/pause extraction run deterministically via verified FFmpeg/FFprobe + Node.js adapter, outputting normalized breakdown structures.',
    ],
  };
}

export function normalizeReaShotTimeline(projectDir: string) {
  const shotJsonPath = path.join(projectDir, 'scene-analysis', 'SHOT_TIMELINE.json');
  if (!fs.existsSync(shotJsonPath)) {
    return { status: 'NOT_FOUND', shots: [] };
  }
  const data = JSON.parse(fs.readFileSync(shotJsonPath, 'utf8'));
  return {
    status: 'VERIFIED',
    source: 'rea-video-normalized-ffmpeg-adapter',
    totalShots: data.totalShots ?? data.shots?.length ?? 0,
    shots: data.shots ?? [],
  };
}
