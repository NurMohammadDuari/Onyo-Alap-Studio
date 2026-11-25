'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Player } from '@remotion/player';
import { Columns2, SplitSquareHorizontal } from 'lucide-react';
import { BANGLADESH_POLICE_RANKS, ONYO_ALAP_VISUAL_DNA } from '../../packages/visual-dna/src/index';
import type { StoryboardShot } from '../../packages/shared-types/src/types';
import { OnyoAlapComposition } from '../../packages/remotion-engine/src/OnyoAlapComposition';
import { ShotSceneRenderer } from '../../packages/remotion-engine/src/ShotSceneRenderer';
import { StudioShell } from './StudioShell';
import { FullVideoComparisonPanel } from './FullVideoComparisonPanel';

type ShowcaseTestId = 'infographic_rank' | 'thana_character' | 'logo_bumper' | 'history_map' | 'counter_composite';

const SHOWCASE_TABS: Array<{ id: ShowcaseTestId; label: string }> = [
  { id: 'infographic_rank', label: '1. Rank Infographic' },
  { id: 'thana_character', label: '2. Thana Character' },
  { id: 'logo_bumper', label: '3. Logo Bumper' },
  { id: 'history_map', label: '4. History & Map' },
  { id: 'counter_composite', label: '5. Multi-Layer Dial' },
];

interface ComparatorPreset {
  id: string;
  label: string;
  timestampLabel: string;
  keyframeFile: string;
  frameIndex: number;
  shot: StoryboardShot;
}

function makePresetShot(partial: Partial<StoryboardShot> & { shotId: string; title: string; templateType: StoryboardShot['templateType'] }): StoryboardShot {
  return {
    sceneId: 'COMPARE',
    order: 1,
    startTime: 0,
    endTime: 5,
    duration: 5,
    narration: '',
    scenePurpose: 'Visual DNA Parity Check',
    visualObjective: 'Compare React SSR/SVG reconstruction directly against original frame',
    mainSubject: partial.title,
    secondaryElements: [],
    background: {
      style: partial.shotId,
      primaryHex: ONYO_ALAP_VISUAL_DNA.palette.skyPaperBlue,
      secondaryHex: ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow,
      paperTexture: true,
    },
    foreground: '',
    characters: [],
    objects: [],
    typography: { accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent },
    graphics: {},
    composition: { focalAnchor: 'center', depthLayers: 4 },
    camera: { movement: 'static', zoomStart: 1, zoomEnd: 1, panXStart: 0, panXEnd: 0 },
    animation: { entranceStyle: 'paper_drop', speedMultiplier: 1, easing: 'linear' },
    transitions: { in: 'cut', out: 'cut' },
    sfx: [],
    music: { mood: 'documentary', bpm: 96, volumeDb: -18 },
    continuityNotes: '',
    reactComponents: ['ShotSceneRenderer'],
    assetDependencies: [],
    ...partial,
  };
}

const COMPARATOR_PRESETS: ComparatorPreset[] = [
  {
    id: 'thana_exterior',
    label: 'Thana Verandah Establishing',
    timestampLabel: '00:02 (t_2.png)',
    keyframeFile: 't_2.png',
    frameIndex: 40,
    shot: makePresetShot({
      shotId: 'CMP_T2',
      title: 'থানা প্রাঙ্গণ ও বারান্দা',
      templateType: 'diorama_thana_exterior',
      narration: 'মনে করেন একটা কাজে থানায় গেছেন।',
      typography: {
        caption: 'মনে করেন একটা কাজে থানায় গেছেন।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
    }),
  },
  {
    id: 'tea_verandah',
    label: 'Tea Sipping Officer & Visitor',
    timestampLabel: '00:08 (t_8.png)',
    keyframeFile: 't_8.png',
    frameIndex: 45,
    shot: makePresetShot({
      shotId: 'CMP_T8',
      title: 'অভিজ্ঞ কর্মকর্তা ও দর্শনার্থী',
      templateType: 'diorama_thana_exterior',
      narration: 'বারান্দায় দাঁড়িয়ে একজন পুলিশ কর্মকর্তার সাথে কথা বলছেন।',
      typography: {
        caption: 'বারান্দায় দাঁড়িয়ে একজন পুলিশ কর্মকর্তার সাথে কথা বলছেন।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
      characters: [
        {
          id: 'vis',
          role: 'Civilian Visitor',
          pose: 'standing',
          facing: 'right',
          x: 420,
          y: 350,
          scale: 1.25,
          uniformColor: '#C8D3CD',
          trouserColor: '#2B3A55',
        },
        {
          id: 'off',
          role: 'Senior Police Officer',
          pose: 'tea_sipping',
          facing: 'left',
          x: 780,
          y: 348,
          scale: 1.25,
          uniformColor: ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
          trouserColor: ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
        },
      ],
    }),
  },
  {
    id: 'royal_bumper',
    label: 'Onyo Alap Cobalt Logo Bumper',
    timestampLabel: '01:00 (t_60.png)',
    keyframeFile: 't_60.png',
    frameIndex: 90,
    shot: makePresetShot({
      shotId: 'CMP_T60',
      title: 'অন্য আলাপ ব্র্যান্ড বাম্পার',
      templateType: 'brand_bumper',
      background: {
        style: 'royal_cobalt',
        primaryHex: ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid,
        secondaryHex: ONYO_ALAP_VISUAL_DNA.palette.royalCobaltDeep,
        paperTexture: true,
      },
      narration: 'চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপ।',
      typography: {
        headline: 'অন্য আলাপ',
        caption: 'চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপ।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
    }),
  },
  {
    id: 'naik_stencil',
    label: 'Naik Epaulette Stencil Reveal',
    timestampLabel: '04:15 (t_255.png)',
    keyframeFile: 't_255.png',
    frameIndex: 18,
    shot: makePresetShot({
      shotId: 'CMP_T255',
      title: 'নায়েক (Naik) — র‍্যাঙ্ক ব্যাজ',
      templateType: 'epaulette_macro_showcase',
      background: {
        style: 'craft_tan',
        primaryHex: '#DFD2B8',
        secondaryHex: '#A78B62',
        paperTexture: true,
      },
      graphics: { highlightRankId: 'naik' },
      narration: 'নায়েকের ব্যাজে দুটি লাল ভি আকৃতির শেভরন থাকে।',
      typography: {
        headline: 'নায়েক · র‍্যাঙ্ক ০২',
        caption: 'নায়েকের ব্যাজে দুটি লাল ভি আকৃতির শেভরন থাকে।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
    }),
  },
  {
    id: 'office_placard',
    label: 'Office Interior & Hanging Placard',
    timestampLabel: '09:00 (t_540.png)',
    keyframeFile: 't_540.png',
    frameIndex: 35,
    shot: makePresetShot({
      shotId: 'CMP_T540',
      title: 'এসআই ১৯০৫ অফিস ডায়োরামা',
      templateType: 'diorama_interior_office',
      narration: '১৯০৫ সালে সাব-ইন্সপেক্টর ও ওসি পদবির কাঠামো নির্ধারিত হয়।',
      typography: {
        placardText: 'এসআই',
        placardYear: '১৯০৫',
        caption: '১৯০৫ সালে সাব-ইন্সপেক্টর ও ওসি পদবির কাঠামো নির্ধারিত হয়।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue,
      },
      characters: [
        {
          id: 'si_off',
          role: 'Sub-Inspector',
          pose: 'walking',
          facing: 'left',
          x: 780,
          y: 375,
          scale: 1.25,
          uniformColor: ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
          trouserColor: ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
        },
      ],
    }),
  },
  {
    id: 'rank_strip',
    label: '6-Rank Cardstock Strip',
    timestampLabel: '20:10 (t_1210.png)',
    keyframeFile: 't_1210.png',
    frameIndex: 60,
    shot: makePresetShot({
      shotId: 'CMP_T1210',
      title: 'কনস্টেবল থেকে ইন্সপেক্টর পর্যন্ত পদক্রম',
      templateType: 'rank_tower_comparison',
      background: {
        style: 'craft_strip',
        primaryHex: '#FAF6EB',
        secondaryHex: '#E5D7AE',
        paperTexture: true,
      },
      graphics: {
        rankIds: ['constable', 'naik', 'asi', 'si', 'sergeant', 'inspector'],
        highlightRankId: 'inspector',
        showPencilPointer: false,
      },
      narration: 'কনস্টেবল থেকে শুরু করে ইন্সপেক্টর পর্যন্ত প্রথম ছয়টি র‍্যাঙ্ক।',
      typography: {
        headline: 'কনস্টেবল (১) থেকে ইন্সপেক্টর (৬)',
        caption: 'কনস্টেবল থেকে শুরু করে ইন্সপেক্টর পর্যন্ত প্রথম ছয়টি র‍্যাঙ্ক।',
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue,
      },
    }),
  },
];

export function SceneBuilderClient({ defaultMode = 'builder' }: { defaultMode?: 'builder' | 'animation' }) {
  const [activeTest, setActiveTest] = useState<ShowcaseTestId>(
    defaultMode === 'animation' ? 'logo_bumper' : 'infographic_rank'
  );
  const [selectedRankId, setSelectedRankId] = useState('inspector');
  const [pose, setPose] = useState<'standing' | 'walking' | 'saluting' | 'tea_sipping' | 'seated_reading' | 'guarding_rifle'>('saluting');
  const [placardYear, setPlacardYear] = useState('১৯০৫');
  const [counterVal, setCounterVal] = useState('২');
  const [headlineOverride, setHeadlineOverride] = useState('');
  const [previewFrame, setPreviewFrame] = useState(45);

  // Reference vs React Reconstruction Comparator state
  const [presetId, setPresetId] = useState<string>(COMPARATOR_PRESETS[0].id);
  const [compareMode, setCompareMode] = useState<'side_by_side' | 'split_wipe'>('side_by_side');
  const [splitPct, setSplitPct] = useState(50);

  const activePreset = useMemo(
    () => COMPARATOR_PRESETS.find((p) => p.id === presetId) ?? COMPARATOR_PRESETS[0],
    [presetId]
  );

  const testShot: StoryboardShot = useMemo(() => {
    const rank = BANGLADESH_POLICE_RANKS.find((r) => r.id === selectedRankId) ?? BANGLADESH_POLICE_RANKS[0];
    const base: StoryboardShot = {
      shotId: 'PREVIEW_001',
      sceneId: 'SCENE_TEST',
      order: 1,
      title: headlineOverride || `${rank.nameBn} (${rank.nameEn})`,
      startTime: 0,
      endTime: 5,
      duration: 5,
      narration: rank.notesBn,
      scenePurpose: 'Live interactive React + SVG + Remotion artwork verification',
      visualObjective: 'Render tactile paper-craft layers at 30fps',
      templateType: 'epaulette_macro_showcase',
      mainSubject: rank.nameBn,
      secondaryElements: ['Cardstock Slot', 'Stitch Rim'],
      background: {
        style: activeTest,
        primaryHex: activeTest === 'logo_bumper' ? ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid : ONYO_ALAP_VISUAL_DNA.palette.skyPaperBlue,
        secondaryHex: activeTest === 'logo_bumper' ? ONYO_ALAP_VISUAL_DNA.palette.royalCobaltDeep : ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow,
        paperTexture: true,
      },
      foreground: '2.5D cardstock parallax border',
      characters: [],
      objects: [],
      typography: {
        headline: headlineOverride || `${rank.nameBn} · ${rank.payGrade}`,
        subheadline: rank.cadre,
        caption: rank.notesBn,
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
      graphics: {
        rankIds: ['constable', 'naik', 'asi', 'si', 'inspector', 'asp'],
        highlightRankId: selectedRankId,
        counterValue: counterVal,
        counterLabel: 'শিক্ষানবিশ কাল',
        showPencilPointer: true,
        diagramNodes: [
          { label: 'ঢাকা রেঞ্জ', sub: 'Range 01' },
          { label: 'চট্টগ্রাম রেঞ্জ', sub: 'Range 02' },
          { label: 'রাজশাহী রেঞ্জ', sub: 'Range 03' },
          { label: 'খুলনা রেঞ্জ', sub: 'Range 04' },
          { label: 'সিলেট রেঞ্জ', sub: 'Range 05' },
          { label: 'বরিশাল রেঞ্জ', sub: 'Range 06' },
          { label: 'রংপুর রেঞ্জ', sub: 'Range 07' },
          { label: 'ময়মনসিংহ রেঞ্জ', sub: 'Range 08' },
        ],
      },
      composition: { focalAnchor: 'center', depthLayers: 4 },
      camera: { movement: 'push_in', zoomStart: 1, zoomEnd: 1.07, panXStart: -12, panXEnd: 12 },
      animation: { entranceStyle: 'paper_drop', speedMultiplier: 1, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      transitions: { in: 'paper_wipe', out: 'cut' },
      sfx: [],
      music: { mood: 'documentary_marimba', bpm: 96, volumeDb: -18 },
      continuityNotes: 'Matched to Visual DNA palette',
      reactComponents: ['ShotSceneRenderer'],
      assetDependencies: ['VDNA_001'],
    };

    if (activeTest === 'infographic_rank') {
      return {
        ...base,
        templateType: 'rank_tower_comparison',
        typography: {
          ...base.typography,
          headline: headlineOverride || `${rank.nameBn} — র‍্যাঙ্ক ব্যাজ ও পদক্রম`,
        },
      };
    }

    if (activeTest === 'thana_character') {
      return {
        ...base,
        templateType: 'diorama_thana_exterior',
        typography: {
          ...base.typography,
          headline: headlineOverride || 'থানা প্রাঙ্গণ ও অফিসার ডায়োরামা',
          caption: 'বারান্দায় দাঁড়িয়ে অভিজ্ঞ অফিসার ও জিপ থেকে নামা তরুণ এএসপি।',
        },
        objects: [{ id: 'jeep_preview', kind: 'police_jeep', x: 870, y: 455, scale: 0.95 }],
        characters: [
          {
            id: 'officer_a',
            role: 'Senior Inspector',
            rankId: selectedRankId,
            pose,
            facing: 'right',
            x: 360,
            y: 350,
            scale: 1.12,
            uniformColor: ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
            trouserColor: ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
          },
          {
            id: 'civilian_b',
            role: 'Civilian Visitor',
            pose: 'standing',
            facing: 'left',
            x: 520,
            y: 355,
            scale: 1.05,
            uniformColor: '#C8D3CD',
            trouserColor: '#2B3A55',
          },
        ],
      };
    }

    if (activeTest === 'logo_bumper') {
      return {
        ...base,
        templateType: 'brand_bumper',
        typography: {
          headline: 'অন্য আলাপ',
          subheadline: 'চেনা জিনিসের অচেনা দিক',
          caption: 'আসসালামু আলাইকুম, স্বাগতম অন্য আলাপের আজকের আয়োজনে।',
          accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
        },
      };
    }

    if (activeTest === 'history_map') {
      return {
        ...base,
        templateType: 'bangladesh_range_map',
        typography: {
          ...base.typography,
          headline: headlineOverride || 'বাংলাদেশ পুলিশ রেঞ্জ ও ঐতিহাসিক পটভূমি',
          placardText: 'ইতিহাস',
          placardYear,
          caption: '১৮৬১ ও ১৯০৫ সালের বিধিমালা থেকে আধুনিক ৮টি প্রশাসনিক রেঞ্জ।',
        },
      };
    }

    return {
      ...base,
      templateType: 'infographic_dial_counter',
      typography: {
        ...base.typography,
        headline: headlineOverride || 'কাগজের গ্রিড কাউন্টার ও ডায়াল কম্পোজিশন',
        placardText: 'নথিভুক্তি',
        placardYear,
      },
    };
  }, [activeTest, selectedRankId, pose, placardYear, counterVal, headlineOverride]);

  return (
    <StudioShell
      title={defaultMode === 'animation' ? 'Remotion Motion & Camera Studio' : 'Next.js Art & Scene Builder'}
      subtitle="All five reusable Onyo Alap artwork systems rendered directly via editable React, SVG, and Remotion components at 1280×720 30fps."
    >
      {/* Interactive 5-Test Switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
        {SHOWCASE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTest(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTest === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Remotion Stage */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Live Remotion Player (1280×720 · 30 fps)
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              Template: {testShot.templateType}
            </span>
          </div>

          <div className="aspect-video w-full bg-[#041664] rounded-md overflow-hidden border border-slate-300">
            <Player
              component={OnyoAlapComposition}
              inputProps={{ shots: [testShot], showCaptions: true }}
              durationInFrames={150}
              compositionWidth={1280}
              compositionHeight={720}
              fps={30}
              controls
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Static SVG Frame Scrubber */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <label htmlFor="frame-scrubber" className="font-medium text-slate-700">
                Inspect Exact SVG Frame ({previewFrame} / 150)
              </label>
              <span className="font-mono tabular-nums text-slate-500">
                {(previewFrame / 30).toFixed(2)}s
              </span>
            </div>
            <input
              id="frame-scrubber"
              type="range"
              min={0}
              max={149}
              value={previewFrame}
              onChange={(e) => setPreviewFrame(Number(e.target.value))}
              className="w-full accent-[#16339B]"
            />
            <div className="mt-3 aspect-video w-full max-w-lg rounded border border-slate-200 overflow-hidden bg-slate-50">
              <ShotSceneRenderer shot={testShot} localFrame={previewFrame} totalFrames={150} fps={30} />
            </div>
          </div>
        </div>

        {/* Editable Component Props Panel */}
        <aside className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-slate-900">Editable Artwork Props</h2>

          <div>
            <label htmlFor="rank-select" className="block text-xs font-medium text-slate-700 mb-1">
              Police Rank Insignia (13 Verified Ranks)
            </label>
            <select
              id="rank-select"
              value={selectedRankId}
              onChange={(e) => setSelectedRankId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
            >
              {BANGLADESH_POLICE_RANKS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.orderBn}. {r.nameBn} ({r.nameEn}) — {r.payGrade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pose-select" className="block text-xs font-medium text-slate-700 mb-1">
              Articulated Character Pose
            </label>
            <select
              id="pose-select"
              value={pose}
              onChange={(e) => setPose(e.target.value as typeof pose)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
            >
              <option value="standing">Standing Attention</option>
              <option value="saluting">Saluting Officer</option>
              <option value="walking">Walking Gait Cycle</option>
              <option value="tea_sipping">Sipping Tea</option>
              <option value="seated_reading">Seated Reading Ledger</option>
              <option value="guarding_rifle">Thana Gate Rifle Guard</option>
            </select>
          </div>

          <div>
            <label htmlFor="headline-input" className="block text-xs font-medium text-slate-700 mb-1">
              Headline Override (Bengali or English)
            </label>
            <input
              id="headline-input"
              type="text"
              value={headlineOverride}
              onChange={(e) => setHeadlineOverride(e.target.value)}
              placeholder="Leave blank for rank default…"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="placard-year" className="block text-xs font-medium text-slate-700 mb-1">
                Hanging Placard Year
              </label>
              <input
                id="placard-year"
                type="text"
                value={placardYear}
                onChange={(e) => setPlacardYear(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-mono"
              />
            </div>
            <div>
              <label htmlFor="counter-val" className="block text-xs font-medium text-slate-700 mb-1">
                Dial Counter Value
              </label>
              <input
                id="counter-val"
                type="text"
                value={counterVal}
                onChange={(e) => setCounterVal(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">Visual DNA Compliance</p>
            <p>White die-cut paper edge rim, brass rivet limb pivots, dashed cardstock mounts, and 30fps Remotion camera interpolation.</p>
          </div>
        </aside>
      </div>

      {/* Synchronized 1-Minute Full Video Side-by-Side Comparison */}
      <div className="mt-8">
        <FullVideoComparisonPanel />
      </div>

      {/* Reference Frame vs. React Reconstruction Comparator */}
      <section className="mt-8 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Reference Frame vs. React Reconstruction Comparator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare lossless extracted frames from ukgbxNHllMY directly against our live SSR/SVG ShotSceneRenderer output.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select comparison keyframe preset"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
            >
              {COMPARATOR_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.timestampLabel})
                </option>
              ))}
            </select>

            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setCompareMode('side_by_side')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                  compareMode === 'side_by_side' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setCompareMode('split_wipe')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
                  compareMode === 'split_wipe' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
                <span>Split Wipe</span>
              </button>
            </div>
          </div>
        </div>

        {compareMode === 'side_by_side' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>ORIGINAL REFERENCE ({activePreset.timestampLabel})</span>
                <span>1280×720 PNG</span>
              </div>
              <div className="aspect-video w-full rounded border border-slate-300 overflow-hidden bg-slate-100">
                <Image
                  src={`/api/reference/keyframe/${activePreset.keyframeFile}`}
                  alt={`Original Onyo Alap reference frame ${activePreset.keyframeFile}`}
                  width={1280}
                  height={720}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>LIVE REACT + SVG RECONSTRUCTION</span>
                <span>{activePreset.shot.templateType}</span>
              </div>
              <div className="aspect-video w-full rounded border border-slate-300 overflow-hidden bg-slate-100">
                <ShotSceneRenderer
                  shot={activePreset.shot}
                  localFrame={activePreset.frameIndex}
                  totalFrames={150}
                  fps={30}
                  showCaption={false}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600">
              <span>Left: Reference ({activePreset.keyframeFile})</span>
              <span>Split: {splitPct}%</span>
              <span>Right: React Reconstruction</span>
            </div>
            <input
              type="range"
              aria-label="Split wipe percentage"
              min={0}
              max={100}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              className="w-full accent-[#16339B]"
            />
            <div className="relative aspect-video w-full max-w-4xl mx-auto rounded border border-slate-300 overflow-hidden bg-slate-100">
              {/* Base layer: Live React Reconstruction */}
              <div className="absolute inset-0">
                <ShotSceneRenderer
                  shot={activePreset.shot}
                  localFrame={activePreset.frameIndex}
                  totalFrames={150}
                  fps={30}
                  showCaption={false}
                />
              </div>
              {/* Clipped top layer: Original Reference Frame */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
              >
                <Image
                  src={`/api/reference/keyframe/${activePreset.keyframeFile}`}
                  alt={`Original Onyo Alap reference frame ${activePreset.keyframeFile}`}
                  width={1280}
                  height={720}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Vertical divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#D81919] pointer-events-none"
                style={{ left: `${splitPct}%` }}
              />
            </div>
          </div>
        )}
      </section>
    </StudioShell>
  );
}
