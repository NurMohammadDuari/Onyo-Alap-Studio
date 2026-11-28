import * as THREE from 'three';

/* =====================================================================
   Paper-cut characters matching the reference diorama crop:
   small narrow head, long thin neck, sloped shoulders, slim body,
   long legs, thin cream paper edge, airbrushed shading.
   Drawn facing RIGHT (3/4 back view); mirror for left-facing.
   kinds: 'clerk' | 'officer' | 'constable'
   ===================================================================== */

export function drawCharacter(kind = 'clerk') {
  const CW = 820, CH = 1340;
  const c = document.createElement('canvas');
  c.width = CW; c.height = CH;
  const g = c.getContext('2d');
  g.lineJoin = 'round'; g.lineCap = 'round';

  const clerk = kind === 'clerk';
  const constable = kind === 'constable';

  const OUT = '#f7f2e2';
  const skin = '#916040';
  const skinSh = '#6b4028';
  const skinHi = '#a87350';

  const shirt = clerk ? '#b9c6c2' : '#2c49b6';
  const shirtHi = clerk ? '#d6e0dc' : '#4b69d8';
  const shirtSh = clerk ? '#9aa8a4' : '#1c2e7e';
  const trouser = clerk ? '#2b3344' : '#cdb98c';
  const trouserSh = clerk ? '#1b2230' : '#b09c72';
  const shoe = '#181411';
  const belt = '#232630';

  /* ---------- helpers ---------- */
  const paper = (pathFn, fill, ow = 2.2) => {
    g.save(); g.beginPath(); pathFn();
    g.strokeStyle = OUT; g.lineWidth = ow * 2; g.stroke();
    g.fillStyle = fill; g.fill();
    g.restore();
  };
  const solid = (pathFn, fill) => {
    g.save(); g.beginPath(); pathFn(); g.fillStyle = fill; g.fill(); g.restore();
  };
  const shade = (clipFn, x0, y0, x1, y1, stops) => {
    g.save(); g.beginPath(); clipFn(); g.clip();
    const grd = g.createLinearGradient(x0, y0, x1, y1);
    for (const [p, col] of stops) grd.addColorStop(p, col);
    g.fillStyle = grd; g.fillRect(0, 0, CW, CH);
    g.restore();
  };
  const taper = (pts, widths, fill, ow = 2.0) => {
    const left = [], right = [];
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      const [px, py] = pts[Math.max(0, i - 1)];
      const [nx, ny] = pts[Math.min(pts.length - 1, i + 1)];
      const dx = nx - px, dy = ny - py;
      const len = Math.hypot(dx, dy) || 1;
      const w = widths[i] / 2;
      left.push([x - (dy / len) * w, y + (dx / len) * w]);
      right.push([x + (dy / len) * w, y - (dx / len) * w]);
    }
    const path = () => {
      g.moveTo(left[0][0], left[0][1]);
      for (let i = 1; i < left.length; i++) g.lineTo(left[i][0], left[i][1]);
      for (let i = right.length - 1; i >= 0; i--) g.lineTo(right[i][0], right[i][1]);
      g.closePath();
    };
    paper(path, fill, ow);
    return path;
  };
  const ellipse = (x, y, rx, ry, fill, rot = 0, ow = 2.0) =>
    paper(() => g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), fill, ow);

  /* ================= FAR LEG ================= */
  const farLeg = taper([[382, 758], [378, 900], [374, 1050], [372, 1180], [370, 1272]],
                       [78, 68, 60, 52, 44], trouserSh, 2.2);
  ellipse(350, 1288, 52, 14, shoe, 0, 2.2);

  /* ================= FAR ARM ================= */
  if (constable) {
    taper([[318, 324], [306, 490], [310, 650], [318, 760]], [44, 38, 33, 29], shirtSh, 2.0);
    taper([[318, 760], [320, 810]], [29, 26], skinSh, 1.8);
  } else if (clerk) {
    taper([[318, 324], [306, 490], [310, 640], [322, 740]], [44, 38, 33, 29], shirtSh, 2.0);
    taper([[322, 740], [324, 786]], [29, 26], skinSh, 1.8);
  } else {
    taper([[318, 324], [304, 490], [314, 630], [328, 710]], [44, 38, 33, 29], shirtSh, 2.0);
    taper([[328, 710], [334, 766]], [29, 26], skinSh, 1.8);
  }

  /* ================= NEAR LEG ================= */
  const nearLeg = taper([[450, 758], [458, 900], [464, 1050], [468, 1180], [470, 1272]],
                        [92, 80, 68, 58, 48], trouser, 2.4);
  shade(nearLeg, 420, 770, 500, 1280, [
    [0, 'rgba(255,255,255,0.20)'],
    [0.32, 'rgba(255,255,255,0.02)'],
    [1, 'rgba(0,0,0,0.22)'],
  ]);
  g.save(); g.beginPath(); nearLeg(); g.clip();
  g.strokeStyle = trouserSh; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(438, 820); g.quadraticCurveTo(446, 980, 442, 1140); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(486, 850); g.quadraticCurveTo(492, 1050, 488, 1200); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2.6;
  g.beginPath(); g.moveTo(438, 1256); g.lineTo(494, 1262); g.stroke();
  g.restore();
  ellipse(496, 1288, 54, 14, shoe, 0, 2.4);
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.beginPath(); g.ellipse(494, 1282, 30, 5, 0, 0, 7); g.fill();

  /* ================= NECK (behind torso) ================= */
  const neckPath = () => {
    g.moveTo(374, 268); g.lineTo(444, 268);
    g.bezierCurveTo(450, 286, 446, 298, 440, 312);
    g.lineTo(380, 312);
    g.bezierCurveTo(370, 298, 368, 282, 374, 268);
    g.closePath();
  };
  solid(neckPath, skinSh);
  shade(neckPath, 372, 0, 446, 0, [
    [0, 'rgba(0,0,0,0.22)'],
    [0.48, 'rgba(255,220,190,0.14)'],
    [1, 'rgba(0,0,0,0.28)'],
  ]);

  /* ================= TORSO ================= */
  const torsoPath = () => {
    g.moveTo(298, 336);
    g.bezierCurveTo(304, 312, 330, 300, 366, 296);
    g.bezierCurveTo(406, 292, 452, 300, 476, 316);
    g.bezierCurveTo(492, 396, 496, 480, 492, 560);
    g.bezierCurveTo(486, 640, 480, 716, 476, 762);
    g.lineTo(316, 762);
    g.bezierCurveTo(304, 660, 298, 520, 296, 430);
    g.bezierCurveTo(292, 402, 295, 384, 298, 372);
    g.closePath();
  };
  paper(torsoPath, shirt, 2.4);
  shade(torsoPath, 288, 330, 498, 765, [
    [0, 'rgba(255,255,255,0.20)'],
    [0.24, 'rgba(255,255,255,0.04)'],
    [0.55, 'rgba(0,0,0,0.06)'],
    [1, 'rgba(0,0,0,0.30)'],
  ]);
  // core shadow along the back
  g.save(); g.beginPath(); torsoPath(); g.clip();
  const backSh = g.createLinearGradient(288, 0, 372, 0);
  backSh.addColorStop(0, 'rgba(0,0,0,0.26)');
  backSh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = backSh; g.fillRect(286, 330, 100, 440);
  // soft light down the front
  const frontHi = g.createLinearGradient(430, 340, 500, 760);
  frontHi.addColorStop(0, 'rgba(255,255,255,0.16)');
  frontHi.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = frontHi; g.fillRect(420, 340, 90, 430);
  g.restore();

  // shoulder seam + armhole seam (reference has visible stitching)
  g.strokeStyle = shirtSh; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(398, 298); g.bezierCurveTo(430, 324, 444, 384, 448, 464); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(400, 300); g.bezierCurveTo(432, 326, 446, 386, 450, 466); g.stroke();

  // placket + buttons
  g.strokeStyle = shirtSh; g.lineWidth = 2.0;
  g.beginPath(); g.moveTo(462, 332); g.bezierCurveTo(472, 434, 470, 604, 464, 722); g.stroke();
  for (let i = 0; i < 4; i++) {
    g.fillStyle = clerk ? '#f1ede1' : '#e9e4d4';
    g.beginPath(); g.arc(466, 374 + i * 90, 4.2, 0, 7); g.fill();
  }

  // collar
  paper(() => {
    g.moveTo(380, 296);
    g.bezierCurveTo(408, 316, 444, 320, 466, 306);
    g.lineTo(486, 336);
    g.bezierCurveTo(452, 364, 408, 360, 380, 332);
    g.closePath();
  }, clerk ? '#eff3ef' : '#e8e4d2', 2.0);
  solid(() => {
    g.moveTo(392, 306);
    g.bezierCurveTo(414, 322, 440, 324, 458, 314);
    g.lineTo(462, 334);
    g.bezierCurveTo(436, 344, 410, 338, 392, 324);
    g.closePath();
  }, 'rgba(90,70,55,0.18)');
  g.strokeStyle = 'rgba(95,100,95,0.30)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(384, 302); g.quadraticCurveTo(424, 328, 462, 312); g.stroke();

  // chest pocket with flap
  g.strokeStyle = clerk ? '#a1ada8' : '#16225e'; g.lineWidth = 1.8;
  g.strokeRect(468, 412, 26, 34);
  g.beginPath(); g.moveTo(466, 412); g.lineTo(496, 412); g.stroke();
  g.fillStyle = clerk ? '#4a5a72' : '#eae6d6';
  g.fillRect(478, 400, 5, 14);

  if (!clerk) {
    silhouette: {
      paper(() => {
        g.moveTo(322, 360); g.lineTo(366, 348); g.lineTo(372, 366); g.lineTo(326, 380);
        g.closePath();
      }, '#22399a', 1.8);
    }
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(350, 364, 4.6, 0, 7); g.fill();
    g.fillStyle = '#f2eedc'; g.fillRect(466, 508, 24, 10);
    g.fillStyle = '#2a2a2a'; g.fillRect(469, 511, 15, 2);
    g.fillStyle = '#b33a2f'; g.fillRect(450, 486, 12, 7);
    g.fillStyle = '#c9a24a'; g.fillRect(451, 493, 10, 9);
    ellipse(486, 414, 11, 13, '#eae6d4', 0, 1.8);
    g.fillStyle = '#2f8a4e'; g.beginPath(); g.arc(486, 414, 7.4, 0, 7); g.fill();
    g.fillStyle = '#f2eedc'; g.beginPath(); g.arc(486, 414, 3.4, 0, 7); g.fill();
  }

  /* ================= BELT ================= */
  paper(() => { g.rect(310, 754, 174, 24); }, belt, 2.2);
  g.fillStyle = '#c9a24a'; g.fillRect(448, 757, 19, 18);
  g.fillStyle = '#8f6f22'; g.fillRect(452, 761, 11, 10);

  /* ================= NEAR ARM ================= */
  if (constable) {
    const p = taper([[482, 324], [500, 490], [498, 650], [494, 762]], [44, 39, 34, 30], shirt, 2.4);
    shade(p, 476, 352, 524, 770, [[0, 'rgba(255,255,255,0.22)'], [1, 'rgba(0,0,0,0.18)']]);
    taper([[494, 762], [492, 828]], [30, 27], skin, 2.0);
    ellipse(490, 842, 17, 14, skin, 0.2, 2.0);
  } else if (clerk) {
    // upper arm down, forearm reaching forward at waist height
    const p = taper([[482, 324], [498, 452], [504, 552]], [44, 39, 35], shirt, 2.4);
    shade(p, 476, 352, 526, 570, [[0, 'rgba(255,255,255,0.22)'], [1, 'rgba(0,0,0,0.16)']]);
    const f = taper([[504, 552], [556, 572], [600, 584]], [35, 31, 28], skin, 2.0);
    shade(f, 500, 556, 610, 600, [[0, 'rgba(255,255,255,0.16)'], [1, 'rgba(0,0,0,0.20)']]);
    ellipse(612, 592, 18, 14, skin, 0.15, 2.0);
    g.strokeStyle = skinSh; g.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.moveTo(612, 588 + i * 5); g.quadraticCurveTo(624, 594 + i * 4, 630, 600 + i * 3); g.stroke();
    }
  } else {
    // arm bent forward at chest height
    const p = taper([[482, 324], [514, 386], [548, 438]], [44, 39, 35], shirt, 2.4);
    shade(p, 476, 352, 560, 466, [[0, 'rgba(255,255,255,0.22)'], [1, 'rgba(0,0,0,0.16)']]);
    const f = taper([[548, 438], [590, 460], [624, 472]], [35, 31, 28], skin, 2.0);
    shade(f, 528, 452, 630, 496, [[0, 'rgba(255,255,255,0.18)'], [1, 'rgba(0,0,0,0.18)']]);
    ellipse(636, 476, 18, 14, skin, 0.1, 2.0);
  }

  /* ================= HELD OBJECTS ================= */
  if (clerk) {
    g.save();
    g.translate(636, 626); g.rotate(-0.14);
    paper(() => { g.rect(-30, -46, 60, 92); }, '#fbf7ea', 2.4);
    g.strokeStyle = '#b9b3a4'; g.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-18, -32 + i * 12); g.lineTo(18, -32 + i * 12); g.stroke(); }
    g.strokeStyle = 'rgba(150,145,130,0.5)'; g.lineWidth = 1.1;
    g.beginPath(); g.moveTo(0, -46); g.lineTo(0, 44); g.stroke();
    g.restore();
  } else if (!constable) {
    ellipse(654, 490, 42, 9, '#f4eee2', 0, 2.4);
    paper(() => { g.rect(634, 444, 36, 40); }, '#f8f2e6', 2.2);
    g.fillStyle = '#b8382e'; g.fillRect(634, 459, 36, 9);
    g.strokeStyle = '#e8e2d4'; g.lineWidth = 4;
    g.beginPath(); g.arc(672, 461, 9.5, -1.2, 1.2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.82)'; g.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      g.beginPath();
      g.moveTo(644 + i * 12, 436);
      g.bezierCurveTo(630 + i * 12, 410, 652 + i * 12, 396, 642 + i * 12, 372);
      g.stroke();
    }
    // cap held low in the far hand
    ellipse(330, 800, 38, 12, '#1b2554', 0.06, 2.6);
    paper(() => { g.ellipse(330, 784, 32, 16, 0.06, Math.PI, Math.PI * 2); }, '#1b2554', 2.6);
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(321, 784, 4.2, 0, 7); g.fill();
  }

  /* ================= HEAD (narrow profile, facing right) ================= */
  g.save();
  g.translate(0, 42);
  const headPath = () => {
    g.moveTo(340, 148);
    g.bezierCurveTo(336, 90, 362, 44, 404, 34);
    g.bezierCurveTo(440, 26, 466, 52, 470, 96);
    g.bezierCurveTo(472, 108, 472, 118, 470, 126);
    g.bezierCurveTo(476, 132, 480, 140, 480, 148);
    g.bezierCurveTo(488, 156, 492, 164, 486, 170);
    g.bezierCurveTo(480, 174, 474, 172, 470, 170);
    g.bezierCurveTo(470, 176, 470, 180, 468, 184);
    g.bezierCurveTo(474, 188, 476, 194, 472, 198);
    g.bezierCurveTo(476, 206, 474, 214, 466, 218);
    g.bezierCurveTo(464, 232, 452, 244, 436, 248);
    g.bezierCurveTo(410, 256, 380, 250, 362, 232);
    g.bezierCurveTo(348, 218, 342, 186, 340, 148);
    g.closePath();
  };
  paper(headPath, skin, 2.6);
  shade(headPath, 334, 24, 494, 256, [
    [0, 'rgba(0,0,0,0.10)'],
    [0.30, 'rgba(0,0,0,0.0)'],
    [0.70, 'rgba(255,236,210,0.26)'],
    [1, 'rgba(255,236,210,0.10)'],
  ]);
  g.save(); g.beginPath(); headPath(); g.clip();
  const cg = g.createRadialGradient(440, 168, 4, 440, 168, 56);
  cg.addColorStop(0, 'rgba(198,126,94,0.30)');
  cg.addColorStop(1, 'rgba(198,126,94,0)');
  g.fillStyle = cg; g.fillRect(380, 110, 120, 130);
  const jg = g.createLinearGradient(0, 190, 0, 256);
  jg.addColorStop(0, 'rgba(0,0,0,0)');
  jg.addColorStop(1, 'rgba(40,18,8,0.24)');
  g.fillStyle = jg; g.fillRect(350, 190, 150, 66);
  g.restore();

  // ear
  solid(() => g.ellipse(354, 158, 10, 17, 0.06, 0, Math.PI * 2), skinSh);
  g.strokeStyle = 'rgba(45,22,12,0.42)'; g.lineWidth = 1.9;
  g.beginPath(); g.arc(354, 158, 5.6, -1.6, 1.4); g.stroke();
  g.strokeStyle = 'rgba(214,164,132,0.30)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(349, 149); g.quadraticCurveTo(344, 159, 349, 168); g.stroke();

  // hair: neat short crop with a clean hairline
  const hairPath = () => {
    g.moveTo(338, 160);
    g.bezierCurveTo(332, 92, 366, 38, 412, 28);
    g.bezierCurveTo(450, 20, 474, 44, 478, 80);
    g.bezierCurveTo(462, 66, 446, 58, 430, 58);
    g.bezierCurveTo(404, 58, 386, 76, 378, 104);
    g.bezierCurveTo(372, 122, 370, 144, 370, 168);
    g.bezierCurveTo(368, 196, 362, 214, 354, 228);
    g.bezierCurveTo(342, 210, 338, 186, 338, 160);
    g.closePath();
  };
  solid(hairPath, '#1b1512');
  g.save(); g.beginPath(); hairPath(); g.clip();
  g.strokeStyle = 'rgba(126,110,96,0.30)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(362, 66); g.bezierCurveTo(404, 34, 452, 40, 474, 74); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,0.28)'; g.lineWidth = 2.4;
  for (let i = 0; i < 8; i++) {
    g.beginPath(); g.moveTo(346 + i * 5, 148 + i * 2); g.quadraticCurveTo(356 + i * 5, 108, 392 + i * 4, 72); g.stroke();
  }
  g.restore();
  // sideburn
  solid(() => {
    g.moveTo(340, 146); g.quadraticCurveTo(352, 166, 350, 198);
    g.quadraticCurveTo(338, 186, 336, 162); g.closePath();
  }, '#1b1512');

  // eyebrow
  g.strokeStyle = '#1a1410'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(436, 116); g.quadraticCurveTo(452, 108, 468, 118); g.stroke();

  // eye
  solid(() => {
    g.moveTo(438, 134);
    g.quadraticCurveTo(450, 125, 466, 132);
    g.quadraticCurveTo(452, 141, 438, 134);
    g.closePath();
  }, '#f2e9da');
  g.strokeStyle = 'rgba(40,24,14,0.48)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(438, 134); g.quadraticCurveTo(452, 141, 466, 132); g.stroke();
  g.fillStyle = '#4a2e1a'; g.beginPath(); g.arc(455, 133, 4.6, 0, 7); g.fill();
  g.fillStyle = '#120d0a'; g.beginPath(); g.arc(455, 133, 2.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(453.4, 131.4, 1.1, 0, 7); g.fill();
  g.strokeStyle = '#1a1410'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(436, 133); g.quadraticCurveTo(450, 123, 468, 131); g.stroke();

  // nose
  g.strokeStyle = 'rgba(60,30,16,0.26)'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(470, 126); g.quadraticCurveTo(478, 146, 486, 166); g.stroke();
  solid(() => g.ellipse(477, 171, 4.0, 2.5, 0.3, 0, 7), 'rgba(40,18,10,0.52)');
  g.strokeStyle = 'rgba(232,172,142,0.28)'; g.lineWidth = 1.7;
  g.beginPath(); g.moveTo(482, 146); g.quadraticCurveTo(490, 156, 491, 166); g.stroke();

  // lips
  g.strokeStyle = '#5a3026'; g.lineWidth = 2.3;
  g.beginPath(); g.moveTo(462, 186); g.quadraticCurveTo(471, 188, 475, 185); g.stroke();
  g.strokeStyle = 'rgba(190,124,100,0.48)'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(462, 194); g.quadraticCurveTo(470, 197, 474, 194); g.stroke();
  // chin shade
  g.strokeStyle = 'rgba(50,25,14,0.12)'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(452, 234); g.quadraticCurveTo(462, 238, 468, 234); g.stroke();

  // moustache / stubble
  if (!clerk) {
    solid(() => {
      g.moveTo(452, 174);
      g.quadraticCurveTo(470, 169, 484, 176);
      g.quadraticCurveTo(470, 182, 452, 182);
      g.closePath();
    }, '#1c1613');
  } else {
    const rnd = (() => { let s = 9; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    g.fillStyle = 'rgba(30,18,12,0.14)';
    for (let i = 0; i < 110; i++) g.fillRect(400 + rnd() * 70, 196 + rnd() * 36, 1.6, 1.6);
  }

  g.restore();

  /* ================= PEAKED CAP (constable) ================= */
  if (constable) {
    g.save();
    g.translate(0, 42);
    paper(() => {
      g.moveTo(336, 76);
      g.bezierCurveTo(340, 36, 376, 12, 420, 18);
      g.bezierCurveTo(456, 22, 478, 44, 484, 72);
      g.lineTo(484, 88);
      g.lineTo(336, 94);
      g.closePath();
    }, '#1b2554', 2.8);
    g.save();
    g.beginPath();
    g.moveTo(336, 76);
    g.bezierCurveTo(340, 36, 376, 12, 420, 18);
    g.bezierCurveTo(456, 22, 478, 44, 484, 72);
    g.lineTo(484, 88); g.lineTo(336, 94); g.closePath();
    g.clip();
    const cg2 = g.createLinearGradient(336, -10, 512, 100);
    cg2.addColorStop(0, 'rgba(130,155,235,0.40)');
    cg2.addColorStop(1, 'rgba(8,12,36,0.30)');
    g.fillStyle = cg2; g.fillRect(320, -20, 200, 130);
    g.restore();
    paper(() => { g.rect(336, 84, 148, 13); }, '#101736', 1.8);
    paper(() => {
      g.moveTo(472, 96);
      g.quadraticCurveTo(506, 102, 516, 113);
      g.quadraticCurveTo(494, 120, 472, 115);
      g.closePath();
    }, '#0b1022', 2.4);
    ellipse(398, 54, 9, 11, '#c9a24a', 0, 1.6);
    g.fillStyle = '#8a6a1e'; g.beginPath(); g.arc(398, 54, 4.4, 0, 7); g.fill();
    g.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
