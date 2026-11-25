'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import type { ProjectRecord } from '../../packages/shared-types/src/types';
import { StudioShell } from './StudioShell';

interface ReferenceSummary {
  counts: {
    expectedFrames: number;
    extractedNativePngCount: number;
    telemetryAnalyzedCount: number;
    vlmInspectedCount: number;
    queuedVlmCount: number;
    scenesCount: number;
    shotsCount: number;
    sfxCount: number;
  };
  reaVideo?: {
    installed: boolean;
    pythonAvailable: boolean;
    availableCapabilities: string[];
  };
  ranks?: Array<{ id: string }>;
  knowledgeHits?: Array<{ id: string }>;
}

export function DashboardClient({
  initialProjects = [],
}: {
  initialProjects?: ProjectRecord[];
}) {
  const [projects, setProjects] = useState<ProjectRecord[]>(initialProjects);
  const [refSummary, setRefSummary] = useState<ReferenceSummary | null>(null);
  const [loading, setLoading] = useState(initialProjects.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/projects').then((r) => r.json()),
      fetch('/api/reference?pageSize=6').then((r) => r.json()),
    ])
      .then(([projRes, refRes]) => {
        if (!active) return;
        setProjects(projRes.projects ?? []);
        setRefSummary(refRes);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load studio overview');
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = refSummary?.counts;

  return (
    <StudioShell
      title="Production Overview"
      subtitle="Visual DNA extracted from Bangladesh Police Ranks (ukgbxNHllMY), reusable Next.js React/Remotion paper-craft components, and storyboard-locked video assembly."
      primaryAction={
        <Link
          href="/script-studio"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16339B] rounded-lg hover:bg-[#0A2A9F] transition-colors whitespace-nowrap"
        >
          <span>Create Storyboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Quantitative Reference DNA Strip */}
      <section aria-label="Reference corpus metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500">Reference Frame Telemetry</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {counts ? counts.telemetryAnalyzedCount.toLocaleString() : '38,829'}
          </p>
          <p className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            {counts ? `${counts.extractedNativePngCount.toLocaleString()} lossless PNGs on disk` : 'Loading disk state'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500">Keyframes Visually Audited</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {counts ? `${counts.vlmInspectedCount} inspected` : '42 inspected'}
          </p>
          <p className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            {counts ? `${counts.queuedVlmCount.toLocaleString()} queued in frame store` : 'Resumable queue'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500">Scene & Shot Segmentation</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {counts ? `${counts.scenesCount} scenes · ${counts.shotsCount} shots` : '11 scenes · 97 shots'}
          </p>
          <p className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            30.00 fps CFR · 1280×720 · -14.1 LUFS
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-xs font-medium text-slate-500">Reusable Visual DNA Library</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {refSummary?.knowledgeHits?.length ?? 10} recipes
          </p>
          <p className="mt-1.5 text-xs text-slate-600 font-mono tabular-nums">
            {refSummary?.ranks?.length ?? 13} Police rank insignias · 10 templates
          </p>
        </div>
      </section>

      {/* Projects & Approval Gate Ledger */}
      <section aria-label="Production projects" className="bg-white border border-slate-200 rounded-lg mb-8">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Active Video Productions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Final MP4 rendering remains strictly locked until explicit user approval of the latest storyboard version.
            </p>
          </div>
          <Link
            href="/rendering"
            className="text-xs font-semibold text-[#16339B] hover:underline whitespace-nowrap"
          >
            Open Render Queue
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-600">No production projects yet.</p>
            <Link
              href="/script-studio"
              className="mt-3 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-[#16339B] rounded-lg"
            >
              Start First Production
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3 px-5">Project</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Version</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-5 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {projects.map((p) => {
                  const isApproved =
                    (p.approvalState === 'USER_APPROVED' || p.approvalState === 'FINAL_RENDER_AUTHORIZED') &&
                    p.approvedVersionNumber === p.currentStoryboardVersion;
                  return (
                    <tr key={p.projectId} className="hover:bg-slate-50">
                      <td className="py-3.5 px-5 font-medium text-slate-900">
                        <div>{p.title}</div>
                        <div className="text-xs text-slate-500 font-mono">{p.projectId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{p.language}</td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {(p.audioDurationSeconds ?? 0).toFixed(1)}s
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        v{p.currentStoryboardVersion}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          {isApproved ? (
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
                      <td className="py-3.5 px-5 text-right space-x-3 whitespace-nowrap">
                        <Link
                          href={`/projects/${p.projectId}/storyboard`}
                          className="text-xs font-semibold text-[#16339B] hover:underline"
                        >
                          Open Storyboard
                        </Link>
                        {p.finalVideoPath && (
                          <Link
                            href="/rendering"
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                          >
                            View MP4
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Studio Pipeline Entry Modules */}
      <section aria-label="Studio modules" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">1. Forensic Video & Frame Lab</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Explore all 38,829 frame telemetry records, REA-VIDEO scene cuts, and extract lossless native PNG batches from Bangladesh Police Ranks (ukgbxNHllMY).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <Link href="/reference-analyzer" className="text-[#16339B] hover:underline">
              Open Reference Analyzer
            </Link>
            <Link href="/audio-studio" className="text-slate-600 hover:text-slate-900">
              Audio & SFX
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">2. Next.js Paper-Craft & Remotion Engine</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Test live editable SVG & Remotion modules: 13 stitched rank insignias, articulated rivet characters, 3-arch Thana facade, logo bumper, and Bangladesh range map.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <Link href="/scene-builder" className="text-[#16339B] hover:underline">
              Inspect 5 Artwork Tests
            </Link>
            <Link href="/animation-studio" className="text-slate-600 hover:text-slate-900">
              Motion Lab
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">3. AI Director & Storyboard Gate</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Ingest Bengali or English scripts & voiceovers, generate Visual DNA storyboards, edit every shot surgically, and unlock H.264 rendering after explicit approval.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <Link href="/script-studio" className="text-[#16339B] hover:underline">
              Script & AI Director
            </Link>
            <Link href="/quality-control" className="text-slate-600 hover:text-slate-900">
              QC Reports
            </Link>
          </div>
        </div>
      </section>
    </StudioShell>
  );
}
