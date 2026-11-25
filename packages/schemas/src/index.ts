import { z } from 'zod';

export const ApprovalStateSchema = z.enum([
  'DRAFT',
  'STORYBOARD_GENERATION',
  'STORYBOARD_READY',
  'AWAITING_USER_REVIEW',
  'CHANGES_REQUESTED',
  'REGENERATING',
  'READY_FOR_APPROVAL',
  'USER_APPROVED',
  'FINAL_RENDER_AUTHORIZED',
]);

export const SceneTemplateTypeSchema = z.enum([
  'diorama_thana_exterior',
  'diorama_interior_office',
  'diorama_classroom_exam',
  'epaulette_macro_showcase',
  'rank_tower_comparison',
  'infographic_dial_counter',
  'historical_archive_ledger',
  'bangladesh_range_map',
  'brand_bumper',
  'split_comparison',
]);

export const CharacterDirectionSchema = z.object({
  id: z.string().min(1),
  role: z.string().min(1),
  rankId: z.string().optional(),
  pose: z.enum(['standing', 'walking', 'saluting', 'tea_sipping', 'seated_reading', 'guarding_rifle']),
  facing: z.enum(['left', 'right']),
  x: z.number().min(0).max(1280),
  y: z.number().min(0).max(720),
  scale: z.number().min(0.3).max(2.5),
  uniformColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  trouserColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const StoryboardShotSchema = z.object({
  shotId: z.string().min(1),
  sceneId: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  duration: z.number().positive(),
  narration: z.string(),
  scenePurpose: z.string().min(1),
  visualObjective: z.string().min(1),
  templateType: SceneTemplateTypeSchema,
  mainSubject: z.string().min(1),
  secondaryElements: z.array(z.string()),
  background: z.object({
    style: z.string().min(1),
    primaryHex: z.string(),
    secondaryHex: z.string(),
    paperTexture: z.boolean(),
  }),
  foreground: z.string(),
  characters: z.array(CharacterDirectionSchema),
  objects: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      label: z.string().optional(),
      x: z.number(),
      y: z.number(),
      scale: z.number(),
      color: z.string().optional(),
    })
  ),
  typography: z.object({
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    caption: z.string().optional(),
    placardText: z.string().optional(),
    placardYear: z.string().optional(),
    accentColor: z.string(),
  }),
  graphics: z.object({
    rankIds: z.array(z.string()).optional(),
    highlightRankId: z.string().optional(),
    counterValue: z.string().optional(),
    counterLabel: z.string().optional(),
    showPencilPointer: z.boolean().optional(),
    diagramNodes: z.array(z.object({ label: z.string(), sub: z.string().optional() })).optional(),
  }),
  composition: z.object({
    focalAnchor: z.enum(['center', 'left', 'right', 'split']),
    depthLayers: z.number().int().min(1).max(10),
  }),
  camera: z.object({
    movement: z.enum(['static', 'push_in', 'pull_out', 'pan_left', 'pan_right', 'tilt_up']),
    zoomStart: z.number().min(0.5).max(2.5),
    zoomEnd: z.number().min(0.5).max(2.5),
    panXStart: z.number().min(-400).max(400),
    panXEnd: z.number().min(-400).max(400),
  }),
  animation: z.object({
    entranceStyle: z.enum(['paper_drop', 'slide_card', 'pendulum_swing', 'fade_stagger', 'pencil_draw']),
    speedMultiplier: z.number().min(0.25).max(3),
    easing: z.string(),
  }),
  transitions: z.object({
    in: z.enum(['cut', 'paper_wipe', 'dissolve', 'whip_pan', 'fade_black']),
    out: z.enum(['cut', 'paper_wipe', 'dissolve', 'whip_pan', 'fade_black']),
  }),
  sfx: z.array(
    z.object({
      timeOffset: z.number().min(0),
      type: z.enum(['whoosh', 'pop', 'click', 'paper_rustle', 'bell', 'impact']),
      description: z.string(),
    })
  ),
  music: z.object({
    mood: z.string(),
    bpm: z.number().min(40).max(220),
    volumeDb: z.number().min(-60).max(0),
  }),
  continuityNotes: z.string(),
  reactComponents: z.array(z.string()),
  assetDependencies: z.array(z.string()),
  userNotes: z.string().optional(),
});

export const StoryboardPlanSchema = z.object({
  title: z.string().min(1),
  shots: z.array(StoryboardShotSchema).min(1),
});

export const ScriptIngestRequestSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.enum(['bn', 'en', 'mixed']).default('bn'),
  scriptText: z.string().min(5),
  audioDurationSeconds: z.number().positive().optional(),
  hasExactAudioSync: z.boolean().default(false),
});
