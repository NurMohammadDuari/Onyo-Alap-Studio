import { NextRequest, NextResponse } from 'next/server';
import { createProjectWithStoryboard, listProjects } from '../../../lib/db';
import { ScriptIngestRequestSchema } from '../../../packages/schemas/src/index';
import { parseScriptInput } from '../../../packages/script-engine/src/parser';
import {
  buildDeterministicProductionPlan,
  generateGeminiProductionPlan,
} from '../../../packages/ai-director/src/director';

export async function GET() {
  const projects = listProjects();
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedInput = ScriptIngestRequestSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: 'Invalid script input', details: parsedInput.error.flatten() },
        { status: 400 }
      );
    }

    const { title, language, scriptText, audioDurationSeconds, hasExactAudioSync } = parsedInput.data;
    const useGemini = Boolean(body.useGemini);
    const audioPath = typeof body.audioPath === 'string' ? body.audioPath : undefined;

    const parsedScript = parseScriptInput(scriptText, audioDurationSeconds);
    if (parsedScript.segments.length === 0) {
      return NextResponse.json({ error: 'Could not extract any script segments.' }, { status: 400 });
    }

    let shots;
    let engineUsed = 'visual_dna_deterministic_director';
    if (useGemini) {
      shots = await generateGeminiProductionPlan({ title, segments: parsedScript.segments });
      engineUsed = 'gemini-4-hydrogen';
    } else {
      shots = buildDeterministicProductionPlan({ title, segments: parsedScript.segments });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32) || 'project';
    const projectId = `${slug}-${Date.now().toString(36)}`;

    const created = createProjectWithStoryboard({
      projectId,
      title,
      language: language ?? parsedScript.language,
      scriptText,
      audioPath,
      audioDurationSeconds: audioDurationSeconds ?? parsedScript.totalDuration,
      hasExactAudioSync: Boolean(hasExactAudioSync && audioPath),
      timingIsEstimated: parsedScript.timingIsEstimated,
      discrepancies: parsedScript.discrepancies,
      shots,
      changeSummary: `Generated initial ${shots.length}-shot storyboard using ${engineUsed} (${parsedScript.detectedFormat}).`,
    });

    return NextResponse.json({
      ...created,
      engineUsed,
      parsedSummary: {
        detectedFormat: parsedScript.detectedFormat,
        segmentCount: parsedScript.segments.length,
        timingIsEstimated: parsedScript.timingIsEstimated,
        discrepancies: parsedScript.discrepancies,
      },
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create project' },
      { status: 500 }
    );
  }
}
