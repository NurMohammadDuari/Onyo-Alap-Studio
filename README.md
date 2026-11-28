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

## Cinematic 10-Second 3D Render

A three.js diorama rebuilt from a frame-by-frame analysis of the reference film
(see `docs/REFERENCE_FRAME_ANALYSIS.md`): colonial three-arch thana, green louvered
shutters, warm interior light, painted paper-cut foliage, cobalt police jeep,
near-profile paper cut-out officers, tilt-shift lens and a synthesized score.

The reference is a **tabletop diorama**: a modelled, lit 3D set with flat 2D
paper characters composited over it. This rebuild keeps that split — the set,
props, jeep and trees are three.js geometry and painted canvas textures; the
three people are canvas-drawn cut-outs mapped onto camera-facing planes with a
thin cream paper edge, exactly as they appear in the film.

```bash
bun install                                    # three + puppeteer-core
bun build packages/cinematic-engine/src/three-scene.js \
  --outfile packages/cinematic-engine/src/bundle.js --target browser

python3 scripts/score-cinematic.py renders_tmp/onyo-alap-10s-3d/score.wav
bun scripts/render-cinematic-3d.mjs            # 300 frames @ 30fps -> public/renders/onyo-alap-10s-cinematic.mp4
bun scripts/render-cinematic-3d.mjs --stills 1.2,4.6,7.9   # quick 960x540 previews
bun scripts/render-cinematic-3d.mjs --frames 0:120         # partial render, resumable
bun scripts/render-cinematic-3d.mjs --encode               # re-grade + mux only
```

Rendering is chunked (40 frames per fresh headless Chrome, `CHUNK=40`) because
SwiftShader sessions crash after a minute or two; finished frames are skipped so
an interrupted render resumes automatically.

Requires Google Chrome (headless WebGL via SwiftShader) and ffmpeg.
Output: `public/renders/onyo-alap-10s-cinematic.mp4` (1920×1080, H.264, AAC).
