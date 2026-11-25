'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Upload } from 'lucide-react';
import { StudioShell } from './StudioShell';

const SAMPLE_SCRIPT = `[00:00:00.000 - 00:00:05.000]
আসসালামু আলাইকুম। চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপের বিষয় বাংলাদেশ পুলিশের র্যাঙ্ক কাঠামো।
[00:00:05.000 - 00:00:11.000]
থানার গেটে দাঁড়িয়ে থাকা কনস্টেবলের ব্যাজে শুধু রুপালি রঙে লেখা একটি শব্দ পুলিশ—কোনো তারকা বা শাপলা নেই।
[00:00:11.000 - 00:00:17.500]
কিন্তু একজন এএসপি সরাসরি বিসিএস পুলিশ ক্যাডার থেকে নিয়োগ পান এবং সিনিয়র ইন্সপেক্টরকেও স্যালুট নিতে পারেন।
[00:00:17.500 - 00:00:24.000]
১৯০৫ সালের প্রবিধান থেকে আজকের আটটি বিভাগীয় পুলিশ রেঞ্জ—সবকিছুর শীর্ষে থাকেন আইজিপি।`;

export function ScriptDirectorClient({ defaultEngine = 'deterministic' }: { defaultEngine?: 'deterministic' | 'gemini' }) {
  const router = useRouter();
  const [title, setTitle] = useState('বাংলাদেশ পুলিশের র্যাঙ্ক ও বিসিএস ক্যাডার বিশ্লেষণ');
  const [language, setLanguage] = useState<'bn' | 'en' | 'mixed'>('bn');
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPT);
  const [useGemini, setUseGemini] = useState(defaultEngine === 'gemini');
  const [audioFileInfo, setAudioFileInfo] = useState<{
    audioPath: string;
    durationSeconds: number;
  } | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('audio', file);
      const res = await fetch('/api/upload/audio', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Audio upload failed');
      setAudioFileInfo({
        audioPath: json.audioPath,
        durationSeconds: json.durationSeconds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setUploadingAudio(false);
    }
  }

  async function handleCreateStoryboard(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || scriptText.trim().length < 10) {
      setError('Please enter a project title and at least one script sentence (10+ characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          language,
          scriptText: scriptText.trim(),
          audioPath: audioFileInfo?.audioPath,
          audioDurationSeconds: audioFileInfo?.durationSeconds,
          hasExactAudioSync: Boolean(audioFileInfo),
          useGemini,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to generate storyboard');
      }
      router.push(`/projects/${json.project.projectId}/storyboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Storyboard generation failed');
      setSubmitting(false);
    }
  }

  return (
    <StudioShell
      title="Script Ingestion & Autonomous AI Director"
      subtitle="Submit a Bengali or English script (plain text, SRT, or timestamped cue blocks) and optional voiceover audio to generate an editable Onyo Alap storyboard."
    >
      <form onSubmit={handleCreateStoryboard} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          {error && (
            <div role="alert" className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="project-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Production Title
              </label>
              <input
                id="project-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#16339B]"
              />
            </div>

            <div>
              <label htmlFor="project-lang" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Language
              </label>
              <select
                id="project-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'bn' | 'en' | 'mixed')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
              >
                <option value="bn">Bengali (বাংলা)</option>
                <option value="en">English</option>
                <option value="mixed">Mixed (Bengali + English)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="script-textarea" className="block text-xs font-semibold text-slate-700">
                Script / Subtitles / Narration Cues
              </label>
              <button
                type="button"
                onClick={() => setScriptText(SAMPLE_SCRIPT)}
                className="text-xs font-medium text-[#16339B] hover:underline"
              >
                Load Reference Bengali Sample
              </button>
            </div>
            <textarea
              id="script-textarea"
              rows={11}
              required
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste timestamped cues ([00:00:00.000 - 00:00:05.000]), SRT, or plain paragraphs…"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-md font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#16339B]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Final video render stays locked until you inspect every keyframe and approve the generated storyboard.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#16339B] rounded-lg hover:bg-[#0A2A9F] disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Directing Storyboard…' : 'Generate Complete Storyboard'}</span>
            </button>
          </div>
        </div>

        {/* Right Configuration Column */}
        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">Director Engine Mode</h2>
            <div className="space-y-2.5">
              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="director-engine"
                  checked={!useGemini}
                  onChange={() => setUseGemini(false)}
                  className="mt-0.5 accent-[#16339B]"
                />
                <span>
                  <strong className="block text-slate-900">Visual DNA Deterministic Director</strong>
                  <span className="text-slate-600">
                    Maps narration topics, ranks, years, and maps directly to measured Onyo Alap templates without external API dependency.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="director-engine"
                  checked={useGemini}
                  onChange={() => setUseGemini(true)}
                  className="mt-0.5 accent-[#16339B]"
                />
                <span>
                  <strong className="block text-slate-900">Gemini 4 Hydrogen AI Director</strong>
                  <span className="text-slate-600">
                    Uses server-side <span className="font-mono">gemini-4-hydrogen</span> with Visual DNA schema grounding (requires server <span className="font-mono">GEMINI_API_KEY</span>).
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Optional Voiceover Audio Sync</h2>
            <p className="text-xs text-slate-600">
              Upload MP3, WAV, AAC, or M4A to measure exact FFprobe duration and mux into the final approved MP4.
            </p>
            <label className="flex items-center justify-center gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploadingAudio ? 'Probing Audio…' : 'Upload Voiceover Audio'}</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="sr-only"
              />
            </label>
            {audioFileInfo ? (
              <div className="text-xs font-mono tabular-nums text-emerald-700">
                Synced: {audioFileInfo.durationSeconds.toFixed(2)}s ({audioFileInfo.audioPath})
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                No audio uploaded: segment timings will be parsed from timestamps or estimated honestly from word count.
              </div>
            )}
          </div>
        </aside>
      </form>
    </StudioShell>
  );
}
