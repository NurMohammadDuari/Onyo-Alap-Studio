import { GoogleGenAI, Type } from '@google/genai';
import type { SceneTemplateType, StoryboardShot } from '../../shared-types/src/types';
import type { ParsedScriptSegment } from '../../script-engine/src/parser';
import { searchVisualKnowledge } from '../../knowledge-base/src/store';
import { ONYO_ALAP_VISUAL_DNA } from '../../visual-dna/src/index';
import { StoryboardPlanSchema } from '../../schemas/src/index';

function pickTemplateForSegment(text: string, index: number, total: number): {
  templateType: SceneTemplateType;
  rankId: string;
  pose: 'standing' | 'walking' | 'saluting' | 'tea_sipping' | 'seated_reading' | 'guarding_rifle';
  headline: string;
  placardYear?: string;
  counterValue?: string;
} {
  const lower = text.toLowerCase();
  if (index === 0 && (text.includes('আসসালামু') || text.includes('অন্য আলাপ'))) {
    return { templateType: 'brand_bumper', rankId: 'constable', pose: 'standing', headline: 'অন্য আলাপ' };
  }
  if (/থানা|বারান্দা|জিপ|স্যালুট/.test(text)) {
    return {
      templateType: 'diorama_thana_exterior',
      rankId: text.includes('এএসপি') ? 'asp' : 'inspector',
      pose: text.includes('স্যালুট') ? 'saluting' : 'standing',
      headline: 'থানা প্রাঙ্গণ ও র্যাঙ্ক ডায়োরামা',
    };
  }
  if (/বিসিএস|পরীক্ষা|একাডেমি|সারদা|ট্রেনিং/.test(text)) {
    return {
      templateType: 'diorama_classroom_exam',
      rankId: 'asp',
      pose: 'standing',
      headline: 'বিসিএস পুলিশ ক্যাডার ও প্রশিক্ষণ',
    };
  }
  if (/রেঞ্জ|বিভাগ|মানচিত্র|জেলা|map|district|range/.test(lower)) {
    return {
      templateType: 'bangladesh_range_map',
      rankId: 'dig',
      pose: 'standing',
      headline: 'প্রশাসনিক কাঠামো ও রেঞ্জ মানচিত্র',
    };
  }
  if (/১৭৯২|১৯০৫|১৮৬১|১৯৭১|১৯৮০|২০১২|২০২৫|২০২৬|ইতিহাস|আইন|বই|history|act/.test(lower)) {
    const yearMatch = text.match(/(১৭৯২|১৯০৫|১৮৬১|১৯৭১|১৯৮০|২০১২|২০২৫|২০২৬|\d{4})/);
    return {
      templateType: 'historical_archive_ledger',
      rankId: 'si',
      pose: 'seated_reading',
      headline: 'ঐতিহাসিক প্রেক্ষাপট ও প্রবিধান',
      placardYear: yearMatch ? yearMatch[1] : '১৯০৫',
    };
  }
  if (/গ্রেড|বেতন|সংখ্যা|লাখ|বছর|হাজার|শতাংশ|percent|salary|grade/.test(lower)) {
    const numMatch = text.match(/([০-৯]+|\d+)/);
    return {
      templateType: 'infographic_dial_counter',
      rankId: 'constable',
      pose: 'guarding_rifle',
      headline: 'পরিসংখ্যান ও সময়কাল বিশ্লেষণ',
      counterValue: numMatch ? numMatch[1] : '২',
    };
  }
  if (/কনস্টেবল|নায়েক|এএসআই|এসআই|সার্জেন্ট|ইন্সপেক্টর|এএসপি|এসপি|ডিআইজি|আইজিপি|ব্যাজ|র্যাঙ্ক|rank|badge/.test(lower)) {
    const rankMap: Array<[RegExp, string]> = [
      [/আইজিপি|igp/i, 'igp'],
      [/এডিশনাল আইজিপি/i, 'addl_igp'],
      [/ডিআইজি|dig/i, 'dig'],
      [/এসপি|sp/i, 'sp'],
      [/এএসপি|asp/i, 'asp'],
      [/ইন্সপেক্টর|inspector|ওসি/i, 'inspector'],
      [/সার্জেন্ট|sergeant/i, 'sergeant'],
      [/এসআই|সাব-ইন্সপেক্টর|দারোগা/i, 'si'],
      [/এএসআই|asi/i, 'asi'],
      [/নায়েক|naik/i, 'naik'],
      [/কনস্টেবল|constable/i, 'constable'],
    ];
    const matched = rankMap.find(([re]) => re.test(text));
    return {
      templateType: index === total - 1 ? 'rank_tower_comparison' : 'epaulette_macro_showcase',
      rankId: matched ? matched[1] : 'constable',
      pose: 'standing',
      headline: 'র্যাঙ্ক ব্যাজ ও পদমর্যাদা',
    };
  }
  if (/তুলনা|পার্থক্য|ক্যাডার|vs|compare/.test(lower)) {
    return {
      templateType: 'split_comparison',
      rankId: 'inspector',
      pose: 'standing',
      headline: 'তুলনামূলক কাঠামো',
    };
  }
  return {
    templateType: 'diorama_interior_office',
    rankId: 'inspector',
    pose: 'tea_sipping',
    headline: 'মূল বিশ্লেষণ',
  };
}

export function buildDeterministicProductionPlan(params: {
  title: string;
  segments: ParsedScriptSegment[];
}): StoryboardShot[] {
  const { segments } = params;
  // Merge very short adjacent segments so shots average 4-9 seconds cleanly
  const grouped: ParsedScriptSegment[] = [];
  for (const seg of segments) {
    const last = grouped[grouped.length - 1];
    if (last && last.duration < 3.5 && last.duration + seg.duration <= 10.5) {
      last.endTime = seg.endTime;
      last.duration = Number((last.endTime - last.startTime).toFixed(3));
      last.text = `${last.text} ${seg.text}`.trim();
    } else {
      grouped.push({ ...seg });
    }
  }

  return grouped.map((seg, idx) => {
    const pick = pickTemplateForSegment(seg.text, idx, grouped.length);
    const kbMatches = searchVisualKnowledge(pick.templateType.split('_')[0]);
    const sceneId = `SCENE_${String(Math.floor(idx / 2) + 1).padStart(2, '0')}`;
    const shotId = `SHOT_${String(idx + 1).padStart(3, '0')}`;
    const isRoyal = pick.templateType === 'brand_bumper';

    return {
      shotId,
      sceneId,
      order: idx + 1,
      title: pick.headline,
      startTime: seg.startTime,
      endTime: seg.endTime,
      duration: Math.max(1.5, seg.duration),
      narration: seg.text,
      scenePurpose: `Visualize narration segment ${idx + 1} with tactile paper-craft storytelling`,
      visualObjective: `Render ${pick.templateType} anchored on ${pick.rankId}`,
      templateType: pick.templateType,
      mainSubject: pick.headline,
      secondaryElements: kbMatches.slice(0, 2).map((k) => k.title),
      background: {
        style: pick.templateType,
        primaryHex: isRoyal ? ONYO_ALAP_VISUAL_DNA.palette.royalCobaltMid : ONYO_ALAP_VISUAL_DNA.palette.skyPaperBlue,
        secondaryHex: isRoyal ? ONYO_ALAP_VISUAL_DNA.palette.royalCobaltDeep : ONYO_ALAP_VISUAL_DNA.palette.thanaWallYellow,
        paperTexture: true,
      },
      foreground: '2.5D cardstock parallax border',
      characters:
        pick.templateType === 'brand_bumper' || pick.templateType === 'epaulette_macro_showcase' || pick.templateType === 'rank_tower_comparison'
          ? []
          : [
              {
                id: `char_${idx + 1}_a`,
                role: 'Police Officer',
                rankId: pick.rankId,
                pose: pick.pose,
                facing: 'right',
                x: 340,
                y: 350,
                scale: 1.08,
                uniformColor: ONYO_ALAP_VISUAL_DNA.palette.uniformBlue,
                trouserColor: ONYO_ALAP_VISUAL_DNA.palette.khakiTrouser,
              },
            ],
      objects:
        pick.templateType === 'diorama_thana_exterior'
          ? [{ id: `jeep_${idx}`, kind: 'police_jeep', x: 870, y: 455, scale: 0.95 }]
          : pick.templateType === 'diorama_interior_office'
            ? [{ id: `desk_${idx}`, kind: 'office_desk', label: 'অফিসার ইনচার্জ', x: 640, y: 450, scale: 1 }]
            : [],
      typography: {
        headline: pick.headline,
        subheadline: seg.text.length > 52 ? seg.text.slice(0, 50) + '…' : seg.text,
        caption: seg.text,
        placardText: pick.placardYear ? 'প্রেক্ষাপট' : undefined,
        placardYear: pick.placardYear,
        accentColor: ONYO_ALAP_VISUAL_DNA.palette.crimsonAccent,
      },
      graphics: {
        rankIds: ['constable', 'naik', 'asi', 'si', 'inspector', 'asp'],
        highlightRankId: pick.rankId,
        counterValue: pick.counterValue,
        counterLabel: pick.headline,
        showPencilPointer: pick.templateType === 'rank_tower_comparison',
        diagramNodes: [
          { label: 'ঢাকা রেঞ্জ', sub: 'Range 01' },
          { label: 'চট্টগ্রাম রেঞ্জ', sub: 'Range 02' },
          { label: 'রাজশাহী রেঞ্জ', sub: 'Range 03' },
          { label: 'খুলনা রেঞ্জ', sub: 'Range 04' },
        ],
      },
      composition: {
        focalAnchor: 'center',
        depthLayers: 4,
      },
      camera: {
        movement: idx % 2 === 0 ? 'push_in' : 'pan_right',
        zoomStart: 1,
        zoomEnd: idx % 2 === 0 ? 1.07 : 1.03,
        panXStart: idx % 2 === 0 ? 0 : -18,
        panXEnd: idx % 2 === 0 ? 0 : 18,
      },
      animation: {
        entranceStyle: pick.placardYear ? 'pendulum_swing' : 'paper_drop',
        speedMultiplier: 1,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitions: {
        in: idx === 0 ? 'fade_black' : idx % 3 === 0 ? 'paper_wipe' : 'cut',
        out: 'cut',
      },
      sfx: [
        {
          timeOffset: 0.1,
          type: pick.templateType === 'brand_bumper' ? 'pop' : 'paper_rustle',
          description: `Entry accent for ${shotId}`,
        },
      ],
      music: {
        mood: isRoyal ? 'brand_chime_swell' : 'investigative_documentary_marimba',
        bpm: 96,
        volumeDb: -18,
      },
      continuityNotes: `Follows Visual DNA rule from ${kbMatches[0]?.sourceFrameId ?? 'FRAME_00000060'}`,
      reactComponents: [
        'SceneBackground',
        'Typography',
        'Caption',
        ...(pick.templateType === 'epaulette_macro_showcase' ? ['InsigniaIllustration'] : ['Character']),
      ],
      assetDependencies: kbMatches.map((k) => k.id),
    };
  });
}

export async function generateGeminiProductionPlan(params: {
  title: string;
  segments: ParsedScriptSegment[];
}): Promise<StoryboardShot[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in the server environment. Set it in Settings > Secrets.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });

  const kbSummary = searchVisualKnowledge('').map((k) => ({
    id: k.id,
    title: k.title,
    reactComponent: k.reactComponent,
    recipe: k.reusableRecipe,
  }));

  const prompt = `You are the Autonomous AI Film & Animation Director for Onyo Alap Studio.
Design a complete storyboard in Onyo Alap's Tactile Paper-Craft 2.5D Diorama style for the project "${params.title}".
Visual DNA Palette: ${JSON.stringify(ONYO_ALAP_VISUAL_DNA.palette)}
Available Visual DNA Knowledge Recipes: ${JSON.stringify(kbSummary)}
Script Segments (preserve exact startTime, endTime, duration, and Bengali/English narration text):
${JSON.stringify(params.segments.slice(0, 24), null, 2)}

Return a JSON object { "title": string, "shots": StoryboardShot[] } choosing the best templateType among:
diorama_thana_exterior, diorama_interior_office, diorama_classroom_exam, epaulette_macro_showcase, rank_tower_comparison, infographic_dial_counter, historical_archive_ledger, bangladesh_range_map, brand_bumper, split_comparison.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          shots: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                shotId: { type: Type.STRING },
                sceneId: { type: Type.STRING },
                order: { type: Type.INTEGER },
                title: { type: Type.STRING },
                startTime: { type: Type.NUMBER },
                endTime: { type: Type.NUMBER },
                duration: { type: Type.NUMBER },
                narration: { type: Type.STRING },
                scenePurpose: { type: Type.STRING },
                visualObjective: { type: Type.STRING },
                templateType: { type: Type.STRING },
                mainSubject: { type: Type.STRING },
                headline: { type: Type.STRING },
                rankId: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const raw = JSON.parse(response.text ?? '{}');
  const baseShots = buildDeterministicProductionPlan(params);
  const merged = baseShots.map((base, idx) => {
    const llm = raw.shots?.[idx];
    if (!llm) return base;
    const validTemplates: SceneTemplateType[] = [
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
    ];
    const tmpl = validTemplates.includes(llm.templateType) ? llm.templateType : base.templateType;
    return {
      ...base,
      title: llm.title || base.title,
      scenePurpose: llm.scenePurpose || base.scenePurpose,
      visualObjective: llm.visualObjective || base.visualObjective,
      templateType: tmpl,
      mainSubject: llm.mainSubject || base.mainSubject,
      typography: {
        ...base.typography,
        headline: llm.headline || base.typography.headline,
      },
      graphics: {
        ...base.graphics,
        highlightRankId: llm.rankId || base.graphics.highlightRankId,
      },
    };
  });

  const validated = StoryboardPlanSchema.parse({ title: params.title, shots: merged });
  return validated.shots;
}
