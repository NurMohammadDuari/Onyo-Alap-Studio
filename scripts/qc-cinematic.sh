#!/usr/bin/env bash
# QC the rendered short against the reference frame-for-frame landmarks.
#   bash scripts/qc-cinematic.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FFMPEG="${FFMPEG:-ffmpeg}"
FFPROBE="${FFPROBE:-ffprobe}"
OUT="$ROOT/renders_tmp/qc"
mkdir -p "$OUT"

FINAL="$ROOT/public/renders/onyo-alap-10s-cinematic.mp4"
REF="$ROOT/public/renders/reference_police_ranks_1min.mp4"

echo "== stream =="
"$FFPROBE" -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,duration \
  -of default=noprint_wrappers=1 "$FINAL"

echo "== duration / frame count =="
"$FFPROBE" -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of csv=p=0 "$FINAL"

echo "== loudness =="
"$FFMPEG" -hide_banner -i "$FINAL" -af ebur128=peak=true -f null - 2>&1 | tail -8

echo "== stills =="
for t in 0.5 2.5 4.6 7.6 9.6; do
  "$FFMPEG" -y -loglevel error -ss "$t" -i "$FINAL" -frames:v 1 "$OUT/out_${t}.png"
done
"$FFMPEG" -y -loglevel error -i "$REF" -vf "select='eq(n\,75)+eq(n\,210)+eq(n\,300)+eq(n\,495)'" \
  -vsync 0 "$OUT/ref_%02d.png"

echo "wrote stills to $OUT"
