const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function main() {
  console.log('🚀 Starting Germanic Asset Builder...');

  [
    'public/assets/props',
    'public/assets/icons',
    'public/assets/gfx/npcs',
    'public/assets/gfx/portraits',
    'public/assets/world',
    'public/assets/audio/bgm',
  ].forEach((d) => fs.mkdirSync(d, { recursive: true }));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Load available sheets as Base64
  const sheets = {
    nomad_b1: fs.readFileSync('Assets/extracted/Nomad Camp/tile-B-01.png').toString('base64'),
    nomad_b2: fs.readFileSync('Assets/extracted/Nomad Camp/tile-B-02.png').toString('base64'),
    nomad_b3: fs.readFileSync('Assets/extracted/Nomad Camp/tile-B-03.png').toString('base64'),
    nomad_b4: fs.readFileSync('Assets/extracted/Nomad Camp/tile-B-04.png').toString('base64'),
    nomad_b5: fs.readFileSync('Assets/extracted/Nomad Camp/tile-B-05.png').toString('base64'),
    celtic_b1: fs.readFileSync('Assets/extracted/Celtic Druid Village/tile-B-01.png').toString('base64'),
    celtic_b2: fs.readFileSync('Assets/extracted/Celtic Druid Village/tile-B-02.png').toString('base64'),
    werewolf_b1: fs.readFileSync('Assets/extracted/Werewolf Village/tile-B-01.png').toString('base64'),
    ground_a2_1: fs.readFileSync('Assets/extracted/ground/Tile_A2-1 (2).png').toString('base64'),
    fantasy_1: fs.readFileSync('Assets/extracted/fantasy/1.png').toString('base64'),
    fantasy_2: fs.readFileSync('Assets/extracted/fantasy/2.png').toString('base64'),
    fantasy_3: fs.readFileSync('Assets/extracted/fantasy/3.png').toString('base64'),
    charBase: fs.readFileSync('public/assets/gfx/character.png').toString('base64'),
  };

  // Check if rome assets exist
  if (fs.existsSync('Assets/rome/1.png')) {
    sheets.rome_1 = fs.readFileSync('Assets/rome/1.png').toString('base64');
  }
  if (fs.existsSync('Assets/rome/3.png')) {
    sheets.rome_3 = fs.readFileSync('Assets/rome/3.png').toString('base64');
  }
  if (fs.existsSync('Assets/rome/4.png')) {
    sheets.rome_4 = fs.readFileSync('Assets/rome/4.png').toString('base64');
  }
  if (fs.existsSync('Assets/rome/9.png')) {
    sheets.rome_9 = fs.readFileSync('Assets/rome/9.png').toString('base64');
  }
  if (fs.existsSync('Assets/rome/10.png')) {
    sheets.rome_10 = fs.readFileSync('Assets/rome/10.png').toString('base64');
  }
  if (fs.existsSync('Assets/rome/15.png')) {
    sheets.rome_15 = fs.readFileSync('Assets/rome/15.png').toString('base64');
  }

  // 1. CROP DEFINITIONS FOR GERMANIC & ROMAN PROPS (48x48 grid coordinates)
  const cropDefs = [
    // --- GERMANISCHES DORF & SIEDLUNG (K1 & K2) ---
    { id: 'langhaus_gable_hall', sheet: 'werewolf_b1', cx: 0, cy: 0, cw: 4, ch: 4, outW: 136, outH: 120 },
    { id: 'germanic_round_hut', sheet: 'celtic_b1', cx: 2, cy: 0, cw: 2, ch: 2.15, outW: 68, outH: 70 },
    { id: 'germanic_large_hut', sheet: 'celtic_b1', cx: 4, cy: 0, cw: 2, ch: 2.2, outW: 76, outH: 76 },
    { id: 'pfahlspeicher_grain', sheet: 'celtic_b1', cx: 12, cy: 2, cw: 2, ch: 2, outW: 64, outH: 64 },
    { id: 'timber_watchtower', sheet: 'werewolf_b1', cx: 0, cy: 4, cw: 2, ch: 3.8, outW: 56, outH: 86 },
    { id: 'palisade_wood_gate', sheet: 'celtic_b1', cx: 10, cy: 8, cw: 4, ch: 2.2, outW: 96, outH: 64 },
    { id: 'palisade_spikes_row', sheet: 'celtic_b1', cx: 10, cy: 10, cw: 2, ch: 1.5, outW: 56, outH: 42 },
    { id: 'cattle_pen_fence', sheet: 'nomad_b1', cx: 0, cy: 8, cw: 2, ch: 2, outW: 56, outH: 48 },
    { id: 'wagon_covered_cart', sheet: 'nomad_b1', cx: 2, cy: 14, cw: 2, ch: 2, outW: 64, outH: 52 },
    { id: 'wagon_open_cart', sheet: 'nomad_b1', cx: 0, cy: 14, cw: 2, ch: 2, outW: 58, outH: 48 },
    { id: 'haystack_large', sheet: 'nomad_b1', cx: 4, cy: 8, cw: 2, ch: 2, outW: 56, outH: 48 },
    { id: 'haystack_round', sheet: 'nomad_b1', cx: 10, cy: 8, cw: 2, ch: 1.5, outW: 48, outH: 40 },
    { id: 'water_barrels_wood', sheet: 'nomad_b1', cx: 8, cy: 10, cw: 2, ch: 2, outW: 44, outH: 46 },
    { id: 'beer_keg_cellar', sheet: 'nomad_b1', cx: 10, cy: 2, cw: 2, ch: 1.5, outW: 46, outH: 38 },

    // --- FAUNA & ZUGTIERE (Nomad Camp B1 - Full Body 1:1 Pixel Accuracy) ---
    { id: 'fauna_wisent_auerochse', sheet: 'nomad_b1', cx: 14, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'fauna_wisent_front', sheet: 'nomad_b1', cx: 12, cy: 14, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'fauna_sheep_flock', sheet: 'nomad_b1', cx: 8, cy: 12, cw: 2, ch: 1, outW: 96, outH: 48 },
    { id: 'fauna_lambs_group', sheet: 'nomad_b1', cx: 6, cy: 14, cw: 2, ch: 1, outW: 96, outH: 48 },
    { id: 'fauna_sheep_black', sheet: 'nomad_b1', cx: 8, cy: 12, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'fauna_sheep_white', sheet: 'nomad_b1', cx: 9, cy: 12, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'fauna_lamb_white', sheet: 'nomad_b1', cx: 6, cy: 14, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'fauna_lamb_brown', sheet: 'nomad_b1', cx: 7, cy: 15, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'fauna_goat_ram', sheet: 'nomad_b1', cx: 10, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'fauna_horse_brown', sheet: 'nomad_b1', cx: 0, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'fauna_horse_saddled', sheet: 'nomad_b1', cx: 4, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'fauna_horse_white', sheet: 'nomad_b1', cx: 6, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },

    // --- HANDWERK & METALLURGIE (K2) ---
    { id: 'rennofen_clay_smelter', sheet: 'nomad_b5', cx: 0, cy: 12, cw: 2, ch: 2, outW: 58, outH: 54 },
    { id: 'charcoal_meiler_smoke', sheet: 'nomad_b5', cx: 2, cy: 12, cw: 2, ch: 2, outW: 60, outH: 54 },
    { id: 'smithy_furnace_fire', sheet: 'celtic_b2', cx: 8, cy: 14, cw: 2, ch: 2, outW: 54, outH: 50 },
    { id: 'anvil_and_forge', sheet: 'celtic_b2', cx: 10, cy: 14, cw: 2, ch: 2, outW: 52, outH: 48 },
    { id: 'pelt_drying_frame', sheet: 'werewolf_b1', cx: 4, cy: 14, cw: 2, ch: 2, outW: 52, outH: 52 },
    { id: 'grain_quern_stone', sheet: 'nomad_b5', cx: 0, cy: 8, cw: 2, ch: 2, outW: 48, outH: 46 },
    { id: 'wood_log_pile', sheet: 'nomad_b5', cx: 12, cy: 12, cw: 2, ch: 2, outW: 56, outH: 46 },
    { id: 'weapon_rack_spears', sheet: 'werewolf_b1', cx: 8, cy: 14, cw: 2, ch: 2, outW: 52, outH: 48 },
    { id: 'cauldron_hanging_fire', sheet: 'nomad_b1', cx: 8, cy: 8, cw: 2, ch: 2, outW: 52, outH: 52 },

    // --- THING & HEILIGTUM (K4 & K5 - Exact 48px Grid Coordinates) ---
    { id: 'thing_stone_circle', sheet: 'celtic_b2', cx: 8, cy: 4, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'sacred_dolmen_portal', sheet: 'celtic_b2', cx: 12, cy: 8, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'menhir_pillar_large', sheet: 'celtic_b1', cx: 12, cy: 0, cw: 1, ch: 2, outW: 48, outH: 96 },
    { id: 'sacrificial_altar_carved', sheet: 'celtic_b1', cx: 6, cy: 8, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'carved_wooden_god_idol', sheet: 'celtic_b2', cx: 4, cy: 8, cw: 2, ch: 4, outW: 96, outH: 192 },
    { id: 'braak_totem_pole', sheet: 'celtic_b1', cx: 8, cy: 8, cw: 1, ch: 2, outW: 48, outH: 96 },
    { id: 'bohlenweg_timber_bridge', sheet: 'werewolf_b1', cx: 2, cy: 14, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'sacred_fire_ring', sheet: 'celtic_b2', cx: 2, cy: 4, cw: 2, ch: 2, outW: 96, outH: 96 },
    { id: 'runestone_standing_blue', sheet: 'celtic_b2', cx: 6, cy: 0, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'runestone_standing_green', sheet: 'celtic_b2', cx: 6, cy: 2, cw: 1, ch: 1, outW: 48, outH: 48 },
    { id: 'herbs_medicinal_table', sheet: 'celtic_b1', cx: 12, cy: 12, cw: 2, ch: 2, outW: 96, outH: 96 },

    // --- RÖMER, HANDELSSTÜTZPUNKT & LIMES (K3, K6, K7, K8) ---
    { id: 'roman_trader_canopy', sheet: 'rome_4', cx: 8, cy: 6, cw: 2, ch: 2, outW: 54, outH: 52 },
    { id: 'roman_forum_market', sheet: 'rome_4', cx: 12, cy: 4, cw: 2, ch: 2, outW: 54, outH: 52 },
    { id: 'limes_watchtower_wood', sheet: 'rome_9', cx: 0, cy: 4, cw: 2.5, ch: 4, outW: 54, outH: 84 },
    { id: 'roman_praetorium_red', sheet: 'rome_3', cx: 0, cy: 0, cw: 4, ch: 4, outW: 88, outH: 80 },
    { id: 'scutum_shield_line', sheet: 'rome_10', cx: 8, cy: 6, cw: 2, ch: 2, outW: 46, outH: 44 },
    { id: 'legion_aquila_vexillum', sheet: 'rome_10', cx: 4, cy: 12, cw: 1, ch: 2, outW: 26, outH: 48 },
    { id: 'rasensodenwall_kalkriese', sheet: 'werewolf_b1', cx: 8, cy: 6, cw: 2, ch: 2, outW: 56, outH: 52 },
    { id: 'limes_palisade_barrier', sheet: 'werewolf_b1', cx: 8, cy: 8, cw: 2, ch: 2, outW: 52, outH: 48 },
  ];

  console.log(`Processing ${cropDefs.length} prop crops in browser...`);

  const croppedAssets = await page.evaluate(
    async (defs, sheetB64s) => {
      function loadImage(b64) {
        return new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = 'data:image/png;base64,' + b64;
        });
      }

      const imgCache = {};
      for (const [key, b64] of Object.entries(sheetB64s)) {
        imgCache[key] = await loadImage(b64);
      }

      const out = {};
      for (const def of defs) {
        const sheetImg = imgCache[def.sheet];
        if (!sheetImg) continue;

        const canvas = document.createElement('canvas');
        canvas.width = def.outW;
        canvas.height = def.outH;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const srcX = def.cx * 48;
        const srcY = def.cy * 48;
        const srcW = def.cw * 48;
        const srcH = def.ch * 48;

        ctx.drawImage(sheetImg, srcX, srcY, srcW, srcH, 0, 0, def.outW, def.outH);
        out[def.id] = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      }
      return out;
    },
    cropDefs,
    sheets,
  );

  for (const [id, b64] of Object.entries(croppedAssets)) {
    fs.writeFileSync(`public/assets/props/${id}.png`, Buffer.from(b64, 'base64'));
  }
  console.log(`✅ Saved ${Object.keys(croppedAssets).length} props to public/assets/props/`);

  // 2. ICONS: 27 HISTORICAL FACHBEGRIFFE + 5 ARCHAEOLOGICAL RELICS
  console.log('Generating 32 crisp pixel art icons...');
  const iconDefs = [
    // 1. Wohnstallhaus
    {
      id: 'wohnstallhaus',
      sheet: 'fantasy_1',
      crop: { x: 5, y: 4, s: 128 },
      svg: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(4, 14, 24, 14);
        ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.moveTo(2, 14); ctx.lineTo(16, 4); ctx.lineTo(30, 14); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(14, 18, 4, 10);
      `,
    },
    // 2. Sippe (Family/Clan)
    {
      id: 'sippe',
      svg: `
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(10, 10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(22, 10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 8, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#92400e';
        ctx.fillRect(6, 15, 8, 12); ctx.fillRect(18, 15, 8, 12); ctx.fillRect(12, 12, 8, 15);
      `,
    },
    // 3. Ackerbau & Getreide
    {
      id: 'ackerbau_spelt',
      svg: `
        ctx.fillStyle = '#ca8a04'; ctx.fillRect(15, 4, 2, 24);
        ctx.fillStyle = '#fde047';
        for(let y=6; y<=18; y+=3) { ctx.fillRect(10, y, 5, 2); ctx.fillRect(17, y-1, 5, 2); }
        ctx.fillStyle = '#854d0e'; ctx.fillRect(8, 22, 16, 3);
      `,
    },
    // 4. Auerochse / Wisent
    {
      id: 'auerochse',
      svg: `
        ctx.fillStyle = '#451a03'; ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(4, 4); ctx.lineTo(10, 8); ctx.fill();
        ctx.beginPath(); ctx.moveTo(24, 12); ctx.lineTo(28, 4); ctx.lineTo(22, 8); ctx.fill();
        ctx.fillStyle = '#000'; ctx.fillRect(11, 14, 2, 2); ctx.fillRect(19, 14, 2, 2);
      `,
    },
    // 5. Raseneisenerz (Bog Iron Ore)
    {
      id: 'raseneisenerz',
      svg: `
        ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(16, 16, 11, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(10, 8, 6, 6); ctx.fillRect(18, 14, 7, 6); ctx.fillRect(9, 16, 6, 6);
        ctx.fillStyle = '#451a03'; ctx.fillRect(14, 12, 4, 4);
      `,
    },
    // 6. Rennofen
    {
      id: 'rennofen',
      svg: `
        ctx.fillStyle = '#9a3412';
        ctx.beginPath(); ctx.moveTo(10, 28); ctx.lineTo(12, 8); ctx.lineTo(20, 8); ctx.lineTo(22, 28); ctx.fill();
        ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.arc(16, 22, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(16, 22, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#475569'; ctx.fillRect(4, 22, 8, 3);
      `,
    },
    // 7. Fibel (Gewandspange)
    {
      id: 'fibel',
      svg: `
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(16, 14, 9, 0, Math.PI); ctx.stroke();
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(16, 16, 9, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(7, 14, 18, 3);
        ctx.fillStyle = '#b45309'; ctx.fillRect(6, 13, 4, 5); ctx.fillRect(22, 13, 4, 5);
      `,
    },
    // 8. Schmiedehammer & Eisenluppe
    {
      id: 'schmiede_hammer',
      svg: `
        ctx.fillStyle = '#78350f'; for(let i=0;i<16;i++) ctx.fillRect(6+i, 26-i, 3, 3);
        ctx.fillStyle = '#64748b'; ctx.fillRect(16, 6, 12, 7);
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(18, 7, 8, 3);
      `,
    },
    // 9. Bernstein (Nordisches Gold)
    {
      id: 'bernstein',
      svg: `
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.ellipse(16, 16, 10, 8, 0.4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.ellipse(15, 14, 7, 5, 0.4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.fillRect(13, 11, 4, 3);
      `,
    },
    // 10. Terra Sigillata
    {
      id: 'terra_sigillata',
      svg: `
        ctx.fillStyle = '#991b1b';
        ctx.beginPath(); ctx.arc(16, 18, 11, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.ellipse(16, 17, 11, 4, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fca5a5'; ctx.fillRect(10, 16, 12, 1.5);
      `,
    },
    // 11. Denar des Augustus
    {
      id: 'denar_augustus',
      svg: `
        ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(16, 16, 11, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e2e8f0'; ctx.beginPath(); ctx.arc(16, 16, 9.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#64748b';
        // Profile head
        ctx.fillRect(14, 10, 5, 5); ctx.fillRect(12, 13, 6, 7); ctx.fillRect(14, 18, 7, 3);
      `,
    },
    // 12. Römerstadt Waldgirmes
    {
      id: 'waldgirmes',
      svg: `
        ctx.fillStyle = '#b45309'; ctx.fillRect(4, 14, 24, 14);
        ctx.fillStyle = '#f59e0b';
        for(let x=6; x<=22; x+=5) ctx.fillRect(x, 16, 3, 12);
        ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.moveTo(2, 14); ctx.lineTo(16, 6); ctx.lineTo(30, 14); ctx.fill();
        ctx.fillStyle = '#eab308'; ctx.fillRect(14, 10, 4, 3);
      `,
    },
    // 13. Das Thing
    {
      id: 'thing',
      svg: `
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(16, 16, 10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(16, 16, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        for(let a=0; a<Math.PI*2; a+=Math.PI/4) {
          ctx.fillRect(15 + Math.cos(a)*10, 15 + Math.sin(a)*10, 3, 3);
        }
      `,
    },
    // 14. Wergeld (Sühnegeld)
    {
      id: 'wergeld',
      svg: `
        ctx.fillStyle = '#b45309'; ctx.fillRect(6, 10, 20, 16);
        ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(16, 12, 5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(11, 18, 4, 4); ctx.fillRect(17, 18, 4, 4); ctx.fillRect(14, 21, 4, 4);
      `,
    },
    // 15. Allmende (Gemeinland)
    {
      id: 'allmende',
      svg: `
        ctx.fillStyle = '#15803d'; ctx.fillRect(4, 14, 24, 14);
        ctx.fillStyle = '#86efac'; ctx.fillRect(6, 16, 8, 4); ctx.fillRect(18, 20, 8, 4);
        ctx.fillStyle = '#78350f'; ctx.fillRect(4, 13, 24, 2);
      `,
    },
    // 16. Heiliger Hain
    {
      id: 'heiliger_hain',
      svg: `
        ctx.fillStyle = '#166534';
        ctx.beginPath(); ctx.arc(10, 12, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(22, 12, 6, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(16, 10, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#78350f'; ctx.fillRect(14, 16, 4, 12);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(15, 12, 2, 4);
      `,
    },
    // 17. Mooropfer
    {
      id: 'mooropfer',
      svg: `
        ctx.fillStyle = '#3f2e1a'; ctx.fillRect(4, 16, 24, 12);
        ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.ellipse(16, 20, 10, 5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(11, 10, 10, 3); ctx.fillRect(15, 6, 2, 16);
      `,
    },
    // 18. Seherin / Völva
    {
      id: 'seherin_voelva',
      svg: `
        ctx.fillStyle = '#f1f5f9'; ctx.beginPath(); ctx.arc(16, 12, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillRect(10, 16, 12, 12);
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(16, 11, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#0284c7'; ctx.fillRect(14, 20, 4, 4);
      `,
    },
    // 19. Runen des Futhark
    {
      id: 'runen_futhark',
      svg: `
        ctx.fillStyle = '#334155'; ctx.fillRect(6, 6, 20, 20);
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
        // Rune Fehu
        ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(12, 24); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(12, 10); ctx.lineTo(20, 13); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(12, 14); ctx.lineTo(19, 17); ctx.stroke();
      `,
    },
    // 20. Varusschlacht
    {
      id: 'varusschlacht',
      svg: `
        ctx.fillStyle = '#991b1b'; ctx.fillRect(6, 6, 20, 20);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(8, 8, 4, 16); ctx.fillRect(14, 8, 4, 16); ctx.fillRect(20, 8, 4, 16);
        ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(26, 26); ctx.stroke();
      `,
    },
    // 21. Kalkriese Nadelöhr
    {
      id: 'kalkriese',
      svg: `
        ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(4, 28); ctx.lineTo(12, 6); ctx.lineTo(20, 28); ctx.fill();
        ctx.fillStyle = '#334155'; ctx.fillRect(16, 14, 12, 14);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(11, 18, 5, 2);
      `,
    },
    // 22. Rasensodenwall
    {
      id: 'rasensodenwall',
      svg: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(4, 16, 24, 12);
        ctx.fillStyle = '#15803d'; ctx.fillRect(4, 12, 24, 5);
        ctx.fillStyle = '#86efac';
        for(let x=6; x<=24; x+=4) ctx.fillRect(x, 10, 2, 3);
      `,
    },
    // 23. Der Limes
    {
      id: 'limes',
      svg: `
        ctx.fillStyle = '#92400e';
        for(let x=6; x<=24; x+=4) {
          ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x+1.5, 8); ctx.lineTo(x+3, 26); ctx.fill();
        }
        ctx.fillStyle = '#78350f'; ctx.fillRect(4, 18, 24, 3);
      `,
    },
    // 24. Limes-Wachturm
    {
      id: 'limes_wachturm',
      svg: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(10, 10, 12, 18);
        ctx.fillStyle = '#b45309'; ctx.fillRect(8, 8, 16, 4);
        ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.moveTo(7, 8); ctx.lineTo(16, 3); ctx.lineTo(25, 8); ctx.fill();
        ctx.fillStyle = '#fbbf24'; ctx.fillRect(14, 14, 4, 5);
      `,
    },
    // 25. Vicus (Kastelldorf)
    {
      id: 'vicus',
      svg: `
        ctx.fillStyle = '#78350f'; ctx.fillRect(6, 16, 9, 10); ctx.fillRect(17, 14, 10, 12);
        ctx.fillStyle = '#ea580c'; ctx.beginPath(); ctx.moveTo(4, 16); ctx.lineTo(10, 10); ctx.lineTo(16, 16); ctx.fill();
        ctx.beginPath(); ctx.moveTo(15, 14); ctx.lineTo(22, 8); ctx.lineTo(29, 14); ctx.fill();
      `,
    },
    // 26. Föderaten
    {
      id: 'foederaten',
      svg: `
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.arc(12, 14, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.arc(20, 14, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.fillRect(14, 12, 4, 12);
      `,
    },
    // 27. Spätantike
    {
      id: 'spaetantike',
      svg: `
        ctx.fillStyle = '#475569'; ctx.fillRect(4, 16, 24, 12);
        ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.moveTo(16, 4); ctx.lineTo(24, 16); ctx.lineTo(8, 16); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(16, 11, 2.5, 0, Math.PI*2); ctx.fill();
      `,
    },

    // --- 5 RELIKTE (Archäologische Leitfunde) ---
    // Relikt 1: Eiserne Pflugschar
    {
      id: 'relic_pflugschar',
      svg: `
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(7, 23); ctx.lineTo(25, 9); ctx.lineTo(25, 23); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.fillRect(9, 19, 14, 4);
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(11, 20, 10, 2);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 16, 13, 0, Math.PI*2); ctx.stroke();
      `,
    },
    // Relikt 2: Bronzene Rollenkappenfibel
    {
      id: 'relic_rollenkappenfibel',
      svg: `
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(16, 14, 9, 0, Math.PI); ctx.stroke();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(16, 17, 9, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = '#b45309'; ctx.fillRect(5, 12, 5, 6); ctx.fillRect(22, 12, 5, 6);
        ctx.fillStyle = '#fef08a'; ctx.fillRect(14, 14, 4, 3);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 16, 13, 0, Math.PI*2); ctx.stroke();
      `,
    },
    // Relikt 3: Römische Terra Sigillata Schale
    {
      id: 'relic_terra_sigillata',
      svg: `
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath(); ctx.arc(16, 18, 11, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.ellipse(16, 17, 11, 4.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fca5a5'; ctx.fillRect(11, 16, 10, 2);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 16, 13, 0, Math.PI*2); ctx.stroke();
      `,
    },
    // Relikt 4: Tacitus Germania Handschrift
    {
      id: 'relic_tacitus_germania',
      svg: `
        ctx.fillStyle = '#fef3c7'; ctx.fillRect(8, 5, 16, 22);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(10, 8, 12, 2); ctx.fillRect(10, 12, 12, 2); ctx.fillRect(10, 16, 12, 2); ctx.fillRect(10, 20, 8, 2);
        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1.5; ctx.strokeRect(8, 5, 16, 22);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 16, 13, 0, Math.PI*2); ctx.stroke();
      `,
    },
    // Relikt 5: Römische Gesichtsmaske von Kalkriese
    {
      id: 'relic_kalkriese_maske',
      svg: `
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.ellipse(16, 16, 9, 12, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#64748b';
        ctx.fillRect(11, 12, 3, 2); ctx.fillRect(18, 12, 3, 2);
        ctx.fillRect(15, 14, 2, 5);
        ctx.fillRect(13, 21, 6, 2);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(16, 16, 13, 0, Math.PI*2); ctx.stroke();
      `,
    },
    // Relikt-Entdeckungs-Marker auf der Weltkarte
    {
      id: 'relic_marker_glow',
      svg: `
        const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 14);
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);

        ctx.fillStyle = '#78350f';
        ctx.beginPath(); ctx.ellipse(16, 24, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#92400e';
        ctx.beginPath(); ctx.ellipse(16, 23, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(16, 17, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(14, 14, 4, 4);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(23, 7, 2, 6); ctx.fillRect(21, 9, 6, 2);
        ctx.fillRect(8, 11, 2, 4); ctx.fillRect(7, 12, 4, 2);
        ctx.fillRect(15, 16, 2, 2);
      `,
    },
  ];

  const renderedIcons = await page.evaluate(async (defs) => {
    const out = {};
    for (const d of defs) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Execute procedural drawing
      const fn = new Function('ctx', d.svg);
      fn(ctx);

      out[d.id] = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    }
    return out;
  }, iconDefs);

  for (const [id, b64] of Object.entries(renderedIcons)) {
    fs.writeFileSync(`public/assets/icons/${id}.png`, Buffer.from(b64, 'base64'));
  }
  console.log(`✅ Saved ${Object.keys(renderedIcons).length} icons to public/assets/icons/`);

  // 3. LUMINANZ-ERHALTENDE CHARAKTER- UND NPC-PIPELINE
  console.log('Generating characters and NPC spritesheets...');

  // Color ramps (dark to bright) for clothing remapping
  const npcRamps = {
    // Player 1: Folkmar (Tribe Hunter / Smith - forest green & leather brown)
    player_folkmar: [
      [30, 20, 10],
      [70, 50, 25],
      [34, 84, 40],
      [58, 130, 60],
      [110, 180, 110],
    ],
    // Player 2: Alrun (Tribe Herbalist / Weaver - deep wine red & linen)
    player_alrun: [
      [40, 15, 20],
      [90, 25, 40],
      [145, 40, 60],
      [185, 85, 95],
      [225, 160, 165],
    ],
    // Walburg: Dorfälteste (Sage elder - charcoal & warm wool)
    npc_walburg: [
      [25, 25, 30],
      [60, 60, 70],
      [100, 95, 90],
      [150, 140, 130],
      [210, 205, 195],
    ],
    // Sindolf: Schmied (Smith - dark apron, fiery rust)
    npc_sindolf: [
      [30, 15, 10],
      [80, 35, 15],
      [130, 55, 20],
      [180, 85, 30],
      [220, 135, 60],
    ],
    // Marcus: Römischer Händler (Roman merchant - imperial purple & white toga)
    npc_marcus: [
      [35, 10, 45],
      [75, 20, 95],
      [125, 35, 145],
      [180, 80, 190],
      [235, 190, 240],
    ],
    // Hagano: Thing-Gesetzessprecher / Priester (Law speaker - deep navy & bronze)
    npc_hagano: [
      [15, 25, 45],
      [30, 55, 95],
      [50, 90, 145],
      [95, 135, 180],
      [160, 190, 220],
    ],
    // Albruna: Seherin & Völva (Seer - pure mystic white & cyan)
    npc_albruna: [
      [20, 40, 50],
      [40, 80, 100],
      [80, 140, 160],
      [140, 200, 220],
      [220, 245, 255],
    ],
    // Arminius: Cheruskerfürst (Chieftain - bronze scale armor & royal cloak)
    npc_arminius: [
      [45, 20, 10],
      [95, 45, 15],
      [160, 85, 25],
      [210, 140, 45],
      [250, 210, 110],
    ],
    // Segestes: Cheruskischer Adliger (Noble - amber & fur)
    npc_segestes: [
      [40, 25, 15],
      [85, 50, 25],
      [140, 90, 40],
      [195, 140, 70],
      [235, 195, 130],
    ],
    // Flavus: Römischer Auxiliarsoldat (Roman legion red & mail)
    npc_flavus: [
      [50, 10, 10],
      [110, 20, 20],
      [170, 30, 30],
      [210, 60, 60],
      [240, 130, 130],
    ],
    // Chlodio: Spätantiker Föderatenführer (Late antique gold & royal blue)
    npc_chlodio: [
      [15, 20, 45],
      [35, 50, 95],
      [65, 90, 150],
      [140, 130, 40],
      [220, 195, 80],
    ],
  };

  const remappedNpcs = await page.evaluate(
    async (charBaseB64, ramps) => {
      function loadImage(b64) {
        return new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = 'data:image/png;base64,' + b64;
        });
      }

      const baseImg = await loadImage(charBaseB64);
      const out = {};
      const portraits = {};

      for (const [npcId, ramp] of Object.entries(ramps)) {
        const canvas = document.createElement('canvas');
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImg, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        // Process each 16x32 frame
        for (let fy = 0; fy < canvas.height; fy += 32) {
          for (let fx = 0; fx < canvas.width; fx += 16) {
            for (let py = 0; py < 32; py++) {
              for (let px = 0; px < 16; px++) {
                // Strict rule: PROTECT FACE ZONE (y = 10..18)
                if (py >= 10 && py <= 18) continue;

                const idx = ((fy + py) * canvas.width + (fx + px)) * 4;
                const r = d[idx],
                  g = d[idx + 1],
                  b = d[idx + 2],
                  a = d[idx + 3];
                if (a < 128) continue;

                // Modulate clothes: y >= 19 or headwear py <= 9
                if (py >= 19 && (r !== g || r > 80)) {
                  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                  // Interpolate color ramp
                  const pos = lum * (ramp.length - 1);
                  const i0 = Math.floor(pos);
                  const i1 = Math.min(ramp.length - 1, i0 + 1);
                  const t = pos - i0;

                  const c0 = ramp[i0];
                  const c1 = ramp[i1];

                  d[idx] = Math.round(c0[0] + (c1[0] - c0[0]) * t);
                  d[idx + 1] = Math.round(c0[1] + (c1[1] - c0[1]) * t);
                  d[idx + 2] = Math.round(c0[2] + (c1[2] - c0[2]) * t);
                }
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        out[npcId] = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');

        // Extract frame 0 (front-facing idle: 16x32) scaled 3x (48x96) for crisp dialogue portraits
        const pCanvas = document.createElement('canvas');
        pCanvas.width = 48;
        pCanvas.height = 96;
        const pCtx = pCanvas.getContext('2d');
        pCtx.imageSmoothingEnabled = false;
        pCtx.drawImage(canvas, 0, 0, 16, 32, 0, 0, 48, 96);
        portraits[npcId] = pCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      }
      return { npcs: out, portraits };
    },
    sheets.charBase,
    npcRamps,
  );

  for (const [id, b64] of Object.entries(remappedNpcs.npcs)) {
    fs.writeFileSync(`public/assets/gfx/npcs/${id}.png`, Buffer.from(b64, 'base64'));
  }
  for (const [id, b64] of Object.entries(remappedNpcs.portraits)) {
    fs.writeFileSync(`public/assets/gfx/portraits/${id}.png`, Buffer.from(b64, 'base64'));
  }
  console.log(`✅ Saved ${Object.keys(remappedNpcs.npcs).length} characters to public/assets/gfx/npcs/`);
  console.log(`✅ Saved ${Object.keys(remappedNpcs.portraits).length} portraits to public/assets/gfx/portraits/`);

  await browser.close();
  console.log('🎉 Asset Baking Complete!');
}

main().catch((err) => {
  console.error('Asset build error:', err);
  process.exit(1);
});
