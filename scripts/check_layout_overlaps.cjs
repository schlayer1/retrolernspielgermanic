const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const atlasJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/world/world_atlas.json'), 'utf8'));
const frames = atlasJson.frames;

function getPngDims(filePath) {
  const buf = fs.readFileSync(filePath);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const propDims = {
  relic_marker_glow: { w: 32, h: 32 },
  npc: { w: 17, h: 32 }
};
const propsDir = path.join(ROOT, 'public/assets/props');
if (fs.existsSync(propsDir)) {
  for (const f of fs.readdirSync(propsDir)) {
    if (f.endsWith('.png')) {
      propDims[f.replace('.png', '')] = getPngDims(path.join(propsDir, f));
    }
  }
}

const worldCode = fs.readFileSync(path.join(ROOT, 'src/scenes/WorldScene.ts'), 'utf8');
const relicsCode = fs.readFileSync(path.join(ROOT, 'src/data/relics.ts'), 'utf8');

const items = [];
function addBox(label, x, y, w, h, scale = 1, originX = 0.5, originY = 0.9, shrink = 0.95) {
  const sw = w * scale * shrink;
  const sh = h * scale * shrink;
  const cx = x + (0.5 - originX) * (w * scale);
  const cy = y + (0.5 - originY) * (h * scale);
  items.push({
    label,
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w * scale),
    h: Math.round(h * scale),
    left: cx - sw / 2,
    right: cx + sw / 2,
    top: cy - sh / 2,
    bottom: cy + sh / 2
  });
}

// 1. Parse seedPoints in scatterGermanicNature()
const seedRegex = /\{\s*x:\s*(\d+)\s*,\s*y:\s*(\d+)\s*,\s*f:\s*'([^']+)'\s*,\s*s:\s*([0-9.]+)\s*\}/g;
let m;
while ((m = seedRegex.exec(worldCode)) !== null) {
  const tx = parseFloat(m[1]);
  const ty = parseFloat(m[2]);
  const f = m[3];
  const s = parseFloat(m[4]);
  const d = frames[f]?.frame || { w: 48, h: 48 };
  if (f.startsWith('tree_')) {
    addBox(`tree:${f}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, s);
    const bd = frames['bush_a']?.frame || { w: 32, h: 28 };
    addBox(`bush_a(${tx + 4},${ty + 1})`, (tx + 4) * 16, (ty + 1) * 16, bd.w, bd.h, 0.8);
    const fd = frames['fern_1']?.frame || { w: 16, h: 16 };
    addBox(`fern_1(${tx - 4},${ty + 1})`, (tx - 4) * 16, (ty + 1) * 16, fd.w, fd.h, 0.75);
  } else {
    addBox(`prop:${f}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, s);
  }
}

// 2. Parse placeDecor(X * 16, Y * 16, 'frame', scale)
const decorDirectRegex = /placeDecor\(\s*(\d+)\s*\*\s*16\s*,\s*(\d+)\s*\*\s*16\s*,\s*'([^']+)'(?:\s*,\s*([0-9.]+))?/g;
while ((m = decorDirectRegex.exec(worldCode)) !== null) {
  const tx = parseFloat(m[1]);
  const ty = parseFloat(m[2]);
  const f = m[3];
  const s = m[4] ? parseFloat(m[4]) : 1.0;
  const d = frames[f]?.frame || { w: 32, h: 32 };
  addBox(`decor:${f}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, s);
}

// 3. Parse this.add.image(X * 16, Y * 16, 'tex').setOrigin(...).setScale(S)
const imgRegex = /this\.add\.image\(\s*(\d+)\s*\*\s*16\s*,\s*(\d+)\s*\*\s*16\s*,\s*'([^']+)'\)(?:\.setOrigin\(([0-9.]+)\s*,\s*([0-9.]+)\))?(?:\.setScale\(([0-9.]+)\))?/g;
while ((m = imgRegex.exec(worldCode)) !== null) {
  const tx = parseFloat(m[1]);
  const ty = parseFloat(m[2]);
  const key = m[3];
  const ox = m[4] ? parseFloat(m[4]) : 0.5;
  const oy = m[5] ? parseFloat(m[5]) : 0.9;
  const s = m[6] ? parseFloat(m[6]) : 1.0;
  const d = propDims[key] || { w: 48, h: 48 };
  addBox(`building/prop:${key}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, s, ox, oy);
}

// 4. Parse mentors in mentorCoords
const mentorRegex = /(\d+):\s*\{\s*x:\s*(\d+)\s*,\s*y:\s*(\d+)\s*,\s*id:\s*'([^']+)'/g;
while ((m = mentorRegex.exec(worldCode)) !== null) {
  const tx = parseFloat(m[2]);
  const ty = parseFloat(m[3]);
  const id = m[4];
  addBox(`mentor:${id}(${tx},${ty})`, tx * 16, ty * 16, 17, 32, 1.0, 0.5, 0.5);
}

// 5. Parse GERMAN_RELICS
const relicBlockRegex = /id:\s*'([^']+)'[\s\S]*?x:\s*(\d+)\s*,\s*y:\s*(\d+)/g;
while ((m = relicBlockRegex.exec(relicsCode)) !== null) {
  const id = m[1];
  const tx = parseFloat(m[2]);
  const ty = parseFloat(m[3]);
  addBox(`relic:${id}(${tx},${ty})`, tx * 16, ty * 16, 32, 32, 0.65, 0.5, 0.8);
}

// 6. Parse GERMAN_BUILDINGS
const itemsCode = fs.readFileSync(path.join(ROOT, 'src/data/items.ts'), 'utf8');
const builtBuildingTextureMap = {
  wohnstallhaus_ausbau: { tex: 'cattle_pen_fence', scale: 0.85 },
  rennofen_schmelze: { tex: 'rennofen_clay_smelter', scale: 0.95 },
  handelssteg_waldgirmes: { tex: 'bohlenweg_timber_bridge', scale: 0.45 },
  thing_steinring: { tex: 'runestone_standing_blue', scale: 0.60 },
  moor_bohlenweg: { tex: 'bohlenweg_timber_bridge', scale: 0.45 },
  rasensodenwall: { tex: 'rasensodenwall_kalkriese', scale: 0.90 },
  limes_wachturm_bau: { tex: 'limes_palisade_barrier', scale: 0.90 },
  foederaten_siedlung: { tex: 'wagon_covered_cart', scale: 0.80 },
};
const bldRegex = /id:\s*'([^']+)'\s*,\s*name:\s*'[^']+'\s*,\s*helperName:\s*'[^']+'\s*,\s*x:\s*(\d+)\s*,\s*y:\s*(\d+)/g;
while ((m = bldRegex.exec(itemsCode)) !== null) {
  const id = m[1];
  const tx = parseFloat(m[2]);
  const ty = parseFloat(m[3]);
  const spec = builtBuildingTextureMap[id];
  if (spec) {
    const d = propDims[spec.tex] || { w: 48, h: 48 };
    addBox(`built:${id}(${tx},${ty})`, tx * 16, ty * 16, d.w, d.h, spec.scale, 0.5, 0.9);
  }
}

let overlaps = 0;
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i];
    const b = items[j];
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 2 && iy > 2) {
      overlaps++;
      console.error(`❌ OVERLAP #${overlaps}: ${a.label} [${a.w}x${a.h} at (${a.x},${a.y})] <-> ${b.label} [${b.w}x${b.h} at (${b.x},${b.y})] by ${Math.round(ix)}x${Math.round(iy)}px`);
    }
  }
}

if (overlaps > 0) {
  console.error(`\nFAILED: ${overlaps} visual bounding-box overlap(s) detected across ${items.length} placed objects!`);
  process.exit(1);
} else {
  console.log(`✅ Layout Check Passed: ${items.length} placed objects verified with 0 visual bounding-box overlaps!`);
}
