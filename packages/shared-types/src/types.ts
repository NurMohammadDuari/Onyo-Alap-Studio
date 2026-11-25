export type AnalysisStatus =
  | 'PENDING'
  | 'EXTRACTED'
  | 'QUEUED'
  | 'ANALYZING'
  | 'COMPLETE'
  | 'NEEDS_REVIEW'
  | 'FAILED';

export type VerificationStatus = 'pending' | 'verified' | 'needs_review' | 'rejected';

export type ReconstructionStatus =
  | 'EXACTLY_RECOVERED'
  | 'CLOSELY_RECONSTRUCTED'
  | 'APPROXIMATELY_RECONSTRUCTED'
  | 'UNRESOLVED';

export type AssetClassification =
  | 'EXTRACTED'
  | 'CROPPED'
  | 'MASKED'
  | 'VECTOR_RECONSTRUCTED'
  | 'REACT_RECREATED'
  | 'NEW_ORIGINAL'
  | 'UNRESOLVED';

export type ApprovalState =
  | 'DRAFT'
  | 'STORYBOARD_GENERATION'
  | 'STORYBOARD_READY'
  | 'AWAITING_USER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REGENERATING'
  | 'READY_FOR_APPROVAL'
  | 'USER_APPROVED'
  | 'FINAL_RENDER_AUTHORIZED';

export type StageStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'FAILED'
  | 'NEEDS_REVIEW'
  | 'TESTED'
  | 'VERIFIED_COMPLETE';

export interface FrameAnalysisRecord {
  source_id: string;
  native_frame_id: string;
  analysis_frame_id: string;
  frame_number_30fps: number;
  timestamp_seconds: number;
  scene_id: string;
  shot_id: string;

  visual_description: string;
  main_subject: string;
  secondary_subjects: string[];
  objects: Array<{
    name: string;
    category: string;
    shape?: string;
    position?: { x: number; y: number; width: number; height: number };
    scale?: number;
    state?: string;
  }>;
  characters: Array<{
    role: string;
    uniform?: string;
    pose?: string;
    facing?: 'left' | 'right' | 'front';
    expression?: string;
    accessories?: string[];
    position?: { x: number; y: number };
  }>;
  visible_text: Array<{
    text: string;
    language: 'bn' | 'en' | 'mixed';
    color?: string;
    position?: string;
    uncertain?: boolean;
  }>;

  background: string;
  foreground: string;
  composition: Record<string, string | number>;
  positions: Record<string, { x: number; y: number }>;
  dimensions: Record<string, { w: number; h: number }>;
  colors: {
    primary: string[];
    secondary: string[];
    accent: string[];
    background: string;
  };
  typography: Record<string, string | number>;
  layers: string[];

  animation_state: {
    motionMagnitude: number;
    isStaticHold: boolean;
    movingElements: string[];
    phase: 'enter' | 'hold' | 'action' | 'exit';
  };
  camera_state: {
    movement: 'static' | 'pan_left' | 'pan_right' | 'push_in' | 'pull_out' | 'tilt' | 'dolly_25d';
    depthOfField: 'deep' | 'shallow_bokeh';
  };

  previous_frame_changes: {
    checksumChanged: boolean;
    lumaDelta: number;
    summary: string;
  };
  next_frame_changes: {
    summary: string;
  };

  audio_events: string[];
  asset_references: string[];
  react_component_mapping: string[];

  confidence: {
    overall: number;
    ocr?: number;
    insignia?: number;
  };
  analysis_status: AnalysisStatus;
  verification_status: VerificationStatus;
}

export type SceneTemplateType =
  | 'diorama_thana_exterior'
  | 'diorama_interior_office'
  | 'diorama_classroom_exam'
  | 'epaulette_macro_showcase'
  | 'rank_tower_comparison'
  | 'infographic_dial_counter'
  | 'historical_archive_ledger'
  | 'bangladesh_range_map'
  | 'brand_bumper'
  | 'split_comparison';

export interface StoryboardShot {
  shotId: string;
  sceneId: string;
  order: number;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  narration: string;
  scenePurpose: string;
  visualObjective: string;
  templateType: SceneTemplateType;
  mainSubject: string;
  secondaryElements: string[];
  background: {
    style: string;
    primaryHex: string;
    secondaryHex: string;
    paperTexture: boolean;
  };
  foreground: string;
  characters: Array<{
    id: string;
    role: string;
    rankId?: string;
    pose: 'standing' | 'walking' | 'saluting' | 'tea_sipping' | 'seated_reading' | 'guarding_rifle';
    facing: 'left' | 'right';
    x: number;
    y: number;
    scale: number;
    uniformColor: string;
    trouserColor: string;
  }>;
  objects: Array<{
    id: string;
    kind: string;
    label?: string;
    x: number;
    y: number;
    scale: number;
    color?: string;
  }>;
  typography: {
    headline?: string;
    subheadline?: string;
    caption?: string;
    placardText?: string;
    placardYear?: string;
    accentColor: string;
  };
  graphics: {
    rankIds?: string[];
    highlightRankId?: string;
    counterValue?: string;
    counterLabel?: string;
    showPencilPointer?: boolean;
    diagramNodes?: Array<{ label: string; sub?: string }>;
  };
  composition: {
    focalAnchor: 'center' | 'left' | 'right' | 'split';
    depthLayers: number;
  };
  camera: {
    movement: 'static' | 'push_in' | 'pull_out' | 'pan_left' | 'pan_right' | 'tilt_up';
    zoomStart: number;
    zoomEnd: number;
    panXStart: number;
    panXEnd: number;
  };
  animation: {
    entranceStyle: 'paper_drop' | 'slide_card' | 'pendulum_swing' | 'fade_stagger' | 'pencil_draw';
    speedMultiplier: number;
    easing: string;
  };
  transitions: {
    in: 'cut' | 'paper_wipe' | 'dissolve' | 'whip_pan' | 'fade_black';
    out: 'cut' | 'paper_wipe' | 'dissolve' | 'whip_pan' | 'fade_black';
  };
  sfx: Array<{
    timeOffset: number;
    type: 'whoosh' | 'pop' | 'click' | 'paper_rustle' | 'bell' | 'impact';
    description: string;
  }>;
  music: {
    mood: string;
    bpm: number;
    volumeDb: number;
  };
  continuityNotes: string;
  reactComponents: string[];
  assetDependencies: string[];
  userNotes?: string;
}

export interface StoryboardVersion {
  versionId: string;
  projectId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: 'ai_director' | 'user_edit';
  changeSummary: string;
  approvalState: ApprovalState;
  shots: StoryboardShot[];
  totalDurationSeconds: number;
}

export interface ProjectRecord {
  projectId: string;
  title: string;
  language: 'bn' | 'en' | 'mixed';
  scriptText: string;
  audioPath?: string;
  audioDurationSeconds?: number;
  hasExactAudioSync: boolean;
  timingIsEstimated: boolean;
  discrepancies: string[];
  approvalState: ApprovalState;
  currentStoryboardVersion: number;
  approvedVersionNumber: number | null;
  approvedAt: string | null;
  finalVideoPath: string | null;
  createdAt: string;
  updatedAt: string;
}
