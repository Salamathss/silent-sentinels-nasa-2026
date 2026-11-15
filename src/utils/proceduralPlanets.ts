/**
 * Photorealistic Procedural Planetary Texture Synthesizer
 * Generates fine-grained, museum-grade (2048x1024) equirectangular surface maps and
 * matching displacement bump maps for the Moon and Mars using pure HTML5 Canvas.
 * 
 * Styled for "Dark Luxury Minimalism" (Polestar / Leica / Porsche Design aesthetic):
 * Subtle micro-cratering, organic basalt dust basins, studio terminator falloff,
 * architectural and photorealistic, zero cartoonish white circles.
 */

import { CelestialBody } from '@/data/missions';

// In-memory cache so procedural generation only executes once per session
let cachedMoonMap: string | null = null;
let cachedMoonBump: string | null = null;
let cachedMarsMap: string | null = null;
let cachedMarsBump: string | null = null;

// Deterministic PRNG (Park-Miller LCG)
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate 2048x1024 Photorealistic Lunar Surface Texture
 * Subtle basaltic maria, organic regolith gradations, delicate micro-cratering,
 * and gossamer filamentary ejecta rays (Tycho / Copernicus).
 */
export function generateMoonSurfaceTexture(): string {
  if (typeof document === 'undefined') return '';
  if (cachedMoonMap) return cachedMoonMap;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = createPRNG(19690720);

  // 1. Subtle Anorthositic Highlands Base (Sophisticated warm-gray tones)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0.0, '#585c63');
  baseGrad.addColorStop(0.25, '#6a707a');
  baseGrad.addColorStop(0.5, '#767c87');
  baseGrad.addColorStop(0.75, '#686e78');
  baseGrad.addColorStop(1.0, '#54585f');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-Frequency Micro-Regolith Grain (Noise)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 16;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Basaltic Maria (Lava Flow Basins) - Layered soft organic feathered gradients
  const drawMareFeathered = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    intensity = 0.85
  ) => {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx);
    g.addColorStop(0.0, `rgba(26, 29, 34, ${intensity})`);
    g.addColorStop(0.5, `rgba(34, 38, 45, ${intensity * 0.75})`);
    g.addColorStop(0.8, `rgba(50, 56, 65, ${intensity * 0.35})`);
    g.addColorStop(1.0, 'rgba(80, 86, 96, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Oceanus Procellarum (Sprawling Western Sea)
  drawMareFeathered(720, 420, 280, 220, 0.88);
  drawMareFeathered(620, 360, 190, 160, 0.82);
  drawMareFeathered(680, 520, 170, 150, 0.85);

  // Mare Imbrium (Concentric basalt basin)
  drawMareFeathered(940, 330, 160, 150, 0.92);
  drawMareFeathered(930, 320, 100, 95, 0.95);

  // Mare Serenitatis
  drawMareFeathered(1120, 350, 120, 110, 0.9);

  // Mare Tranquillitatis (Apollo 11 landing region)
  drawMareFeathered(1180, 480, 140, 115, 0.92);
  drawMareFeathered(1240, 440, 90, 80, 0.88);

  // Mare Crisium (Crisp oval basin)
  drawMareFeathered(1360, 410, 75, 65, 0.94);
  drawMareFeathered(1360, 410, 45, 40, 0.96);

  // Mare Fecunditatis & Nectaris
  drawMareFeathered(1310, 560, 110, 90, 0.85);
  drawMareFeathered(1220, 600, 75, 70, 0.86);

  // Mare Nubium & Humorum
  drawMareFeathered(930, 630, 115, 100, 0.88);
  drawMareFeathered(810, 650, 70, 65, 0.85);

  // South Pole - Aitken Basin (Deep farside basin)
  drawMareFeathered(60, 800, 150, 110, 0.65);
  drawMareFeathered(1980, 800, 150, 110, 0.65);

  // 4. Subtle Filamentary Ejecta Rays (Tycho & Copernicus)
  // Tycho Crater at x: 960, y: 760 with 20 delicate gossamer rays
  ctx.save();
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2 + (rand() - 0.5) * 0.08;
    const len = 280 + rand() * 320;
    const grad = ctx.createLinearGradient(
      960,
      760,
      960 + Math.cos(angle) * len,
      760 + Math.sin(angle) * len
    );
    grad.addColorStop(0, 'rgba(215, 222, 232, 0.45)');
    grad.addColorStop(0.3, 'rgba(200, 208, 220, 0.18)');
    grad.addColorStop(0.7, 'rgba(180, 188, 200, 0.06)');
    grad.addColorStop(1, 'rgba(160, 168, 180, 0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.0 + rand() * 1.5;
    ctx.beginPath();
    ctx.moveTo(960, 760);
    ctx.lineTo(960 + Math.cos(angle) * len, 760 + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Tycho Crater Core (Crisp, subtle, architectural)
  ctx.fillStyle = '#1c1f24';
  ctx.beginPath();
  ctx.arc(960, 760, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(235, 240, 250, 0.75)';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  // Tycho Central Peak
  ctx.fillStyle = '#f5f7fa';
  ctx.beginPath();
  ctx.arc(960, 760, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Copernicus Crater (x: 910, y: 460)
  ctx.save();
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    const len = 70 + rand() * 60;
    ctx.strokeStyle = 'rgba(210, 218, 228, 0.18)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(910, 460);
    ctx.lineTo(910 + Math.cos(angle) * len, 460 + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.fillStyle = '#20242a';
  ctx.beginPath();
  ctx.arc(910, 460, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(230, 235, 245, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();

  // Aristarchus Beacon (x: 750, y: 380) - Brightest spot, softly glowing
  ctx.save();
  const arGrad = ctx.createRadialGradient(750, 380, 1, 750, 380, 18);
  arGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  arGrad.addColorStop(0.35, 'rgba(220, 228, 240, 0.4)');
  arGrad.addColorStop(1, 'rgba(180, 190, 205, 0)');
  ctx.fillStyle = arGrad;
  ctx.beginPath();
  ctx.arc(750, 380, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Fine-Grained Micro-Cratering (Realistic small craters: 2px to 10px)
  for (let i = 0; i < 400; i++) {
    const cx = rand() * width;
    const cy = 60 + rand() * (height - 120);
    const radius = 1.5 + rand() * 8.5;

    // Dark bowl
    ctx.fillStyle = 'rgba(22, 24, 28, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Fine sunlit crescent (Northwest illuminated)
    ctx.strokeStyle = 'rgba(235, 240, 248, 0.45)';
    ctx.lineWidth = Math.max(0.6, radius * 0.2);
    ctx.beginPath();
    ctx.arc(cx - radius * 0.15, cy - radius * 0.15, radius * 0.9, Math.PI * 0.75, Math.PI * 1.65);
    ctx.stroke();

    // Soft shadow edge (Southeast)
    ctx.strokeStyle = 'rgba(10, 12, 15, 0.5)';
    ctx.lineWidth = Math.max(0.6, radius * 0.2);
    ctx.beginPath();
    ctx.arc(cx + radius * 0.1, cy + radius * 0.1, radius * 0.9, -Math.PI * 0.25, Math.PI * 0.65);
    ctx.stroke();
  }

  // 6. Subtle Studio Terminator Vignette (Slight limb darkening for 3D realism)
  const edgeGrad = ctx.createLinearGradient(0, 0, 0, height);
  edgeGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.25)');
  edgeGrad.addColorStop(0.08, 'rgba(0, 0, 0, 0)');
  edgeGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0)');
  edgeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  cachedMoonMap = canvas.toDataURL('image/jpeg', 0.88);
  return cachedMoonMap;
}

/**
 * Generate 2048x1024 Lunar Bump / Relief Map
 * High-precision grayscale displacement for Three.js bump texture
 */
export function generateMoonBumpTexture(): string {
  if (typeof document === 'undefined') return '';
  if (cachedMoonBump) return cachedMoonBump;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = createPRNG(19690720);

  // 1. Highlands mid-gray baseline
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, width, height);

  // 2. Basalt Depressed Basins
  const drawBumpBasin = (cx: number, cy: number, rx: number, ry: number) => {
    const g = ctx.createRadialGradient(cx, cy, rx * 0.15, cx, cy, rx);
    g.addColorStop(0, 'rgba(38, 38, 38, 0.85)');
    g.addColorStop(0.65, 'rgba(52, 52, 52, 0.55)');
    g.addColorStop(1, 'rgba(122, 122, 122, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  drawBumpBasin(720, 420, 280, 220);
  drawBumpBasin(940, 330, 160, 150);
  drawBumpBasin(1120, 350, 120, 110);
  drawBumpBasin(1180, 480, 140, 115);
  drawBumpBasin(1360, 410, 75, 65);
  drawBumpBasin(1310, 560, 110, 90);
  drawBumpBasin(930, 630, 115, 100);
  drawBumpBasin(60, 800, 150, 110);
  drawBumpBasin(1980, 800, 150, 110);

  // 3. Montes Apenninus Mountain Ridge (Near Apollo 15: x: 1020, y: 370)
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(990, 395);
  ctx.lineTo(1025, 365);
  ctx.lineTo(1060, 345);
  ctx.stroke();

  // 4. Micro-Crater Rims (Elevated white lines) and Bowls (Depressed black circles)
  for (let i = 0; i < 400; i++) {
    const cx = rand() * width;
    const cy = 60 + rand() * (height - 120);
    const radius = 1.5 + rand() * 8.5;

    // Rim highlight
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = Math.max(0.6, radius * 0.22);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Bowl depression
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tycho bump
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(960, 760, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#121212';
  ctx.beginPath();
  ctx.arc(960, 760, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(960, 760, 2, 0, Math.PI * 2);
  ctx.fill();

  cachedMoonBump = canvas.toDataURL('image/jpeg', 0.85);
  return cachedMoonBump;
}

/**
 * Generate 2048x1024 Photorealistic Martian Surface Texture
 * Muted, deep architectural iron-oxide terracotta (not electric orange),
 * dark basaltic shields (Syrtis Major, Acidalia), Valles Marineris canyon rift,
 * and fine polar frost caps.
 */
export function generateMarsSurfaceTexture(): string {
  if (typeof document === 'undefined') return '';
  if (cachedMarsMap) return cachedMarsMap;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = createPRNG(20261115);

  // 1. Muted Deep Terracotta Regolith (Restrained Polestar/Leica tone)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0.0, '#75341c');
  baseGrad.addColorStop(0.25, '#8c3f22');
  baseGrad.addColorStop(0.5, '#82371c');
  baseGrad.addColorStop(0.75, '#8a3c20');
  baseGrad.addColorStop(1.0, '#6d2e18');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-Frequency Surface Grain
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 14;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.7));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.5));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Basaltic Lowlands & Albedo Markings
  const drawDarkRegion = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    intensity = 0.85
  ) => {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, rx * 0.15, cx, cy, rx);
    g.addColorStop(0.0, `rgba(32, 18, 14, ${intensity})`);
    g.addColorStop(0.65, `rgba(45, 25, 20, ${intensity * 0.65})`);
    g.addColorStop(0.85, `rgba(65, 35, 28, ${intensity * 0.3})`);
    g.addColorStop(1.0, 'rgba(130, 55, 28, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Syrtis Major Planum (Iconic dark triangular shield at x: 1416, y: 466)
  ctx.save();
  ctx.fillStyle = 'rgba(28, 16, 12, 0.9)';
  ctx.beginPath();
  ctx.moveTo(1380, 390);
  ctx.lineTo(1470, 480);
  ctx.lineTo(1390, 540);
  ctx.closePath();
  ctx.filter = 'blur(14px)';
  ctx.fill();
  ctx.restore();

  // Sinus Sabaeus & Meridiani Planum (Opportunity region)
  drawDarkRegion(1060, 530, 220, 45, 0.86);
  drawDarkRegion(960, 535, 120, 40, 0.88);

  // Acidalia Planitia & Chryse Planitia (Viking 1 region)
  drawDarkRegion(750, 320, 160, 120, 0.82);

  // Mare Erythraeum & Solis Lacus
  drawDarkRegion(780, 650, 140, 75, 0.8);
  drawDarkRegion(540, 660, 65, 45, 0.85);

  // Southern dark belt
  drawDarkRegion(1800, 660, 250, 70, 0.72);
  drawDarkRegion(240, 670, 180, 65, 0.72);

  // Hellas Planitia (Light golden-ochre circular basin at x: 1420, y: 750)
  ctx.save();
  const hellasGrad = ctx.createRadialGradient(1420, 750, 20, 1420, 750, 120);
  hellasGrad.addColorStop(0, 'rgba(180, 105, 55, 0.7)');
  hellasGrad.addColorStop(0.7, 'rgba(160, 90, 45, 0.4)');
  hellasGrad.addColorStop(1, 'rgba(130, 55, 28, 0)');
  ctx.fillStyle = hellasGrad;
  ctx.beginPath();
  ctx.ellipse(1420, 750, 120, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Olympus Mons (x: 262, y: 405) - Subtle, massive volcanic shield
  ctx.save();
  const olyGrad = ctx.createRadialGradient(262, 405, 4, 262, 405, 60);
  olyGrad.addColorStop(0, '#3e170c');
  olyGrad.addColorStop(0.25, '#5c2414');
  olyGrad.addColorStop(0.7, '#722e1a');
  olyGrad.addColorStop(0.9, '#8a3c22');
  olyGrad.addColorStop(1.0, 'rgba(130, 55, 28, 0)');
  ctx.fillStyle = olyGrad;
  ctx.beginPath();
  ctx.arc(262, 405, 60, 0, Math.PI * 2);
  ctx.fill();

  // Summit caldera
  ctx.fillStyle = '#200b05';
  ctx.beginPath();
  ctx.arc(262, 405, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(214, 199, 178, 0.4)';
  ctx.lineWidth = 1.0;
  ctx.stroke();
  ctx.restore();

  // 5. Tharsis Montes Chain (Ascraeus, Pavonis, Arsia Mons)
  [
    { x: 430, y: 440, r: 30 },
    { x: 380, y: 515, r: 28 },
    { x: 340, y: 585, r: 30 },
  ].forEach((m) => {
    ctx.save();
    const g = ctx.createRadialGradient(m.x, m.y, 3, m.x, m.y, m.r);
    g.addColorStop(0, '#2b0f07');
    g.addColorStop(0.5, '#4f1c0f');
    g.addColorStop(1, 'rgba(130, 55, 28, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 6. Valles Marineris (4,000 km Canyon Fissure)
  ctx.save();
  ctx.strokeStyle = '#140604';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(600, 575);
  ctx.bezierCurveTo(680, 595, 780, 605, 910, 585);
  ctx.stroke();

  // Branching Chasmas
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1c0a06';
  ctx.beginPath();
  ctx.moveTo(680, 595);
  ctx.lineTo(740, 570);
  ctx.moveTo(760, 603);
  ctx.lineTo(810, 625);
  ctx.stroke();
  ctx.restore();

  // 7. Micro-Cratering across southern hemisphere
  for (let i = 0; i < 300; i++) {
    const cx = rand() * width;
    const cy = 400 + rand() * 500;
    const radius = 1.5 + rand() * 7;

    ctx.fillStyle = 'rgba(35, 15, 10, 0.65)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(190, 110, 70, 0.4)';
    ctx.lineWidth = Math.max(0.6, radius * 0.2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 8. Polar Ice Caps (Planum Boreum & Planum Australe)
  // North Pole
  ctx.save();
  const northCap = ctx.createLinearGradient(0, 0, 0, 75);
  northCap.addColorStop(0.0, '#f8fafc');
  northCap.addColorStop(0.5, '#e2e8f0');
  northCap.addColorStop(0.85, 'rgba(226, 232, 240, 0.5)');
  northCap.addColorStop(1.0, 'rgba(226, 232, 240, 0)');
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, width, 75);
  ctx.restore();

  // South Pole
  ctx.save();
  const southCap = ctx.createLinearGradient(0, 950, 0, height);
  southCap.addColorStop(0.0, 'rgba(248, 250, 252, 0)');
  southCap.addColorStop(0.4, 'rgba(248, 250, 252, 0.6)');
  southCap.addColorStop(0.8, '#f1f5f9');
  southCap.addColorStop(1.0, '#ffffff');
  ctx.fillStyle = southCap;
  ctx.fillRect(0, 950, width, height - 950);
  ctx.restore();

  cachedMarsMap = canvas.toDataURL('image/jpeg', 0.88);
  return cachedMarsMap;
}

/**
 * Generate 2048x1024 Martian Bump / Displacement Map
 */
export function generateMarsBumpTexture(): string {
  if (typeof document === 'undefined') return '';
  if (cachedMarsBump) return cachedMarsBump;

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const rand = createPRNG(20261115);

  // 1. Dichotomy Baseline
  const dichoGrad = ctx.createLinearGradient(0, 0, 0, height);
  dichoGrad.addColorStop(0.0, '#787878');
  dichoGrad.addColorStop(0.18, '#3d3d3d');
  dichoGrad.addColorStop(0.48, '#525252');
  dichoGrad.addColorStop(0.68, '#707070');
  dichoGrad.addColorStop(1.0, '#888888');
  ctx.fillStyle = dichoGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Olympus Mons (+21km Peak)
  ctx.save();
  const olyBump = ctx.createRadialGradient(262, 405, 4, 262, 405, 60);
  olyBump.addColorStop(0.0, '#ffffff');
  olyBump.addColorStop(0.2, '#f0f0f0');
  olyBump.addColorStop(0.5, '#c8c8c8');
  olyBump.addColorStop(0.85, '#999999');
  olyBump.addColorStop(1.0, 'rgba(82, 82, 82, 0)');
  ctx.fillStyle = olyBump;
  ctx.beginPath();
  ctx.arc(262, 405, 60, 0, Math.PI * 2);
  ctx.fill();

  // Caldera
  ctx.fillStyle = '#555555';
  ctx.beginPath();
  ctx.arc(262, 405, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Tharsis Montes
  [
    { x: 430, y: 440, r: 30 },
    { x: 380, y: 515, r: 28 },
    { x: 340, y: 585, r: 30 },
  ].forEach((m) => {
    ctx.save();
    const g = ctx.createRadialGradient(m.x, m.y, 2, m.x, m.y, m.r);
    g.addColorStop(0, '#e8e8e8');
    g.addColorStop(0.4, '#b8b8b8');
    g.addColorStop(1, 'rgba(82, 82, 82, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 4. Valles Marineris (-7km Trench)
  ctx.save();
  ctx.strokeStyle = '#080808';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(600, 575);
  ctx.bezierCurveTo(680, 595, 780, 605, 910, 585);
  ctx.stroke();
  ctx.restore();

  // 5. Hellas Planitia Depression (-8km)
  ctx.save();
  const hellasBump = ctx.createRadialGradient(1420, 750, 15, 1420, 750, 120);
  hellasBump.addColorStop(0, 'rgba(16, 16, 16, 0.85)');
  hellasBump.addColorStop(0.7, 'rgba(32, 32, 32, 0.5)');
  hellasBump.addColorStop(1, 'rgba(112, 112, 112, 0)');
  ctx.fillStyle = hellasBump;
  ctx.beginPath();
  ctx.ellipse(1420, 750, 120, 100, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Micro-Craters
  for (let i = 0; i < 300; i++) {
    const cx = rand() * width;
    const cy = 400 + rand() * 500;
    const radius = 1.5 + rand() * 7;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = Math.max(0.6, radius * 0.22);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#181818';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  cachedMarsBump = canvas.toDataURL('image/jpeg', 0.85);
  return cachedMarsBump;
}

/**
 * Accessor for planet textures
 */
export function getPlanetTextures(body: CelestialBody): { map: string; bump: string } {
  if (body === 'Moon') {
    return {
      map: generateMoonSurfaceTexture(),
      bump: generateMoonBumpTexture(),
    };
  }
  return {
    map: generateMarsSurfaceTexture(),
    bump: generateMarsBumpTexture(),
  };
}
