import * as THREE from 'three';
import { drawCharacter } from './sprite3.js';

/* =====================================================================
   Onyo Alap — "থানা" miniature diorama, rebuilt to match the reference:
   cream colonial police station, square columns, green shutters & door,
   painterly trees, pale-cyan sky, flat 2D cut-out officers.
   ===================================================================== */

export const W = 1920, H = 1080, FPS = 30, DURATION = 10;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => { const x = clamp(t); return x * x * (3 - 2 * x); };
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => { const x = clamp(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

const PAL = {
  wall: 0xe9d49a, wallLit: 0xf2e0ad, wallShade: 0xd8c184,
  trim: 0xf7f0dc, trimShade: 0xe6dcc0,
  stone: 0xb8b7af, stoneDark: 0x98978f, brick: 0xb08a76,
  green: 0x1c6b45, greenDark: 0x114a2e, greenLit: 0x2f8f5c,
  cobalt: 0x1c2f8c, cobaltDark: 0x121e5c, red: 0xb2312c,
  ink: 0x2a2118, sky: 0x8ecfd9,
  table: 0x8a5f3a,
};

const state = { t: 0 };

/* ---------------- renderer ---------------- */
const QS = new URLSearchParams(location.search);
const RW = Number(QS.get('w') ?? W), RH = Number(QS.get('h') ?? H);
const canvas = document.getElementById('c');
canvas.style.width = RW + 'px'; canvas.style.height = RH + 'px';
const stage = document.getElementById('stage');
stage.style.width = RW + 'px'; stage.style.height = RH + 'px';
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(RW, RH, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.86;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd6de);
scene.fog = new THREE.Fog(0xcfe6df, 60, 150);

const camera = new THREE.PerspectiveCamera(30, RW / RH, 0.1, 500);

/* ---------------- helpers ---------------- */
const matCache = new Map();
function mat(color, o = {}) {
  const key = `${color}|${o.roughness ?? 1}|${o.metalness ?? 0}|${o.flat ? 1 : 0}|${o.emissive ?? 0}|${o.emissiveIntensity ?? 1}|${o.transparent ? 1 : 0}|${o.opacity ?? 1}|${o.side ?? 0}|${o.map ? o.map.uuid : 0}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({
      color, roughness: o.roughness ?? 1, metalness: o.metalness ?? 0,
      flatShading: !!o.flat, emissive: o.emissive ?? 0x000000,
      emissiveIntensity: o.emissiveIntensity ?? 1,
      transparent: !!o.transparent, opacity: o.opacity ?? 1,
      side: o.side ?? THREE.FrontSide, map: o.map ?? null,
    }));
  }
  return matCache.get(key);
}
const geoCache = new Map();
function boxGeo(w, h, d) {
  const k = `${w}|${h}|${d}`;
  if (!geoCache.has(k)) geoCache.set(k, new THREE.BoxGeometry(w, h, d));
  return geoCache.get(k);
}
function box(w, h, d, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(boxGeo(w, h, d), o.material ?? mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rx) m.rotation.x = o.rx;
  if (o.rz) m.rotation.z = o.rz;
  return m;
}
function cyl(rt, rb, h, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 16), o.material ?? mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
  if (o.rz) m.rotation.z = o.rz;
  if (o.rx) m.rotation.x = o.rx;
  return m;
}
function sph(r, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.ws ?? 12, o.hs ?? 9), o.material ?? mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false;
  if (o.sx || o.sy || o.sz) m.scale.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1);
  return m;
}
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rngFrom(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

/* ---------------- textures ---------------- */
function paperSheet(base = '#e7d9b6', tint = 'rgba(150,125,80,0.05)', size = 512) {
  const c = makeCanvas(size, size), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const rnd = rngFrom(88);
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = tint;
    ctx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 2.5, 1 + rnd() * 2.5);
  }
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = 'rgba(160,138,100,0.05)'; ctx.lineWidth = 1;
    ctx.beginPath(); const y = rnd() * size;
    ctx.moveTo(0, y); ctx.lineTo(size, y + (rnd() - 0.5) * 6); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function plasterTexture(base = '#e9d49a') {
  const N = 512, c = makeCanvas(N, N), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, N, N);
  const rnd = rngFrom(303);
  for (let i = 0; i < 5200; i++) {
    const light = rnd() > 0.5;
    ctx.fillStyle = light ? `rgba(255,248,224,${0.05 + rnd() * 0.07})` : `rgba(140,112,66,${0.035 + rnd() * 0.06})`;
    const sz = 1 + rnd() * 2.6;
    ctx.fillRect(rnd() * N, rnd() * N, sz, sz);
  }
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = `rgba(150,122,78,${0.05 + rnd() * 0.04})`;
    ctx.lineWidth = 0.8 + rnd() * 2.0;
    const x = rnd() * N;
    ctx.beginPath(); ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 12, N * 0.34, x - 12, N * 0.68, x, N); ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = 'rgba(130,104,64,0.05)'; ctx.lineWidth = 1;
    const y = rnd() * N;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(N, y + (rnd() - 0.5) * 8); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function stoneTexture(base = '#b8b7af') {
  const N = 512, c = makeCanvas(N, N), ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, N, N);
  const rnd = rngFrom(414);
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,250,${0.02 + rnd() * 0.05})` : `rgba(80,80,76,${0.02 + rnd() * 0.05})`;
    ctx.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 2.4, 1 + rnd() * 2.4);
  }
  // stone joints
  for (let row = 0; row < 6; row++) {
    const y = row * (N / 6);
    ctx.strokeStyle = 'rgba(96,96,90,0.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(N, y); ctx.stroke();
    const off = row % 2 ? N / 8 : 0;
    for (let k = 0; k < 4; k++) {
      const x = off + k * (N / 4);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + N / 6); ctx.stroke();
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function asphaltTexture() {
  const N = 512, c = makeCanvas(N, N), ctx = c.getContext('2d');
  ctx.fillStyle = '#8b8b84'; ctx.fillRect(0, 0, N, N);
  const rnd = rngFrom(515);
  for (let i = 0; i < 16000; i++) {
    const v = rnd();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,250,${0.03 + rnd() * 0.05})` : `rgba(60,60,56,${0.03 + rnd() * 0.06})`;
    ctx.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 1.8, 1 + rnd() * 1.8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function tileTexture() {
  const N = 512, c = makeCanvas(N, N), ctx = c.getContext('2d');
  ctx.fillStyle = '#c0c2c0'; ctx.fillRect(0, 0, N, N);
  const rnd = rngFrom(616);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rnd() > 0.5 ? `rgba(255,255,250,${0.03 + rnd() * 0.05})` : `rgba(90,90,84,${0.02 + rnd() * 0.04})`;
    ctx.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 2, 1 + rnd() * 2);
  }
  const step = N / 4;
  ctx.strokeStyle = 'rgba(120,120,112,0.45)'; ctx.lineWidth = 2.4;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * step, 0); ctx.lineTo(i * step, N); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * step); ctx.lineTo(N, i * step); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function woodTexture() {
  const c = makeCanvas(1024, 1024), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 1024, 1024);
  g.addColorStop(0, '#8a5f3a'); g.addColorStop(0.5, '#78502f'); g.addColorStop(1, '#91663e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 1024);
  const rnd = rngFrom(41);
  for (let i = 0; i < 240; i++) {
    const y = rnd() * 1024;
    ctx.strokeStyle = `rgba(${52 + rnd() * 30},${30 + rnd() * 20},${14 + rnd() * 12},${0.10 + rnd() * 0.16})`;
    ctx.lineWidth = 0.6 + rnd() * 3.4;
    ctx.beginPath(); ctx.moveTo(0, y);
    ctx.bezierCurveTo(300, y + (rnd() - 0.5) * 22, 700, y + (rnd() - 0.5) * 22, 1024, y);
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function skyTexture() {
  const c = makeCanvas(2048, 1024), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0.00, '#49a9c9');
  g.addColorStop(0.22, '#5bb6d0');
  g.addColorStop(0.42, '#74c4d7');
  g.addColorStop(0.58, '#93d3dd');
  g.addColorStop(0.70, '#b8e2e3');
  g.addColorStop(0.755, '#dcefe4');
  g.addColorStop(0.78, '#cfe3c8');
  g.addColorStop(1.00, '#b9d3a8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 2048, 1024);

  // soft sun glow, upper-left
  const sg = ctx.createRadialGradient(300, 210, 0, 300, 210, 520);
  sg.addColorStop(0, 'rgba(255,252,232,0.55)');
  sg.addColorStop(0.35, 'rgba(255,246,210,0.20)');
  sg.addColorStop(1, 'rgba(255,246,210,0)');
  ctx.fillStyle = sg; ctx.fillRect(0, 0, 2048, 1024);

  // distinct cumulus clouds
  function cumulus(cx, cy, s) {
    ctx.save();
    ctx.filter = 'blur(3px)';
    const puffs = 9;
    for (let i = 0; i < puffs; i++) {
      const t = i / (puffs - 1);
      const x = cx + (t - 0.5) * 230 * s;
      const r = (30 + Math.sin(t * Math.PI) * 34) * s;
      const y = cy - Math.sin(t * Math.PI) * 22 * s + (i % 2 ? 5 : 0);
      const grd = ctx.createRadialGradient(x, y - r * 0.25, r * 0.08, x, y, r);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.72, 'rgba(255,255,255,0.96)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    // shaded flat base
    ctx.filter = 'blur(4px)';
    const bg = ctx.createLinearGradient(0, cy + 4 * s, 0, cy + 26 * s);
    bg.addColorStop(0, 'rgba(206,224,226,0.55)');
    bg.addColorStop(1, 'rgba(206,224,226,0)');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(cx, cy + 12 * s, 128 * s, 20 * s, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  cumulus(180, 430, 0.80);
  cumulus(560, 470, 0.62);
  cumulus(980, 440, 0.74);
  cumulus(1250, 480, 0.68);
  cumulus(1320, 448, 0.68);
  cumulus(1800, 486, 0.78);
  cumulus(520, 512, 0.5);
  cumulus(1560, 520, 0.46);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function textTexture(text, { w = 512, h = 128, font = '700 64px "Noto Serif Bengali"', color = '#f7f0d8' } = {}) {
  const c = makeCanvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
}

const paperTex = paperSheet('#e8d9b4', 'rgba(150,124,78,0.05)');
const wallTex = plasterTexture('#e3c079');
wallTex.repeat.set(4, 1.5);
const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: wallTex, roughness: 1 });
const stoneTex = stoneTexture();
stoneTex.repeat.set(6, 2);
const stoneMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: stoneTex, roughness: 1 });
const tileTex = tileTexture();
tileTex.repeat.set(5, 1.4);
const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tileTex, roughness: 1 });
const asphaltTex = asphaltTexture();
asphaltTex.repeat.set(16, 6);
const asphaltMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: asphaltTex, roughness: 1 });

/* ---------------- lights ---------------- */
scene.add(new THREE.HemisphereLight(0xbcdff2, 0xdcc191, 0.62));
scene.add(new THREE.AmbientLight(0xffe8c8, 0.20));
const sun = new THREE.DirectionalLight(0xffd8a4, 2.45);
sun.position.set(-9, 19, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -14;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 90;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025; sun.shadow.radius = 3.5;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xa9c9e8, 0.34);
fill.position.set(13, 7, 14);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xfff0d0, 0.50);
rim.position.set(7, 9, -12);
scene.add(rim);
const bounce = new THREE.DirectionalLight(0xe8cfa0, 0.30);
bounce.position.set(0, -6, 8);
scene.add(bounce);
const verandaGlow = new THREE.PointLight(0xffc089, 1.15, 8, 2);
verandaGlow.position.set(0, 2.4, 1.2);
scene.add(verandaGlow);

/* ---------------- sky + ground ---------------- */
{
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 60),
    new THREE.MeshBasicMaterial({ map: skyTexture(), fog: false, depthWrite: false, toneMapped: false })
  );
  sky.position.set(0, 18, -75);
  sky.renderOrder = -10;
  scene.add(sky);
}

// distant painted hills (seen between the trees)
{
  const N = 2048, H = 512;
  const c = makeCanvas(N, H), ctx = c.getContext('2d');
  const rnd = rngFrom(4242);
  const layers = [
    { y: H * 0.62, amp: 26, col: '#a8c98c', haze: 0.42 },
    { y: H * 0.74, amp: 34, col: '#8dbd72', haze: 0.26 },
    { y: H * 0.86, amp: 22, col: '#74ac5c', haze: 0.12 },
  ];
  for (const L of layers) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, L.y);
    for (let x = 0; x <= N; x += 16) {
      const y = L.y
        + Math.sin(x * 0.0032 + rnd() * 0.4) * L.amp
        + Math.sin(x * 0.0091 + 1.7) * L.amp * 0.45
        + Math.sin(x * 0.021 + 0.4) * L.amp * 0.16;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(N, H); ctx.closePath();
    ctx.fillStyle = L.col; ctx.fill();
    // haze wash toward the top of each ridge
    ctx.save(); ctx.clip();
    const hz = ctx.createLinearGradient(0, L.y - L.amp, 0, L.y + L.amp * 2.2);
    hz.addColorStop(0, `rgba(226,240,226,${L.haze})`);
    hz.addColorStop(1, 'rgba(226,240,226,0)');
    ctx.fillStyle = hz; ctx.fillRect(0, L.y - L.amp, N, L.amp * 3.4);
    ctx.restore();
  }
  // soft tree-line texture on the nearest ridge
  for (let i = 0; i < 220; i++) {
    const x = rnd() * N, y = H * 0.86 + rnd() * H * 0.14;
    ctx.fillStyle = `rgba(${60 + rnd() * 40},${100 + rnd() * 40},${50 + rnd() * 30},0.5)`;
    ctx.beginPath(); ctx.arc(x, y, 6 + rnd() * 16, 0, 7); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const hill = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 30),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, toneMapped: false })
  );
  hill.position.set(0, 11.2, -46);
  hill.renderOrder = -9;
  scene.add(hill);
}

// tabletop / paper base
{
  const wood = woodTexture();
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(340, 300),
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: wood, roughness: 0.9 })
  );
  table.rotation.x = -Math.PI / 2;
  table.position.set(0, -1.02, 0);
  table.receiveShadow = true;
  scene.add(table);

  const base = box(58, 1.0, 44, 0xe9dcc0, 0, -0.5, 0, { cast: true });
  scene.add(base);
  const topTex = paperSheet('#e6d6ae', 'rgba(146,120,74,0.06)');
  topTex.repeat.set(7, 7);
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(58, 44),
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: topTex, roughness: 1 })
  );
  top.rotation.x = -Math.PI / 2;
  top.position.set(0, 0.004, 0);
  top.receiveShadow = true;
  scene.add(top);
}

// road / sidewalk / grass
{
  const roadTex = paperSheet('#bdbcb2', 'rgba(90,90,84,0.05)');
  roadTex.repeat.set(14, 1.4);
  const road = box(58, 0.07, 22.0, 0xb9b8ae, 0, 0.04, 15.8, { cast: false });
  const roadCanvas = asphaltMat.map.image;
  const roadTex2 = new THREE.CanvasTexture(roadCanvas);
  roadTex2.colorSpace = THREE.SRGBColorSpace;
  roadTex2.wrapS = roadTex2.wrapT = THREE.RepeatWrapping;
  roadTex2.repeat.set(16, 6);
  road.material = new THREE.MeshBasicMaterial({ map: roadTex2, color: 0xaeb2b3 });
  scene.add(road);
  scene.add(box(58, 0.075, 0.16, 0xe8e4d6, 0, 0.052, 4.95, { cast: false }));
  scene.add(box(58, 0.10, 0.20, 0xdcd8c8, 0, 0.055, 4.74, { cast: false }));
  scene.add(box(58, 0.12, 0.16, 0xc4c2b4, 0, 0.06, 4.78, { cast: false }));
  scene.add(box(58, 0.07, 0.16, 0xa9a89f, 0, 0.05, 24.9, { cast: false }));
  scene.add(box(58, 0.07, 0.16, 0xa9a89f, 0, 0.05, 9.15, { cast: false }));

  // white tiled sidewalk
  const walkTex = paperSheet('#e2ded0', 'rgba(150,148,135,0.05)');
  walkTex.repeat.set(20, 1.6);
  const walk = box(58, 0.09, 1.5, 0xdedacd, 0, 0.06, 3.9, { cast: false });
  walk.material = new THREE.MeshStandardMaterial({ color: 0xdedacd, roughness: 1, map: walkTex });
  scene.add(walk);
  for (let i = 0; i < 40; i++) {
    scene.add(box(0.02, 0.012, 1.45, 0xc8c4b6, -28 + i * 1.4, 0.108, 3.9, { cast: false }));
  }
  scene.add(box(58, 0.1, 0.12, 0xc9c5b7, 0, 0.07, 3.16, { cast: false }));

  // grass strips
  function grass(x, z, sx, sz, col = 0x86c25c, rot = 0) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(1, 26), mat(col, { roughness: 1 }));
    m.scale.set(sx, sz, 1);
    m.rotation.x = -Math.PI / 2; m.rotation.z = rot;
    m.position.set(x, 0.015, z);
    m.receiveShadow = true;
    scene.add(m);
  }
  grass(-15.5, 2.2, 6.0, 1.35, 0x9bd06a, 0.03);
  grass(15.5, 2.2, 6.2, 1.4, 0x9bd06a, -0.03);
  grass(-20.5, 6.0, 3.4, 1.1, 0x93c862, 0.2);
  grass(20.5, 6.0, 3.4, 1.1, 0x8cc45c, -0.2);
  // grass beds at the plinth
  const bedL = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.5), mat(0x93c862, { roughness: 1 }));
  bedL.rotation.x = -Math.PI / 2; bedL.position.set(-7.6, 0.018, 2.35); bedL.receiveShadow = true; scene.add(bedL);
  const bedR = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.5), mat(0x8cc45c, { roughness: 1 }));
  bedR.rotation.x = -Math.PI / 2; bedR.position.set(7.6, 0.018, 2.35); bedR.receiveShadow = true; scene.add(bedR);

  // little path to the steps
  scene.add(box(5.2, 0.02, 1.4, 0xd9d5c7, 0, 0.02, 3.7, { cast: false }));
}

/* ================= BUILDING ================= */
const building = new THREE.Group();
scene.add(building);

const BW = 12.4, WALL_Y0 = 0.62, WALL_H = 3.2;
const FRONT_Z = 2.15;      // column line
const BACK_Z = -0.72;      // back wall front face

// plinth
building.add(box(13.5, 0.5, 4.9, PAL.stone, 0, 0.25, 0.15, { material: stoneMat }));
building.add(box(13.6, 0.1, 5.0, 0xc4c3ba, 0, 0.52, 0.15, { cast: false }));
building.add(box(13.3, 0.07, 4.7, PAL.stoneDark, 0, 0.02, 0.15, { cast: false }));
// brick facing under veranda
{
  const bt = paperSheet('#b08a76', 'rgba(90,55,40,0.08)', 256);
  bt.repeat.set(10, 1);
  const brick = box(12.9, 0.44, 0.06, 0xb08a76, 0, 0.27, 2.56, { cast: false });
  brick.material = new THREE.MeshStandardMaterial({ color: 0xb08a76, roughness: 1, map: bt });
  building.add(brick);
}

// veranda floor + tiles
building.add(box(13.0, 0.14, 2.4, 0xbfc1ba, 0, 0.63, 1.15, { cast: false, material: tileMat }));
for (let i = 0; i < 26; i++) building.add(box(0.02, 0.012, 2.35, 0xaaa99d, -6.4 + i * 0.5, 0.703, 1.15, { cast: false }));
for (let i = 0; i < 5; i++) building.add(box(12.9, 0.012, 0.02, 0xaaa99d, 0, 0.703, 0.2 + i * 0.48, { cast: false }));

// dark floor border strip
building.add(box(13.0, 0.03, 0.18, 0x9a988c, 0, 0.706, 2.32, { cast: false }));

// steps
for (let i = 0; i < 3; i++) {
  building.add(box(4.8, 0.16, 0.5, PAL.stone, 0, 0.48 - i * 0.16, 2.75 + i * 0.46, { cast: true, material: stoneMat }));
}
building.add(box(5.2, 0.08, 0.2, 0xc4c3ba, 0, 0.66, 2.55, { cast: false }));

// back + side walls
building.add(box(BW, WALL_H, 0.3, PAL.wall, 0, WALL_Y0 + WALL_H / 2, BACK_Z - 0.15, { material: wallMat }));
building.add(box(0.3, WALL_H, 3.0, PAL.wall, -BW / 2 + 0.15, WALL_Y0 + WALL_H / 2, 0.4, { material: wallMat }));
building.add(box(0.3, WALL_H, 3.0, PAL.wall, BW / 2 - 0.15, WALL_Y0 + WALL_H / 2, 0.4, { material: wallMat }));
// warm interior plane behind openings
building.add(box(BW - 0.6, WALL_H - 0.2, 0.06, 0x6b5638, 0, WALL_Y0 + WALL_H / 2, BACK_Z - 0.34, { cast: false, material: mat(0x6b5638, { roughness: 1 }) }));

// ceiling (shaded veranda roof underside)
building.add(box(13.0, 0.1, 3.0, PAL.trimShade, 0, 3.56, 0.9, { cast: false }));

// square columns + bases + capitals
const COLX = [-5.65, -1.9, 1.9, 5.65];
for (const cx of COLX) {
  building.add(box(0.46, 3.0, 0.46, PAL.trim, cx, WALL_Y0 + 1.5, FRONT_Z));
  building.add(box(0.62, 0.16, 0.62, PAL.trimShade, cx, WALL_Y0 + 0.08, FRONT_Z, { cast: false }));
  building.add(box(0.66, 0.1, 0.66, PAL.trim, cx, WALL_Y0 + 0.2, FRONT_Z, { cast: false }));
  building.add(box(0.62, 0.14, 0.62, PAL.trim, cx, 3.52, FRONT_Z, { cast: false }));
  building.add(box(0.68, 0.08, 0.68, PAL.trim, cx, 3.6, FRONT_Z, { cast: false }));
}

// arched spandrel between columns (solid band with arch-shaped bottom)
{
  const shape = new THREE.Shape();
  shape.moveTo(-6.0, 3.6);
  shape.lineTo(6.0, 3.6);
  shape.lineTo(6.0, 3.12);
  const springs = [5.65, 1.9, -1.9, -5.65];
  shape.lineTo(springs[0], 3.12);
  for (let i = 0; i < 3; i++) {
    const xr = springs[i], xl = springs[i + 1];
    const mid = (xr + xl) / 2;
    shape.quadraticCurveTo(mid, 3.12 + (xr - xl) * 0.30, xl, 3.12);
  }
  shape.lineTo(-6.0, 3.12);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: false, curveSegments: 20 });
  const m = new THREE.Mesh(geo, mat(PAL.trim, { roughness: 1 }));
  m.position.set(0, 0, FRONT_Z - 0.21);
  m.castShadow = true; m.receiveShadow = true;
  building.add(m);
}

// entablature + roof
building.add(box(13.2, 0.3, 4.7, PAL.trim, 0, 3.75, 0.35));
building.add(box(13.3, 0.12, 4.8, PAL.trimShade, 0, 3.92, 0.35, { cast: false }));
building.add(box(12.6, 0.16, 4.2, 0xd8cdb0, 0, 3.98, 0.3, { cast: false }));

// soft shade under the cornice (fake ambient occlusion)
{
  const N = 512, c = makeCanvas(8, N), ctx = c.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, N);
  grd.addColorStop(0, 'rgba(60,38,14,0.34)');
  grd.addColorStop(0.35, 'rgba(60,38,14,0.12)');
  grd.addColorStop(1, 'rgba(60,38,14,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, 8, N);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const shadeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(12.4, 1.15),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  shadeMesh.position.set(0, 3.30, BACK_Z + 0.09);
  building.add(shadeMesh);
}

// parapet with balusters
{
  const z = 2.62;
  building.add(box(13.2, 0.12, 0.34, PAL.trim, 0, 3.98, z, { cast: false }));
  building.add(box(13.2, 0.13, 0.38, PAL.trim, 0, 4.52, z));
  building.add(box(13.2, 0.06, 0.42, 0xfaf4e2, 0, 4.6, z, { cast: false }));
  for (let i = 0; i < 30; i++) {
    building.add(box(0.13, 0.42, 0.12, PAL.trim, -6.3 + i * 0.435, 4.24, z, { cast: false }));
  }
  for (const ex of [-6.5, 6.5]) {
    building.add(box(0.5, 0.72, 0.5, PAL.trim, ex, 4.28, z));
    building.add(box(0.62, 0.1, 0.62, PAL.trim, ex, 4.66, z, { cast: false }));
  }
}

// signboard
{
  const g = new THREE.Group();
  g.position.set(0, 4.28, 2.68);
  g.add(box(3.05, 0.68, 0.12, 0x0d4a2c, 0, 0, 0));
  g.add(box(2.88, 0.54, 0.04, 0x1a6b3f, 0, 0, 0.08));
  const txt = new THREE.Mesh(
    new THREE.PlaneGeometry(2.25, 0.42),
    new THREE.MeshBasicMaterial({ map: textTexture('থানা', { w: 512, h: 128, font: '700 76px "Noto Serif Bengali"', color: '#f2f4e6' }), transparent: true })
  );
  txt.position.set(0, 0.01, 0.11);
  g.add(txt);
  building.add(g);
}

// windows (dark barred recess + green louvered shutters)
function windowBay(cx) {
  const g = new THREE.Group();
  const w = 2.5, h = 2.2, y0 = 0.98;
  // recess
  g.add(box(w, h, 0.1, 0x141210, cx, y0 + h / 2, BACK_Z + 0.02, { cast: false, material: mat(0x141210, { roughness: 1 }) }));
  // white frame
  g.add(box(w + 0.2, 0.12, 0.14, PAL.trim, cx, y0 + h + 0.03, BACK_Z + 0.08, { cast: false }));
  g.add(box(w + 0.2, 0.14, 0.16, PAL.trim, cx, y0 - 0.03, BACK_Z + 0.08, { cast: false }));
  g.add(box(0.12, h + 0.2, 0.14, PAL.trim, cx - w / 2 - 0.04, y0 + h / 2, BACK_Z + 0.08, { cast: false }));
  g.add(box(0.12, h + 0.2, 0.14, PAL.trim, cx + w / 2 + 0.04, y0 + h / 2, BACK_Z + 0.08, { cast: false }));
  // vertical bars
  for (let i = 0; i < 6; i++) {
    g.add(box(0.05, h - 0.1, 0.05, 0xe8e3d4, cx - 0.95 + i * 0.38, y0 + h / 2, BACK_Z + 0.12, { cast: false }));
  }
  g.add(box(w - 0.1, 0.04, 0.05, 0xe8e3d4, cx, y0 + h * 0.62, BACK_Z + 0.12, { cast: false }));
  g.add(box(w - 0.1, 0.04, 0.05, 0xe8e3d4, cx, y0 + h * 0.34, BACK_Z + 0.12, { cast: false }));
  // louvered shutters
  function shutter(x) {
    const s = new THREE.Group();
    s.position.set(x, y0, BACK_Z + 0.12);
    s.add(box(0.8, h, 0.06, PAL.greenDark, 0, h / 2, 0));
    for (let i = 0; i < 12; i++) s.add(box(0.72, 0.075, 0.05, PAL.greenLit, 0, 0.1 + i * (h - 0.2) / 12, 0.04, { cast: false }));
    s.add(box(0.07, h - 0.06, 0.07, PAL.green, -0.36, h / 2, 0.05, { cast: false }));
    s.add(box(0.07, h - 0.06, 0.07, PAL.green, 0.36, h / 2, 0.05, { cast: false }));
    return s;
  }
  const sl = shutter(cx - w / 2 - 0.42); sl.rotation.y = -0.28; g.add(sl);
  const sr = shutter(cx + w / 2 + 0.42); sr.rotation.y = 0.28; g.add(sr);
  // lintel vents
  g.add(box(0.5, 0.12, 0.08, 0x2a2620, cx - 0.6, y0 + h + 0.32, BACK_Z + 0.1, { cast: false }));
  g.add(box(0.5, 0.12, 0.08, 0x2a2620, cx + 0.6, y0 + h + 0.32, BACK_Z + 0.1, { cast: false }));
  return g;
}
building.add(windowBay(-4.05));
building.add(windowBay(4.05));

// green double door
{
  const g = new THREE.Group();
  const dw = 2.3, dh = 2.55, y0 = WALL_Y0;
  g.add(box(dw + 0.24, dh + 0.24, 0.12, PAL.trim, 0, y0 + dh / 2, BACK_Z + 0.05, { cast: false }));
  g.add(box(dw, dh, 0.14, 0x0e3a24, 0, y0 + dh / 2, BACK_Z + 0.1));
  for (const side of [-1, 1]) {
    const dx = side * dw / 4;
    g.add(box(dw / 2 - 0.05, dh - 0.14, 0.1, side < 0 ? 0x1c7046 : 0x1a6b42, dx, y0 + dh / 2, BACK_Z + 0.15));
    for (const [py, ph] of [[1.85, 0.95], [0.85, 0.75]]) {
      g.add(box(dw / 2 - 0.3, ph, 0.035, 0x2b8a58, dx, py, BACK_Z + 0.2, { cast: false }));
      g.add(box(dw / 2 - 0.4, ph - 0.12, 0.02, 0x155537, dx, py, BACK_Z + 0.215, { cast: false }));
    }
    g.add(sph(0.045, 0, dx - side * 0.42, y0 + 1.15, BACK_Z + 0.25, { material: mat(0xc9a24a, { roughness: 0.35, metalness: 0.6 }), ws: 10, hs: 8, cast: false }));
  }
  g.add(box(0.06, dh - 0.14, 0.11, 0x0d3320, 0, y0 + dh / 2, BACK_Z + 0.16, { cast: false }));
  // small wall speaker above the door
  g.add(box(0.34, 0.20, 0.12, 0x232323, 0, y0 + dh + 0.20, BACK_Z + 0.12, { cast: true }));
  g.add(box(0.26, 0.12, 0.02, 0x3a3a3a, 0, y0 + dh + 0.20, BACK_Z + 0.19, { cast: false }));
  // step stone
  g.add(box(2.9, 0.08, 0.5, 0xc4c3ba, 0, 0.02, FRONT_Z - 0.4, { cast: false }));
  building.add(g);
}

// notice board
{
  const g = new THREE.Group();
  g.position.set(-1.98, 2.15, BACK_Z + 0.05);
  g.add(box(0.74, 0.92, 0.05, 0x8a5a2e, 0, 0, 0));
  g.add(box(0.64, 0.82, 0.03, 0xb07a44, 0, 0, 0.03));
  const rnd = rngFrom(17);
  const spots = [[-0.17, 0.24], [0.17, 0.24], [-0.17, -0.02], [0.17, -0.02], [-0.17, -0.27], [0.17, -0.27]];
  for (const [px, py] of spots) {
    g.add(box(0.24, 0.17, 0.02, 0xf7f1de, px, py, 0.05, { cast: false }));
    g.add(box(0.18, 0.012, 0.005, 0x9a9484, px, py + 0.045, 0.065, { cast: false }));
    g.add(box(0.18, 0.012, 0.005, 0x9a9484, px, py + 0.015, 0.065, { cast: false }));
    g.add(box(0.12, 0.012, 0.005, 0x9a9484, px - 0.03, py - 0.02, 0.065, { cast: false }));
  }
  building.add(g);
}

// wall clock
{
  const g = new THREE.Group();
  g.position.set(2.9, 2.75, BACK_Z + 0.05);
  g.add(cyl(0.2, 0.2, 0.05, 0xe8e2d2, 0, 0, 0, { seg: 24 }));
  g.rotation.x = Math.PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), new THREE.MeshBasicMaterial({ color: 0xfbf7ea }));
  face.position.z = 0.03;
  g.add(face);
  for (let i = 0; i < 12; i++) {
    const tick = box(0.012, 0.026, 0.004, 0x4a443a, Math.sin(i / 12 * Math.PI * 2) * 0.13, Math.cos(i / 12 * Math.PI * 2) * 0.13, 0.045, { cast: false });
    tick.rotation.z = -i / 12 * Math.PI * 2;
    g.add(tick);
  }
  const h1 = box(0.012, 0.09, 0.004, 0x2a2620, 0.0, 0.04, 0.05, { cast: false }); h1.rotation.z = 0.5; g.add(h1);
  const h2 = box(0.01, 0.13, 0.004, 0x2a2620, 0.05, 0.02, 0.052, { cast: false }); h2.rotation.z = -0.9; g.add(h2);
  building.add(g);
}

// bench + wooden table
{
  const g = new THREE.Group();
  g.position.set(-4.5, 0.7, 1.5);
  g.add(box(1.5, 0.09, 0.44, 0xb07a44, 0, 0.34, 0));
  g.add(box(1.5, 0.09, 0.44, 0x8a5a2e, 0, 0.42, 0));
  for (const dx of [-0.58, 0.58]) {
    g.add(box(0.09, 0.34, 0.09, 0x6e4522, dx, 0.17, 0.16));
    g.add(box(0.09, 0.34, 0.09, 0x6e4522, dx, 0.17, -0.16));
  }
  g.add(box(1.5, 0.5, 0.08, 0x8a5a2e, 0, 0.64, -0.2));
  building.add(g);
}
{
  const g = new THREE.Group();
  g.position.set(2.95, 0.7, 1.55);
  g.add(box(0.95, 0.09, 0.66, 0xb07a44, 0, 0.55, 0));
  g.add(box(0.95, 0.04, 0.66, 0xc98a4c, 0, 0.61, 0, { cast: false }));
  for (const dx of [-0.38, 0.38]) for (const dz of [-0.25, 0.25]) g.add(box(0.08, 0.55, 0.08, 0x6e4522, dx, 0.275, dz));
  building.add(g);
}

// potted plants
for (const px of [-6.15, 6.15]) {
  const g = new THREE.Group();
  g.position.set(px, 0.72, 2.1);
  g.add(cyl(0.16, 0.12, 0.28, 0xa9713c, 0, 0.14, 0, { seg: 10 }));
  const rnd = rngFrom(Math.round(px * 10) + 3);
  for (let i = 0; i < 7; i++) {
    const m = sph(0.16, 0, (rnd() - 0.5) * 0.36, 0.34 + rnd() * 0.22, (rnd() - 0.5) * 0.36, { material: mat(i % 2 ? 0x2f7a45 : 0x3f9152, { flat: true }), ws: 6, hs: 5 });
    m.scale.set(1.1, 0.85, 1);
    g.add(m);
  }
  building.add(g);
}

/* ---------------- contact shadows ---------------- */
function contactShadow(x, z, sx, sz, opacity = 0.3) {
  const c = makeCanvas(128, 128), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, `rgba(28,22,12,${opacity})`);
  g.addColorStop(0.55, `rgba(28,22,12,${opacity * 0.45})`);
  g.addColorStop(1, 'rgba(28,22,12,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z);
  m.renderOrder = 1;
  scene.add(m);
  return m;
}
contactShadow(0, 0.4, 17, 8.5, 0.42);
contactShadow(-8.6, -0.9, 7, 6, 0.34);
contactShadow(8.8, -0.5, 7, 6, 0.34);

/* ---------------- painterly paper-cut trees ---------------- */
function leafBlade(ctx, x, y, len, wid, rot, fill, dark) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(wid * 0.85, -len * 0.42, 0, -len);
  ctx.quadraticCurveTo(-wid * 0.85, -len * 0.42, 0, 0);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 1.1; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -len * 0.12); ctx.lineTo(0, -len * 0.86);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

const GREENS = ['#3a6d1f', '#447b25', '#4d8829', '#57962f', '#62a435', '#6db03b', '#7cbd46', '#8ccb55'];
const GREENS_DARK = ['#1d4410', '#245012', '#2a5a16'];

function canopyTexture(seed, bright = 0) {
  const N = 640, c = makeCanvas(N, N), ctx = c.getContext('2d');
  const rnd = rngFrom(seed);
  const cx = N / 2, cy = N / 2;

  // solid painted mass so the canopy never looks see-through
  ctx.save();
  ctx.beginPath();
  const lobes = 13;
  for (let i = 0; i <= lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const rr = 0.40 + 0.055 * Math.sin(a * 5 + seed) + 0.03 * Math.sin(a * 9 + seed * 2);
    const x = cx + Math.cos(a) * N * rr;
    const y = cy + Math.sin(a) * N * rr * 0.92;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#3c6d22'; ctx.fill();
  ctx.restore();

  // dense leaves, back to front
  const items = [];
  for (let i = 0; i < 900; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = Math.pow(rnd(), 0.62);
    const lobe = 1 + 0.10 * Math.sin(a * 5 + seed);
    items.push([
      cx + Math.cos(a) * rr * N * 0.435 * lobe,
      cy + Math.sin(a) * rr * N * 0.40 * lobe,
      rnd(), a
    ]);
  }
  items.sort((p1, p2) => p1[1] - p2[1]);
  for (const [x, y, r, a] of items) {
    const len = 20 + r * 30;
    const wid = len * (0.44 + r * 0.16);
    // sun comes from upper-left
    const lit = ((cx - x) + (cy - y) * 0.6) / N;
    let idx = Math.floor((r * 0.55 + lit * 0.9 + bright) * (GREENS.length - 1));
    idx = Math.max(0, Math.min(GREENS.length - 1, idx));
    leafBlade(ctx, x, y, len, wid, a + Math.PI / 2 + (r - 0.5) * 0.9, GREENS[idx], GREENS_DARK[r > 0.5 ? 1 : 0]);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function blossomTexture() {
  const N = 256, c = makeCanvas(N, N), ctx = c.getContext('2d');
  const rnd = rngFrom(919);
  for (let i = 0; i < 26; i++) {
    const x = 22 + rnd() * (N - 44), y = 22 + rnd() * (N - 44);
    const r = 7 + rnd() * 7;
    const rot = rnd() * 6.28;
    // five petals
    for (let k = 0; k < 5; k++) {
      const a = rot + k * (Math.PI * 2 / 5);
      ctx.save();
      ctx.translate(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.52, r * 0.40, a, 0, 7);
      const grd = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 0.55);
      grd.addColorStop(0, '#f2604a');
      grd.addColorStop(0.6, '#d8342a');
      grd.addColorStop(1, '#a81f1c');
      ctx.fillStyle = grd; ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, 7);
    ctx.fillStyle = '#f0c040'; ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const canopyMats = [0, 1, 2].map(i => {
  const tex = canopyTexture(101 + i * 37, i === 0 ? -0.10 : i === 2 ? 0.06 : 0.0);
  const m = new THREE.MeshStandardMaterial({
    map: tex, transparent: true, alphaTest: 0.45, side: THREE.DoubleSide,
    roughness: 1, metalness: 0,
  });
  m.userData.depth = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.45,
  });
  return m;
});

function makeTree(x, z, s, seed, blossoms) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  const rnd = rngFrom(seed);

  // painted trunk
  const trunkTex = (() => {
    const N = 256, c = makeCanvas(N, 512), ctx = c.getContext('2d');
    ctx.fillStyle = '#5d3f26'; ctx.fillRect(0, 0, N, 512);
    const r2 = rngFrom(seed + 5);
    for (let i = 0; i < 60; i++) {
      ctx.strokeStyle = `rgba(${r2() > 0.5 ? '38,24,12' : '126,92,58'},${0.10 + r2() * 0.18})`;
      ctx.lineWidth = 1 + r2() * 4;
      const xx = r2() * N;
      ctx.beginPath(); ctx.moveTo(xx, 0);
      ctx.bezierCurveTo(xx + (r2() - 0.5) * 26, 170, xx + (r2() - 0.5) * 26, 340, xx + (r2() - 0.5) * 18, 512);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  })();
  const barkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: trunkTex, roughness: 1 });

  const trunk = cyl(0.34, 0.62, 4.3, 0xffffff, 0, 2.15, 0, { seg: 12, material: barkMat });
  g.add(trunk);
  // paper-cut branches
  for (const [bx, by, bz, rz, len] of [[0.62, 3.2, 0.1, 0.42, 0.9], [-0.58, 3.5, -0.1, -0.45, 0.8], [0.15, 3.9, 0.28, 0.16, 0.7]]) {
    const b = cyl(0.09, 0.20, len * 2, 0xffffff, bx, by + len * 0.7, bz, { seg: 8, material: barkMat });
    b.rotation.z = rz; g.add(b);
  }

  // canopy: three offset cards give volume, plus leaf-card fringes
  const canopy = new THREE.Group();
  canopy.position.y = 4.55;
  const cards = [
    [0, 0, -0.85, 7.9, 6.7, 0],
    [0, 0, -0.55, 7.6, 6.4, 0],
    [0.12, 0.16, 0.0, 7.0, 5.9, 1],
    [-0.10, -0.12, 0.55, 6.1, 5.2, 2],
  ];
  for (const [ox, oy, oz, w, h, mi] of cards) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), canopyMats[mi]);
    m.position.set(ox, oy, oz);
    m.castShadow = true; m.receiveShadow = true;
    m.customDepthMaterial = canopyMats[mi].userData.depth;
    canopy.add(m);
  }
  // side cards for parallax when the camera drifts
  for (const side of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.6), canopyMats[side > 0 ? 1 : 2]);
    m.position.set(side * 2.5, -0.15, 0.15);
    m.rotation.y = side * 0.85;
    m.castShadow = true; m.receiveShadow = true;
    m.customDepthMaterial = canopyMats[side > 0 ? 1 : 2].userData.depth;
    canopy.add(m);
  }

  if (blossoms) {
    const bt = blossomTexture();
    const bm = new THREE.MeshStandardMaterial({ map: bt, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 1 });
    for (let i = 0; i < 12; i++) {
      const a = rnd() * Math.PI * 2, rr = 0.35 + rnd() * 0.6;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), bm);
      m.position.set(Math.cos(a) * 2.6 * rr, Math.sin(a) * 2.1 * rr, 0.68 + rnd() * 0.15);
      m.rotation.z = rnd() * 6.28;
      canopy.add(m);
    }
  }
  g.add(canopy);
  g.userData.canopy = canopy;
  return g;
}
const treeL = makeTree(-8.7, -1.2, 1.30, 21, true);
const treeR = makeTree(8.9, -0.9, 1.34, 37, false);
scene.add(treeL, treeR);

/* ---------------- flagpole + "?" boards ---------------- */
const flag = new THREE.Group();
{
  const pole = new THREE.Group();
  pole.position.set(-10.2, 0, 2.2);
  pole.add(cyl(0.035, 0.05, 5.6, 0xf4ecd8, 0, 2.8, 0, { seg: 8 }));
  pole.add(sph(0.07, 0, 0, 5.64, 0, { material: mat(0xc9a24a, { metalness: 0.5, roughness: 0.4 }), ws: 8, hs: 6 }));
  scene.add(pole);
  const fg = new THREE.PlaneGeometry(1.25, 0.78, 10, 5);
  const fm = new THREE.MeshStandardMaterial({ color: 0xc2352f, roughness: 0.9, side: THREE.DoubleSide });
  const fl = new THREE.Mesh(fg, fm);
  fl.position.set(0.65, 5.05, 0);
  flag.add(fl);
  flag.position.set(-10.2, 0, 2.2);
  scene.add(flag);
  flag.userData.geo = fg;
  flag.userData.base = fg.attributes.position.array.slice();
}

function questionBoard(x, z, ry, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry; g.scale.setScalar(s);
  g.add(cyl(0.04, 0.045, 1.25, 0xe9e0c8, 0, 0.62, 0, { seg: 6 }));
  g.add(box(1.2, 0.92, 0.06, 0xfbf6e6, 0, 1.5, 0));
  g.add(box(1.08, 0.8, 0.02, 0xffffff, 0, 1.5, 0.04, { cast: false }));
  const q = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.6), new THREE.MeshBasicMaterial({ map: textTexture('?', { w: 256, h: 320, font: '700 240px Georgia', color: '#c0392b' }), transparent: true }));
  q.position.set(0, 1.5, 0.06);
  g.add(q);
  scene.add(g);
}
questionBoard(-11.2, 2.6, 0.1, 0.95);
questionBoard(11.6, 2.4, -0.12, 0.9);

/* ---------------- bicycle ---------------- */
{
  const g = new THREE.Group();
  g.position.set(-7.35, 0.02, 2.75);
  g.rotation.y = 0.32; g.rotation.z = 0.05;
  const metal = mat(0x2b2b28, { roughness: 0.6, metalness: 0.4 });
  const red = mat(0x8a3b32, { roughness: 0.7 });
  const tyre = new THREE.TorusGeometry(0.34, 0.035, 6, 22);
  for (const wx of [-0.48, 0.48]) {
    const w = new THREE.Mesh(tyre, metal);
    w.position.set(wx, 0.36, 0); w.castShadow = true;
    g.add(w);
    for (let k = 0; k < 8; k++) {
      const sp = box(0.012, 0.62, 0.012, 0xb8b2a2, wx, 0.36, 0, { cast: false });
      sp.rotation.z = k * Math.PI / 8;
      g.add(sp);
    }
  }
  const tube = (x1, y1, x2, y2, col) => {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const m = box(0.035, len, 0.035, 0, (x1 + x2) / 2, (y1 + y2) / 2, 0, { material: col });
    m.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    g.add(m);
  };
  tube(-0.48, 0.36, -0.05, 0.72, red);
  tube(-0.05, 0.72, 0.30, 0.36, red);
  tube(0.30, 0.36, -0.05, 0.72, red);
  tube(-0.05, 0.72, 0.05, 0.98, metal);
  tube(0.30, 0.36, 0.05, 0.98, metal);
  g.add(box(0.28, 0.04, 0.06, 0x2a2622, 0.05, 1.0, 0, { cast: false }));
  const bar = box(0.04, 0.04, 0.34, metal, 0.05, 1.0, 0, { cast: false });
  g.add(bar);
  g.add(box(0.16, 0.04, 0.09, 0x2a2622, -0.06, 0.76, 0, { cast: false }));
  scene.add(g);
}

/* ---------------- police jeep ---------------- */
const jeep = new THREE.Group();
{
  const navy = mat(PAL.cobalt, { roughness: 0.6, metalness: 0.05 });
  const navyDark = mat(PAL.cobaltDark, { roughness: 0.65 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fbccb, roughness: 0.15, metalness: 0.4 });
  const chrome = mat(0xc9c4b6, { roughness: 0.4, metalness: 0.55 });
  const tyre = mat(0x272320, { roughness: 1 });

  const body = new THREE.Group();
  body.position.y = 0.66;

  body.add(box(4.4, 0.2, 1.82, 0, 0, -0.06, 0, { material: navyDark }));
  body.add(box(4.3, 0.64, 1.88, 0, 0, 0.18, 0, { material: navy }));
  body.add(box(1.4, 0.36, 1.86, 0, 1.45, 0.52, 0, { material: navy }));
  body.add(box(2.6, 0.86, 1.84, 0, -0.42, 0.62, 0, { material: navy }));
  body.add(box(2.66, 0.1, 1.88, 0, -0.42, 1.08, 0, { material: navy }));

  body.add(box(0.06, 0.56, 1.72, 0, 0.86, 0.7, 0, { material: glass }));
  for (const zz of [0.935, -0.935]) {
    body.add(box(0.74, 0.5, 0.02, 0, -1.14, 0.7, zz, { material: glass, cast: false }));
    body.add(box(0.72, 0.5, 0.02, 0, -0.3, 0.7, zz, { material: glass, cast: false }));
    body.add(box(0.7, 0.5, 0.02, 0, 0.5, 0.7, zz, { material: glass, cast: false }));
    for (const px of [-1.52, -0.72, 0.06, 0.86]) body.add(box(0.06, 0.56, 0.04, 0, px, 0.7, zz, { material: navyDark, cast: false }));
  }
  body.add(box(0.05, 0.54, 1.72, 0, -1.72, 0.68, 0, { material: glass }));

  for (const zz of [0.952, -0.952]) {
    body.add(box(4.34, 0.18, 0.02, 0, 0, 0.16, zz, { material: mat(0xf2ead6, { roughness: 0.8 }), cast: false }));
    body.add(box(4.34, 0.03, 0.022, 0, 0, 0.075, zz, { material: mat(PAL.red, { roughness: 0.7 }), cast: false }));
    body.add(box(4.34, 0.03, 0.022, 0, 0, 0.245, zz, { material: mat(PAL.red, { roughness: 0.7 }), cast: false }));
  }

  body.add(box(0.08, 0.3, 1.42, 0x121a3c, 2.18, 0.28, 0, { material: navyDark }));
  for (let i = 0; i < 5; i++) body.add(box(0.03, 0.24, 0.05, 0xb9b2a0, 2.23, 0.28, -0.46 + i * 0.23, { cast: false }));
  for (const zz of [0.6, -0.6]) {
    body.add(sph(0.1, 0, 2.2, 0.4, zz, { material: new THREE.MeshStandardMaterial({ color: 0xfff4d2, emissive: 0xffe6a6, emissiveIntensity: 0.6 }), ws: 10, hs: 8 }));
  }
  body.add(box(0.12, 0.13, 1.94, chrome, 2.28, 0.0, 0, { material: chrome }));
  body.add(box(0.12, 0.13, 1.94, chrome, -2.26, 0.0, 0, { material: chrome }));

  body.add(box(1.06, 0.16, 0.3, 0x1b1b1b, -0.34, 1.24, 0));
  const redLight = box(0.46, 0.12, 0.26, 0, -0.58, 1.24, 0, { material: new THREE.MeshStandardMaterial({ color: PAL.red, emissive: PAL.red, emissiveIntensity: 1.2 }) });
  const blueLight = box(0.46, 0.12, 0.26, 0, -0.12, 1.24, 0, { material: new THREE.MeshStandardMaterial({ color: 0x2f6bd8, emissive: 0x2f6bd8, emissiveIntensity: 1.1 }) });
  body.add(redLight, blueLight);

  const txt = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.24), new THREE.MeshBasicMaterial({ map: textTexture('পুলিশ', { w: 512, h: 128, font: '700 80px "Noto Sans Bengali"', color: '#f7f1de' }), transparent: true }));
  txt.position.set(0.34, 0.02, 0.962);
  body.add(txt);
  const txt2 = txt.clone(); txt2.position.z = -0.962; txt2.rotation.y = Math.PI; body.add(txt2);

  for (const wx of [1.4, -1.4]) for (const zz of [0.95, -0.95]) {
    body.add(box(1.06, 0.1, 0.1, 0, wx, 0.70, zz, { material: navyDark, cast: false }));
    // fender flare over the wheel
    const flare = box(1.16, 0.30, 0.10, 0x1b2560, wx, 0.30, zz * 1.012, { material: navyDark, cast: false });
    body.add(flare);
    body.add(box(1.16, 0.07, 0.12, 0x151d4a, wx, 0.15, zz * 1.012, { material: navyDark, cast: false }));
  }
  // windscreen frame
  for (const zz of [0.92, -0.92]) body.add(box(0.05, 0.60, 0.05, 0x1a2450, 0.87, 0.70, zz, { cast: false }));
  body.add(box(0.05, 0.06, 1.86, 0x1a2450, 0.87, 1.00, 0, { cast: false }));
  body.add(box(0.05, 0.06, 1.86, 0x1a2450, 0.87, 0.41, 0, { cast: false }));
  // roof rack rails
  for (const zz of [0.78, -0.78]) body.add(box(2.4, 0.05, 0.05, 0x1b2550, -0.42, 1.16, zz, { cast: false }));
  jeep.add(body);

  const wheelGeo = new THREE.CylinderGeometry(0.37, 0.37, 0.28, 28); wheelGeo.rotateX(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.30, 24); hubGeo.rotateX(Math.PI / 2);
  const wheels = [];
  for (const [wx, wz] of [[1.4, 0.94], [-1.4, 0.94], [1.4, -0.94], [-1.4, -0.94]]) {
    const spin = new THREE.Group();
    spin.position.set(wx, 0.37, wz);
    const w = new THREE.Mesh(wheelGeo, tyre); w.castShadow = true;
    const rim = new THREE.Mesh(hubGeo, mat(0xc6c0b0, { roughness: 0.45, metalness: 0.35 }));
    const capGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 16); capGeo.rotateX(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, mat(0x2a2723, { roughness: 0.8 }));
    spin.add(w, rim, cap);
    for (let k = 0; k < 5; k++) {
      const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.026, 6, 5), mat(0x6b6153, { roughness: 0.7 }));
      bolt.position.set(Math.cos(k * Math.PI * 2 / 5) * 0.13, Math.sin(k * Math.PI * 2 / 5) * 0.13, 0.16);
      spin.add(bolt);
    }
    jeep.add(spin);
    wheels.push(spin);
  }
  jeep.userData.wheels = wheels;
  jeep.userData.redLight = redLight;
  jeep.userData.blueLight = blueLight;
}
const jeepShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(5.6, 2.9),
  new THREE.MeshBasicMaterial({ map: (() => {
    const c = makeCanvas(128, 128), ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    g.addColorStop(0, 'rgba(26,20,10,0.5)'); g.addColorStop(1, 'rgba(26,20,10,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })(), transparent: true, depthWrite: false })
);
jeepShadow.rotation.x = -Math.PI / 2; jeepShadow.position.y = 0.02;
jeep.add(jeepShadow);
jeep.scale.setScalar(1.0);
jeep.position.set(-18, 0, 7.0);
scene.add(jeep);

/* ---------------- 2D cut-out characters ---------------- */
const spriteTex = {
  clerk: drawCharacter('clerk'),
  officer: drawCharacter('officer'),
  constable: drawCharacter('constable'),
};

function makeCutout(kind, height = 1.82) {
  const tex = spriteTex[kind];
  const w = height * (760 / 1320);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.03, side: THREE.DoubleSide })
  );
  m.castShadow = false; m.receiveShadow = false;
  const g = new THREE.Group();
  g.add(m);
  // soft contact shadow
  const sc = makeCanvas(128, 64), sctx = sc.getContext('2d');
  const grd = sctx.createRadialGradient(64, 32, 2, 64, 32, 60);
  grd.addColorStop(0, 'rgba(40,30,18,0.55)');
  grd.addColorStop(1, 'rgba(40,30,18,0)');
  sctx.fillStyle = grd; sctx.fillRect(0, 0, 128, 64);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, w * 0.75), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.015;
  g.add(sh);
  g.userData.mesh = m;
  return g;
}

const offGrey = makeCutout('clerk', 2.46);
offGrey.position.set(-0.62, 0.70, 2.02);
offGrey.userData.mesh.position.y = 1.23;
scene.add(offGrey);

const offBlue = makeCutout('officer', 2.50);
offBlue.position.set(0.70, 0.70, 1.98);
offBlue.scale.x = -1;
offBlue.userData.mesh.position.y = 1.25;
scene.add(offBlue);

const constable = makeCutout('constable', 2.42);
constable.position.set(2.3, 0.09, 4.5);
constable.userData.mesh.position.y = 1.21;
scene.add(constable);

// two tiny background figures on the veranda for the wide shot
const far1 = makeCutout('constable', 2.2);
far1.position.set(-2.4, 0.70, 1.4);
far1.userData.mesh.position.y = 1.10;
far1.scale.setScalar(0.85);
scene.add(far1);

/* ---------------- pigeons ---------------- */
function pigeon(x, z, ry, s = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0.02, z); g.rotation.y = ry; g.scale.setScalar(s);
  const grey = mat(0x8f8d86, { roughness: 1 });
  const dark = mat(0x5d5b55, { roughness: 1 });
  g.add(sph(0.11, 0, 0, 0.11, 0, { material: grey, ws: 10, hs: 8 }));
  g.add(sph(0.065, 0, 0.10, 0.19, 0.02, { material: grey, ws: 8, hs: 6 }));
  g.add(box(0.13, 0.02, 0.06, 0, -0.10, 0.10, 0, { material: dark, cast: false }));
  g.add(cyl(0.006, 0.006, 0.05, 0xf0d070, 0.15, 0.18, 0.02, { seg: 4, cast: false }));
  scene.add(g);
  return g;
}


/* ---------------- dust ---------------- */
const DUST_N = 34;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST_N * 3);
const dustSeed = new Float32Array(DUST_N * 2);
for (let i = 0; i < DUST_N; i++) { dustSeed[i * 2] = Math.random(); dustSeed[i * 2 + 1] = Math.random(); dustPos[i * 3 + 1] = -5; }
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  size: 0.4, transparent: true, depthWrite: false, opacity: 0.45,
  map: (() => {
    const c = makeCanvas(64, 64), ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(226,206,168,0.9)'); g.addColorStop(1, 'rgba(226,206,168,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })(),
});
scene.add(new THREE.Points(dustGeo, dustMat));

/* ---------------- birds ---------------- */
const birds = new THREE.Group();
const birdMat = new THREE.LineBasicMaterial({ color: 0x5a5346, transparent: true, opacity: 0.45 });
for (let i = 0; i < 5; i++) {
  const geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-0.4, 0, 0), new THREE.Vector3(0, -0.18, 0), new THREE.Vector3(0.4, 0, 0),
  ]);
  const line = new THREE.Line(geo, birdMat);
  line.position.set(8 - i * 2.2, 7.6 + (i % 3) * 0.7, -12);
  line.userData.seed = i;
  birds.add(line);
}
scene.add(birds);

/* ---------------- camera timeline ---------------- */
const camTarget = new THREE.Vector3();
function cameraAt(t) {
  if (t < 3.25) {
    const p = smooth(t / 3.25);
    return {
      pos: new THREE.Vector3(lerp(0.5, 0.1, p), lerp(1.16, 1.22, p), lerp(17.4, 16.0, p)),
      target: new THREE.Vector3(lerp(0.15, 0.02, p), lerp(2.88, 2.84, p), 0),
      fov: lerp(32.0, 31.6, p),
    };
  }
  if (t < 6.45) {
    const p = smooth((t - 3.25) / 3.2);
    return {
      pos: new THREE.Vector3(lerp(0.52, 0.40, p), lerp(1.86, 1.84, p), lerp(7.55, 7.30, p)),
      target: new THREE.Vector3(lerp(0.40, 0.32, p), lerp(1.72, 1.71, p), 1.5),
      fov: 34,
    };
  }
  if (t < 8.55) {
    const p = smooth((t - 6.45) / 2.1);
    return {
      pos: new THREE.Vector3(lerp(9.2, 8.7, p), lerp(1.30, 1.24, p), lerp(12.9, 12.4, p)),
      target: new THREE.Vector3(lerp(3.0, 2.8, p), lerp(1.16, 1.14, p), 6.8),
      fov: 36,
    };
  }
  return {
    pos: new THREE.Vector3(0, 2.0, 14.5),
    target: new THREE.Vector3(0, 2.0, 0),
    fov: 28,
  };
}

/* ---------------- overlay ---------------- */
const overlay = document.getElementById('overlay');
const lower = document.createElement('div');
lower.style.cssText = `position:absolute;left:104px;top:918px;display:flex;gap:22px;align-items:flex-start;opacity:0;will-change:transform,opacity;`;
lower.innerHTML = `
  <div style="width:5px;height:82px;background:#b2312c;border-radius:2px;margin-top:6px"></div>
  <div>
    <div style="font-family:'Noto Serif Bengali',serif;font-weight:700;font-size:64px;line-height:1.05;color:#fff8e6;text-shadow:0 3px 16px rgba(30,20,8,.55)">অন্য আলাপ</div>
    <div style="font-family:'Noto Sans Bengali',sans-serif;font-size:25px;color:#f6e9cd;margin-top:6px;text-shadow:0 2px 10px rgba(30,20,8,.6)">বাংলাদেশ পুলিশ — একটি ভিজ্যুয়াল ডকুমেন্টারি</div>
  </div>`;
overlay.appendChild(lower);

const end = document.createElement('div');
end.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;
  background:radial-gradient(circle at 50% 40%, #fdf7e6 0%, #f0e2c2 52%, #dcc79c 100%);`;
end.innerHTML = `
  <div style="width:1180px;padding:74px 60px 66px;background:#f9f1da;border:2px solid #e3d3ae;border-radius:10px;box-shadow:0 34px 80px rgba(70,45,15,.30);position:relative;overflow:hidden">
    <div style="position:absolute;left:0;right:0;top:0;height:14px;background:linear-gradient(90deg,#1c2f8c,#b2312c,#1c6b45,#1c2f8c)"></div>
    <div style="position:absolute;left:26px;right:26px;top:26px;height:16px;background-image:radial-gradient(circle, #23307e 5px, transparent 6px);background-size:26px 16px;background-repeat:repeat-x;opacity:.85"></div>
    <div id="endTitle" style="font-family:'Noto Serif Bengali',serif;font-weight:700;font-size:176px;line-height:1;color:#1c2f8c;text-align:center;text-shadow:0 8px 20px rgba(60,40,10,.16);will-change:transform,opacity">অন্য আলাপ</div>
    <div id="endRule" style="width:600px;height:3px;margin:30px auto 0;background:linear-gradient(90deg,#b2312c,#1c2f8c);opacity:0"></div>
    <div id="endSub" style="margin-top:32px;font-family:'Noto Sans Bengali',sans-serif;font-size:35px;color:#4a3b2a;text-align:center;opacity:0">চেনা জিনিসের অচেনা দিক নিয়ে আমাদের আজকের অন্য আলাপ</div>
    <div id="endMeta" style="margin-top:14px;font-family:'Noto Sans Bengali',sans-serif;font-size:26px;color:#7a6647;text-align:center;opacity:0">বাংলাদেশ পুলিশ · ভিজ্যুয়াল ডকুমেন্টারি</div>
    <div id="endBrand" style="margin-top:52px;font-family:Inter,sans-serif;font-size:22px;letter-spacing:7px;color:#1c2f8c;text-align:center;opacity:0">ONYO ALAP STUDIO</div>
  </div>`;
overlay.appendChild(end);
const endTitle = end.querySelector('#endTitle');
const endRule = end.querySelector('#endRule');
const endSub = end.querySelector('#endSub');
const endMeta = end.querySelector('#endMeta');
const endBrand = end.querySelector('#endBrand');

/* ---------------- animation ---------------- */
function updateScene(t) {
  state.t = t;
  const cam = cameraAt(t);
  camera.position.copy(cam.pos);
  camera.fov = cam.fov;
  camera.updateProjectionMatrix();
  camTarget.copy(cam.target);
  camera.lookAt(camTarget);

  // trees sway
  treeL.userData.canopy.rotation.z = Math.sin(t * 0.7) * 0.010;
  treeR.userData.canopy.rotation.z = Math.sin(t * 0.62 + 1.3) * 0.012;

  // flag wave
  {
    const pos = flag.userData.geo.attributes.position, base = flag.userData.base;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      pos.array[i * 3 + 2] = Math.sin(x * 3.0 + t * 5.0) * 0.08 * (x + 0.62) / 1.25 + Math.sin(y * 4 + t * 3) * 0.025;
    }
    pos.needsUpdate = true;
    flag.userData.geo.computeVertexNormals();
  }

  // birds
  birds.children.forEach((b) => {
    const s = b.userData.seed;
    b.position.x = 10 - ((t * 1.6 + s * 1.5) % 26);
    b.position.y = 7.4 + (s % 3) * 0.8 + Math.sin(t * 2 + s) * 0.12;
    b.rotation.z = Math.sin(t * 7 + s * 1.7) * 0.15;
  });

  // characters idle
  const bob = Math.sin(t * 2.0) * 0.010;
  offGrey.userData.mesh.position.y = 0.92 + bob;
  offBlue.userData.mesh.position.y = 0.93 + Math.sin(t * 2.0 + 1.7) * 0.010;
  offGrey.userData.mesh.rotation.z = Math.sin(t * 0.9) * 0.003;
  offBlue.userData.mesh.rotation.z = Math.sin(t * 0.85 + 1.1) * 0.003;
  constable.userData.mesh.position.y = 0.9 + Math.sin(t * 2.2 + 0.6) * 0.008;

  // constable salutes during the jeep shot
  const sal = clamp((t - 7.0) / 0.4);
  constable.visible = t > 6.0;
  constable.scale.setScalar(1.0);
  constable.userData.mesh.rotation.z = Math.sin(sal * Math.PI) * 0.0;
  constable.position.x = 2.3 - sal * 0.2;

  // jeep drives in during shot C
  const jp = clamp((t - 6.45) / 1.6);
  const jeepX = t < 6.45 ? -18.0 : lerp(-14.0, 3.7, easeOut(jp));
  jeep.position.x = jeepX;
  jeep.position.z = 7.0;
  const moving = t > 6.45 && t < 8.1;
  jeep.position.y = moving ? Math.sin(t * 26) * 0.02 : Math.sin(t * 2) * 0.004;
  jeep.userData.wheels.forEach((w) => { w.rotation.z = -(jeepX + 14) * 1.05; });
  const pulse = 0.6 + Math.sin(t * 9) * 0.4;
  jeep.userData.redLight.material.emissiveIntensity = 1.1 + pulse * 1.4;
  jeep.userData.blueLight.material.emissiveIntensity = 1.1 + (1 - pulse) * 1.4;

  // dust behind the jeep
  const dp = dustGeo.attributes.position;
  for (let i = 0; i < DUST_N; i++) {
    const s1 = dustSeed[i * 2], s2 = dustSeed[i * 2 + 1];
    const age = ((t * 0.8 + s1) % 1);
    dp.array[i * 3] = jeepX - 2.1 - age * (1.1 + s2 * 2.2) * (moving ? 1 : 0.1);
    dp.array[i * 3 + 1] = 0.2 + age * (0.5 + s2 * 0.45) * (moving ? 1 : 0.12);
    dp.array[i * 3 + 2] = 7.0 + (s2 - 0.5) * 1.6;
  }
  dp.needsUpdate = true;
  dustMat.opacity = moving ? 0.45 : 0.08;

  // lower third
  const ltA = smooth((t - 0.55) / 0.55) * (1 - smooth((t - 2.95) / 0.4));
  lower.style.opacity = ltA.toFixed(3);
  lower.style.transform = `translateY(${((1 - smooth((t - 0.55) / 0.55)) * 22).toFixed(2)}px)`;

  if (t >= 8.55) {
    const lt = t - 8.55;
    const a = easeOut(lt / 0.45);
    const b = easeOut((lt - 0.12) / 0.4);
    const c = easeOut((lt - 0.26) / 0.4);
    end.style.opacity = a.toFixed(3);
    endTitle.style.transform = `translateY(${((1 - a) * 22).toFixed(2)}px) scale(${(0.965 + a * 0.035).toFixed(3)})`;
    endRule.style.opacity = b.toFixed(3);
    endRule.style.transform = `scaleX(${(0.4 + b * 0.6).toFixed(3)})`;
    endSub.style.opacity = b.toFixed(3);
    endMeta.style.opacity = c.toFixed(3);
    endBrand.style.opacity = c.toFixed(3);
  } else {
    end.style.opacity = '0';
  }
}

window.renderAt = (t) => {
  updateScene(t);
  renderer.render(scene, camera);
  return true;
};

(async () => {
  await document.fonts.load('700 76px "Noto Serif Bengali"');
  await document.fonts.load('400 32px "Noto Sans Bengali"');
  await document.fonts.load('700 80px "Noto Sans Bengali"');
  await document.fonts.ready;
  updateScene(0);
  renderer.render(scene, camera);
  window.__ready = true;
})();
