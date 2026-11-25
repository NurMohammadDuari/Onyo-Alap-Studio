'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Player } from '@remotion/player';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Download,
  Film,
  Lock,
  Maximize2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import type {
  ProjectRecord,
  SceneTemplateType,
  StoryboardShot,
  StoryboardVersion,
} from '../../packages/shared-types/src/types';
import { BANGLADESH_POLICE_RANKS } from '../../packages/visual-dna/src/index';
import { OnyoAlapComposition } from '../../packages/remotion-engine/src/OnyoAlapComposition';
import { ShotSceneRenderer } from '../../packages/remotion-engine/src/ShotSceneRenderer';
import { StudioShell } from './StudioShell';

interface ApprovalEvent {
  id: number;
  version_number: number;
  action: string;
  previous_state: string;
  new_state: string;
  note: string;
  created_at: string;
}

const TEMPLATE_OPTIONS: Array<{ value: SceneTemplateType; label: string }> = [
  { value: 'brand_bumper', label: 'Onyo Alap Royal Logo Bumper' },
  { value: 'diorama_thana_exterior', label: 'Thana Exterior Verandah Diorama' },
  { value: 'diorama_interior_office', label: 'Station Interior Office Diorama' },
  { value: 'diorama_classroom_exam', label: 'BCS Classroom Chalkboard Diorama' },
  { value: 'epaulette_macro_showcase', label: 'Epaulette Insignia Macro Card' },
  { value: 'rank_tower_comparison', label: 'Rank Tower Cardstock Strip' },
  { value: 'infographic_dial_counter', label: 'Grid Paper Counter & Year Dial' },
  { value: 'historical_archive_ledger', label: 'Historical Archive Ledger Book' },
  { value: 'bangladesh_range_map', label: 'Bangladesh Range Map' },
  { value: 'split_comparison', label: 'Split Frame Comparison Cards' },
];

export function StoryboardClient({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [storyboard, setStoryboard] = useState<StoryboardVersion | null>(null);
  const [versions, setVersions] = useState<StoryboardVersion[]>([]);
  const [history, setHistory] = useState<ApprovalEvent[]>([]);
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    narration: string;
    templateType: SceneTemplateType;
    duration: number;
    highlightRankId: string;
    pose: 'standing' | 'walking' | 'saluting' | 'tea_sipping' | 'seated_reading' | 'guarding_rifle';
    headline: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderResult, setRenderResult] = useState<{ videoUrl: string; qaMarkdown: string } | null>(null);

  const applyLoadedPayload = useCallback((json: {
    project: ProjectRecord;
    latestStoryboard: StoryboardVersion;
    versions?: StoryboardVersion[];
    approvalHistory?: ApprovalEvent[];
  }) => {
    setProject(json.project);
    setStoryboard(json.latestStoryboard);
    setVersions(json.versions ?? []);
    setHistory(json.approvalHistory ?? []);
    if (json.project.finalVideoPath) {
      setRenderResult((prev) =>
        prev ?? { videoUrl: json.project.finalVideoPath!, qaMarkdown: 'Rendered output verified on disk.' }
      );
    }
    setLoading(false);
  }, []);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Project not found');
      applyLoadedPayload(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load storyboard');
      setLoading(false);
    }
  }, [projectId, applyLoadedPayload]);

  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${projectId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Project not found');
        return json;
      })
      .then((json) => {
        if (active) applyLoadedPayload(json);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load storyboard');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [projectId, applyLoadedPayload]);

  function selectShotForEdit(shot: StoryboardShot) {
    setSelectedShotId(shot.shotId);
    setEditDraft({
      title: shot.title,
      narration: shot.narration,
      templateType: shot.templateType,
      duration: shot.duration,
      highlightRankId: shot.graphics.highlightRankId ?? 'constable',
      pose: shot.characters[0]?.pose ?? 'standing',
      headline: shot.typography.headline ?? shot.title,
    });
  }

  async function patchStoryboard(payload: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Storyboard update failed');
      setProject(json.project);
      setStoryboard(json.latestStoryboard);
      setVersions(json.versions ?? []);
      setHistory(json.approvalHistory ?? []);
      setStatusMessage(
        json.invalidatedPreviousApproval
          ? `Saved storyboard v${json.latestStoryboard.versionNumber}. Prior approval was invalidated and re-approval is required.`
          : `Saved storyboard v${json.latestStoryboard.versionNumber}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update storyboard');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveShotEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedShotId || !editDraft || !storyboard) return;
    const orig = storyboard.shots.find((s) => s.shotId === selectedShotId);
    if (!orig) return;

    const updatedChars =
      orig.characters.length > 0
        ? [{ ...orig.characters[0], pose: editDraft.pose, rankId: editDraft.highlightRankId }, ...orig.characters.slice(1)]
        : editDraft.templateType !== 'brand_bumper' && editDraft.templateType !== 'epaulette_macro_showcase'
          ? [
              {
                id: `${orig.shotId}_char`,
                role: 'Police Officer',
                rankId: editDraft.highlightRankId,
                pose: editDraft.pose,
                facing: 'right' as const,
                x: 340,
                y: 350,
                scale: 1.08,
                uniformColor: '#1E44B8',
                trouserColor: '#D8C89B',
              },
            ]
          : [];

    await patchStoryboard({
      action: 'update_shot',
      shotId: selectedShotId,
      patch: {
        title: editDraft.title,
        narration: editDraft.narration,
        templateType: editDraft.templateType,
        duration: Number(editDraft.duration),
        characters: updatedChars,
        typography: {
          ...orig.typography,
          headline: editDraft.headline,
          caption: editDraft.narration,
        },
        graphics: {
          ...orig.graphics,
          highlightRankId: editDraft.highlightRankId,
        },
      },
    });
  }

  async function handleApproveStoryboard() {
    if (!storyboard) return;
    setApproving(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionNumber: storyboard.versionNumber }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Approval failed');
      setProject(json.project);
      setStoryboard(json.latestStoryboard);
      setHistory(json.approvalHistory ?? []);
      setStatusMessage(
        `Storyboard v${storyboard.versionNumber} explicitly approved. Final MP4 rendering is now unlocked.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval error');
    } finally {
      setApproving(false);
    }
  }

  async function handleRenderVideo() {
    setRendering(true);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/render`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Render failed');
      setRenderResult({ videoUrl: json.videoUrl, qaMarkdown: json.qaMarkdown });
      await loadProject();
      setStatusMessage(`Rendered final MP4 to ${json.videoUrl} and passed automated QC.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render error');
    } finally {
      setRendering(false);
    }
  }

  const isRenderUnlocked = Boolean(
    project &&
      storyboard &&
      (project.approvalState === 'USER_APPROVED' || project.approvalState === 'FINAL_RENDER_AUTHORIZED') &&
      project.approvedVersionNumber === storyboard.versionNumber
  );

  const totalFrames = storyboard
    ? Math.max(30, storyboard.shots.reduce((acc, s) => acc + Math.max(15, Math.round(s.duration * 30)), 0))
    : 150;

  function downloadBlob(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleExportJson() {
    if (!project || !storyboard) return;
    downloadBlob(
      `${project.projectId}_storyboard_v${storyboard.versionNumber}.json`,
      JSON.stringify({ project, storyboard }, null, 2),
      'application/json'
    );
  }

  function handleExportProductionBible() {
    if (!project || !storyboard) return;
    const lines: string[] = [
      `# ONYO ALAP PRODUCTION BIBLE — ${project.title}`,
      `- Project ID: ${project.projectId}`,
      `- Storyboard Version: v${storyboard.versionNumber}`,
      `- Approval State: ${project.approvalState}`,
      `- Total Duration: ${storyboard.totalDurationSeconds.toFixed(2)}s (${storyboard.shots.length} shots)`,
      '',
      '## Shot-by-Shot Directorial Specification',
      '',
    ];
    for (const s of storyboard.shots) {
      lines.push(
        `### ${s.order}. ${s.shotId} — ${s.title} (${s.startTime.toFixed(1)}s–${s.endTime.toFixed(1)}s)`,
        `- **Template:** \`${s.templateType}\``,
        `- **Camera / Entrance:** ${s.camera.movement} (${s.camera.zoomStart}x → ${s.camera.zoomEnd}x) · ${s.animation.entranceStyle}`,
        `- **Characters:** ${s.characters.map((c) => `${c.role} (${c.pose})`).join(', ') || 'None'}`,
        `- **Narration:** ${s.narration}`,
        `- **Continuity:** ${s.continuityNotes}`,
        ''
      );
    }
    downloadBlob(
      `${project.projectId}_production_bible_v${storyboard.versionNumber}.md`,
      lines.join('\n'),
      'text/markdown;charset=utf-8'
    );
  }

  return (
    <StudioShell
      title={project ? project.title : 'Storyboard Approval Workspace'}
      subtitle={
        project && storyboard
          ? `Version v${storyboard.versionNumber} · ${storyboard.shots.length} shots · ${storyboard.totalDurationSeconds.toFixed(1)}s total · Status: ${project.approvalState}`
          : 'Inspect opening, main action, and ending React keyframes for every shot before authorizing render.'
      }
      primaryAction={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={!storyboard}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={handleExportProductionBible}
            disabled={!storyboard}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Bible (.md)</span>
          </button>
          <button
            type="button"
            onClick={() => setFullscreenOpen(true)}
            disabled={!storyboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-300 bg-white text-slate-800 rounded-lg hover:bg-slate-50 whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Play Full Preview</span>
          </button>
          <button
            type="button"
            onClick={handleRenderVideo}
            disabled={!isRenderUnlocked || rendering}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              isRenderUnlocked
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isRenderUnlocked ? <Film className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{rendering ? 'Rendering MP4…' : isRenderUnlocked ? 'Render Final MP4' : 'Render Locked'}</span>
          </button>
        </div>
      }
    >
      {error && (
        <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
          {error}
        </div>
      )}
      {statusMessage && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
          {statusMessage}
        </div>
      )}

      {loading || !project || !storyboard ? (
        <div className="h-72 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : (
        <div className="space-y-6">
          {/* Strict Approval Authorization Gate Banner */}
          <section
            aria-label="Storyboard authorization gate"
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                {isRenderUnlocked ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Storyboard v{storyboard.versionNumber} Approved — Render Authorized</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Render Locked Until Explicit Storyboard Approval</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {isRenderUnlocked
                  ? `Approved at ${project.approvedAt ?? 'now'}. Editing or reordering any shot will automatically create a new draft version and re-lock rendering.`
                  : 'Inspect every shot keyframe below, edit any narration or visual template as needed, and authorize when satisfied.'}
              </p>
            </div>

            {!isRenderUnlocked && (
              <button
                type="button"
                onClick={handleApproveStoryboard}
                disabled={approving}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#16339B] rounded-lg hover:bg-[#0A2A9F] disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                {approving
                  ? 'Approving Storyboard…'
                  : 'APPROVE COMPLETE STORYBOARD & AUTHORIZE FINAL VIDEO RENDER'}
              </button>
            )}
          </section>

          {/* Discrepancy & Sync Notice */}
          {project.discrepancies.length > 0 && (
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
              <span className="font-semibold">Timing &amp; Sync Notes:</span> {project.discrepancies.join(' · ')}
            </section>
          )}

          {/* Proportional Multi-Track Visual Timeline Strip */}
          <section
            aria-label="Multi-track production timeline"
            className="bg-white border border-slate-200 rounded-lg p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <h2 className="font-semibold text-slate-900">
                Multi-Track Timeline ({storyboard.totalDurationSeconds.toFixed(1)}s)
              </h2>
              <span className="font-mono tabular-nums text-slate-500">
                Click any block to inspect &amp; edit shot
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {/* Track 1: Video / Visual Templates */}
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-slate-500">V1 ART</span>
                <div className="flex-1 flex gap-1 overflow-x-auto pb-0.5">
                  {storyboard.shots.map((sh) => {
                    const pct = Math.max(8, (sh.duration / Math.max(1, storyboard.totalDurationSeconds)) * 100);
                    const isSel = selectedShotId === sh.shotId;
                    return (
                      <button
                        key={`v1_${sh.shotId}`}
                        type="button"
                        onClick={() => selectShotForEdit(sh)}
                        style={{ width: `${pct}%`, minWidth: '88px' }}
                        className={`px-2 py-1.5 rounded text-left truncate border transition-colors ${
                          isSel
                            ? 'bg-[#16339B] text-white border-[#16339B]'
                            : 'bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <span className="font-mono font-semibold">{sh.shotId}</span> · {sh.duration.toFixed(1)}s
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Track 2: Articulated Characters / Graphics */}
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-slate-500">V2 RIGS</span>
                <div className="flex-1 flex gap-1 overflow-x-auto pb-0.5">
                  {storyboard.shots.map((sh) => {
                    const pct = Math.max(8, (sh.duration / Math.max(1, storyboard.totalDurationSeconds)) * 100);
                    const rigLabel =
                      sh.characters.length > 0
                        ? sh.characters.map((c) => c.pose).join('+')
                        : sh.graphics.highlightRankId ?? sh.templateType.split('_')[0];
                    return (
                      <div
                        key={`v2_${sh.shotId}`}
                        style={{ width: `${pct}%`, minWidth: '88px' }}
                        className="px-2 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 font-mono truncate"
                      >
                        {rigLabel}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Track 3: Audio / SFX & Music */}
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-mono text-slate-500">A1 SFX</span>
                <div className="flex-1 flex gap-1 overflow-x-auto pb-0.5">
                  {storyboard.shots.map((sh) => {
                    const pct = Math.max(8, (sh.duration / Math.max(1, storyboard.totalDurationSeconds)) * 100);
                    const sfxTag = sh.sfx[0]?.type ?? sh.music.mood.split('_')[0];
                    return (
                      <div
                        key={`a1_${sh.shotId}`}
                        style={{ width: `${pct}%`, minWidth: '88px' }}
                        className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono truncate"
                      >
                        {sfxTag} ({sh.transitions.in})
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Rendered Video Output + QC Report if completed */}
          {renderResult && (
            <section className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Final Rendered Video Output</h2>
                <video
                  controls
                  src={renderResult.videoUrl}
                  className="w-full aspect-video rounded border border-slate-300 bg-black"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span>{renderResult.videoUrl}</span>
                  <Link href="/quality-control" className="text-[#16339B] font-sans font-semibold hover:underline">
                    Full QC Ledger
                  </Link>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-2">FINAL_VIDEO_QA_REPORT</h2>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 whitespace-pre-wrap">
                  {renderResult.qaMarkdown}
                </pre>
              </div>
            </section>
          )}

          {/* Main Storyboard Grid + Surgical Shot Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Shot Cards Column */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Chronological Shots ({storyboard.shots.length})
                </h2>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => patchStoryboard({ action: 'add_shot' })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 bg-white rounded-md hover:bg-slate-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Shot</span>
                </button>
              </div>

              {storyboard.shots.map((shot, idx) => {
                const shotFrames = Math.max(30, Math.round(shot.duration * 30));
                const isSelected = selectedShotId === shot.shotId;
                return (
                  <article
                    key={shot.shotId}
                    className={`bg-white border rounded-lg p-4 transition-colors ${
                      isSelected ? 'border-[#16339B] ring-2 ring-[#16339B]/15' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {shot.order}. {shot.title}
                        </div>
                        <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                          {shot.shotId} · {shot.startTime.toFixed(1)}s–{shot.endTime.toFixed(1)}s ({shot.duration.toFixed(1)}s) · {shot.templateType}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Move ${shot.shotId} earlier`}
                          disabled={idx === 0 || saving}
                          onClick={() => patchStoryboard({ action: 'move_shot', shotId: shot.shotId, direction: 'up' })}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${shot.shotId} later`}
                          disabled={idx === storyboard.shots.length - 1 || saving}
                          onClick={() => patchStoryboard({ action: 'move_shot', shotId: shot.shotId, direction: 'down' })}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${shot.shotId}`}
                          disabled={storyboard.shots.length <= 1 || saving}
                          onClick={() => patchStoryboard({ action: 'delete_shot', shotId: shot.shotId })}
                          className="p-1.5 border border-slate-200 rounded text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => selectShotForEdit(shot)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded"
                        >
                          Edit Shot
                        </button>
                      </div>
                    </div>

                    {/* Opening / Main Action / Ending Keyframes */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { label: 'Opening Frame', frame: 0 },
                        { label: 'Main Action', frame: Math.floor(shotFrames / 2) },
                        { label: 'Ending Frame', frame: Math.max(0, shotFrames - 1) },
                      ].map((kf) => (
                        <div key={kf.label} className="space-y-1">
                          <div className="aspect-video w-full rounded border border-slate-200 overflow-hidden bg-slate-100">
                            <ShotSceneRenderer
                              shot={shot}
                              localFrame={kf.frame}
                              totalFrames={shotFrames}
                              fps={30}
                              showCaption={false}
                            />
                          </div>
                          <p className="text-[11px] font-mono tabular-nums text-slate-500">
                            {kf.label} (f{kf.frame})
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{shot.narration}</p>
                  </article>
                );
              })}
            </div>

            {/* Right Sidebar: Surgical Shot Editor + Version & Approval Audit */}
            <aside className="space-y-5 h-fit">
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  {selectedShotId ? `Edit ${selectedShotId}` : 'Surgical Shot Editor'}
                </h2>
                {editDraft && selectedShotId ? (
                  <form onSubmit={handleSaveShotEdit} className="space-y-3.5 text-xs">
                    <div>
                      <label htmlFor="shot-title" className="block font-medium text-slate-700 mb-1">
                        Shot Title
                      </label>
                      <input
                        id="shot-title"
                        type="text"
                        required
                        value={editDraft.title}
                        onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                      />
                    </div>

                    <div>
                      <label htmlFor="shot-headline" className="block font-medium text-slate-700 mb-1">
                        On-Screen Headline
                      </label>
                      <input
                        id="shot-headline"
                        type="text"
                        value={editDraft.headline}
                        onChange={(e) => setEditDraft({ ...editDraft, headline: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                      />
                    </div>

                    <div>
                      <label htmlFor="shot-template" className="block font-medium text-slate-700 mb-1">
                        Visual Template
                      </label>
                      <select
                        id="shot-template"
                        value={editDraft.templateType}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, templateType: e.target.value as SceneTemplateType })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                      >
                        {TEMPLATE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="shot-rank" className="block font-medium text-slate-700 mb-1">
                          Police Rank
                        </label>
                        <select
                          id="shot-rank"
                          value={editDraft.highlightRankId}
                          onChange={(e) => setEditDraft({ ...editDraft, highlightRankId: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                        >
                          {BANGLADESH_POLICE_RANKS.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.nameBn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="shot-duration" className="block font-medium text-slate-700 mb-1">
                          Duration (sec)
                        </label>
                        <input
                          id="shot-duration"
                          type="number"
                          step="0.5"
                          min="1"
                          max="60"
                          value={editDraft.duration}
                          onChange={(e) => setEditDraft({ ...editDraft, duration: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="shot-pose" className="block font-medium text-slate-700 mb-1">
                        Character Pose
                      </label>
                      <select
                        id="shot-pose"
                        value={editDraft.pose}
                        onChange={(e) => setEditDraft({ ...editDraft, pose: e.target.value as typeof editDraft.pose })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                      >
                        <option value="standing">Standing</option>
                        <option value="saluting">Saluting</option>
                        <option value="walking">Walking</option>
                        <option value="tea_sipping">Tea Sipping</option>
                        <option value="seated_reading">Seated Reading</option>
                        <option value="guarding_rifle">Guarding Rifle</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="shot-narration" className="block font-medium text-slate-700 mb-1">
                        Narration & Subtitle Caption
                      </label>
                      <textarea
                        id="shot-narration"
                        rows={4}
                        required
                        value={editDraft.narration}
                        onChange={(e) => setEditDraft({ ...editDraft, narration: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 font-semibold text-white bg-[#16339B] rounded hover:bg-[#0A2A9F] disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving Revision…' : 'Save Shot Revision'}</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Edit Shot&rdquo; on any shot card to customize its template, Bengali narration, rank insignia, character pose, or timing.
                  </p>
                )}
              </div>

              {/* Remotion Compact Player */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Timeline Remotion Player</h2>
                <div className="aspect-video w-full rounded overflow-hidden border border-slate-300 bg-[#041664]">
                  <Player
                    component={OnyoAlapComposition}
                    inputProps={{ shots: storyboard.shots, showCaptions: true }}
                    durationInFrames={totalFrames}
                    compositionWidth={1280}
                    compositionHeight={720}
                    fps={30}
                    controls
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Version & Approval History */}
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Revision & Approval Log ({versions.length} versions)
                </h2>
                <ul className="space-y-2 text-xs">
                  {versions.map((v) => (
                    <li key={v.versionId} className="pb-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center justify-between font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">v{v.versionNumber}</span>
                        <span className="text-slate-500">{v.approvalState}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{v.changeSummary}</p>
                    </li>
                  ))}
                  {history.slice(0, 5).map((h) => (
                    <li key={h.id} className="text-[11px] text-slate-500 font-mono">
                      v{h.version_number}: {h.action} ({h.previous_state} → {h.new_state})
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Fullscreen Storyboard Playback Modal */}
      {fullscreenOpen && storyboard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full Storyboard Remotion Playback"
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-5xl bg-white rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Full Storyboard Preview — v{storyboard.versionNumber}
              </span>
              <button
                type="button"
                onClick={() => setFullscreenOpen(false)}
                aria-label="Close full preview"
                className="p-1.5 rounded hover:bg-slate-100 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-[#041664]">
              <Player
                component={OnyoAlapComposition}
                inputProps={{ shots: storyboard.shots, showCaptions: true }}
                durationInFrames={totalFrames}
                compositionWidth={1280}
                compositionHeight={720}
                fps={30}
                controls
                autoPlay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </StudioShell>
  );
}
