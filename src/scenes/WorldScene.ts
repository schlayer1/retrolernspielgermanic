import Phaser from 'phaser';
import { sound } from '../audio/sound';
import { CHAPTERS } from '../data/chapters';
import { GERMAN_BUILDINGS, GERMAN_ITEMS, GermanItemId } from '../data/items';
import { GERMAN_RELICS, GermanRelic } from '../data/relics';
import { gameState } from '../systems/GameState';
import { WorldDecorManager } from '../world/decor';
import { WildlifeManager } from '../world/Wildlife';
import { LivingWorldManager } from '../world/LivingWorldManager';

interface InteractiveTarget {
  id: string;
  kind: 'mentor' | 'resource' | 'relic' | 'portal' | 'trader' | 'building_plot' | 'interactive_quest';
  name: string;
  sub: string;
  x: number;
  y: number;
  minChapter: number;
  itemId?: GermanItemId;
  relic?: GermanRelic;
  buildingId?: string;
  questChapter?: number;
  questObjectiveIndex?: number;
  questMessage?: string;
  actionTip?: string;
}

export class WorldScene extends Phaser.Scene {
  public mapW = 100;
  public mapH = 80;
  public player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
  };

  private dynamicGroup!: Phaser.GameObjects.Group;
  private mentorSprite: Phaser.GameObjects.Sprite | null = null;
  private targets: InteractiveTarget[] = [];
  private activeTarget: InteractiveTarget | null = null;
  private labelLayer!: HTMLDivElement;

  private decorManager!: WorldDecorManager;
  private wildlifeManager!: WildlifeManager;
  private livingWorldManager!: LivingWorldManager;
  private stepTimer = 0;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private bakedGroundEpoch = -1;
  private groundImage?: Phaser.GameObjects.Image;
  private sunlightOverlay?: Phaser.GameObjects.Rectangle;

  // Mentor positions per chapter
  private mentorCoords: Record<number, { x: number; y: number; id: string; name: string }> = {
    1: { x: 34, y: 30, id: 'npc_walburg', name: 'Walburg (Sippenälteste)' },
    2: { x: 48, y: 36, id: 'npc_sindolf', name: 'Sindolf (Dorfschmied)' },
    3: { x: 22, y: 50, id: 'npc_marcus', name: 'Marcus (Römischer Händler)' },
    4: { x: 50, y: 56, id: 'npc_hagano', name: 'Hagano (Thing-Priester)' },
    5: { x: 74, y: 44, id: 'npc_albruna', name: 'Albruna (Seherin & Völva)' },
    6: { x: 78, y: 20, id: 'npc_arminius', name: 'Arminius (Cheruskerfürst)' },
    7: { x: 24, y: 66, id: 'npc_flavus', name: 'Flavus (Auxiliarsoldat)' },
    8: { x: 58, y: 68, id: 'npc_chlodio', name: 'Chlodio (Föderatenführer)' },
  };

  constructor() {
    super('World');
  }

  create() {
    this.createCharacterAnimations();
    this.bakeGermanicTerrainTexture(gameState.chapter);

    this.groundImage = this.add
      .image(0, 0, 'germanic_ground_baked')
      .setOrigin(0, 0)
      .setDepth(0);

    this.decorManager = new WorldDecorManager(this);
    this.wildlifeManager = new WildlifeManager(this);
    this.livingWorldManager = new LivingWorldManager(this);

    // 1. Waterways: Weser/Rhein river in the West and marsh ponds
    this.buildRiverAndBridges();

    // 2. Scatter nature: Oaks, pines, bushes, mossy rocks
    this.scatterGermanicNature();

    // 3. Static settlements, buildings & monuments
    this.buildStaticGermanicWorld();

    this.dynamicGroup = this.add.group();
    this.rebuildChapterEntities();

    // 4. Player Spawn
    const texKey = gameState.gender === 'female' ? 'player_alrun' : 'player_folkmar';
    this.player = this.add
      .sprite(gameState.playerX, gameState.playerY, texKey, 0)
      .setOrigin(0.5, 0.9)
      .setDepth(gameState.playerY);
    this.livingWorldManager.registerPlayer(this.player);

    // 5. Living wildlife: Wisente, sheep, rams, horses
    this.wildlifeManager.init(this.mapW, this.mapH);

    // 6. Sunlight Overlay
    this.sunlightOverlay = this.add
      .rectangle(0, 0, this.mapW * 16, this.mapH * 16, 0xfef08a, 0.04)
      .setOrigin(0, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(8500);

    // Camera setup
    this.cameras.main.setBounds(0, 0, this.mapW * 16, this.mapH * 16);
    this.cameras.main.startFollow(this.player, true, 0.14, 0.14);
    this.cameras.main.setRoundPixels(true);
    this.updateCameraZoom();
    this.scale.on('resize', () => this.updateCameraZoom());

    // Keyboard controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D,E') as {
      W: Phaser.Input.Keyboard.Key;
      A: Phaser.Input.Keyboard.Key;
      S: Phaser.Input.Keyboard.Key;
      D: Phaser.Input.Keyboard.Key;
      E: Phaser.Input.Keyboard.Key;
    };

    this.initDOMLabelLayer();

    // Subscribe to state changes (chapter progress, building construction)
    gameState.subscribe(() => {
      this.bakeGermanicTerrainTexture(gameState.chapter);
      this.rebuildChapterEntities();
    });

    // Start background music
    sound.playBGM(gameState.chapter);
  }

  private updateCameraZoom(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const zoom = w < 900 || h < 500 ? 2.25 : 2.75;
    this.cameras.main.setZoom(zoom);
  }

  private initDOMLabelLayer(): void {
    let existing = document.getElementById('world-label-layer') as HTMLDivElement | null;
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'world-label-layer';
      existing.style.position = 'fixed';
      existing.style.inset = '0';
      existing.style.pointerEvents = 'none';
      existing.style.zIndex = '15';
      document.body.appendChild(existing);
    }
    this.labelLayer = existing;
    this.labelLayer.style.display = 'block';
  }

  private createCharacterAnimations(): void {
    // Already defined in BootScene, but we make sure idles exist
  }

  // =========================================================================
  // 16-BIT PER-PIXEL A2 SAMPLING + 4x4 BAYER DITHERING
  // =========================================================================
  private isWaterTile(tx: number, ty: number): boolean {
    // Wooden bridges across the river at ty: 28..30 and ty: 50..52
    if (ty >= 28 && ty <= 30 && tx >= 11 && tx <= 19) return false;
    if (ty >= 50 && ty <= 52 && tx >= 11 && tx <= 19) return false;

    // Meandering river in the West (x = 13..17)
    const riverCenter = 15 + Math.round(Math.sin(ty * 0.12) * 2.2);
    if (Math.abs(tx - riverCenter) <= 2) return true;

    // Marsh pond in the Eastern Moor (tx: 76..80, ty: 46..48)
    if (tx >= 76 && tx <= 80 && ty >= 46 && ty <= 48) return true;

    return false;
  }

  private bakeGermanicTerrainTexture(ch: number): void {
    const epoch = ch <= 2 ? 1 : ch <= 5 ? 2 : ch <= 7 ? 3 : 4;
    if (this.textures.exists('germanic_ground_baked') && this.bakedGroundEpoch === epoch) {
      return;
    }
    this.bakedGroundEpoch = epoch;

    const W = this.mapW * 16;
    const H = this.mapH * 16;

    const srcA2 = this.textures.get('ground_a2').getSourceImage() as HTMLImageElement;
    const srcGermanic = this.textures.get('germanic_ground_a2').getSourceImage() as HTMLImageElement;

    const extractData = (img: HTMLImageElement) => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return { data: ctx.getImageData(0, 0, img.width, img.height).data, w: img.width };
    };

    const a2 = extractData(srcA2);
    const germA2 = extractData(srcGermanic);

    const sampleBlock = (
      sheet: { data: Uint8ClampedArray; w: number },
      bx: number,
      by: number,
      px: number,
      py: number,
    ): [number, number, number] => {
      const u = ((px % 48) + 48) % 48;
      const v = ((py % 48) + 48) % 48;
      const sx = bx * 96 + 24 + u;
      const sy = by * 144 + 72 + v; // Standard +72
      const idx = (sy * sheet.w + sx) * 4;
      return [sheet.data[idx], sheet.data[idx + 1], sheet.data[idx + 2]];
    };

    const distToSeg = (
      px: number,
      py: number,
      ax: number,
      ay: number,
      bx: number,
      by: number,
    ): number => {
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - ax, py - ay);
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
      return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
    };

    // Organic Road & Trail Network across Free Germania
    const trails: Array<[number, number, number, number, number, 'dirt' | 'cobble' | 'boardwalk']> = [
      // Village Center <-> West River Bridge
      [18 * 16, 29 * 16, 34 * 16, 30 * 16, 16, 'dirt'],
      // Village Center <-> Smelter & Forge
      [34 * 16, 30 * 16, 48 * 16, 36 * 16, 15, 'dirt'],
      // Smelter <-> Thingplatz under the Oak
      [48 * 16, 36 * 16, 50 * 16, 56 * 16, 15, 'dirt'],
      // Village <-> Waldgirmes Market (Southwest)
      [34 * 16, 30 * 16, 22 * 16, 50 * 16, 16, epoch >= 2 ? 'cobble' : 'dirt'],
      // Waldgirmes <-> Limes Watchtower
      [22 * 16, 50 * 16, 24 * 16, 66 * 16, 16, epoch >= 3 ? 'cobble' : 'dirt'],
      // Smelter <-> Eastern Moor Entrance
      [48 * 16, 36 * 16, 65 * 16, 42 * 16, 14, 'dirt'],
      // Moor Boardwalk to Nerthus Sanctuary
      [65 * 16, 42 * 16, 78 * 16, 44 * 16, 14, 'boardwalk'],
      [78 * 16, 44 * 16, 86 * 16, 46 * 16, 14, 'boardwalk'],
      // Village <-> Kalkriese Mountain Pass (Northeast)
      [34 * 16, 30 * 16, 56 * 16, 22 * 16, 14, 'dirt'],
      [56 * 16, 22 * 16, 78 * 16, 20 * 16, 15, 'dirt'],
      // Thingplatz <-> Rhine Föderaten Camp
      [50 * 16, 56 * 16, 58 * 16, 68 * 16, 15, epoch >= 4 ? 'cobble' : 'dirt'],
    ];

    let canvasTex: Phaser.Textures.CanvasTexture;
    if (this.textures.exists('germanic_ground_baked')) {
      canvasTex = this.textures.get('germanic_ground_baked') as Phaser.Textures.CanvasTexture;
    } else {
      canvasTex = this.textures.createCanvas('germanic_ground_baked', W, H)!;
    }
    const outCtx = canvasTex.getContext();
    const outImg = outCtx.createImageData(W, H);
    const out = outImg.data;

    // 4x4 Bayer Dithering Matrix
    const bayer4 = [
      [0 / 16, 8 / 16, 2 / 16, 10 / 16],
      [12 / 16, 4 / 16, 14 / 16, 6 / 16],
      [3 / 16, 11 / 16, 1 / 16, 9 / 16],
      [15 / 16, 7 / 16, 13 / 16, 5 / 16],
    ];

    for (let y = 0; y < H; y += 2) {
      const ty = y >> 4;
      const riverCenterPx = (15 + Math.sin(ty * 0.12) * 2.2) * 16 + 8;

      for (let x = 0; x < W; x += 2) {
        const dither = bayer4[(y >> 1) & 3][(x >> 1) & 3] - 0.5;
        const n1 = Math.sin(x * 0.032) * Math.cos(y * 0.032) * 5;
        const n2 = Math.sin((x + y) * 0.02) * 4;
        const jitter = n1 + n2 + dither * 9;

        // 1. Distance to West River
        const distRiver = Math.abs(x - riverCenterPx) - 34;

        // 2. Road & Boardwalk Distance
        let minDistRoad = 999;
        let roadType: 'dirt' | 'cobble' | 'boardwalk' = 'dirt';
        for (const [ax, ay, bx, by, width, type] of trails) {
          const d = distToSeg(x, y, ax, ay, bx, by) - width;
          if (d < minDistRoad) {
            minDistRoad = d;
            roadType = type;
          }
        }

        // 3. Moor Bog Zone (East: x > 68*16, y between 34*16 and 56*16)
        const inMoorZone = x > 68 * 16 && y > 34 * 16 && y < 56 * 16;
        const distVillageCenter = Math.hypot(x - 34 * 16, y - 30 * 16);
        const distWaldgirmesForum = Math.hypot(x - 22 * 16, y - 50 * 16);

        // Fill 2x2 cluster
        for (let py = y; py < y + 2 && py < H; py++) {
          for (let px = x; px < x + 2 && px < W; px++) {
            let rgb: [number, number, number];

            if (distRiver + jitter * 0.65 < 16) {
              // River Shore (Sand & pebbles)
              rgb = distRiver < 8 ? sampleBlock(a2, 2, 1, px, py) : sampleBlock(a2, 1, 0, px, py);
            } else if (minDistRoad + jitter * 0.55 < 0) {
              // Trail / Road
              if (roadType === 'boardwalk') {
                rgb = sampleBlock(germA2, 4, 2, px, py); // Timber planks
              } else if (roadType === 'cobble') {
                rgb = sampleBlock(a2, 6, 1, px, py); // Natural stone cobble
              } else {
                rgb = sampleBlock(a2, 1, 0, px, py); // Warm clay dirt path
              }
            } else if (distWaldgirmesForum + jitter * 0.7 < 55 && epoch >= 2) {
              // Roman market cobblestone in Waldgirmes
              rgb = sampleBlock(a2, 6, 1, px, py);
            } else if (distVillageCenter + jitter * 0.6 < 45) {
              // Village cleared loam yard
              rgb = sampleBlock(a2, 1, 0, px, py);
            } else if (inMoorZone) {
              // Mossy Bog / Peat ground
              const moorWave = Math.sin(px * 0.04 + py * 0.03);
              rgb = moorWave > 0.1 ? sampleBlock(a2, 0, 3, px, py) : sampleBlock(a2, 0, 1, px, py);
            } else {
              // Free Germania meadows & woodlands
              const forestWave = Math.sin(px * 0.022 + py * 0.018) * 0.5 + Math.cos(px * 0.015 - py * 0.025) * 0.5;
              if (forestWave + dither * 0.5 > 0.62) {
                rgb = sampleBlock(a2, 0, 3, px, py); // Deep mossy forest
              } else if (forestWave + dither * 0.5 > 0.22) {
                rgb = sampleBlock(a2, 0, 1, px, py); // Forest grass
              } else {
                rgb = sampleBlock(a2, 1, 1, px, py); // Lush meadow grass
              }
            }

            const oi = (py * W + px) * 4;
            out[oi] = rgb[0];
            out[oi + 1] = rgb[1];
            out[oi + 2] = rgb[2];
            out[oi + 3] = 255;
          }
        }
      }
    }

    outCtx.putImageData(outImg, 0, 0);
    canvasTex.refresh();
  }

  // =========================================================================
  // WATERWAYS, BRIDGES & SCHILF
  // =========================================================================
  private buildRiverAndBridges(): void {
    const W = this.mapW;
    const H = this.mapH;

    for (let ty = 0; ty < H; ty++) {
      const riverCenter = 15 + Math.round(Math.sin(ty * 0.12) * 2.2);

      // Bridges
      const isBridgeNorth = ty >= 28 && ty <= 30;
      const isBridgeSouth = ty >= 50 && ty <= 52;

      for (let tx = riverCenter - 2; tx <= riverCenter + 2; tx++) {
        if (isBridgeNorth || isBridgeSouth) {
          // Wooden bridge plank over river
          this.add
            .image(tx * 16 + 8, ty * 16 + 8, 'bohlenweg_timber_bridge')
            .setDepth(ty * 16 + 2)
            .setScale(0.5);
        } else {
          // Flowing water tile from Overworld.png [16, 16, 16, 16]
          this.add
            .image(tx * 16 + 8, ty * 16 + 8, 'overworld')
            .setCrop(16, 16, 16, 16)
            .setDepth(1);
        }
      }

      // Reeds & riverbank flora
      if (!isBridgeNorth && !isBridgeSouth && ty % 3 === 0) {
        const f1 = this.decorManager.placeDecor((riverCenter - 3) * 16 + 8, ty * 16 + 12, 'fern_1', 0.8, -2);
        this.livingWorldManager.registerFlora(f1);
        const f2 = this.decorManager.placeDecor((riverCenter + 3) * 16 + 8, ty * 16 + 12, 'fern_2', 0.8, -2);
        this.livingWorldManager.registerFlora(f2);
      }
    }

    // Initialize flowing water shimmer lines & moor ripples
    this.livingWorldManager.initWaterEffects();
  }

  // =========================================================================
  // NATURE & FLORA SCATTER
  // =========================================================================
  private scatterGermanicNature(): void {
    // Deterministic pseudo-random placement for natural immersion
    const seedPoints = [
      // Deep Northern Oaks & Birch woods
      { x: 30, y: 12, f: 'tree_oak_1', s: 1.2 },
      { x: 38, y: 10, f: 'tree_oak_2', s: 1.1 },
      { x: 46, y: 14, f: 'tree_oak_1', s: 1.3 },
      { x: 55, y: 12, f: 'tree_oak_2', s: 1.2 },
      { x: 62, y: 16, f: 'tree_oak_1', s: 1.1 },
      // Eastern Moor Haze Oaks & Willows
      { x: 72, y: 32, f: 'tree_oak_2', s: 1.3 },
      { x: 84, y: 34, f: 'tree_willow', s: 1.2 },
      { x: 88, y: 52, f: 'tree_willow', s: 1.4 },
      // Southern Forest Pines & Oaks
      { x: 38, y: 72, f: 'tree_oak_1', s: 1.2 },
      { x: 46, y: 74, f: 'tree_pine_1', s: 1.3 },
      { x: 68, y: 72, f: 'tree_oak_2', s: 1.2 },
    ];

    seedPoints.forEach((p) => {
      const tree = this.decorManager.placeDecor(p.x * 16, p.y * 16, p.f, p.s);
      this.livingWorldManager.registerFlora(tree);

      const bush = this.decorManager.placeDecor(p.x * 16 + 14, p.y * 16 + 10, 'bush_a', 0.9);
      this.livingWorldManager.registerFlora(bush);

      const fern = this.decorManager.placeDecor(p.x * 16 - 12, p.y * 16 + 14, 'fern_1', 0.8);
      this.livingWorldManager.registerFlora(fern);
    });

    // Scattered meadow flowers & wild grasses
    const meadowFlora = [
      { x: 26, y: 38, f: 'flower_white' },
      { x: 32, y: 44, f: 'flower_sun' },
      { x: 28, y: 54, f: 'grass_1' },
      { x: 36, y: 58, f: 'grass_2' },
      { x: 46, y: 58, f: 'flower_white' },
      { x: 54, y: 58, f: 'flower_sun' },
      { x: 72, y: 38, f: 'grass_1' },
      { x: 76, y: 38, f: 'fern_2' },
    ];
    meadowFlora.forEach((fl) => {
      const spr = this.decorManager.placeDecor(fl.x * 16, fl.y * 16, fl.f, 0.9);
      this.livingWorldManager.registerFlora(spr);
    });

    // Scattered rocks, stumps, ferns
    const props = [
      { x: 26, y: 22, f: 'rock_moss_a' },
      { x: 44, y: 20, f: 'stump_a' },
      { x: 54, y: 38, f: 'rock_moss_b' },
      { x: 68, y: 46, f: 'rock_moss_c' },
      { x: 76, y: 24, f: 'stump_b' },
      { x: 82, y: 22, f: 'rock_moss_a' },
      { x: 32, y: 58, f: 'pebbles_a' },
      { x: 62, y: 62, f: 'pebbles_b' },
    ];
    props.forEach((p) => {
      this.decorManager.placeDecor(p.x * 16, p.y * 16, p.f, 1);
    });
  }

  // =========================================================================
  // STATIC GERMANIC & ROMAN SETTLEMENTS
  // =========================================================================
  private buildStaticGermanicWorld(): void {
    // 1. GERMANIC VILLAGE CENTER
    // Main Longhouse with crossed gable beams
    this.add.image(35 * 16, 26 * 16, 'langhaus_gable_hall').setOrigin(0.5, 0.9).setDepth(26 * 16);
    // Thatched round hut spaced 11 tiles west of Langhaus (clear 176px walking street)
    this.add.image(24 * 16, 26 * 16, 'germanic_round_hut').setOrigin(0.5, 0.9).setDepth(26 * 16);
    // Large hut spaced 9 tiles east of Langhaus
    this.add.image(44 * 16, 24 * 16, 'germanic_large_hut').setOrigin(0.5, 0.9).setDepth(24 * 16);
    // Elevated granary (Pfahlspeicher) north of village
    this.add.image(41 * 16, 17 * 16, 'pfahlspeicher_grain').setOrigin(0.5, 0.9).setDepth(17 * 16);
    // Cattle pen & haystacks (placed in the village animal enclosure)
    this.add.image(24 * 16, 35 * 16, 'cattle_pen_fence').setOrigin(0.5, 0.9).setDepth(35 * 16);
    this.add.image(30 * 16, 35 * 16, 'haystack_large').setOrigin(0.5, 0.9).setDepth(35 * 16);
    this.add.image(19 * 16, 28 * 16, 'wagon_covered_cart').setOrigin(0.5, 0.9).setDepth(28 * 16);
    this.add.image(37 * 16, 32 * 16, 'water_barrels_wood').setOrigin(0.5, 0.9).setDepth(32 * 16);

    // 2. SMELTER & SMITHS AT THE STREAM (Center-East)
    this.add.image(48 * 16, 33 * 16, 'rennofen_clay_smelter').setOrigin(0.5, 0.9).setDepth(33 * 16);
    this.livingWorldManager.registerFireSource(48 * 16, 33 * 16, true, 34, 0xf97316);

    this.add.image(55 * 16, 33 * 16, 'charcoal_meiler_smoke').setOrigin(0.5, 0.9).setDepth(33 * 16);
    this.livingWorldManager.registerFireSource(55 * 16, 33 * 16, true, 36, 0x64748b);

    this.add.image(46 * 16, 38 * 16, 'anvil_and_forge').setOrigin(0.5, 0.9).setDepth(38 * 16);
    this.livingWorldManager.registerFireSource(46 * 16, 38 * 16, true, 32, 0xf59e0b);

    this.add.image(53 * 16, 38 * 16, 'wood_log_pile').setOrigin(0.5, 0.9).setDepth(38 * 16);
    this.add.image(41 * 16, 36 * 16, 'pelt_drying_frame').setOrigin(0.5, 0.9).setDepth(36 * 16);

    // 3. THINGPLATZ UNDER THE SACRED OAK (South-Center)
    // Mighty Oak stands at North edge of glade (y=42)
    const oak = this.decorManager.placeDecor(50 * 16, 42 * 16, 'tree_oak_tall', 1.5, -10);
    this.livingWorldManager.registerFlora(oak);

    // Dolmen altar north of the stone circle (y=47)
    this.add.image(50 * 16, 47 * 16, 'sacred_dolmen_portal').setOrigin(0.5, 0.9).setScale(0.7).setDepth(47 * 16);

    // Thing stone circle in center of glade (y=54)
    this.add.image(50 * 16, 54 * 16, 'thing_stone_circle').setOrigin(0.5, 0.9).setScale(0.75).setDepth(54 * 16);

    // Sacred fire ring positioned in open clearing (y=61)
    this.add.image(50 * 16, 61 * 16, 'sacred_fire_ring').setOrigin(0.5, 0.9).setScale(0.65).setDepth(61 * 16);
    this.livingWorldManager.registerFireSource(50 * 16, 61 * 16, true, 46, 0xfb923c);

    // Flanking sacred runestones (Runestones maintain their mystical rune glow)
    const runeBlue = this.add.image(43 * 16, 54 * 16, 'runestone_standing_blue').setOrigin(0.5, 0.9).setScale(0.55).setDepth(54 * 16);
    this.livingWorldManager.registerMysticalProp(runeBlue);

    const runeGreen = this.add.image(57 * 16, 54 * 16, 'runestone_standing_green').setOrigin(0.5, 0.9).setScale(0.55).setDepth(54 * 16);
    this.livingWorldManager.registerMysticalProp(runeGreen);

    // 4. WALDGIRMES ROMAN TRADING POST & FORUM (Southwest) - Solid architecture, no pillar swaying!
    this.add.image(22 * 16, 48 * 16, 'roman_trader_canopy').setOrigin(0.5, 0.9).setDepth(48 * 16);
    this.add.image(26 * 16, 50 * 16, 'roman_forum_market').setOrigin(0.5, 0.9).setDepth(50 * 16);

    // 5. SACRED MOOR & SANCTUARY OF NERTHUS (East)
    this.add.image(74 * 16, 42 * 16, 'sacrificial_altar_carved').setOrigin(0.5, 0.9).setDepth(42 * 16);

    this.add.image(78 * 16, 40 * 16, 'carved_wooden_god_idol').setOrigin(0.5, 0.9).setDepth(40 * 16);
    this.add.image(70 * 16, 44 * 16, 'braak_totem_pole').setOrigin(0.5, 0.9).setDepth(44 * 16);

    const moorRuneB = this.add.image(76 * 16, 46 * 16, 'runestone_standing_blue').setOrigin(0.5, 0.9).setDepth(46 * 16);
    this.livingWorldManager.registerMysticalProp(moorRuneB);

    const moorRuneG = this.add.image(72 * 16, 46 * 16, 'runestone_standing_green').setOrigin(0.5, 0.9).setDepth(46 * 16);
    this.livingWorldManager.registerMysticalProp(moorRuneG);

    this.add.image(80 * 16, 44 * 16, 'herbs_medicinal_table').setOrigin(0.5, 0.9).setDepth(44 * 16);

    // 6. KALKRIESE PASS & TURF RAMPART (Northeast)
    this.add.image(78 * 16, 18 * 16, 'rasensodenwall_kalkriese').setOrigin(0.5, 0.9).setDepth(18 * 16);
    this.add.image(82 * 16, 18 * 16, 'weapon_rack_spears').setOrigin(0.5, 0.9).setDepth(18 * 16);

    // 7. LIMES WATCHTOWER & PALISADE (Southwest Frontier)
    this.add.image(24 * 16, 64 * 16, 'limes_watchtower_wood').setOrigin(0.5, 0.9).setDepth(64 * 16);
    this.add.image(20 * 16, 66 * 16, 'limes_palisade_barrier').setOrigin(0.5, 0.9).setDepth(66 * 16);
    this.add.image(28 * 16, 66 * 16, 'limes_palisade_barrier').setOrigin(0.5, 0.9).setDepth(66 * 16);

    // 8. FOEDERATI SETTLEMENT AT THE RHINE (Southeast)
    this.add.image(58 * 16, 66 * 16, 'roman_praetorium_red').setOrigin(0.5, 0.9).setDepth(66 * 16);
    this.add.image(54 * 16, 68 * 16, 'scutum_shield_line').setOrigin(0.5, 0.9).setDepth(68 * 16);

    const vexillum = this.add.image(62 * 16, 68 * 16, 'legion_aquila_vexillum').setOrigin(0.5, 0.9).setDepth(68 * 16);
    this.livingWorldManager.registerBanner(vexillum);

    // 9. Resource Sparkle Hotspots
    this.livingWorldManager.registerResourceHotspot(30 * 16, 22 * 16); // Spelz
    this.livingWorldManager.registerResourceHotspot(30 * 16, 34 * 16); // Heu
    this.livingWorldManager.registerResourceHotspot(52 * 16, 36 * 16); // Erz
    this.livingWorldManager.registerResourceHotspot(52 * 16, 32 * 16); // Kohle
    this.livingWorldManager.registerResourceHotspot(18 * 16, 36 * 16); // Bernstein
    this.livingWorldManager.registerResourceHotspot(74 * 16, 20 * 16); // Rasensode
  }

  // =========================================================================
  // DYNAMIC CHAPTER ENTITIES & MENTORS
  // =========================================================================
  private rebuildChapterEntities(): void {
    this.dynamicGroup.clear(true, true);
    this.targets = [];

    const ch = gameState.chapter;
    const mData = this.mentorCoords[ch];

    // 1. Current Chapter Mentor
    if (mData) {
      this.mentorSprite = this.add
        .sprite(mData.x * 16, mData.y * 16, mData.id, 0)
        .setDepth(mData.y * 16);
      this.dynamicGroup.add(this.mentorSprite);

      this.targets.push({
        id: 'current_mentor',
        kind: 'mentor',
        name: mData.name,
        sub: 'Kapitel-Aufgabe & Lehrdialog',
        x: mData.x * 16,
        y: mData.y * 16,
        minChapter: ch,
      });

      if (this.livingWorldManager) {
        this.livingWorldManager.clearMentors();
        this.livingWorldManager.registerMentor(this.mentorSprite);
      }
    }

    // 2. Resource Harvest Sites
    this.targets.push({
      id: 'res_spelz',
      kind: 'resource',
      name: 'Spelzweizen-Acker',
      sub: '[E] Ähren für die Sippe ernten',
      x: 30 * 16,
      y: 22 * 16,
      minChapter: 1,
      itemId: 'spelzweizen',
    });

    this.targets.push({
      id: 'res_heuballen',
      kind: 'resource',
      name: 'Wiesen-Heulager',
      sub: '[E] Trockenes Heu für die Weidetiere',
      x: 30 * 16,
      y: 34 * 16,
      minChapter: 1,
      itemId: 'heuballen',
    });

    this.targets.push({
      id: 'res_erz',
      kind: 'resource',
      name: 'Raseneisenerz-Moorlager',
      sub: '[E] Rostbraunes Moorerz stechen',
      x: 52 * 16,
      y: 36 * 16,
      minChapter: 2,
      itemId: 'raseneisenerz',
    });

    this.targets.push({
      id: 'res_kohle',
      kind: 'resource',
      name: 'Köhler-Meiler',
      sub: '[E] Reine Holzkohle entnehmen',
      x: 52 * 16,
      y: 32 * 16,
      minChapter: 2,
      itemId: 'holzkohle',
    });

    this.targets.push({
      id: 'res_bernstein',
      kind: 'resource',
      name: 'Bernstein-Flussufer',
      sub: '[E] Goldgelbes Harz am Ufer keschern',
      x: 18 * 16,
      y: 36 * 16,
      minChapter: 3,
      itemId: 'bernstein',
    });

    this.targets.push({
      id: 'res_rasensode',
      kind: 'resource',
      name: 'Rasensoden-Abstich',
      sub: '[E] Grassoden für den Wehrwall stechen',
      x: 74 * 16,
      y: 20 * 16,
      minChapter: 6,
      itemId: 'rasensode',
    });

    // 3. Archaeological Relics (5 Historical artifacts on map)
    GERMAN_RELICS.forEach((rel) => {
      if (ch >= rel.minChapter && !gameState.discoveredRelics.has(rel.id)) {
        // Glowing archaeological relic site marker
        const sparkle = this.add
          .image(rel.x * 16, rel.y * 16, 'relic_marker_glow')
          .setOrigin(0.5, 0.8)
          .setScale(0.85)
          .setDepth(rel.y * 16);
        this.dynamicGroup.add(sparkle);

        this.tweens.add({
          targets: sparkle,
          y: rel.y * 16 - 3,
          alpha: 0.85,
          scale: 0.95,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });

        this.targets.push({
          id: rel.id,
          kind: 'relic',
          name: rel.name,
          sub: '[E] Archäologisches Relikt bergen & Quiz',
          x: rel.x * 16,
          y: rel.y * 16,
          minChapter: rel.minChapter,
          relic: rel,
        });
      }
    });

    // 4. Construction Plots (Taste B)
    GERMAN_BUILDINGS.forEach((b) => {
      if (ch >= b.unlockedEpoch && !gameState.builtBuildings.has(b.id)) {
        this.targets.push({
          id: `plot_${b.id}`,
          kind: 'building_plot',
          name: b.name,
          sub: `[E] Bauvorhaben mit ${b.helperName}`,
          x: b.x * 16,
          y: b.y * 16,
          minChapter: b.unlockedEpoch,
          buildingId: b.id,
        });
      }
    });

    // 5. Chapter-Specific Interactive Quest Objectives (Ensures 100% playable quests without missing targets)
    if (ch === 1) {
      this.targets.push({
        id: 'pfahlspeicher_ch1',
        kind: 'interactive_quest',
        name: 'Pfahlspeicher (Erntelager)',
        sub: '[E] Pfahlspeicher inspizieren & Ernte sichern',
        x: 41 * 16,
        y: 17 * 16,
        minChapter: 1,
        questChapter: 1,
        questObjectiveIndex: 2,
        questMessage: '🌾 Pfahlspeicher inspiziert: Spelzweizen und Emmer lagern sicher vor Mäusen und Feuchte!',
      });
    } else if (ch === 2) {
      this.targets.push({
        id: 'rennofen_bellows_ch2',
        kind: 'interactive_quest',
        name: 'Rennofen-Schmelze',
        sub: '[E] Blasebalg bedienen & Schlacke ablassen',
        x: 48 * 16,
        y: 33 * 16,
        minChapter: 2,
        questChapter: 2,
        questObjectiveIndex: 2,
        questMessage: '🔥 Blasebalg bedient: Die Glut erreicht 1100°C – flüssige Schlacke rinnt heraus!',
      });
      this.targets.push({
        id: 'schmiede_forge_ch2',
        kind: 'interactive_quest',
        name: 'Schmiede-Werkstatt (Esse)',
        sub: '[E] Werkstatt öffnen & Fibel schmieden [C]',
        x: 46 * 16,
        y: 38 * 16,
        minChapter: 2,
        questChapter: 2,
        questObjectiveIndex: 3,
        questMessage: '⚒️ Schmiede geöffnet! Drücke Taste [C], um deine erste bronzene Fibel zu fertigen.',
      });
    } else if (ch === 3) {
      this.targets.push({
        id: 'waldgirmes_trader_ch3',
        kind: 'interactive_quest',
        name: 'Römischer Handelsstand',
        sub: '[E] Handel öffnen & Terra Sigillata tauschen [T]',
        x: 22 * 16,
        y: 48 * 16,
        minChapter: 3,
        questChapter: 3,
        questObjectiveIndex: 1,
        questMessage: '🏺 Handelsstand erreicht! Drücke Taste [T], um Bernstein gegen Terra Sigillata zu tauschen.',
      });
      this.targets.push({
        id: 'roman_denarii_ch3',
        kind: 'interactive_quest',
        name: 'Römische Geldkiste',
        sub: '[E] Augustus-Denare begutachten',
        x: 24 * 16,
        y: 50 * 16,
        minChapter: 3,
        questChapter: 3,
        questObjectiveIndex: 2,
        questMessage: '🪙 Augustus-Denare untersucht: Reines Silber mit Porträt des Kaisers aus Rom!',
      });
      this.targets.push({
        id: 'waldgirmes_forum_ch3',
        kind: 'interactive_quest',
        name: 'Forum von Waldgirmes',
        sub: '[E] Römerstadt Waldgirmes kartieren',
        x: 26 * 16,
        y: 50 * 16,
        minChapter: 3,
        questChapter: 3,
        questObjectiveIndex: 3,
        questMessage: '🏛️ Forum kartiert: Ein ziviles Verwaltungs- und Handelszentrum mitten im freien Germanien!',
      });
    } else if (ch === 4) {
      this.targets.push({
        id: 'thing_hasel_peace_ch4',
        kind: 'interactive_quest',
        name: 'Haselstangen-Waffengrenze',
        sub: '[E] Waffen ablegen (Thingfrieden)',
        x: 48 * 16,
        y: 54 * 16,
        minChapter: 4,
        questChapter: 4,
        questObjectiveIndex: 1,
        questMessage: '🗡️ Thingfrieden ausgerufen: Alle freien Männer haben ihre Klingen an den Haselstangen niedergelegt!',
      });
      this.targets.push({
        id: 'thing_witnesses_ch4',
        kind: 'interactive_quest',
        name: 'Zeugenbank am Thing',
        sub: '[E] Zeugenaussage zum Ochsendiebstahl anhören',
        x: 52 * 16,
        y: 54 * 16,
        minChapter: 4,
        questChapter: 4,
        questObjectiveIndex: 2,
        questMessage: '⚖️ Zeugenaussagen geprüft: Der Streit um die Zugochsen ist aufgeklärt!',
      });
      this.targets.push({
        id: 'thing_verdict_ch4',
        kind: 'interactive_quest',
        name: 'Thingstein (Richtplatz)',
        sub: '[E] Wergeld-Urteil anstimmen (Schildklirren)',
        x: 50 * 16,
        y: 54 * 16,
        minChapter: 4,
        questChapter: 4,
        questObjectiveIndex: 3,
        questMessage: '🛡️ Wergeld verkündet! Die Thingversammlung schlägt die Schilde – Urteil durch Akklamation bestätigt!',
      });
    } else if (ch === 5) {
      this.targets.push({
        id: 'moor_bohlenweg_ch5',
        kind: 'interactive_quest',
        name: 'Moor-Bohlenweg',
        sub: '[E] Eichenbohlen am Moorsteg befestigen',
        x: 68 * 16,
        y: 44 * 16,
        minChapter: 5,
        questChapter: 5,
        questObjectiveIndex: 1,
        questMessage: '🪵 Bohlenweg repariert: Der Holzsteg zur Opferplattform ist stabil und passierbar!',
      });
      this.targets.push({
        id: 'nerthus_altar_ch5',
        kind: 'interactive_quest',
        name: 'Opferaltar der Nerthus',
        sub: '[E] Votiv-Holzidol & Spelzweizen weihen',
        x: 74 * 16,
        y: 42 * 16,
        minChapter: 5,
        questChapter: 5,
        questObjectiveIndex: 2,
        questMessage: '🌿 Fruchtbarkeitsopfer dargebracht: Mutter Erde Nerthus ist gewogen!',
      });
      this.targets.push({
        id: 'futhark_runes_ch5',
        kind: 'interactive_quest',
        name: 'Futhark-Runenstein',
        sub: '[E] Zeichen des Älteren Futhark entziffern',
        x: 76 * 16,
        y: 44 * 16,
        minChapter: 5,
        questChapter: 5,
        questObjectiveIndex: 3,
        questMessage: 'ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ Runen entziffert: Fehu (Wohlstand), Uruz (Urkraft), Ansuz (Götterrat)!',
      });
    } else if (ch === 6) {
      this.targets.push({
        id: 'kalkriese_wall_ch6',
        kind: 'interactive_quest',
        name: 'Rasensodenwall Kalkriese',
        sub: '[E] Wall mit Grassoden verstärken',
        x: 78 * 16,
        y: 18 * 16,
        minChapter: 6,
        questChapter: 6,
        questObjectiveIndex: 1,
        questMessage: '🧱 Wall befestigt: Der Rasensodenwall am Engpass schützt die Krieger vor römischen Geschossen!',
      });
      this.targets.push({
        id: 'kalkriese_supplies_ch6',
        kind: 'interactive_quest',
        name: 'Sanitäts- & Proviantlager',
        sub: '[E] Trinkwasser & Wundsalben verteilen',
        x: 76 * 16,
        y: 18 * 16,
        minChapter: 6,
        questChapter: 6,
        questObjectiveIndex: 2,
        questMessage: '🩹 Nachschub gesichert: Trinkwasser und Kräutersalben versorgen die Sippenmitglieder!',
      });
    } else if (ch === 7) {
      this.targets.push({
        id: 'limes_barrier_ch7',
        kind: 'interactive_quest',
        name: 'Limes-Schlagbaum & Grenztor',
        sub: '[E] Zollerklärung & Passierschein prüfen',
        x: 22 * 16,
        y: 66 * 16,
        minChapter: 7,
        questChapter: 7,
        questObjectiveIndex: 1,
        questMessage: '📜 Zollkontrolle durchgeführt: Warenströme und Viehlieferungen sind registriert!',
      });
      this.targets.push({
        id: 'limes_signal_ch7',
        kind: 'interactive_quest',
        name: 'Wachturm-Signalposten',
        sub: '[E] Fackel- & Rauchsignal übermitteln',
        x: 24 * 16,
        y: 64 * 16,
        minChapter: 7,
        questChapter: 7,
        questObjectiveIndex: 2,
        questMessage: '📡 Signalfeuer entzündet: Die Kette der Wachtürme bestätigt die freie Grenze!',
      });
      this.targets.push({
        id: 'limes_brick_ch7',
        kind: 'interactive_quest',
        name: 'Legionsziegel-Lager',
        sub: '[E] Römischen Ziegelstempel entziffern',
        x: 28 * 16,
        y: 66 * 16,
        minChapter: 7,
        questChapter: 7,
        questObjectiveIndex: 3,
        questMessage: '🏛️ Stempel dokumentiert: LEG VIII AVG belegt die Bautätigkeit der 8. Legion!',
      });
    } else if (ch === 8) {
      this.targets.push({
        id: 'foederati_fibel_ch8',
        kind: 'interactive_quest',
        name: 'Goldene Runen-Bügelfibel',
        sub: '[E] Runeninschrift auf der Prachtfibel entziffern',
        x: 56 * 16,
        y: 68 * 16,
        minChapter: 8,
        questChapter: 8,
        questObjectiveIndex: 1,
        questMessage: '🦅 Runeninschrift dechiffriert: Das Bündniszeichen der Franken für Frieden und Treue!',
      });
      this.targets.push({
        id: 'rhine_pontoon_ch8',
        kind: 'interactive_quest',
        name: 'Rhein-Pontonbrücke',
        sub: '[E] Sippentreck über den Strom leiten',
        x: 62 * 16,
        y: 66 * 16,
        minChapter: 8,
        questChapter: 8,
        questObjectiveIndex: 2,
        questMessage: '🌊 Sippentreck geleitet: Familie und Vieh haben das Föderatengebiet sicher erreicht!',
      });
      this.targets.push({
        id: 'diploma_council_ch8',
        kind: 'interactive_quest',
        name: 'Föderaten-Praetorium',
        sub: '[E] Abschluss-Thing abhalten & Meisterdiplom öffnen [U]',
        x: 58 * 16,
        y: 66 * 16,
        minChapter: 8,
        questChapter: 8,
        questObjectiveIndex: 3,
        questMessage: '👑 Höchste Ehre der Sippe! Drücke [U], um dein Chronisten-Diplom zu bewundern!',
      });
    }
  }

  // =========================================================================
  // UPDATE LOOP & SINGLE-PROXIMITY INTERACTION (< 44px)
  // =========================================================================
  update(time: number, delta: number): void {
    gameState.playTimeSeconds += delta / 1000;
    const isMoving = this.handleMovement(delta);
    this.wildlifeManager.update(delta, this.player.x, this.player.y);
    this.livingWorldManager.update(delta, this.player.x, this.player.y, isMoving);
    this.updateInteractiveProximity();
    this.updateQuestCompass();
  }

  private handleMovement(delta: number): boolean {
    let vx = 0;
    let vy = 0;
    const speed = 88; // Crisp 16-Bit walking speed

    const left = this.cursors.left.isDown || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;
    const up = this.cursors.up.isDown || this.wasd.W.isDown;
    const down = this.cursors.down.isDown || this.wasd.S.isDown;

    if (left) vx -= speed;
    if (right) vx += speed;
    if (up) vy -= speed;
    if (down) vy += speed;

    const charKey = gameState.gender === 'female' ? 'player_alrun' : 'player_folkmar';
    const isMoving = vx !== 0 || vy !== 0;

    if (isMoving) {
      if (vx < 0) this.facing = 'left';
      else if (vx > 0) this.facing = 'right';
      else if (vy < 0) this.facing = 'up';
      else if (vy > 0) this.facing = 'down';

      this.player.anims.play(`${charKey}_walk_${this.facing}`, true);

      // Footstep timing & sound
      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        sound.playClick();
        this.stepTimer = 340;
      }

      // Check map boundary & water collisions
      const nextX = Phaser.Math.Clamp(this.player.x + (vx * delta) / 1000, 16, (this.mapW - 1) * 16);
      const nextY = Phaser.Math.Clamp(this.player.y + (vy * delta) / 1000, 16, (this.mapH - 1) * 16);

      const tx = Math.floor(nextX / 16);
      const ty = Math.floor(nextY / 16);

      if (!this.isWaterTile(tx, ty)) {
        const stepDist = Math.hypot(nextX - this.player.x, nextY - this.player.y);
        // 1 tile (16px) = ~1.6m, so 0.1m per pixel
        gameState.walkedDistanceMeters += stepDist * 0.1;

        this.player.x = nextX;
        this.player.y = nextY;
        this.player.setDepth(this.player.y);
        gameState.playerX = this.player.x;
        gameState.playerY = this.player.y;
      }
    } else {
      this.player.anims.play(`${charKey}_idle_${this.facing}`, true);
    }

    return isMoving;
  }

  private updateInteractiveProximity(): void {
    let closestTarget: InteractiveTarget | null = null;
    let minDist = 44; // Proximity threshold strictly < 44px

    for (const t of this.targets) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y);
      if (d < minDist) {
        minDist = d;
        closestTarget = t;
      }
    }

    this.activeTarget = closestTarget;
    this.renderDOMInteractiveLabel(closestTarget);

    // Check interaction key [E]
    if (Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
      this.triggerActiveInteraction();
    }
  }

  public triggerActiveInteraction(): void {
    if (!this.activeTarget) return;
    const t = this.activeTarget;
    const ui = this.scene.get('UI') as any;

    if (t.kind === 'mentor') {
      sound.playClick();
      // Speaking with mentor marks objective 0
      gameState.setObjective(gameState.chapter, 0, true);
      ui?.showMentorDialog(gameState.chapter);
    } else if (t.kind === 'resource' && t.itemId) {
      sound.playCollect();
      gameState.addItem(t.itemId, 2);
      // Fulfill objective if relevant
      if (gameState.chapter === 1 && (t.itemId === 'spelzweizen' || t.itemId === 'heuballen')) {
        gameState.setObjective(1, 1, true);
      } else if (gameState.chapter === 2 && t.itemId === 'raseneisenerz') {
        gameState.setObjective(2, 0, true);
      } else if (gameState.chapter === 2 && t.itemId === 'holzkohle') {
        gameState.setObjective(2, 1, true);
      } else if (gameState.chapter === 3 && t.itemId === 'bernstein') {
        gameState.setObjective(3, 0, true);
      } else if (gameState.chapter === 6 && t.itemId === 'rasensode') {
        gameState.setObjective(6, 1, true);
      }
      ui?.showNotification(`+2 ${GERMAN_ITEMS[t.itemId].name} erhalten!`);
    } else if (t.kind === 'interactive_quest') {
      sound.playQuest();
      if (t.questChapter !== undefined && t.questObjectiveIndex !== undefined) {
        gameState.setObjective(t.questChapter, t.questObjectiveIndex, true);
      }
      if (t.questMessage) {
        ui?.showNotification(t.questMessage);
      }
    } else if (t.kind === 'relic' && t.relic) {
      sound.playRelic();
      ui?.showRelicQuizModal(t.relic);
    } else if (t.kind === 'building_plot' && t.buildingId) {
      sound.playCraft();
      ui?.showBuildingModal(t.buildingId);
    }
  }

  // =========================================================================
  // REALTIME QUEST COMPASS / RADAR (8-POINT DIRECTION & METERS DISTANCE)
  // =========================================================================
  private updateQuestCompass(): void {
    const ch = gameState.chapter;
    const objs = gameState.chapterObjectives[ch] || [false, false, false, false];
    const activeIdx = objs.findIndex((done) => !done);

    let targetX = 0;
    let targetY = 0;
    let label = '';
    let actionTip = '(drücke E)';

    const mentor = this.mentorCoords[ch];

    if (activeIdx === -1) {
      // All 4 objectives done! Head to mentor for quiz!
      if (mentor) {
        targetX = mentor.x * 16;
        targetY = mentor.y * 16;
        label = mentor.name;
        actionTip = '(Kapitel-Quiz starten!)';
        gameState.activeObjectiveText = `Alle Aufgaben gemeistert! Sprich mit ${mentor.name} für das Kapitel-Quiz (E).`;
      }
    } else {
      const chData = CHAPTERS.find((c) => c.id === ch) || CHAPTERS[0];
      gameState.activeObjectiveText = chData.hints[activeIdx] || chData.questDescription;

      const t = this.getObjectiveTargetCoords(ch, activeIdx);
      if (t) {
        targetX = t.x;
        targetY = t.y;
        label = t.name;
        if (t.actionTip) actionTip = t.actionTip;
      } else if (mentor) {
        targetX = mentor.x * 16;
        targetY = mentor.y * 16;
        label = mentor.name;
      }
    }

    if (!targetX && !targetY) {
      gameState.compassText = '';
      return;
    }

    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const distPx = Math.hypot(dx, dy);

    if (distPx < 32) {
      gameState.compassText = `📍 Ziel direkt vor dir: ${label} ${actionTip}`;
      return;
    }

    const meters = Math.max(2, Math.round(distPx / 8));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, 0 = Ost, -90 = Nord, 90 = Süd

    let dirStr = '→ Osten';
    if (angle >= -112.5 && angle < -67.5) dirStr = '↑ Norden';
    else if (angle >= -67.5 && angle < -22.5) dirStr = '↗ Nordosten';
    else if (angle >= -22.5 && angle < 22.5) dirStr = '→ Osten';
    else if (angle >= 22.5 && angle < 67.5) dirStr = '↘ Südosten';
    else if (angle >= 67.5 && angle < 112.5) dirStr = '↓ Süden';
    else if (angle >= 112.5 && angle < 157.5) dirStr = '↙ Südwesten';
    else if (angle >= -157.5 && angle < -112.5) dirStr = '↖ Nordwesten';
    else dirStr = '← Westen';

    gameState.compassText = `🧭 ${label}: ${dirStr} (${meters} m)`;
  }

  private getObjectiveTargetCoords(
    ch: number,
    objIdx: number
  ): { x: number; y: number; name: string; actionTip?: string } | null {
    if (ch === 1) {
      if (objIdx === 0) return { x: 34 * 16, y: 30 * 16, name: 'Walburg (Dorfplatz)' };
      if (objIdx === 1) return { x: 30 * 16, y: 34 * 16, name: 'Wiesen-Heulager' };
      if (objIdx === 2) return { x: 41 * 16, y: 17 * 16, name: 'Pfahlspeicher (Erntelager)' };
      if (objIdx === 3) return { x: 28 * 16, y: 21 * 16, name: 'Eiserne Pflugschar (Acker)' };
    } else if (ch === 2) {
      if (objIdx === 0) return { x: 52 * 16, y: 36 * 16, name: 'Raseneisenerz-Moorlager' };
      if (objIdx === 1) return { x: 52 * 16, y: 32 * 16, name: 'Köhler-Meiler' };
      if (objIdx === 2) return { x: 48 * 16, y: 33 * 16, name: 'Rennofen-Schmelze' };
      if (objIdx === 3) return { x: 46 * 16, y: 38 * 16, name: 'Schmiede-Werkstatt', actionTip: '(drücke C)' };
    } else if (ch === 3) {
      if (objIdx === 0) return { x: 22 * 16, y: 50 * 16, name: 'Marcus Licinius (Handelssteg)' };
      if (objIdx === 1) return { x: 22 * 16, y: 48 * 16, name: 'Römischer Handelsstand', actionTip: '(drücke T)' };
      if (objIdx === 2) return { x: 24 * 16, y: 50 * 16, name: 'Römische Geldkiste' };
      if (objIdx === 3) return { x: 26 * 16, y: 50 * 16, name: 'Forum von Waldgirmes' };
    } else if (ch === 4) {
      if (objIdx === 0) return { x: 50 * 16, y: 56 * 16, name: 'Gesetzessprecher Hagano' };
      if (objIdx === 1) return { x: 48 * 16, y: 54 * 16, name: 'Haselstangen (Thingfrieden)' };
      if (objIdx === 2) return { x: 52 * 16, y: 54 * 16, name: 'Zeugenbank am Thing' };
      if (objIdx === 3) return { x: 50 * 16, y: 54 * 16, name: 'Thingstein (Richtplatz)' };
    } else if (ch === 5) {
      if (objIdx === 0) return { x: 74 * 16, y: 44 * 16, name: 'Seherin Albruna' };
      if (objIdx === 1) return { x: 68 * 16, y: 44 * 16, name: 'Moor-Bohlenweg' };
      if (objIdx === 2) return { x: 74 * 16, y: 42 * 16, name: 'Opferaltar der Nerthus' };
      if (objIdx === 3) return { x: 76 * 16, y: 44 * 16, name: 'Futhark-Runenstein' };
    } else if (ch === 6) {
      if (objIdx === 0) return { x: 78 * 16, y: 20 * 16, name: 'Cheruskerfürst Arminius' };
      if (objIdx === 1) return { x: 78 * 16, y: 18 * 16, name: 'Rasensodenwall Kalkriese' };
      if (objIdx === 2) return { x: 76 * 16, y: 18 * 16, name: 'Sanitäts- & Proviantlager' };
      if (objIdx === 3) return { x: 80 * 16, y: 18 * 16, name: 'Kalkriese-Reitermaske' };
    } else if (ch === 7) {
      if (objIdx === 0) return { x: 24 * 16, y: 66 * 16, name: 'Auxiliarsoldat Flavus' };
      if (objIdx === 1) return { x: 22 * 16, y: 66 * 16, name: 'Limes-Schlagbaum & Zoll' };
      if (objIdx === 2) return { x: 24 * 16, y: 64 * 16, name: 'Wachturm-Signalposten' };
      if (objIdx === 3) return { x: 28 * 16, y: 66 * 16, name: 'Römischer Ziegelstempel' };
    } else if (ch === 8) {
      if (objIdx === 0) return { x: 58 * 16, y: 68 * 16, name: 'Frankenführer Chlodio' };
      if (objIdx === 1) return { x: 56 * 16, y: 68 * 16, name: 'Goldene Runen-Bügelfibel' };
      if (objIdx === 2) return { x: 62 * 16, y: 66 * 16, name: 'Rhein-Pontonbrücke' };
      if (objIdx === 3) return { x: 58 * 16, y: 66 * 16, name: 'Föderaten-Praetorium', actionTip: '(drücke U)' };
    }
    return null;
  }

  private renderDOMInteractiveLabel(target: InteractiveTarget | null): void {
    if (!this.labelLayer) return;

    if (!target) {
      this.labelLayer.innerHTML = '';
      return;
    }

    // Convert game world coords to screen DOM pixel coords
    const cam = this.cameras.main;
    const screenX = (target.x - cam.scrollX) * cam.zoom + this.scale.width / 2 - (cam.width * cam.zoom) / 2;
    const screenY = (target.y - cam.scrollY) * cam.zoom + this.scale.height / 2 - (cam.height * cam.zoom) / 2;

    this.labelLayer.innerHTML = `
      <div class="world-dom-label" style="left: ${screenX}px; top: ${screenY - 18}px;">
        <div class="world-dom-label-title">${target.name}</div>
        <div class="world-dom-label-sub">${target.sub}</div>
      </div>
    `;
  }
}
