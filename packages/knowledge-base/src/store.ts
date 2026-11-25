import { ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';

export interface VisualKnowledgeEntry {
  id: string;
  category:
    | 'background_diorama'
    | 'character_rig'
    | 'brand_bumper'
    | 'insignia_macro'
    | 'infographic_machine'
    | 'craft_stencil_reveal'
    | 'hanging_placard'
    | 'rank_tower_strip'
    | 'transition_grammar'
    | 'audio_sfx_pattern';
  title: string;
  sourceFrameId: string;
  timestampSeconds: number;
  reactComponent: string;
  colors: string[];
  description: string;
  reusableRecipe: string;
  tags: string[];
}

export const PERSISTENT_VISUAL_DNA_KB: VisualKnowledgeEntry[] = [
  {
    id: 'VDNA_001',
    category: 'background_diorama',
    title: 'Thana Verandah Paper-Craft Facade',
    sourceFrameId: 'FRAME_00000060',
    timestampSeconds: 2.0,
    reactComponent: 'BuildingIllustration',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow,
      ONYO_ALAP_VISUAL_DNA.palette.thanaColumnIvory,
      ONYO_ALAP_VISUAL_DNA.palette.shutterEmerald,
      ONYO_ALAP_VISUAL_DNA.palette.skyPaperBlue,
    ],
    description:
      'Three-arch colonial police station verandah built from layered cream cardstock columns, yellow stucco wall, emerald green louvered shutters, white security grilles, wooden notice board, and Krishnachura tree cutout.',
    reusableRecipe:
      'Use 4 depth planes: sky paper -> hills/trees -> architectural facade -> verandah steps & bokeh foreground bar.',
    tags: ['thana', 'building', 'station', 'verandah', 'background', 'diorama', 'colonial', 'krishnachura'],
  },
  {
    id: 'VDNA_002',
    category: 'character_rig',
    title: 'Articulated Rivet-Jointed Paper Puppet',
    sourceFrameId: 'FRAME_00000240',
    timestampSeconds: 8.0,
    reactComponent: 'Character',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
      ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
      ONYO_ALAP_VISUAL_DNA.palette.inkCharcoal,
    ],
    description:
      'Side-profile or 3/4 cutout character with subtle 1.5px white cardstock edge stroke, visible circular brass/tan rivet pins at shoulder, elbow, hip, and knee, cobalt uniform shirt with green shoulder patch, and khaki trousers.',
    reusableRecipe:
      'Animate limb rotation around explicit joint pivot coordinates (shoulder/elbow/knee) using smooth spring curves.',
    tags: ['character', 'officer', 'puppet', 'uniform', 'salute', 'walk', 'tea', 'pose', 'cutout'],
  },
  {
    id: 'VDNA_003',
    category: 'brand_bumper',
    title: 'Onyo Alap Royal Cobalt Cutout Logo',
    sourceFrameId: 'FRAME_00001800',
    timestampSeconds: 60.0,
    reactComponent: 'OnyoAlapLogoBumper',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.royalCobaltDeep,
      ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid,
      '#FFFFFF',
      ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
    ],
    description:
      'Deep royal-cobalt textured paper background with subtle light fiber motes; stacked cutout Bengali wordmark "অন্য" + crimson three-dot speech bubble + "আলাপ" with crisp charcoal drop border.',
    reusableRecipe:
      'Start from slow radial light glow + dust particles, pop crimson speech-bubble accent at beat 1.2s.',
    tags: ['title', 'logo', 'bumper', 'onyo alap', 'typography', 'intro', 'bengali'],
  },
  {
    id: 'VDNA_004',
    category: 'insignia_macro',
    title: 'Stitched Epaulette Shoulder Strap Macro',
    sourceFrameId: 'FRAME_00002850',
    timestampSeconds: 95.0,
    reactComponent: 'InsigniaIllustration',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue,
      ONYO_ALAP_VISUAL_DNA.palette.cardstockCream,
      ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
    ],
    description:
      'Angled close-up of cobalt blue fabric-textured shoulder strap with dashed white perimeter stitching, metallic silver top snap button, and clean Bengali "পুলিশ" lettering or rank symbols.',
    reusableRecipe:
      'Pass rankId prop to InsigniaIllustration to render accurate stitched chevrons, 4-petal flowers, diamond stars, Shapla, or crossed sword & baton.',
    tags: ['badge', 'insignia', 'epaulette', 'rank', 'constable', 'naik', 'asi', 'si', 'inspector', 'asp', 'sp', 'dig', 'igp'],
  },
  {
    id: 'VDNA_005',
    category: 'infographic_machine',
    title: 'Cascading Grid-Paper Counter & Year Dial',
    sourceFrameId: 'FRAME_00004200',
    timestampSeconds: 140.0,
    reactComponent: 'Infographic',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.cardstockCream,
      ONYO_ALAP_VISUAL_DNA.palette.cardstockTan,
      ONYO_ALAP_VISUAL_DNA.palette.inkCharcoal,
      ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
    ],
    description:
      'Tactile cardstock slot dispensing grid-ruled calendar sheets beneath a bold Bengali header banner, paired with a circular rotary year gauge featuring a red pointer triangle.',
    reusableRecipe:
      'Use for numeric durations, probation periods, headcount ratios, or budget breakdowns.',
    tags: ['infographic', 'numbers', 'counter', 'dial', 'years', 'probation', 'statistics', 'ratio'],
  },
  {
    id: 'VDNA_006',
    category: 'craft_stencil_reveal',
    title: 'Cutting Mat Rank Card & Yellow Pencil Draw',
    sourceFrameId: 'FRAME_00007650',
    timestampSeconds: 255.0,
    reactComponent: 'RankTowerLadder',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.craftMatGreen,
      ONYO_ALAP_VISUAL_DNA.palette.woodWalnut,
      ONYO_ALAP_VISUAL_DNA.palette.cardstockTan,
      ONYO_ALAP_VISUAL_DNA.palette.pencilYellow,
      ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
    ],
    description:
      'Standing cardstock rank card on a green craft cutting mat & walnut desk; yellow pencil traces a chevron through a translucent stencil slot.',
    reusableRecipe:
      'Use pencil_draw animation mode when introducing a new symbol, rule change, or addition to an existing diagram.',
    tags: ['pencil', 'draw', 'stencil', 'cutting mat', 'chevron', 'naik', 'reveal'],
  },
  {
    id: 'VDNA_007',
    category: 'hanging_placard',
    title: 'Brass Dowel & Red String Hanging Date Placards',
    sourceFrameId: 'FRAME_00016200',
    timestampSeconds: 540.0,
    reactComponent: 'HangingSignPlacard',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue,
      ONYO_ALAP_VISUAL_DNA.palette.cardstockCream,
      ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
    ],
    description:
      'Horizontal brass rod mounted with pins; cream and navy rounded rectangular cards suspended by red threads displaying years (১৯০৫) and rank titles (এসআই / ওসি).',
    reusableRecipe:
      'Pendulum sway entrance (rotation -3deg -> +1.5deg -> 0deg) when introducing historical dates or role comparisons.',
    tags: ['history', 'date', 'placard', 'hanging', 'year', '1905', '1792', '1861', 'timeline', 'comparison'],
  },
  {
    id: 'VDNA_008',
    category: 'rank_tower_strip',
    title: '12-Slot Dashed Cardstock Rank Tower & Strip',
    sourceFrameId: 'FRAME_00036300',
    timestampSeconds: 1210.0,
    reactComponent: 'RankTowerLadder',
    colors: [
      ONYO_ALAP_VISUAL_DNA.palette.cardstockTan,
      ONYO_ALAP_VISUAL_DNA.palette.cardstockStitch,
      ONYO_ALAP_VISUAL_DNA.palette.epauletteBlue,
      ONYO_ALAP_VISUAL_DNA.palette.inkCharcoal,
    ],
    description:
      'Modular dashed-border cream cardstock cells numbered ১–১২ in Bengali ink, arranged either vertically (with sliding pencil tracker) or horizontally for full hierarchy recaps.',
    reusableRecipe:
      'Use for any ordered hierarchy, step ladder, timeline, or comparison series.',
    tags: ['hierarchy', 'ladder', 'tower', 'strip', '12 ranks', 'diagram', 'order', 'summary'],
  },
  {
    id: 'VDNA_009',
    category: 'transition_grammar',
    title: '2.5D Diorama Macro Push-In & Paper Wipe',
    sourceFrameId: 'FRAME_00000697',
    timestampSeconds: 23.23,
    reactComponent: 'Transition',
    colors: [ONYO_ALAP_VISUAL_DNA.palette.cardstockCream],
    description:
      'Transitions connect physical diorama spaces via smooth lateral camera pans, shallow-DoF rack focus, or crisp hard cuts timed to narration pauses and soft paper-whoosh SFX.',
    reusableRecipe:
      'Time transitions to 0.35s–0.6s paper wipes or whip pans aligned with narration sentence boundaries.',
    tags: ['transition', 'camera', 'pan', 'push-in', 'cut', 'wipe', 'motion'],
  },
  {
    id: 'VDNA_010',
    category: 'audio_sfx_pattern',
    title: 'Documentary Bed (-14.1 LUFS) + Tactile Paper & Chime SFX',
    sourceFrameId: 'FRAME_00001800',
    timestampSeconds: 60.0,
    reactComponent: 'AudioSyncCue',
    colors: [ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid],
    description:
      'Warm Bengali baritone narration anchored over a steady marimba/pluck underscore with crisp paper-rustle, pencil-click, and chime accents hitting exact visual reveals.',
    reusableRecipe:
      'Duck background music to -18dB under narration; trigger paper_rustle or pop SFX on card entrance.',
    tags: ['audio', 'sfx', 'music', 'narration', 'whoosh', 'chime', 'sound'],
  },
];

export function searchVisualKnowledge(
  query: string,
  category?: string
): VisualKnowledgeEntry[] {
  const q = query.trim().toLowerCase();
  return PERSISTENT_VISUAL_DNA_KB.filter((entry) => {
    if (category && category !== 'all' && entry.category !== category) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      entry.title,
      entry.description,
      entry.reusableRecipe,
      entry.reactComponent,
      entry.sourceFrameId,
      ...entry.tags,
    ]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}
