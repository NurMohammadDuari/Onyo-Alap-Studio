# Reference Frame Analysis — `reference_police_ranks_1min.mp4`

Machine analysis of **all 1,800 frames** of the reference clip, used to drive the
3D diorama rebuild in `packages/cinematic-engine`.

## 1. Source

| Property | Value |
|---|---|
| File | `public/renders/reference_police_ranks_1min.mp4` |
| Resolution | 1280×720 (16:9), H.264 High, yuv420p, bt709 |
| Frame rate | 30/1 CFR |
| Frames decoded | **1,800 / 1,800 (100%)** |
| Duration | 60.000 s |
| Audio | AAC 44.1 kHz stereo |

## 2. Per-frame luminance / chroma (signalstats, every frame)

| Metric | Min | Mean | Max |
|---|---|---|---|
| `YAVG` (luma) | 51.9 | 128.3 | 172.4 |
| `SATAVG` (saturation) | 13.1 | 21.1 | 51.5 |
| `HUEAVG` | — | 133.0° | — |

Five-second blocks:

| Window | Luma | Sat | Hue |
|---|---|---|---|
| 00–05 s | 146.3 | 20.0 | 119.4° |
| 05–10 s | 120.3 | 22.5 | 106.6° |
| 10–15 s | 117.1 | 19.8 | 144.0° |
| 15–20 s | 121.6 | 16.1 | 154.5° |
| 20–25 s | 122.1 | 17.7 | 115.4° |
| 25–30 s | 132.1 | 16.9 | 124.8° |
| 30–35 s | 135.9 | 20.1 | 128.2° |
| 35–40 s | 137.0 | 21.6 | 123.5° |
| 40–45 s | 128.0 | 23.3 | 126.7° |
| 45–50 s | 126.3 | 23.2 | 129.9° |
| 50–55 s | 131.5 | 22.0 | 137.9° |
| 55–60 s | 120.9 | 30.5 | 185.5° |

The film sits at a **mid-high key** (mean luma 128) with **restrained saturation**
(mean 21) — a warm, dusty pastel rather than a vivid cartoon palette.

## 3. Shot boundaries (`scdet`, threshold 6)

| Cut | Time | Segment length |
|---|---|---|
| 1 | 3.767 s | 3.77 s |
| 2 | 9.233 s | 5.47 s |
| 3 | 12.933 s | 3.70 s |
| 4 | 16.000 s | 3.07 s |
| 5 | 21.267 s | 5.27 s |
| 6 | 23.233 s | 1.97 s |

Average shot length ≈ 3.9 s — short, confident cuts.

## 4. Dominant palette (k-means over sampled frames, 12 clusters)

| Hex | Share | Role |
|---|---|---|
| `#CCBD98` | 14.0% | sunlit sand / ground |
| `#826D44` | 12.5% | shadowed earth, wood |
| `#A79A7D` | 11.5% | mid-tone stone |
| `#E0D7BD` | 10.4% | cream plaster wall |
| `#817F6E` | 9.4% | stone plinth |
| `#A5B1A9` | 6.6% | hazy sky / concrete |
| `#1D1611` | 6.5% | deep shadow, tyres |
| `#165224` | 6.4% | bottle-green shutters |
| `#C2A963` | 6.4% | warm highlight |
| `#51523F` | 6.3% | foliage shadow |
| `#252B74` | 5.0% | police cobalt |
| `#6C3D13` | 5.0% | terracotta / trunk |

## 5. Visual grammar (what must be reproduced)

1. **Set** — colonial three-arch thana, cream plaster, grey stone plinth and steps,
   bottle-green louvered shutters and double door, green "থানা" signboard, notice
   board, wooden bench, red-flowering trees, sage hills, tan road.
2. **Hero prop** — cobalt police jeep, white waistband with red pinstripes,
   Bengali "পুলিশ" door text, red/blue roof bar, whitewall-ish hubs.
3. **Characters** — clay/paper figures with simple faces, dark hair, peaked caps,
   khaki or navy uniforms; one senior officer with a moustache and a cup of tea.
4. **Light** — low warm key from camera-left, soft ambient fill, long soft shadows,
   warm bounce inside the veranda.
5. **Lens** — miniature tilt-shift: sharp band across the subject, blurred top and
   bottom; slow dolly-in; gentle pan; shallow depth.
6. **Material** — matte paper/clay, visible grain, no specular highlights.
7. **Rhythm** — ~4 s shots, hard cuts, music-led.

## 6. How the rebuild applies it

- `packages/cinematic-engine/src/three-scene.js` builds the set, jeep, characters
  and trees in three.js from these proportions and this palette.
- Camera: 4 shots (3.6 s wide dolly-in, 3.3 s veranda two-shot, 2.1 s jeep arrival,
  1.0 s end card) mirroring the reference's cut rhythm.
- `scripts/render-cinematic-3d.mjs` renders 300 frames (30 fps, 10 s) headlessly.
- `scripts/grade.sh` applies tilt-shift, warm grade, bloom, vignette and film grain.

## 7. Measured framing (establishing shot)

Measured on `est.png` (the 2.5 s frame), as a fraction of the 1280×720 frame.
These are the numbers the 3D camera is solved to reproduce.

| Landmark | y (720p) | Fraction |
|---|---|---|
| Parapet cap (top of building) | 130 | 18.1 % |
| Sign centre | 158 | 21.9 % |
| Cornice / veranda beam | 205 | 28.5 % |
| Window head | 320 | 44.4 % |
| Window sill | 448 | 62.2 % |
| Plinth top | 560 | 77.8 % |
| Sidewalk / road boundary | 640 | 88.9 % |
| Bottom of frame | 720 | 100 % |

Building horizontal extent: x 240 → 1110 = **68 % of frame width**, centred at
x ≈ 675 (52.7 %). Left tree spans x 0 → 300, right tree x 980 → 1280, and both
are cropped by the frame — they are *foreground* foliage, not background props.

Consequences for the 3D camera (`cameraAt()` shot A):

- Camera height **≈ 1.2 m**, pitch **≈ +5°**, vertical FOV **≈ 32°**, distance
  **≈ 16 m** from the facade. A lower, closer camera is what compresses the road
  to the thin band at the bottom of the reference.
- The road must never occupy more than ~12 % of frame height; if it does, the
  camera is too high or too far.
- The parapet must sit at ~18 % from the top with sky and tree canopy above it.

## 8. Character construction (measured from `ref_clerk.png`)

The reference figures are **paper cut-outs photographed in place**, so their
proportions are the on-screen proportions:

| Part | Ratio to total height |
|---|---|
| Head (crown → chin) | 19–21 % |
| Neck (chin → collar) | 4 % |
| Torso (collar → belt) | 32 % |
| Legs (belt → sole) | 43 % |
| Head width : height | 0.52 |
| Shoulder width | 1.55 × head width |
| Cream paper edge | ~2 px at 720p (1.5 ‰ of frame height) |

Construction rules that make them read as the reference rather than as vector art:

1. **One silhouette per limb**, each stroked with a thin cream paper edge — never
   outline internal details (ears, pockets, badges) or the figure turns into a
   sticker collage.
2. **Near-profile head**: narrow oval skull, a short nose wedge, receding lips and
   chin, the eye just behind the brow, a cropped hair cap with a clean hairline.
3. **The neck is skin, un-outlined**, drawn behind the torso so the collar cuts it.
4. **Airbrushed shading**: a single linear gradient across each shape plus a
   clipped core-shadow band on the back edge.
5. The far arm and far leg are a **darker value** of the same garment.
6. Held props (folded paper, cup + saucer, peaked cap) are separate paper shapes
   with their own cream edge.

## 9. Foliage construction

The reference trees are painted paper foliage, not low-poly blobs. The rebuild
generates a 640 px canopy texture: a lobed solid silhouette, then 900 individual
leaf blades sorted back-to-front, each filled from an 8-step green ramp and
rimmed with a darker green. That texture is mapped onto **five intersecting
cards** (three facing the camera at different depths, two angled at the sides)
with `alphaTest` so the cut edge stays crisp, plus a depth material so the cards
cast correct leaf-shaped shadows. The red-flowering tree adds 12 blossom cards
(5-petal flowers with a yellow centre) on the camera-facing side.

## 10. Render + grade pipeline

```
bun build packages/cinematic-engine/src/three-scene.js \
    --outfile packages/cinematic-engine/src/bundle.js --target browser

node scripts/render-cinematic-3d.mjs            # 300 frames, 1920×1080, 30 fps
node scripts/render-cinematic-3d.mjs --stills 1.2,4.6,7.9   # 960×540 previews
node scripts/render-cinematic-3d.mjs --frames 0:120         # partial, resumable
node scripts/render-cinematic-3d.mjs --encode              # grade + mux only
```

Frames are rendered in chunks of 40 with a **fresh headless Chrome per chunk**
(SwiftShader dies with `Target closed` on long sessions) and existing frames are
skipped, so a crashed render resumes where it stopped.

Grade chain (ffmpeg): tilt-shift band → screen bloom → warm film curves →
vignette → grain → unsharp. Target look: mean luma ≈ 128, saturation ≈ 21,
matching the reference's mid-high key and restrained pastel palette.
