# Onyo Alap Studio

End-to-end visual DNA reverse-engineering, Next.js/React/SVG/Remotion paper-craft illustration engine, autonomous AI director, and approval-gated video production studio modeled on **Bangladesh Police Ranks** (`ukgbxNHllMY`).

## Core Capabilities

- **Forensic Reference Reverse Engineering**: Full FFprobe stream/packet analysis (`38,829` frames, `30/1 CFR`, `1280×720`), `ffmpeg scdet` (`97` shots, `11` macro scenes), EBU R128 loudness (`-14.1 LUFS`), Bengali segmented narration & SFX event catalog, and REA-VIDEO upstream integration (`JuneYaooo/rea-video`).
- **Next.js + React + SVG + Remotion Art Engine**: Editable SVG and Remotion components reconstructing Onyo Alap's tactile 2.5D paper-craft diorama style (13 verified Bangladesh Police rank epaulettes, articulated rivet-jointed characters, 3-arch colonial Thana facade, royal-cobalt logo bumper, cutting mat counters, hanging brass-rod placards, and Bangladesh range map).
- **Persistent Visual DNA Knowledge Base**: Searchable catalog tying component recipes, hex palettes, and motion rules directly to source frame IDs and timestamps.
- **Script Ingestion & AI Director**: Bengali/English/SRT script parser + optional FFprobe-measured voiceover audio upload + deterministic Visual DNA director and server-side `gemini-4-hydrogen` integration.
- **Storyboard Review & Strict Render Lock**: Interactive multi-frame storyboard viewer (Opening / Main Action / Ending React keyframes per shot), surgical shot editor with automatic revision history, and hard server-side lock blocking MP4 encoding until explicit click on **APPROVE COMPLETE STORYBOARD & AUTHORIZE FINAL VIDEO RENDER**.

## Local Development

```bash
npm install
npm run dev
```

Configure server-side `GEMINI_API_KEY` via environment variables or AI Studio Secrets when enabling the `gemini-4-hydrogen` AI Director mode. Never expose API keys via `NEXT_PUBLIC_*`.

## Verification

```bash
npx --yes tsx --test packages/storyboard-engine/src/approval-machine.test.ts packages/script-engine/src/parser.test.ts packages/knowledge-base/src/store.test.ts packages/ai-director/src/director.test.ts
npm run lint
npm run build
```
