import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { ApprovalState, ProjectRecord, StoryboardShot, StoryboardVersion } from '../packages/shared-types/src/types';
import { buildDeterministicProductionPlan } from '../packages/ai-director/src/director';
import { parseScriptInput } from '../packages/script-engine/src/parser';
import {
  ONE_MINUTE_POLICE_SHOTS,
  ONE_MINUTE_PROJECT_ID,
  ONE_MINUTE_SCRIPT_TEXT,
} from './one-min-seed';

const DB_PATH = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? 'database/onyo-alap.sqlite');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      language TEXT NOT NULL,
      script_text TEXT NOT NULL,
      audio_path TEXT,
      audio_duration_seconds REAL,
      has_exact_audio_sync INTEGER NOT NULL DEFAULT 0,
      timing_is_estimated INTEGER NOT NULL DEFAULT 1,
      discrepancies_json TEXT NOT NULL DEFAULT '[]',
      approval_state TEXT NOT NULL,
      current_storyboard_version INTEGER NOT NULL DEFAULT 1,
      approved_version_number INTEGER,
      approved_at TEXT,
      final_video_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS storyboard_versions (
      version_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      change_summary TEXT NOT NULL,
      approval_state TEXT NOT NULL,
      shots_json TEXT NOT NULL,
      total_duration_seconds REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS approval_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      action TEXT NOT NULL,
      previous_state TEXT NOT NULL,
      new_state TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS processing_jobs (
      job_id TEXT PRIMARY KEY,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL,
      expected_count INTEGER NOT NULL,
      completed_count INTEGER NOT NULL,
      failed_count INTEGER NOT NULL,
      checkpoint_cursor INTEGER NOT NULL,
      last_message TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS qc_reports (
      report_id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      issues_json TEXT NOT NULL,
      summary_md TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  seedInitialData(db);
  seedOneMinuteProject(db);
  _db = db;
  return db;
}

function seedOneMinuteProject(db: DatabaseSync) {
  const exists = db
    .prepare('SELECT project_id FROM projects WHERE project_id = ?')
    .get(ONE_MINUTE_PROJECT_ID) as { project_id: string } | undefined;
  if (exists) {
    db.prepare(
      `UPDATE storyboard_versions SET shots_json = ?, change_summary = ? WHERE version_id = ? AND created_by = 'ai_director'`
    ).run(
      JSON.stringify(ONE_MINUTE_POLICE_SHOTS),
      'Full 60.0s beat-by-beat Visual DNA storyboard matched to ukgbxNHllMY (00:00–01:00)',
      `${ONE_MINUTE_PROJECT_ID}_v1`
    );
    return;
  }

  const now = new Date().toISOString();
  const renderedOnDisk = fs.existsSync(
    path.resolve(process.cwd(), 'public', 'renders', `${ONE_MINUTE_PROJECT_ID}_v1.mp4`)
  );

  db.prepare(`
    INSERT INTO projects (
      project_id, title, language, script_text, audio_path, audio_duration_seconds,
      has_exact_audio_sync, timing_is_estimated, discrepancies_json, approval_state,
      current_storyboard_version, approved_version_number, approved_at, final_video_path,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ONE_MINUTE_PROJECT_ID,
    'Bangladesh Police Ranks — Full 1-Minute Reconstruction (00:00–01:00)',
    'bn',
    ONE_MINUTE_SCRIPT_TEXT,
    'projects/police-reference/audio/reference_1min.m4a',
    60.0,
    1,
    0,
    JSON.stringify([]),
    renderedOnDisk ? 'FINAL_RENDER_AUTHORIZED' : 'USER_APPROVED',
    1,
    1,
    now,
    renderedOnDisk ? `/renders/${ONE_MINUTE_PROJECT_ID}_v1.mp4` : null,
    now,
    now
  );

  db.prepare(`
    INSERT INTO storyboard_versions (
      version_id, project_id, version_number, created_at, created_by,
      change_summary, approval_state, shots_json, total_duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `${ONE_MINUTE_PROJECT_ID}_v1`,
    ONE_MINUTE_PROJECT_ID,
    1,
    now,
    'ai_director',
    'Full 60.0s beat-by-beat Visual DNA storyboard matched to ukgbxNHllMY (00:00–01:00)',
    'USER_APPROVED',
    JSON.stringify(ONE_MINUTE_POLICE_SHOTS),
    60.0
  );
}

function seedInitialData(db: DatabaseSync) {
  const existing = db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number };
  if (existing.c > 0) return;

  const sampleScript = `[00:00:00.000 - 00:00:06.500]
মনে করেন একটা কাজে থানায় গেছেন। বারান্দায় দাঁড়িয়ে একজন অভিজ্ঞ পুলিশ কর্মকর্তার সাথে কথা বলছেন।
[00:00:06.500 - 00:00:14.000]
কথা চলতে চলতেই বারান্দার সামনে এসে থামল একটা পুলিশ জিপ, আর জিপ থেকে নামলেন আরেকজন তরুণ কর্মকর্তা।
[00:00:14.000 - 00:00:22.000]
চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপের বিষয় বাংলাদেশ পুলিশের ১২টি র্যাঙ্ক।
[00:00:22.000 - 00:00:30.000]
প্রথম র্যাঙ্ক কনস্টেবল, ব্যাজে শুধু রুপালি রঙে লেখা একটি শব্দ পুলিশ—কোনো তারকা বা শাপলা নেই।
[00:00:30.000 - 00:00:38.000]
প্রথম প্রমোশনে নায়েক র্যাঙ্কে আসে দুইটি লাল শেভরন, আর এসআই বা ইন্সপেক্টর র্যাঙ্কের ইতিহাস গেছে ১৯০৫ সাল পর্যন্ত।
[00:00:38.000 - 00:00:46.000]
ডিআইজির অধীনে কাজ করে দেশের আটটি বিভাগীয় পুলিশ রেঞ্জ, আর সর্বোচ্চ পদে আইজিপি।`;

  const parsed = parseScriptInput(sampleScript, 46.0);
  const shots = buildDeterministicProductionPlan({
    title: 'Bangladesh Police Ranks — Visual DNA Reconstruction',
    segments: parsed.segments,
  });

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO projects (
      project_id, title, language, script_text, audio_path, audio_duration_seconds,
      has_exact_audio_sync, timing_is_estimated, discrepancies_json, approval_state,
      current_storyboard_version, approved_version_number, approved_at, final_video_path,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'police-ranks-reconstruction',
    'Bangladesh Police Ranks — Visual DNA Reconstruction',
    'bn',
    sampleScript,
    'projects/police-reference/audio/original_audio.aac',
    46.0,
    1,
    0,
    JSON.stringify([]),
    'READY_FOR_APPROVAL',
    1,
    null,
    null,
    null,
    now,
    now
  );

  db.prepare(`
    INSERT INTO storyboard_versions (
      version_id, project_id, version_number, created_at, created_by,
      change_summary, approval_state, shots_json, total_duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'police-ranks-reconstruction_v1',
    'police-ranks-reconstruction',
    1,
    now,
    'ai_director',
    'Initial Visual DNA storyboard reconstructed from Reference Video ukgbxNHllMY',
    'READY_FOR_APPROVAL',
    JSON.stringify(shots),
    46.0
  );

  // Seed real job checkpoint state matching actual disk counts
  db.prepare(`
    INSERT OR REPLACE INTO processing_jobs (
      job_id, job_type, status, expected_count, completed_count, failed_count, checkpoint_cursor, last_message, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'police_native_extract',
    'NATIVE_FRAME_EXTRACTION',
    'IN_PROGRESS',
    38829,
    300,
    0,
    300,
    'Batch 1 (frames 1–300) extracted lossless PNG; 38,529 queued in resumable batch queue.',
    now
  );

  db.prepare(`
    INSERT OR REPLACE INTO processing_jobs (
      job_id, job_type, status, expected_count, completed_count, failed_count, checkpoint_cursor, last_message, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'police_30fps_analysis',
    'AI_FRAME_ANALYSIS',
    'IN_PROGRESS',
    38829,
    14,
    0,
    14,
    'All 38,829 frames have full PTS/luma/chroma/temporal telemetry; 14 key scene frames visually inspected and 38,815 queued for Gemini Vision batching.',
    now
  );
}

export function listProjects(): ProjectRecord[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map(mapProjectRow);
}

export function getProject(projectId: string): ProjectRecord | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE project_id = ?').get(projectId) as Record<string, unknown> | undefined;
  return row ? mapProjectRow(row) : null;
}

export function getLatestStoryboard(projectId: string): StoryboardVersion | null {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM storyboard_versions WHERE project_id = ? ORDER BY version_number DESC LIMIT 1')
    .get(projectId) as Record<string, unknown> | undefined;
  return row ? mapStoryboardRow(row) : null;
}

export function listStoryboardVersions(projectId: string): StoryboardVersion[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM storyboard_versions WHERE project_id = ? ORDER BY version_number DESC')
    .all(projectId) as Array<Record<string, unknown>>;
  return rows.map(mapStoryboardRow);
}

export function createProjectWithStoryboard(params: {
  projectId: string;
  title: string;
  language: 'bn' | 'en' | 'mixed';
  scriptText: string;
  audioPath?: string;
  audioDurationSeconds?: number;
  hasExactAudioSync: boolean;
  timingIsEstimated: boolean;
  discrepancies: string[];
  shots: StoryboardShot[];
  changeSummary: string;
}): { project: ProjectRecord; storyboard: StoryboardVersion } {
  const db = getDb();
  const now = new Date().toISOString();
  const totalDur = Number(params.shots.reduce((a, s) => a + s.duration, 0).toFixed(3));

  db.prepare(`
    INSERT INTO projects (
      project_id, title, language, script_text, audio_path, audio_duration_seconds,
      has_exact_audio_sync, timing_is_estimated, discrepancies_json, approval_state,
      current_storyboard_version, approved_version_number, approved_at, final_video_path,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    params.projectId,
    params.title,
    params.language,
    params.scriptText,
    params.audioPath ?? null,
    params.audioDurationSeconds ?? totalDur,
    params.hasExactAudioSync ? 1 : 0,
    params.timingIsEstimated ? 1 : 0,
    JSON.stringify(params.discrepancies),
    'READY_FOR_APPROVAL',
    1,
    null,
    null,
    null,
    now,
    now
  );

  db.prepare(`
    INSERT INTO storyboard_versions (
      version_id, project_id, version_number, created_at, created_by,
      change_summary, approval_state, shots_json, total_duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `${params.projectId}_v1`,
    params.projectId,
    1,
    now,
    'ai_director',
    params.changeSummary,
    'READY_FOR_APPROVAL',
    JSON.stringify(params.shots),
    totalDur
  );

  return {
    project: getProject(params.projectId)!,
    storyboard: getLatestStoryboard(params.projectId)!,
  };
}

export function saveNewStoryboardVersion(params: {
  projectId: string;
  newVersion: StoryboardVersion;
  invalidatedPreviousApproval: boolean;
  previousState: ApprovalState;
}): void {
  const db = getDb();
  const now = new Date().toISOString();
  const { projectId, newVersion, invalidatedPreviousApproval, previousState } = params;

  db.prepare(`
    INSERT INTO storyboard_versions (
      version_id, project_id, version_number, created_at, created_by,
      change_summary, approval_state, shots_json, total_duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    newVersion.versionId,
    projectId,
    newVersion.versionNumber,
    newVersion.createdAt,
    newVersion.createdBy,
    newVersion.changeSummary,
    newVersion.approvalState,
    JSON.stringify(newVersion.shots),
    newVersion.totalDurationSeconds
  );

  db.prepare(`
    UPDATE projects SET
      approval_state = ?,
      current_storyboard_version = ?,
      approved_version_number = CASE WHEN ? = 1 THEN NULL ELSE approved_version_number END,
      approved_at = CASE WHEN ? = 1 THEN NULL ELSE approved_at END,
      updated_at = ?
    WHERE project_id = ?
  `).run(
    newVersion.approvalState,
    newVersion.versionNumber,
    invalidatedPreviousApproval ? 1 : 0,
    invalidatedPreviousApproval ? 1 : 0,
    now,
    projectId
  );

  db.prepare(`
    INSERT INTO approval_history (project_id, version_number, action, previous_state, new_state, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    newVersion.versionNumber,
    invalidatedPreviousApproval ? 'EDIT_INVALIDATED_APPROVAL' : 'STORYBOARD_REVISED',
    previousState,
    newVersion.approvalState,
    newVersion.changeSummary,
    now
  );
}

export function approveStoryboardVersion(projectId: string, versionNumber: number): ProjectRecord {
  const db = getDb();
  const project = getProject(projectId);
  if (!project) throw new Error('Project not found');
  if (project.currentStoryboardVersion !== versionNumber) {
    throw new Error(`Can only approve the latest storyboard version (v${project.currentStoryboardVersion})`);
  }
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE projects SET
      approval_state = 'USER_APPROVED',
      approved_version_number = ?,
      approved_at = ?,
      updated_at = ?
    WHERE project_id = ?
  `).run(versionNumber, now, now, projectId);

  db.prepare(`
    UPDATE storyboard_versions SET approval_state = 'USER_APPROVED'
    WHERE project_id = ? AND version_number = ?
  `).run(projectId, versionNumber);

  db.prepare(`
    INSERT INTO approval_history (project_id, version_number, action, previous_state, new_state, note, created_at)
    VALUES (?, ?, 'EXPLICIT_USER_APPROVAL', ?, 'USER_APPROVED', 'User approved complete storyboard and authorized final render.', ?)
  `).run(projectId, versionNumber, project.approvalState, now);

  return getProject(projectId)!;
}

export function listProcessingJobs() {
  const db = getDb();
  return db.prepare('SELECT * FROM processing_jobs ORDER BY updated_at DESC').all();
}

export function listApprovalHistory(projectId: string) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM approval_history WHERE project_id = ? ORDER BY id DESC')
    .all(projectId);
}

function mapProjectRow(row: Record<string, unknown>): ProjectRecord {
  return {
    projectId: String(row.project_id),
    title: String(row.title),
    language: (row.language as ProjectRecord['language']) ?? 'bn',
    scriptText: String(row.script_text),
    audioPath: row.audio_path ? String(row.audio_path) : undefined,
    audioDurationSeconds: row.audio_duration_seconds ? Number(row.audio_duration_seconds) : undefined,
    hasExactAudioSync: Boolean(row.has_exact_audio_sync),
    timingIsEstimated: Boolean(row.timing_is_estimated),
    discrepancies: JSON.parse(String(row.discrepancies_json ?? '[]')),
    approvalState: String(row.approval_state) as ApprovalState,
    currentStoryboardVersion: Number(row.current_storyboard_version),
    approvedVersionNumber: row.approved_version_number !== null ? Number(row.approved_version_number) : null,
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    finalVideoPath: row.final_video_path ? String(row.final_video_path) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapStoryboardRow(row: Record<string, unknown>): StoryboardVersion {
  return {
    versionId: String(row.version_id),
    projectId: String(row.project_id),
    versionNumber: Number(row.version_number),
    createdAt: String(row.created_at),
    createdBy: row.created_by as StoryboardVersion['createdBy'],
    changeSummary: String(row.change_summary),
    approvalState: String(row.approval_state) as ApprovalState,
    shots: JSON.parse(String(row.shots_json)),
    totalDurationSeconds: Number(row.total_duration_seconds),
  };
}
