export interface PoliceRankSpec {
  id: string;
  orderBn: string;
  order: number;
  nameEn: string;
  nameBn: string;
  payGrade: string;
  cadre: 'Non-Cadre' | 'Cadre (BCS Police)';
  insignia: {
    chevrons?: number;
    chevronColor?: string;
    flowers?: number;
    ribbonColor?: 'blue' | 'red' | null;
    stars?: number;
    shapla?: boolean;
    crossedSwordBaton?: boolean;
    hasPoliceText: boolean;
  };
  notesBn: string;
}

/**
 * Measured Visual DNA extracted directly from Bangladesh Police Ranks (ukgbxNHllMY).
 * Every hex value corresponds to observed frame palettes across the 21:34 reference video.
 */
export const ONYO_ALAP_VISUAL_DNA = {
  brand: 'Onyo Alap',
  brandBn: 'অন্য আলাপ',
  styleArchetype: 'Tactile Paper-Craft 2.5D Diorama & Articulated Cutout Motion',
  palette: {
    royalCobaltDeep: '#041664',
    royalCobaltMid: '#0A2A9F',
    epauletteBlue: '#16339B',
    uniformBlue: '#1E44B8',
    cardstockCream: '#F4EFE2',
    cardstockTan: '#D9CBB0',
    cardstockStitch: '#7B6B55',
    thanaWallYellow: '#E5D79F',
    thanaColumnIvory: '#ECE7D5',
    shutterEmerald: '#0B6B3A',
    craftMatGreen: '#0F6B4E',
    woodWalnut: '#7A461C',
    crimsonAccent: '#D81919',
    khakiTrouser: '#D8C89B',
    pencilYellow: '#E8B923',
    inkCharcoal: '#1F1B18',
    skyPaperBlue: '#A9CDD6',
    chalkboardGreen: '#164A2B',
  },
  constructionRules: [
    'All illustrated characters use articulated cardstock cutouts with subtle white die-cut rims and visible brass/tan rivet joints at elbow, shoulder, wrist, and knee.',
    'All rank badges sit inside dashed-border cream cardstock slots (#D9CBB0) with Bengali numerals on the left margin and optional sliding yellow pencil pointers.',
    'Historical dates and titles hang from brass dowel rods via crimson strings as rounded bordered placards.',
    'Scenes separate into 3–5 physical depth planes (backdrop wall/sky, midground diorama architecture/props, hero articulated character/cardstock card, soft bokeh foreground framing).',
    'Camera motion mimics a physical macro slider: smooth 2.5D push-in, lateral pan, and subtle rack-focus transitions rather than harsh digital zooms.',
  ],
  motionGrammar: {
    defaultFps: 30,
    cutPacingSeconds: { intro: 3.5, explanation: 8.5, diagram: 6.0 },
    easings: {
      paperSettle: 'cubic-bezier(0.22, 1, 0.36, 1)',
      pendulumSwing: 'cubic-bezier(0.37, 0, 0.63, 1)',
    },
  },
} as const;

export const BANGLADESH_POLICE_RANKS: PoliceRankSpec[] = [
  {
    id: 'constable',
    orderBn: '১',
    order: 1,
    nameEn: 'Constable',
    nameBn: 'কনস্টেবল',
    payGrade: 'Grade 17',
    cadre: 'Non-Cadre',
    insignia: { hasPoliceText: true },
    notesBn: 'শুধু রুপালি রঙে লেখা "পুলিশ" শব্দ; কোনো তারকা, ফুল বা শেভরন নেই।',
  },
  {
    id: 'naik',
    orderBn: '২',
    order: 2,
    nameEn: 'Naik',
    nameBn: 'নায়েক',
    payGrade: 'Grade 15',
    cadre: 'Non-Cadre',
    insignia: { chevrons: 2, chevronColor: '#D81919', hasPoliceText: true },
    notesBn: 'দুইটি লাল শেভরন (ভি-আকৃতির দাগ) ও নিচে পুলিশ লেখা।',
  },
  {
    id: 'asi',
    orderBn: '৩',
    order: 3,
    nameEn: 'Assistant Sub-Inspector (ASI)',
    nameBn: 'এএসআই',
    payGrade: 'Grade 14',
    cadre: 'Non-Cadre',
    insignia: { flowers: 1, ribbonColor: 'blue', hasPoliceText: true },
    notesBn: 'চার কোনা একটি রুপালি ফুল, নিচে নীল ফিতা ও পুলিশ লেখা।',
  },
  {
    id: 'si',
    orderBn: '৪',
    order: 4,
    nameEn: 'Sub-Inspector (SI)',
    nameBn: 'এসআই (সাব-ইন্সপেক্টর)',
    payGrade: 'Grade 10',
    cadre: 'Non-Cadre',
    insignia: { flowers: 2, ribbonColor: 'blue', hasPoliceText: true },
    notesBn: 'দুইটি চার কোনা রুপালি ফুল ও নিচে নীল ফিতা। (সার্জেন্টের ক্ষেত্রে লাল ফিতা)',
  },
  {
    id: 'sergeant',
    orderBn: '৪খ',
    order: 4.5,
    nameEn: 'Sergeant (Variant)',
    nameBn: 'সার্জেন্ট',
    payGrade: 'Grade 10',
    cadre: 'Non-Cadre',
    insignia: { flowers: 2, ribbonColor: 'red', hasPoliceText: true },
    notesBn: 'দুইটি রুপালি ফুল ও নিচে লাল ফিতা; সরাসরি নিয়োগে ট্রাফিক ও মোটরসাইকেল দায়িত্ব।',
  },
  {
    id: 'inspector',
    orderBn: '৫',
    order: 5,
    nameEn: 'Inspector',
    nameBn: 'ইন্সপেক্টর',
    payGrade: 'Grade 9',
    cadre: 'Non-Cadre',
    insignia: { stars: 1, hasPoliceText: true },
    notesBn: 'একটি চার কোনা রুপালি তারকা; সাধারণত থানার ওসি পদে দায়িত্ব পালন করেন।',
  },
  {
    id: 'asp',
    orderBn: '৬',
    order: 6,
    nameEn: 'Assistant Superintendent of Police (ASP)',
    nameBn: 'এএসপি',
    payGrade: 'Grade 9',
    cadre: 'Cadre (BCS Police)',
    insignia: { stars: 3, hasPoliceText: true },
    notesBn: 'প্রশিক্ষণকালে ২ তারকা, প্রশিক্ষণ শেষে ৩ তারকা; সার্কেল দেখাশোনা করেন।',
  },
  {
    id: 'addl_sp',
    orderBn: '৭',
    order: 7,
    nameEn: 'Additional SP',
    nameBn: 'এডিশনাল এসপি',
    payGrade: 'Grade 6',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, hasPoliceText: true },
    notesBn: 'শুধু একটি জাতীয় ফুল শাপলা।',
  },
  {
    id: 'sp',
    orderBn: '৮',
    order: 8,
    nameEn: 'Superintendent of Police (SP)',
    nameBn: 'এসপি (পুলিশ সুপার)',
    payGrade: 'Grade 5',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, stars: 1, hasPoliceText: true },
    notesBn: 'শাপলার নিচে একটি তারকা; জেলা পুলিশের প্রধান।',
  },
  {
    id: 'addl_dig',
    orderBn: '৯',
    order: 9,
    nameEn: 'Additional DIG',
    nameBn: 'এডিশনাল ডিআইজি',
    payGrade: 'Grade 4',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, stars: 2, hasPoliceText: false },
    notesBn: 'শাপলার নিচে দুইটি তারকা।',
  },
  {
    id: 'dig',
    orderBn: '১০',
    order: 10,
    nameEn: 'Deputy Inspector General (DIG)',
    nameBn: 'ডিআইজি',
    payGrade: 'Grade 3',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, stars: 3, hasPoliceText: false },
    notesBn: 'শাপলার নিচে ত্রিভুজাকারে তিনটি তারকা; বিভাগীয় রেঞ্জের প্রধান।',
  },
  {
    id: 'addl_igp',
    orderBn: '১১',
    order: 11,
    nameEn: 'Additional IGP',
    nameBn: 'এডিশনাল আইজিপি',
    payGrade: 'Grade 2',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, crossedSwordBaton: true, hasPoliceText: false },
    notesBn: 'শাপলার নিচে আড়াআড়ি তলোয়ার ও ব্যাটন।',
  },
  {
    id: 'igp',
    orderBn: '১২',
    order: 12,
    nameEn: 'Inspector General of Police (IGP)',
    nameBn: 'আইজিপি',
    payGrade: 'Grade 1 / Senior',
    cadre: 'Cadre (BCS Police)',
    insignia: { shapla: true, crossedSwordBaton: true, stars: 1, hasPoliceText: false },
    notesBn: 'শাপলা, একটি তারকা ও আড়াআড়ি তলোয়ার-ব্যাটন; বাংলাদেশ পুলিশের সর্বোচ্চ পদ।',
  },
];
