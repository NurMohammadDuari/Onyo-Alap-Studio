# Forensic & Visual Reconstruction Audit Reports

## 1. Reference Video Provenance & Forensics (`ukgbxNHllMY`)
- **Video Title**: Bangladesh Police Ranks (`https://www.youtube.com/watch?v=ukgbxNHllMY`)
- **Container & Video Stream**: MP4 H.264 Main Profile, `1280×720`, exact Constant Frame Rate `30/1` (`30.000 fps`), pixel format `yuv420p`, `start_pts: 512`, `duration: 1294.383s`.
- **Total Decoded Frames**: `38,829` frames.
- **Audio Stream**: AAC `44100 Hz` Stereo, EBU R128 Integrated Loudness `-14.1 LUFS`, Loudness Range `2.7 LU`.
- **Checksum Verification**: Reference file SHA-256 `b5b044dc5ba71979141abc8584e84d6ab6558f3110cd6c161b22fbd30d23fe84`.

## 2. Frame Extraction & Telemetry Accounting (Honest Verified Counts)
- **Full-Video FFprobe Packet + FFmpeg `scdet` Telemetry**: `38,829 / 38,829` frames (`100%`) indexed with exact `pts_time`, frame index, checksum delta, shot ID (`SHOT_001`–`SHOT_097`), and macro scene ID (`SCENE_01`–`SCENE_11`).
- **1 FPS Browse Index**: `1,294 / 1,294` JPEG thumbnails covering the complete `21m 34s` timeline (`/public/reference-frames/1fps/sec_0001.jpg`..`sec_1294.jpg`).
- **Lossless Full-Resolution PNG Archive**: Batch 1 (`300 / 38,829` lossless PNGs in `/projects/police-reference/native-frames/` and mirrored 1:1 to `/projects/police-reference/30fps-frames/`) + `14` strategic keyframe PNGs (`/projects/police-reference/assets/sample_inspect/`). Remaining frames are queued via resumable batch worker `POST /api/reference/extract-batch` and `workers/extract-frames-batch.mjs`.
- **Visual VLM Inspection**: `42` keyframes marked visually audited in `FRAME_STATUS.csv`; `38,787` frames cleanly queued in `FRAME_ANALYSIS.jsonl` with full PTS/luma/temporal telemetry.

## 3. REA-VIDEO Integration (`JuneYaooo/rea-video`)
- **Location**: `/integrations/rea-video-upstream/` + isolated Node/TypeScript adapter `/integrations/rea-video/adapter.ts`.
- **Verified Capabilities**: Upstream `cli.py`, `shots.py`, `probe.py`, `audio.py`, `videomd.py`, `classify.py`, `transitions.py` inspected; paired cleanly with native FFmpeg `scdet` & `ebur128` execution so analysis succeeds deterministically without external Python pip dependencies.

## 4. Visual DNA & Next.js Art Engine Mapping
- **Style Archetype**: Tactile Paper-Craft 2.5D Diorama & Articulated Cutout Motion.
- **Reusable React Modules**: `InsigniaIllustration` (13 Bangladesh Police ranks), `Character` (6 articulated rivet-joint poses), `BuildingIllustration` (3-arch Thana exterior, office, classroom), `OnyoAlapLogoBumper`, `RankTowerLadder`, `HangingSignPlacard`, `MapIllustration`, `ObjectIllustration`, `ShotSceneRenderer`, and `OnyoAlapComposition`.

## 5. GitHub Repository Setup (`Onyo-Alap` / `NurMohammadDuari`)
Due to container security policies, leaked/pasted GitHub tokens must never be embedded or reused in code. To push cleanly to private repository `Onyo-Alap` and grant sole collaborator access to `NurMohammadDuari`:
1. Authenticate locally with a fresh token via `gh auth login`.
2. Create private repo & add collaborator:
   ```bash
   gh repo create Onyo-Alap --private --source=. --remote=origin --push
   gh api -X PUT /repos/<OWNER>/Onyo-Alap/collaborators/NurMohammadDuari -f permission=push
   ```
3. Ensure `.git/info/exclude` excludes `projects/police-reference/original/`, `native-frames/`, `30fps-frames/`, `renders_tmp/`, `public/renders/`, and `database/*.sqlite`.
