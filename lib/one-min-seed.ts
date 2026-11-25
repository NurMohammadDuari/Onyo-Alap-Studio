import type { StoryboardShot } from '../packages/shared-types/src/types';
import { ONYO_ALAP_VISUAL_DNA } from '../packages/visual-dna/src/index';

const PALETTE = ONYO_ALAP_VISUAL_DNA.palette;

function buildShot(
  shotId: string,
  order: number,
  startTime: number,
  endTime: number,
  partial: Partial<StoryboardShot> & {
    title: string;
    narration: string;
    templateType: StoryboardShot['templateType'];
  }
): StoryboardShot {
  const duration = Number((endTime - startTime).toFixed(3));
  return {
    shotId,
    sceneId: `SCENE_${String(order).padStart(2, '0')}`,
    order,
    startTime,
    endTime,
    duration,
    scenePurpose: '1-Minute Opening Sequence Visual DNA Reconstruction (ukgbxNHllMY)',
    visualObjective: partial.title,
    mainSubject: partial.title,
    secondaryElements: ['2.5D Cutout Depth', 'Paper Grain', 'White Rim'],
    background: {
      style: shotId.toLowerCase(),
      primaryHex: PALETTE.skyPaperBlue,
      secondaryHex: PALETTE.thanaWallYellow,
      paperTexture: true,
    },
    foreground: 'Tactile cardstock framing',
    characters: [],
    objects: [],
    typography: {
      headline: partial.title,
      caption: partial.narration,
      accentColor: PALETTE.crimsonAccent,
    },
    graphics: {},
    composition: { focalAnchor: 'center', depthLayers: 4 },
    camera: {
      movement: order % 2 === 1 ? 'push_in' : 'pan_right',
      zoomStart: 1,
      zoomEnd: 1.06,
      panXStart: order % 2 === 1 ? 0 : -14,
      panXEnd: order % 2 === 1 ? 0 : 14,
    },
    animation: {
      entranceStyle: 'paper_drop',
      speedMultiplier: 1,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    transitions: {
      in: order === 1 ? 'fade_black' : order % 4 === 0 ? 'paper_wipe' : 'cut',
      out: 'cut',
    },
    sfx: [{ timeOffset: 0.1, type: 'paper_rustle', description: `Transition into ${shotId}` }],
    music: { mood: 'investigative_documentary_marimba', bpm: 96, volumeDb: -18 },
    continuityNotes: 'Exact 60.0s timeline parity with ukgbxNHllMY (00:00-01:00)',
    reactComponents: ['ShotSceneRenderer'],
    assetDependencies: ['VDNA_001'],
    ...partial,
  };
}

export const ONE_MINUTE_POLICE_SHOTS: StoryboardShot[] = [
  buildShot('SHOT_001', 1, 0.0, 3.8, {
    title: 'মনে করেন একটা কাজে থানায় গেছেন',
    narration: 'মনে করেন একটা কাজে থানায় গেছেন।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_01',
      primaryHex: PALETTE.skyPaperBlue,
      secondaryHex: PALETTE.thanaWallYellow,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_002', 2, 3.8, 9.2, {
    title: 'বারান্দায় অভিজ্ঞ পুলিশ কর্মকর্তা ও চা পান',
    narration: 'বারান্দায় দাঁড়িয়ে একজন পুলিশ কর্মকর্তার সাথে কথা বলছেন, উনি পুলিশে আছেন অনেক বছর ধরে।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_02',
      primaryHex: PALETTE.thanaWallYellow,
      secondaryHex: PALETTE.thanaColumnIvory,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_003', 3, 9.2, 13.0, {
    title: 'বারান্দার সামনে থামল পুলিশ জিপ',
    narration: 'কথা চলতে চলতেই বারান্দার সামনে এসে থামল একটা জিপ।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_03',
      primaryHex: PALETTE.skyPaperBlue,
      secondaryHex: PALETTE.thanaWallYellow,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_004', 4, 13.0, 16.0, {
    title: 'জিপ থেকে নামলেন আরেকজন কর্মকর্তা',
    narration: 'আর জিপ থেকে নামলেন আরেকজন কর্মকর্তা।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_04',
      primaryHex: '#D8BA82',
      secondaryHex: PALETTE.uniformBlue,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_005', 5, 16.0, 23.2, {
    title: 'বয়সে ছোট ও চাকরিতে নতুন তরুণ কর্মকর্তা',
    narration: 'উনি বয়সে আপনার সামনের মানুষটার চেয়ে ছোট আর চাকরিতেও এসেছেন মাত্র কয়েক বছর হলো।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_05',
      primaryHex: PALETTE.thanaWallYellow,
      secondaryHex: PALETTE.thanaColumnIvory,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_006', 6, 23.2, 26.8, {
    title: 'কিন্তু বড়জনই এগিয়ে গিয়ে স্যালুট দিলেন',
    narration: 'কিন্তু আপনি দেখলেন, আপনার সাথে কথা বলা মানুষটাই এগিয়ে গিয়ে ওনাকে স্যালুট দিলেন।',
    templateType: 'diorama_thana_exterior',
    background: {
      style: '1min_06',
      primaryHex: PALETTE.thanaWallYellow,
      secondaryHex: PALETTE.thanaColumnIvory,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_007', 7, 26.8, 35.0, {
    title: 'একই বেতন গ্রেড — ৯ম গ্রেড দাঁড়িপাল্লা',
    narration: 'এই দুজনের বেতন গ্রেড কিন্তু একটাই, নাইন গ্রেড। তাহলে বয়সে বড়, অভিজ্ঞতাও বেশি, বেতন গ্রেডও এক।',
    templateType: 'split_comparison',
    background: {
      style: '1min_07',
      primaryHex: PALETTE.thanaWallYellow,
      secondaryHex: PALETTE.cardstockCream,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_008', 8, 35.0, 38.5, {
    title: 'তারপরও স্যালুটটা বড়জনই কেন দিলেন?',
    narration: 'তারপরও স্যালুটটা বড়জনই কেন দিলেন?',
    templateType: 'split_comparison',
    background: {
      style: '1min_08',
      primaryHex: PALETTE.thanaWallYellow,
      secondaryHex: PALETTE.cardstockCream,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_009', 9, 38.5, 41.5, {
    title: 'পুলিশ বাহিনীর আরও র‍্যাঙ্ক কনফিউশন',
    narration: 'এমন কনফিউশনের জায়গা পুলিশ বাহিনীতে কিন্তু আরও অনেক আছে।',
    templateType: 'rank_tower_comparison',
    background: {
      style: '1min_09',
      primaryHex: '#D5BA85',
      secondaryHex: PALETTE.craftMatGreen,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_010', 10, 41.5, 47.0, {
    title: 'কনস্টেবল — ব্যাজে শুধু একটি শব্দ "পুলিশ"',
    narration: 'যেমন একটা র‍্যাঙ্ক আছে, যাদের র‍্যাঙ্ক ব্যাজে কোনো চিহ্নই নাই, আছে শুধু একটা শব্দ।',
    templateType: 'epaulette_macro_showcase',
    background: {
      style: '1min_10',
      primaryHex: '#6C411A',
      secondaryHex: PALETTE.cardstockTan,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_011', 11, 47.0, 56.0, {
    title: 'এসপির ২০ বছর চাকরিতে ওপরের র‍্যাঙ্কের ব্যাজ',
    narration: 'আবার একজন এসপির চাকরি বিশ বছর পার হলে ওনাকে পরানো হয় ঠিক ওপরের র‍্যাঙ্কের ব্যাজ। মানে পদের বদল না হলেও ব্যাজের বদল হয়ে গেল।',
    templateType: 'infographic_dial_counter',
    background: {
      style: '1min_11',
      primaryHex: '#6C411A',
      secondaryHex: PALETTE.cardstockTan,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
  buildShot('SHOT_012', 12, 56.0, 60.0, {
    title: 'অন্য আলাপ — চেনা জিনিসের অচেনা দিক',
    narration: 'আসসালামু আলাইকুম। চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপের বিষয় নির্ধারিত হয়েছে বাংলাদেশ পুলিশের র‍্যাঙ্ক।',
    templateType: 'brand_bumper',
    background: {
      style: '1min_12',
      primaryHex: PALETTE.royalCobaltMid,
      secondaryHex: PALETTE.royalCobaltDeep,
      paperTexture: true,
    },
    transitions: { in: 'cut', out: 'cut' },
  }),
];

export const ONE_MINUTE_PROJECT_ID = 'police-ranks-1min-reconstruction';
export const ONE_MINUTE_SCRIPT_TEXT = ONE_MINUTE_POLICE_SHOTS.map(
  (s) =>
    `[${s.startTime.toFixed(3)} - ${s.endTime.toFixed(3)}]\n${s.narration}`
).join('\n');
