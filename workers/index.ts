/**
 * Standalone checkpointed worker entrypoints for Onyo Alap Studio media pipelines.
 * Each worker uses Node.js child_process + FFmpeg/FFprobe and writes honest progress
 * checkpoints to database/onyo-alap.sqlite and projects/police-reference/.
 */
export const WORKER_PIPELINES = [
  'video-ingestion',
  'native-frame-extraction',
  '30fps-extraction',
  'ai-frame-analysis',
  'temporal-analysis',
  'audio-analysis',
  'sfx-analysis',
  'asset-extraction',
  'rendering',
  'quality-control',
] as const;

export type WorkerPipelineName = (typeof WORKER_PIPELINES)[number];
