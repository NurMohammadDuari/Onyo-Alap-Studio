export interface ParsedScriptSegment {
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  timingSource: 'explicit_timestamp' | 'srt_vtt' | 'estimated_from_text';
}

export interface ParsedScriptResult {
  segments: ParsedScriptSegment[];
  totalDuration: number;
  timingIsEstimated: boolean;
  detectedFormat: 'bracket_range' | 'inline_mmss' | 'srt_vtt' | 'plain_prose';
  language: 'bn' | 'en' | 'mixed';
  discrepancies: string[];
}

function parseTimeToken(token: string): number {
  const parts = token.trim().replace(',', '.').split(':').map(Number);
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function detectLanguage(text: string): 'bn' | 'en' | 'mixed' {
  const bnMatches = text.match(/[\u0980-\u09FF]/g)?.length ?? 0;
  const enMatches = text.match(/[A-Za-z]/g)?.length ?? 0;
  if (bnMatches > 10 && enMatches > 10) return 'mixed';
  if (bnMatches >= enMatches) return 'bn';
  return 'en';
}

export function parseScriptInput(
  rawText: string,
  actualAudioDurationSeconds?: number
): ParsedScriptResult {
  const text = rawText.trim();
  const language = detectLanguage(text);
  const segments: ParsedScriptSegment[] = [];
  let detectedFormat: ParsedScriptResult['detectedFormat'] = 'plain_prose';
  let timingIsEstimated = false;

  // Format 1: [00:00:00.000 - 00:00:06.500] blocks
  const bracketRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)\s*[-–]\s*(\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?)\]\s*([\s\S]*?)(?=\n\[|\s*$)/g;
  const bracketMatches = [...text.matchAll(bracketRegex)];
  if (bracketMatches.length > 0) {
    detectedFormat = 'bracket_range';
    bracketMatches.forEach((m, idx) => {
      const startTime = Number(parseTimeToken(m[1]).toFixed(3));
      const endTime = Number(Math.max(startTime + 0.5, parseTimeToken(m[2])).toFixed(3));
      const segText = m[3].trim();
      if (segText) {
        segments.push({
          index: idx + 1,
          startTime,
          endTime,
          duration: Number((endTime - startTime).toFixed(3)),
          text: segText,
          timingSource: 'explicit_timestamp',
        });
      }
    });
  } else if (/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}/.test(text)) {
    // Format 2: SRT / VTT
    detectedFormat = 'srt_vtt';
    const blocks = text.replace(/\r/g, '').split(/\n\s*\n/);
    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
      if (timeLineIdx === -1) continue;
      const [sStr, eStr] = lines[timeLineIdx].split('-->').map((s) => s.trim().split(' ')[0]);
      const startTime = Number(parseTimeToken(sStr).toFixed(3));
      const endTime = Number(Math.max(startTime + 0.5, parseTimeToken(eStr)).toFixed(3));
      const segText = lines.slice(timeLineIdx + 1).join(' ').trim();
      if (segText) {
        segments.push({
          index: segments.length + 1,
          startTime,
          endTime,
          duration: Number((endTime - startTime).toFixed(3)),
          text: segText,
          timingSource: 'srt_vtt',
        });
      }
    }
  } else {
    // Format 3: Inline "00:01 - sentence" timestamps (like Onyo Alap raw transcript)
    const inlineRegex = /(?:^|\s)(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–]\s*([^0-9\n][\s\S]*?)(?=(?:\s\d{1,2}:\d{2}(?::\d{2})?\s*[-–])|$)/g;
    const inlineMatches = [...text.matchAll(inlineRegex)];
    if (inlineMatches.length >= 2) {
      detectedFormat = 'inline_mmss';
      for (let i = 0; i < inlineMatches.length; i++) {
        const startTime = Number(parseTimeToken(inlineMatches[i][1]).toFixed(3));
        const nextStart =
          i + 1 < inlineMatches.length
            ? parseTimeToken(inlineMatches[i + 1][1])
            : actualAudioDurationSeconds && actualAudioDurationSeconds > startTime
              ? actualAudioDurationSeconds
              : startTime + Math.max(3, inlineMatches[i][2].trim().length / 13);
        const endTime = Number(Math.max(startTime + 0.8, nextStart).toFixed(3));
        segments.push({
          index: i + 1,
          startTime,
          endTime,
          duration: Number((endTime - startTime).toFixed(3)),
          text: inlineMatches[i][2].trim(),
          timingSource: 'explicit_timestamp',
        });
      }
    } else {
      // Format 4: Plain prose without timestamps -> estimated timeline
      detectedFormat = 'plain_prose';
      timingIsEstimated = true;
      const sentences = text
        .split(/(?<=[।.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      let cursor = 0;
      const totalChars = sentences.reduce((a, s) => a + s.length, 0) || 1;
      for (let i = 0; i < sentences.length; i++) {
        const s = sentences[i];
        const estDur = actualAudioDurationSeconds
          ? Math.max(2.0, (s.length / totalChars) * actualAudioDurationSeconds)
          : Math.max(3.2, Number((s.length / 12.5).toFixed(2)));
        const startTime = Number(cursor.toFixed(3));
        const endTime = Number((cursor + estDur).toFixed(3));
        cursor = endTime;
        segments.push({
          index: i + 1,
          startTime,
          endTime,
          duration: Number((endTime - startTime).toFixed(3)),
          text: s,
          timingSource: 'estimated_from_text',
        });
      }
    }
  }

  const totalDuration = segments.length > 0 ? segments[segments.length - 1].endTime : 0;
  const discrepancies: string[] = [];
  if (actualAudioDurationSeconds && totalDuration > 0) {
    const delta = Math.abs(actualAudioDurationSeconds - totalDuration);
    if (delta > 3.0) {
      discrepancies.push(
        `Script timeline (${totalDuration.toFixed(1)}s) differs from supplied audio duration (${actualAudioDurationSeconds.toFixed(1)}s) by ${delta.toFixed(1)}s.`
      );
    }
  }
  if (!actualAudioDurationSeconds) {
    discrepancies.push(
      'No narration audio file attached yet; synchronization is marked as estimated until audio is verified.'
    );
  }

  return {
    segments,
    totalDuration: Number(totalDuration.toFixed(3)),
    timingIsEstimated,
    detectedFormat,
    language,
    discrepancies,
  };
}
