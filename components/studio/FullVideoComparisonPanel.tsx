'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Film,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ONE_MINUTE_POLICE_SHOTS, ONE_MINUTE_PROJECT_ID } from '../../lib/one-min-seed';
import { findShotAtTime, formatVideoClock } from '../../lib/video-sync';

export interface FullVideoComparisonPanelProps {
  referenceUrl?: string;
  reconstructedUrl?: string | null;
  onRendered?: () => void | Promise<void>;
}

const BEAT_MARKERS = [
  { time: 0.0, end: 3.8, label: '00:00 Thana' },
  { time: 3.8, end: 9.2, label: '00:04 Tea' },
  { time: 9.2, end: 16.0, label: '00:09 Jeep' },
  { time: 16.0, end: 23.2, label: '00:16 Approach' },
  { time: 23.2, end: 26.8, label: '00:23 Salute' },
  { time: 26.8, end: 38.5, label: '00:27 Grade 9' },
  { time: 41.5, end: 47.0, label: '00:42 Constable' },
  { time: 47.0, end: 56.0, label: '00:47 SP 20y' },
  { time: 56.0, end: 60.1, label: '00:56 Bumper' },
];

type AudioSource = 'reference' | 'studio' | 'muted';

export function FullVideoComparisonPanel({
  referenceUrl = '/renders/reference_police_ranks_1min.mp4',
  reconstructedUrl: reconstructedUrlProp,
  onRendered,
}: FullVideoComparisonPanelProps) {
  const refVideoRef = useRef<HTMLVideoElement | null>(null);
  const reconVideoRef = useRef<HTMLVideoElement | null>(null);

  const [fetchedReconUrl, setFetchedReconUrl] = useState<string | null>(null);
  const [cacheNonce, setCacheNonce] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [audioSource, setAudioSource] = useState<AudioSource>('reference');
  const [playbackRate, setPlaybackRate] = useState<0.5 | 1 | 1.5>(1);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const resolvedReconUrl =
    reconstructedUrlProp !== undefined ? reconstructedUrlProp : fetchedReconUrl;

  const reconSrc = resolvedReconUrl
    ? cacheNonce > 0
      ? `${resolvedReconUrl}?v=${cacheNonce}`
      : resolvedReconUrl
    : null;

  useEffect(() => {
    if (reconstructedUrlProp !== undefined) return;
    let active = true;
    fetch(`/api/projects/${ONE_MINUTE_PROJECT_ID}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.project) return;
        setFetchedReconUrl(data.project.finalVideoPath ?? null);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reconstructedUrlProp]);

  useEffect(() => {
    const refEl = refVideoRef.current;
    const reconEl = reconVideoRef.current;
    if (refEl) {
      refEl.muted = audioSource !== 'reference';
      refEl.playbackRate = playbackRate;
    }
    if (reconEl) {
      reconEl.muted = audioSource !== 'studio';
      reconEl.playbackRate = playbackRate;
    }
  }, [audioSource, playbackRate, reconSrc]);

  const activeShot = useMemo(
    () =>
      findShotAtTime(ONE_MINUTE_POLICE_SHOTS, currentTime) ??
      ONE_MINUTE_POLICE_SHOTS[0],
    [currentTime]
  );

  async function togglePlay() {
    const refEl = refVideoRef.current;
    const reconEl = reconVideoRef.current;
    if (!refEl) return;

    if (isPlaying) {
      refEl.pause();
      reconEl?.pause();
      setIsPlaying(false);
      return;
    }

    if (reconEl && Math.abs(reconEl.currentTime - refEl.currentTime) > 0.15) {
      reconEl.currentTime = refEl.currentTime;
    }

    const plays: Array<Promise<void>> = [refEl.play()];
    if (reconEl && reconSrc) {
      plays.push(reconEl.play());
    }
    await Promise.allSettled(plays);
    setIsPlaying(!refEl.paused);
  }

  function seekBoth(nextTime: number) {
    const clamped = Math.max(0, Math.min(duration, nextTime));
    const refEl = refVideoRef.current;
    const reconEl = reconVideoRef.current;
    if (refEl) refEl.currentTime = clamped;
    if (reconEl && reconSrc && reconEl.readyState >= 1) {
      reconEl.currentTime = clamped;
    }
    setCurrentTime(clamped);
  }

  function handleRestart() {
    const refEl = refVideoRef.current;
    const reconEl = reconVideoRef.current;
    if (refEl) {
      refEl.pause();
      refEl.currentTime = 0;
    }
    if (reconEl && reconEl.readyState >= 1) {
      reconEl.pause();
      reconEl.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }

  function handleReferenceTimeUpdate() {
    const refEl = refVideoRef.current;
    const reconEl = reconVideoRef.current;
    if (!refEl) return;
    const t = refEl.currentTime;
    setCurrentTime(t);
    if (
      isPlaying &&
      reconEl &&
      reconSrc &&
      reconEl.readyState >= 2 &&
      Math.abs(reconEl.currentTime - t) > 0.15
    ) {
      reconEl.currentTime = t;
    }
  }

  async function handleRenderOneMinute() {
    setIsRendering(true);
    setRenderError(null);
    try {
      const res = await fetch(`/api/projects/${ONE_MINUTE_PROJECT_ID}/render`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to render 1-minute reconstruction');
      }
      setFetchedReconUrl(json.videoUrl ?? `/renders/${ONE_MINUTE_PROJECT_ID}_v1.mp4`);
      setCacheNonce(Date.now());
      if (onRendered) {
        await onRendered();
      }
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : 'Render error');
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <section
      data-testid="full-video-comparison"
      data-current-time={currentTime.toFixed(1)}
      className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            1-Minute Full Video Side-by-Side Comparison (00:00 – 01:00)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized dual 1280×720 30fps playback: Original Bangladesh Police Ranks (ukgbxNHllMY) vs. Onyo Alap React SSR Reconstruction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/projects/${ONE_MINUTE_PROJECT_ID}/storyboard`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-800 rounded-md hover:bg-slate-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open 1-Min Storyboard</span>
          </Link>
          <button
            type="button"
            disabled={isRendering}
            onClick={handleRenderOneMinute}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#16339B] text-white rounded-md hover:bg-[#0D216E] disabled:opacity-60"
          >
            <Film className="w-3.5 h-3.5" />
            <span>
              {isRendering
                ? 'Rendering 60s MP4…'
                : reconSrc
                  ? 'Re-Render 1-Min MP4'
                  : 'Render 1-Min Studio Video'}
            </span>
          </button>
        </div>
      </div>

      {renderError && (
        <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {renderError}
        </div>
      )}

      {/* Dual Synchronized 16:9 Video Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600">
            <span className="font-semibold text-slate-900">
              ORIGINAL REFERENCE (00:00–01:00)
            </span>
            <span className="tabular-nums">ukgbxNHllMY · 1280×720</span>
          </div>
          <div className="aspect-video w-full rounded-md border border-slate-300 overflow-hidden bg-slate-950">
            <video
              ref={refVideoRef}
              data-testid="ref-video"
              aria-label="Original Reference 1-Minute Video"
              src={referenceUrl}
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                if (Number.isFinite(dur) && dur > 10) {
                  setDuration(dur);
                }
                e.currentTarget.playbackRate = playbackRate;
                e.currentTarget.muted = audioSource !== 'reference';
              }}
              onTimeUpdate={handleReferenceTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                reconVideoRef.current?.pause();
              }}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-600">
            <span className="font-semibold text-[#16339B]">
              ONYO ALAP RECONSTRUCTION (60.0s)
            </span>
            <span className="tabular-nums">
              {reconSrc ? 'React SSR + FFmpeg H.264' : 'Pending Render'}
            </span>
          </div>
          <div className="aspect-video w-full rounded-md border border-slate-300 overflow-hidden bg-slate-950">
            {reconSrc ? (
              <video
                ref={reconVideoRef}
                data-testid="recon-video"
                aria-label="Onyo Alap Reconstructed 1-Minute Video"
                src={reconSrc}
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => {
                  e.currentTarget.playbackRate = playbackRate;
                  e.currentTarget.muted = audioSource !== 'studio';
                  if (refVideoRef.current && refVideoRef.current.currentTime > 0) {
                    e.currentTarget.currentTime = refVideoRef.current.currentTime;
                  }
                }}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-slate-200 space-y-3">
                <p className="text-sm font-semibold">
                  1-Minute Reconstruction Not Yet Rendered
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click Render 1-Min Studio Video above to compile all 12 React SVG shots into a synced 60.0s H.264 MP4.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Transport Controls */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause Synced' : 'Play Synced'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Synced' : 'Play Synced'}</span>
            </button>
            <button
              type="button"
              onClick={handleRestart}
              aria-label="Restart both videos"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
            <span className="ml-2 text-xs font-mono tabular-nums text-slate-800">
              {formatVideoClock(currentTime)} / {formatVideoClock(duration)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Audio Source Toggle */}
            <div className="inline-flex items-center p-0.5 bg-white border border-slate-300 rounded-md">
              <button
                type="button"
                onClick={() => setAudioSource('reference')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                  audioSource === 'reference'
                    ? 'bg-[#16339B] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>Reference Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioSource('studio')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                  audioSource === 'studio'
                    ? 'bg-[#16339B] text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>Studio Render Audio</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioSource('muted')}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                  audioSource === 'muted'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <VolumeX className="w-3 h-3" />
                <span>Mute</span>
              </button>
            </div>

            {/* Playback Speed */}
            <div className="inline-flex items-center p-0.5 bg-white border border-slate-300 rounded-md">
              {([0.5, 1, 1.5] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setPlaybackRate(rate)}
                  className={`px-2 py-1 text-xs font-mono tabular-nums rounded ${
                    playbackRate === rate
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Master Scrubber */}
        <div>
          <input
            type="range"
            aria-label="Master 60-second synchronized scrubber"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={(e) => seekBoth(Number(e.target.value))}
            className="w-full accent-[#16339B]"
          />
        </div>

        {/* Beat Jump Markers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {BEAT_MARKERS.map((beat) => {
            const active =
              currentTime >= beat.time &&
              currentTime < beat.end;
            return (
              <button
                key={beat.time}
                type="button"
                onClick={() => seekBoth(beat.time)}
                className={`px-2 py-1 text-[11px] font-mono tabular-nums rounded border transition-colors ${
                  active
                    ? 'bg-[#D81919] text-white border-[#D81919] font-semibold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {beat.label}
              </button>
            );
          })}
        </div>

        {/* Active Beat Context Bar */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-900 font-medium">
            <span className="font-mono text-[#16339B] mr-2">
              {activeShot.shotId} ({activeShot.startTime.toFixed(1)}–{activeShot.endTime.toFixed(1)}s)
            </span>
            <span>{activeShot.title}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Template: {activeShot.templateType}
          </div>
        </div>
      </div>
    </section>
  );
}
