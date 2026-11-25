'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { StudioShell } from './StudioShell';

interface FrameItem {
  frameNumber: number;
  frameId: string;
  timestampSeconds: number;
  sceneId: string;
  shotId: string;
  analysisStatus: string;
  verificationStatus: string;
  telemetryComplete: boolean;
  vlmInspected: boolean;
  thumbnailUrl: string;
}

interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  sourceFrameId: string;
  timestampSeconds: number;
  reactComponent: string;
  colors: string[];
  description: string;
  reusableRecipe: string;
}

interface SceneItem {
  sceneId: string;
  title: string;
  start?: number;
  end?: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  purpose?: string;
  visualStyle?: string;
}

interface ShotItem {
  shotId: string;
  index: number;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  firstFrame: number;
  lastFrame: number;
  transitionIn: string;
  scdetScore: number;
}

interface ReferencePayload {
  metadata?: {
    videoId?: string;
    video?: {
      width?: number;
      height?: number;
      fps?: string;
      durationSeconds?: number;
      totalDecodedFrames?: number;
      codec?: string;
    };
    sha256?: string;
  };
  counts: {
    expectedFrames: number;
    extractedNativePngCount: number;
    telemetryAnalyzedCount: number;
    vlmInspectedCount: number;
    queuedVlmCount: number;
    scenesCount: number;
    shotsCount: number;
  };
  scenes: SceneItem[];
  shots?: ShotItem[];
  knowledgeHits: KnowledgeEntry[];
  processingJobs: Array<{
    job_id: string;
    job_type: string;
    status: string;
    expected_count: number;
    completed_count: number;
    last_message: string;
  }>;
  reaVideo: {
    upstreamRepo: string;
    upstreamCommitChecked: boolean;
    pythonRuntimeAvailable: boolean;
    pipAvailable: boolean;
    ffmpegAvailable: boolean;
    ffprobeAvailable: boolean;
    mode: string;
    supportedSteps?: string[];
    limitations?: string[];
  };
  framesPage: {
    page: number;
    pageSize: number;
    total: number;
    items: FrameItem[];
  };
}

export function ReferenceAnalyzerClient({ defaultTab = 'overview' }: { defaultTab?: 'overview' | 'shots' | 'frames' | 'knowledge' }) {
  const [data, setData] = useState<ReferencePayload | null>(null);
  const [tab, setTab] = useState<'overview' | 'shots' | 'frames' | 'knowledge'>(defaultTab);
  const [query, setQuery] = useState('');
  const [shotQuery, setShotQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sceneFilter, setSceneFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState<string | null>(null);

  const buildParams = useCallback(() => {
    return new URLSearchParams({
      q: query,
      category,
      scene: sceneFilter,
      page: String(page),
      pageSize: '24',
    }).toString();
  }, [query, category, sceneFilter, page]);

  useEffect(() => {
    let active = true;
    fetch(`/api/reference?${buildParams()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ReferencePayload | null) => {
        if (active && json) setData(json);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [buildParams]);

  async function handleExtractBatch() {
    setExtracting(true);
    setExtractStatus(null);
    try {
      const res = await fetch('/api/reference/extract-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 150 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Batch extraction failed');
      setExtractStatus(
        `Extracted up to frame ${json.extractedCount.toLocaleString()} / ${json.expectedCount.toLocaleString()} lossless PNGs.`
      );
      const refreshRes = await fetch(`/api/reference?${buildParams()}`);
      if (refreshRes.ok) {
        setData(await refreshRes.json());
      }
    } catch (err) {
      setExtractStatus(err instanceof Error ? err.message : 'Batch extraction error');
    } finally {
      setExtracting(false);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.framesPage.total / data.framesPage.pageSize)) : 1;

  return (
    <StudioShell
      title="Reference Video Reverse Engineering"
      subtitle="Bangladesh Police Ranks (ukgbxNHllMY) — native 30fps stream forensics, lossless PNG archive checkpoints, REA-VIDEO integration, and searchable Visual DNA Knowledge Base."
      primaryAction={
        <button
          type="button"
          onClick={handleExtractBatch}
          disabled={extracting}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#16339B] rounded-lg hover:bg-[#0A2A9F] disabled:opacity-50 whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>{extracting ? 'Extracting Batch…' : 'Extract Next 150 PNGs'}</span>
        </button>
      }
    >
      {/* Interactive Section Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              tab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Forensics &amp; Scenes
          </button>
          <button
            type="button"
            onClick={() => setTab('shots')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              tab === 'shots' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All 97 Sub-Shots
          </button>
          <button
            type="button"
            onClick={() => setTab('frames')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              tab === 'frames' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 FPS Frame Explorer
          </button>
          <button
            type="button"
            onClick={() => setTab('knowledge')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              tab === 'knowledge' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visual DNA Knowledge Base
          </button>
        </div>

        {extractStatus && (
          <p className="text-xs font-mono text-slate-700">{extractStatus}</p>
        )}
      </div>

      {!data ? (
        <div className="h-64 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : (
        <>
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Stream Forensics & REA-VIDEO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <h2 className="text-base font-semibold text-slate-900 mb-3">
                    FFprobe Stream & Packet Inventory
                  </h2>
                  <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <dt className="text-slate-500">Video ID</dt>
                    <dd className="font-mono text-slate-900">ukgbxNHllMY</dd>
                    <dt className="text-slate-500">Resolution & Codec</dt>
                    <dd className="font-mono tabular-nums text-slate-900">
                      {data.metadata?.video?.width ?? 1280}×{data.metadata?.video?.height ?? 720} · H.264 Main
                    </dd>
                    <dt className="text-slate-500">Frame Rate</dt>
                    <dd className="font-mono tabular-nums text-slate-900">30/1 CFR (1:1 Native = 30fps)</dd>
                    <dt className="text-slate-500">Total Decoded Frames</dt>
                    <dd className="font-mono tabular-nums text-slate-900">
                      {data.counts.expectedFrames.toLocaleString()}
                    </dd>
                    <dt className="text-slate-500">Lossless PNGs Extracted</dt>
                    <dd className="font-mono tabular-nums text-slate-900">
                      {data.counts.extractedNativePngCount.toLocaleString()} / {data.counts.expectedFrames.toLocaleString()}
                    </dd>
                    <dt className="text-slate-500">1 FPS Thumbnail Index</dt>
                    <dd className="font-mono tabular-nums text-slate-900">1,294 JPEGs (complete 21m 34s)</dd>
                    <dt className="text-slate-500">Keyframes Visually Audited</dt>
                    <dd className="font-mono tabular-nums text-slate-900">
                      {data.counts.vlmInspectedCount} verified · {data.counts.queuedVlmCount.toLocaleString()} queued
                    </dd>
                  </dl>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <h2 className="text-base font-semibold text-slate-900 mb-3">
                    REA-VIDEO Integration Audit
                  </h2>
                  <p className="text-xs text-slate-600 mb-3">
                    Upstream clone status from <span className="font-mono">JuneYaooo/rea-video</span> isolated behind TypeScript adapter.
                  </p>
                  <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <dt className="text-slate-500">Upstream CLI Present</dt>
                    <dd className="font-mono text-slate-900">
                      {data.reaVideo?.upstreamCommitChecked ? 'Yes (/integrations/rea-video-upstream)' : 'Not found'}
                    </dd>
                    <dt className="text-slate-500">Supported Capabilities</dt>
                    <dd className="font-mono text-slate-900">
                      {(data.reaVideo?.supportedSteps ?? []).join(', ') || 'probe, scdet, ebur128'}
                    </dd>
                    <dt className="text-slate-500">Adapter Mode</dt>
                    <dd className="font-mono text-slate-900">
                      {data.reaVideo?.mode ?? 'ffmpeg_normalized_adapter'} ({data.reaVideo?.ffmpegAvailable ? 'FFmpeg ready' : 'Check FFmpeg'})
                    </dd>
                  </dl>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Active Checkpoint Jobs</p>
                    <ul className="space-y-1.5 text-xs">
                      {data.processingJobs.map((j) => (
                        <li key={j.job_id} className="flex items-center justify-between gap-2">
                          <span className="font-mono text-slate-700">{j.job_id}</span>
                          <span className="font-mono tabular-nums text-slate-900">
                            {j.completed_count.toLocaleString()} / {j.expected_count.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 11-Scene Reconstruction Table */}
              <div className="bg-white border border-slate-200 rounded-lg">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">
                    Reconstructed Macro Scenes ({data.scenes.length})
                  </h2>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {data.counts.shotsCount} sub-shots detected via ffmpeg scdet
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                        <th className="py-2.5 px-5">Scene ID</th>
                        <th className="py-2.5 px-4">Title</th>
                        <th className="py-2.5 px-4 text-right">Start</th>
                        <th className="py-2.5 px-4 text-right">End</th>
                        <th className="py-2.5 px-4 text-right">Duration</th>
                        <th className="py-2.5 px-5 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {data.scenes.map((sc) => {
                        const sStart = Number(sc.start ?? sc.startTime ?? 0);
                        const sEnd = Number(sc.end ?? sc.endTime ?? 0);
                        const sDur = Number(sc.duration ?? Math.max(0, sEnd - sStart));
                        return (
                          <tr key={sc.sceneId} className="hover:bg-slate-50">
                            <td className="py-2.5 px-5 font-mono text-xs text-slate-700">{sc.sceneId}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-900">{sc.title}</td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs text-slate-600">
                              {sStart.toFixed(1)}s
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs text-slate-600">
                              {sEnd.toFixed(1)}s
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs text-slate-700">
                              {sDur.toFixed(1)}s
                            </td>
                            <td className="py-2.5 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSceneFilter(sc.sceneId);
                                  setPage(1);
                                  setTab('frames');
                                }}
                                className="text-xs font-semibold text-[#16339B] hover:underline whitespace-nowrap"
                              >
                                Browse Frames
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'shots' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={shotQuery}
                    onChange={(e) => setShotQuery(e.target.value)}
                    placeholder="Filter 97 sub-shots by ID (SHOT_012) or transition (hard_cut, fade_in)…"
                    aria-label="Search detected sub-shots"
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {(data.shots ?? []).length} scdet shot boundaries
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="py-2.5 px-4">Shot ID</th>
                      <th className="py-2.5 px-4 text-right">Time Range</th>
                      <th className="py-2.5 px-4 text-right">Duration</th>
                      <th className="py-2.5 px-4 text-right">30fps Range</th>
                      <th className="py-2.5 px-4">Transition</th>
                      <th className="py-2.5 px-4 text-right">scdet Score</th>
                      <th className="py-2.5 px-4 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {(data.shots ?? [])
                      .filter((s) => {
                        const q = shotQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          s.shotId.toLowerCase().includes(q) ||
                          s.transitionIn.toLowerCase().includes(q)
                        );
                      })
                      .map((sh) => (
                        <tr key={sh.shotId} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono font-semibold text-slate-900">{sh.shotId}</td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-700">
                            {sh.startSeconds.toFixed(2)}s – {sh.endSeconds.toFixed(2)}s
                          </td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-700">
                            {sh.durationSeconds.toFixed(2)}s
                          </td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-500">
                            f{sh.firstFrame}–f{sh.lastFrame}
                          </td>
                          <td className="py-2 px-4 font-mono text-slate-700">{sh.transitionIn}</td>
                          <td className="py-2 px-4 text-right font-mono tabular-nums text-slate-600">
                            {sh.scdetScore.toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSceneFilter('all');
                                setPage(Math.max(1, Math.floor(sh.firstFrame / 24) + 1));
                                setTab('frames');
                              }}
                              className="font-semibold text-[#16339B] hover:underline"
                            >
                              Jump to f{sh.firstFrame}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'frames' && (
            <div className="space-y-5">
              {/* Filter & Pagination Toolbar */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label htmlFor="scene-filter" className="text-xs font-medium text-slate-600">
                    Filter by Scene
                  </label>
                  <select
                    id="scene-filter"
                    value={sceneFilter}
                    onChange={(e) => {
                      setSceneFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
                  >
                    <option value="all">All 38,829 Frames</option>
                    {data.scenes.map((sc) => (
                      <option key={sc.sceneId} value={sc.sceneId}>
                        {sc.sceneId} · {sc.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600">
                  <span>
                    Page {page} of {totalPages.toLocaleString()} ({data.framesPage.total.toLocaleString()} frames)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous frame page"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next frame page"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Frame Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {data.framesPage.items.map((f) => {
                    const isSel = selectedFrame?.frameId === f.frameId;
                    return (
                      <button
                        key={f.frameId}
                        type="button"
                        onClick={() => setSelectedFrame(f)}
                        className={`text-left bg-white border rounded-lg overflow-hidden transition-colors ${
                          isSel ? 'border-[#16339B] ring-2 ring-[#16339B]/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="aspect-video bg-slate-100 overflow-hidden relative">
                          <Image
                            src={f.thumbnailUrl}
                            alt={`${f.frameId} at ${f.timestampSeconds.toFixed(2)} seconds`}
                            width={480}
                            height={270}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <div className="text-[11px] font-mono tabular-nums font-semibold text-slate-900">
                            {f.frameId}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500 font-mono tabular-nums">
                            {f.timestampSeconds.toFixed(2)}s · {f.vlmInspected ? 'VLM verified' : f.analysisStatus}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Frame Inspector */}
                <aside className="bg-white border border-slate-200 rounded-lg p-5 h-fit sticky top-20">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Frame Telemetry Inspector</h3>
                  {selectedFrame ? (
                    <div className="space-y-4">
                      <Image
                        src={selectedFrame.thumbnailUrl}
                        alt={selectedFrame.frameId}
                        width={480}
                        height={270}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-video object-cover rounded border border-slate-200"
                      />
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <dt className="text-slate-500">Frame ID</dt>
                        <dd className="font-mono text-slate-900">{selectedFrame.frameId}</dd>
                        <dt className="text-slate-500">30 FPS Index</dt>
                        <dd className="font-mono tabular-nums text-slate-900">#{selectedFrame.frameNumber}</dd>
                        <dt className="text-slate-500">Timestamp</dt>
                        <dd className="font-mono tabular-nums text-slate-900">{selectedFrame.timestampSeconds.toFixed(3)}s</dd>
                        <dt className="text-slate-500">Scene / Shot</dt>
                        <dd className="font-mono text-slate-900">{selectedFrame.sceneId} / {selectedFrame.shotId}</dd>
                        <dt className="text-slate-500">Telemetry Record</dt>
                        <dd className="font-mono text-slate-900">{selectedFrame.telemetryComplete ? 'Complete' : 'Pending'}</dd>
                        <dt className="text-slate-500">Visual Inspection</dt>
                        <dd className="font-mono text-slate-900">{selectedFrame.vlmInspected ? 'Verified' : 'Queued'}</dd>
                      </dl>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Select any frame card on the left to inspect its 30fps index, shot assignment, and analysis state.
                    </p>
                  )}
                </aside>
              </div>
            </div>
          )}

          {tab === 'knowledge' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Visual DNA rules (e.g., epaulette, thana, pencil, placard, map)…"
                    aria-label="Search Visual DNA Knowledge Base"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16339B]"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Filter Visual DNA category"
                  className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900"
                >
                  <option value="all">All Categories</option>
                  <option value="background_diorama">Background Diorama</option>
                  <option value="character_rig">Character Rig</option>
                  <option value="brand_bumper">Brand Bumper</option>
                  <option value="insignia_macro">Insignia Macro</option>
                  <option value="infographic_machine">Infographic Machine</option>
                  <option value="craft_stencil_reveal">Craft Stencil Reveal</option>
                  <option value="hanging_placard">Hanging Placard</option>
                  <option value="rank_tower_strip">Rank Tower Strip</option>
                  <option value="transition_grammar">Transition Grammar</option>
                  <option value="audio_sfx_pattern">Audio & SFX Pattern</option>
                </select>
              </div>

              {data.knowledgeHits.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-600">
                  No Visual DNA entries matched your filter. Try clearing the search term.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.knowledgeHits.map((entry) => (
                    <article key={entry.id} className="bg-white border border-slate-200 rounded-lg p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-900">{entry.title}</h3>
                        <span className="text-xs font-mono text-slate-500 shrink-0">{entry.id}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                        {entry.sourceFrameId} · {entry.timestampSeconds.toFixed(1)}s · {entry.reactComponent}
                      </p>
                      <p className="mt-2.5 text-xs text-slate-700 leading-relaxed">{entry.description}</p>
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Recipe:</span> {entry.reusableRecipe}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {entry.colors.map((hex) => (
                          <span
                            key={hex}
                            title={hex}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600"
                          >
                            <span
                              className="w-3 h-3 rounded-xs border border-slate-300 inline-block"
                              style={{ backgroundColor: hex }}
                            />
                            {hex}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </StudioShell>
  );
}
