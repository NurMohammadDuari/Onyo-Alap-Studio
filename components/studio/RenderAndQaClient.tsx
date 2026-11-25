'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Film, Lock } from 'lucide-react';
import type { ProjectRecord } from '../../packages/shared-types/src/types';
import { ONE_MINUTE_PROJECT_ID } from '../../lib/one-min-seed';
import { StudioShell } from './StudioShell';
import { FullVideoComparisonPanel } from './FullVideoComparisonPanel';

interface QcReportItem {
  reportId: string;
  projectId: string;
  versionNumber: number;
  status: string;
  issues: Array<{ issueId: string; description: string; severity: string }>;
  summaryMd: string;
  createdAt: string;
}

interface ReportArtifact {
  id: string;
  name: string;
  folder: string;
  sizeBytes: number;
  updatedAt: string;
  preview: string;
}

export function RenderAndQaClient({
  mode,
}: {
  mode: 'rendering' | 'qc' | 'reports' | 'settings';
}) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [qcReports, setQcReports] = useState<QcReportItem[]>([]);
  const [artifacts, setArtifacts] = useState<ReportArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ReportArtifact | null>(null);
  const [renderingId, setRenderingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const [pRes, rRes] = await Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/reports').then((r) => r.json()),
    ]);
    setProjects(pRes.projects ?? []);
    setQcReports(rRes.qcReports ?? []);
    const list: ReportArtifact[] = rRes.artifacts ?? [];
    setArtifacts(list);
    if (list.length > 0 && !selectedArtifact) {
      setSelectedArtifact(list[0]);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/reports').then((r) => r.json()),
    ])
      .then(([pRes, rRes]) => {
        if (!active) return;
        setProjects(pRes.projects ?? []);
        setQcReports(rRes.qcReports ?? []);
        const list: ReportArtifact[] = rRes.artifacts ?? [];
        setArtifacts(list);
        if (list.length > 0) {
          setSelectedArtifact((prev) => prev ?? list[0]);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function triggerRender(projectId: string) {
    setRenderingId(projectId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/render`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Render blocked or failed');
      setMessage(`Rendered ${json.videoUrl} (${json.probe?.duration?.toFixed(2)}s, 1280×720)`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render error');
    } finally {
      setRenderingId(null);
    }
  }

  const titleMap = {
    rendering: 'Final MP4 Render Queue',
    qc: 'Automated Quality Control & Verification',
    reports: 'Forensic Reports & Production Provenance',
    settings: 'Studio Runtime & GitHub Repository Governance',
  };

  const subtitleMap = {
    rendering: 'FFmpeg H.264 1280×720 30fps encoder strictly gated by storyboard approval state.',
    qc: 'Automated blackdetect, stream duration parity, and audio track verification logs.',
    reports: 'Markdown engineering reports, telemetry manifests, and asset provenance registries.',
    settings: 'Official Onyo-Alap repository policy, security boundaries, and environment configuration.',
  };

  return (
    <StudioShell title={titleMap[mode]} subtitle={subtitleMap[mode]}>
      {error && (
        <div role="alert" className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
          {message}
        </div>
      )}

      {(mode === 'rendering' || mode === 'qc') && (
        <div className="space-y-6">
          <FullVideoComparisonPanel
            reconstructedUrl={
              projects.length > 0
                ? (projects.find((p) => p.projectId === ONE_MINUTE_PROJECT_ID)?.finalVideoPath ?? null)
                : undefined
            }
            onRendered={refresh}
          />

          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Project Render Authorization Ledger</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                    <th className="py-3 px-5">Project</th>
                    <th className="py-3 px-4 text-right">Version</th>
                    <th className="py-3 px-4">Gate State</th>
                    <th className="py-3 px-4">Output Video</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {projects.map((p) => {
                    const unlocked =
                      (p.approvalState === 'USER_APPROVED' || p.approvalState === 'FINAL_RENDER_AUTHORIZED') &&
                      p.approvedVersionNumber === p.currentStoryboardVersion;
                    return (
                      <tr key={p.projectId}>
                        <td className="py-3.5 px-5 font-medium text-slate-900">
                          <div>{p.title}</div>
                          <div className="text-xs font-mono text-slate-500">{p.projectId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs">
                          v{p.currentStoryboardVersion}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            {unlocked ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">{p.approvalState}</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-amber-700">{p.approvalState}</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                          {p.finalVideoPath ?? 'Not rendered yet'}
                        </td>
                        <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                          <Link
                            href={`/projects/${p.projectId}/storyboard`}
                            className="text-xs font-semibold text-[#16339B] hover:underline"
                          >
                            Review Storyboard
                          </Link>
                          <button
                            type="button"
                            disabled={!unlocked || renderingId === p.projectId}
                            onClick={() => triggerRender(p.projectId)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded ${
                              unlocked
                                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>{renderingId === p.projectId ? 'Rendering…' : 'Render MP4'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Rendered Video Players */}
          {projects.filter((p) => p.finalVideoPath).length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects
                .filter((p) => p.finalVideoPath)
                .map((p) => (
                  <div key={p.projectId} className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">{p.title}</h3>
                    <video
                      controls
                      src={p.finalVideoPath!}
                      className="w-full aspect-video rounded border border-slate-200 bg-black"
                    />
                    <p className="text-xs font-mono text-slate-500">{p.finalVideoPath}</p>
                  </div>
                ))}
            </section>
          )}

          {/* Automated QC Reports */}
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Automated QC Audit Reports ({qcReports.length})
            </h2>
            {qcReports.length === 0 ? (
              <p className="text-xs text-slate-500">
                No videos have been rendered yet. Approve a storyboard and trigger Final MP4 Render to generate a FFprobe + blackdetect QC report.
              </p>
            ) : (
              <div className="space-y-4">
                {qcReports.map((r) => (
                  <div key={r.reportId} className="border border-slate-200 rounded p-4">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-semibold text-slate-900">
                        {r.projectId} (v{r.versionNumber})
                      </span>
                      <span className={r.status === 'VERIFIED_COMPLETE' ? 'text-emerald-700' : 'text-amber-700'}>
                        {r.status}
                      </span>
                    </div>
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{r.summaryMd}</pre>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {mode === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200 h-fit">
            <div className="px-4 py-3 font-semibold text-sm text-slate-900">
              Generated Reports & Manifests ({artifacts.length})
            </div>
            {artifacts.length === 0 ? (
              <div className="p-4 text-xs text-slate-500">No Markdown reports found yet.</div>
            ) : (
              artifacts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedArtifact(a)}
                  className={`w-full text-left px-4 py-3 text-xs hover:bg-slate-50 ${
                    selectedArtifact?.id === a.id ? 'bg-slate-100 font-semibold text-[#16339B]' : 'text-slate-800'
                  }`}
                >
                  <div>{a.name}</div>
                  <div className="font-mono tabular-nums text-[11px] text-slate-500 mt-0.5">
                    {a.folder} · {(a.sizeBytes / 1024).toFixed(1)} KB
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
            {selectedArtifact ? (
              <div>
                <h2 className="text-sm font-semibold text-slate-900 mb-3 font-mono">{selectedArtifact.id}</h2>
                <pre className="p-4 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800 whitespace-pre-wrap overflow-x-auto max-h-[620px]">
                  {selectedArtifact.preview}
                </pre>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select an artifact on the left to view its contents.</p>
            )}
          </div>
        </div>
      )}

      {mode === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Official Repository Configuration</h2>
            <dl className="grid grid-cols-2 gap-2.5 text-xs">
              <dt className="text-slate-500">Application</dt>
              <dd className="font-medium text-slate-900">Onyo Alap Studio</dd>
              <dt className="text-slate-500">Repository Name</dt>
              <dd className="font-mono text-slate-900">Onyo-Alap (Private)</dd>
              <dt className="text-slate-500">Sole Collaborator</dt>
              <dd className="font-mono text-slate-900">NurMohammadDuari</dd>
              <dt className="text-slate-500">Primary Reference</dt>
              <dd className="font-mono text-slate-900">ukgbxNHllMY (Police Ranks Only)</dd>
              <dt className="text-slate-500">Visual Engine</dt>
              <dd className="font-mono text-slate-900">Next.js + React + SVG + Remotion</dd>
            </dl>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Security & Secret Hygiene</h2>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4">
              <li>Gemini API calls run strictly server-side using <span className="font-mono">process.env.GEMINI_API_KEY</span>.</li>
              <li>No GitHub personal access tokens are persisted in workspace files, scripts, or git config.</li>
              <li>Third-party reference MP4 and lossless PNG archives remain excluded from source commits.</li>
            </ul>
          </section>
        </div>
      )}
    </StudioShell>
  );
}
