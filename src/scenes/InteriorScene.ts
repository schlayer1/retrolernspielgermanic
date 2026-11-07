import Phaser from 'phaser';
import { gameState } from '../systems/GameState';
import { sound } from '../audio/sound';
import { STATIONS } from '../data/stations';
import { GERMAN_RELICS } from '../data/relics';

export type InteriorRoomId = 'langhaus_sippe' | 'eisenschmiede_rennofen' | 'limes_handelsstation';

export interface InteriorInitData {
  buildingId?: InteriorRoomId;
  roomId?: InteriorRoomId;
  buildingName?: string;
  title?: string;
  subtitle?: string;
  mentorId?: string;
  mentorName?: string;
  returnX: number;
  returnY: number;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  speaker: string;
  text: string;
  action?: () => void;
}

export class InteriorScene extends Phaser.Scene {
  private initData!: InteriorInitData;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    ESC: Phaser.Input.Keyboard.Key;
  };
  private hotspots: Hotspot[] = [];
  private exitMat!: { x: number; y: number; w: number; h: number };
  private isExiting = false;
  private stepCooldown = 0;
  private domOverlay?: HTMLDivElement;

  constructor() {
    super({ key: 'InteriorScene' });
  }

  public init(data: InteriorInitData): void {
    const bId = data?.roomId || data?.buildingId || 'langhaus_sippe';
    this.initData = {
      buildingId: bId,
      roomId: bId,
      title: data?.title || this.getRoomTitle(bId),
      subtitle: data?.subtitle || 'Freies Germanien · Sippenverband & Alltagsleben',
      returnX: data?.returnX ?? 34 * 16,
      returnY: data?.returnY ?? 30 * 16,
    };
    this.hotspots = [];
    this.isExiting = false;
  }

  public create(): void {
    const ROOM_W = 352;
    const ROOM_H = 208;
    const CX = 240;
    const CY = 140;
    const LEFT = CX - ROOM_W / 2;
    const TOP = CY - ROOM_H / 2;

    this.cameras.main.setBackgroundColor('#100b07');

    document.getElementById('interior-dom-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'interior-dom-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:25;font-family:system-ui,sans-serif;';
    document.body.appendChild(overlay);
    this.domOverlay = overlay;

    const addDomTag = (
      rx: number,
      ry: number,
      text: string,
      bg = 'rgba(28,18,10,0.92)',
      border = '#d4af37',
      color = '#fef08a'
    ) => {
      const el = document.createElement('div');
      const pctX = (rx / 480) * 100;
      const pctY = (ry / 270) * 100;
      el.style.cssText = `
        position:absolute;left:${pctX}%;top:${pctY}%;transform:translate(-50%,-50%);
        background:${bg};border:1.5px solid ${border};color:${color};
        padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800;
        white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.7);
      `;
      el.textContent = text;
      overlay.appendChild(el);
    };

    // Header Banner
    const headerBanner = document.createElement('div');
    headerBanner.style.cssText = `
      position:absolute;left:50%;top:11%;transform:translate(-50%,-50%);
      background:linear-gradient(180deg,rgba(45,30,18,0.95),rgba(20,13,8,0.95));
      border:2px solid #d4af37;border-radius:8px;padding:4px 14px;text-align:center;
      box-shadow:0 4px 14px rgba(0,0,0,0.8);
    `;
    const roomTitle =
      this.initData.title || this.getRoomTitle(this.initData.buildingId || 'langhaus_sippe');
    headerBanner.innerHTML = `
      <div style="color:#fde047;font-size:13px;font-weight:900;letter-spacing:0.4px;">🏛️ ${roomTitle}</div>
      <div style="color:#e8dec5;font-size:10.5px;font-weight:700;">Die Germanen · Innenraum · [E] Interagieren · [ESC] Verlassen</div>
    `;
    overlay.appendChild(headerBanner);

    const g = this.add.graphics();
    g.fillStyle(0x1a120b, 1);
    g.fillRect(LEFT - 10, TOP - 10, ROOM_W + 20, ROOM_H + 20);

    // Warm timber & loam floor
    for (let y = TOP; y < TOP + ROOM_H; y += 16) {
      for (let x = LEFT; x < LEFT + ROOM_W; x += 16) {
        const alt = ((x + y) / 16) % 2 === 0;
        g.fillStyle(alt ? 0x8c633b : 0x7a522e, 1);
        g.fillRect(x, y, 16, 16);
        g.lineStyle(1, 0x472f1a, 0.25);
        g.strokeRect(x, y, 16, 16);
      }
    }

    // Wooden wall header frieze
    g.fillStyle(0x3e2413, 1);
    g.fillRect(LEFT, TOP, ROOM_W, 34);
    g.fillStyle(0xb45309, 0.6);
    g.fillRect(LEFT, TOP + 30, ROOM_W, 4);
    g.lineStyle(3, 0xd4af37, 0.9);
    g.strokeRect(LEFT, TOP, ROOM_W, ROOM_H);

    // Central runner carpet
    g.fillStyle(0x5a2310, 0.9);
    g.fillRect(CX - 22, TOP + 36, 44, ROOM_H - 44);
    g.lineStyle(2, 0xd4af37, 0.85);
    g.strokeRect(CX - 22, TOP + 36, 44, ROOM_H - 44);

    // 4 Corner Torches / Hearth Fires
    const torchCoords = [
      [LEFT + 46, TOP + 44],
      [LEFT + ROOM_W - 46, TOP + 44],
      [LEFT + 46, TOP + ROOM_H - 22],
      [LEFT + ROOM_W - 46, TOP + ROOM_H - 22],
    ];
    for (const [tx, ty] of torchCoords) {
      const glow = this.add.circle(tx, ty, 30, 0xf59e0b, 0.22).setDepth(2);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.14, to: 0.32 },
        scale: { from: 0.92, to: 1.1 },
        duration: 800 + Math.random() * 300,
        yoyo: true,
        repeat: -1,
      });
    }

    this.buildRoomProps(this.initData.buildingId || 'langhaus_sippe', CX, CY, LEFT, TOP, ROOM_W, ROOM_H, addDomTag);

    // Exit mat at bottom
    this.exitMat = { x: CX, y: TOP + ROOM_H - 14, w: 56, h: 18 };
    g.fillStyle(0x991b1b, 1);
    g.fillRect(this.exitMat.x - 26, this.exitMat.y - 8, 52, 14);
    g.lineStyle(1.5, 0xfde047, 1);
    g.strokeRect(this.exitMat.x - 26, this.exitMat.y - 8, 52, 14);
    addDomTag(
      this.exitMat.x,
      this.exitMat.y + 12,
      '🚪 Ausgang zur Oberwelt (E / ESC)',
      'rgba(127,29,29,0.92)',
      '#fca5a5',
      '#fef2f2'
    );

    // Player (16x32 at scale 1.0)
    const texKey = gameState.gender === 'female' ? 'player_alrun' : 'player_folkmar';
    this.player = this.physics.add
      .sprite(CX, TOP + ROOM_H - 42, texKey, 0)
      .setScale(1.0)
      .setDepth(TOP + ROOM_H - 42)
      .setCollideWorldBounds(true);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 10).setOffset(2, 22);

    this.physics.world.setBounds(LEFT + 14, TOP + 36, ROOM_W - 28, ROOM_H - 44);

    this.cameras.main.setZoom(1.0);
    this.cameras.main.centerOn(CX, CY);
    this.cameras.main.fadeIn(220, 0, 0, 0);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D,
        E: Phaser.Input.Keyboard.KeyCodes.E,
        ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
      }) as typeof this.wasd;
    }

    this.events.once('shutdown', () => {
      document.getElementById('interior-dom-overlay')?.remove();
    });
  }

  private getRoomTitle(id: string): string {
    switch (id) {
      case 'eisenschmiede_rennofen':
        return 'Eisenschmiede am Rennofen';
      case 'limes_handelsstation':
        return 'Römisch-Germanische Limes-Handelsstation';
      default:
        return 'Germanisches Wohnstallhaus (Langhaus der Sippe)';
    }
  }

  private buildRoomProps(
    id: string,
    cx: number,
    _cy: number,
    left: number,
    top: number,
    w: number,
    h: number,
    addDomTag: (rx: number, ry: number, text: string, bg?: string, border?: string, color?: string) => void
  ): void {
    if (id === 'eisenschmiede_rennofen') {
      // Forge & Anvil room
      if (this.textures.exists('anvil_and_forge')) {
        this.add.image(cx, top + 52, 'anvil_and_forge').setScale(0.85).setDepth(top + 52);
      }
      if (this.textures.exists('rennofen_clay_smelter')) {
        this.add.image(left + 78, top + 80, 'rennofen_clay_smelter').setScale(0.75).setDepth(top + 80);
      }
      if (this.textures.exists('weapon_rack_spears')) {
        this.add.image(left + w - 78, top + 80, 'weapon_rack_spears').setScale(0.8).setDepth(top + 80);
      }

      this.add.sprite(cx, top + 68, 'npc_sindolf', 0).setScale(1.0).setDepth(top + 68);
      addDomTag(cx, top + 46, '🔨 Dorfschmied Sindolf (E)', 'rgba(45,26,10,0.92)', '#fde047', '#fde047');
      addDomTag(left + 78, top + 58, '🔥 Rennofen (E)');
      addDomTag(left + w - 78, top + 58, '⚔️ Waffenständer (E)');

      this.hotspots.push(
        {
          id: 'mentor_sindolf',
          x: cx,
          y: top + 70,
          label: 'Dorfschmied Sindolf ansprechen (E)',
          speaker: 'Sindolf – Der Schmiedemeister',
          text: 'Sei gegrüßt in meiner Schmiede! Mit Buchenholzkohle treiben wir den Rennofen auf 1100 Grad, bis das Raseneisenerz zur teigigen Luppe schmilzt.',
        },
        {
          id: 'station_rennofen_hotspot',
          x: left + 78,
          y: top + 80,
          label: 'Rennofen-Schmelzstation starten (E)',
          speaker: 'Rennofen am Bachlauf',
          text: 'Hier wird Raseneisenerz mit Holzkohle geschichtet.',
          action: () => {
            const st = STATIONS.find((s) => s.id === 'station_rennofen');
            const win = window as any;
            if (win.__openStation && st) win.__openStation(st.id);
          },
        },
        {
          id: 'relic_fibel_hotspot',
          x: left + w - 78,
          y: top + 80,
          label: '360°-Quelleninspektor: Bronzene Rollenkappen-Fibel (E)',
          speaker: 'Werkbank des Bronzegießers',
          text: 'Kunstvolle Gewandfibel mit Scharnier.',
          action: () => {
            const rel = GERMAN_RELICS.find((r) => r.id === 'relic_rollenkappenfibel');
            const win = window as any;
            if (win.__openArtifactInspector && rel) win.__openArtifactInspector(rel.id);
          },
        }
      );
    } else if (id === 'limes_handelsstation') {
      // Roman-Germanic Border Station & Merchant Hall
      if (this.textures.exists('roman_trader_canopy')) {
        this.add.image(cx, top + 50, 'roman_trader_canopy').setScale(0.75).setDepth(top + 50);
      }
      if (this.textures.exists('herbs_medicinal_table')) {
        this.add.image(left + 78, top + 80, 'herbs_medicinal_table').setScale(0.8).setDepth(top + 80);
      }
      if (this.textures.exists('water_barrels_wood')) {
        this.add.image(left + w - 78, top + 80, 'water_barrels_wood').setScale(0.8).setDepth(top + 80);
      }

      this.add.sprite(cx, top + 68, 'npc_marcus', 0).setScale(1.0).setDepth(top + 68);
      addDomTag(cx, top + 46, '⚖️ Römischer Händler Marcus (E)', 'rgba(45,26,10,0.92)', '#fde047', '#fde047');
      addDomTag(left + 78, top + 58, '🏺 Terra Sigillata (E)');
      addDomTag(left + w - 78, top + 58, '⚖️ Handelswaage (E)');

      this.hotspots.push(
        {
          id: 'mentor_marcus',
          x: cx,
          y: top + 70,
          label: 'Händler Marcus ansprechen (E)',
          speaker: 'Marcus – Händler aus Mainz (Mogontiacum)',
          text: 'Salvete! Wir bringen feine Terra Sigillata, würzigen Falerner-Wein und gläserne Perlen aus dem Süden.',
        },
        {
          id: 'station_limes_hotspot',
          x: left + w - 78,
          y: top + 80,
          label: 'Handelswaage am Limes bedienen (E)',
          speaker: 'Römische Schnellwaage',
          text: 'Tauschwert von Bernstein und Fellen gegen Wein abwägen.',
          action: () => {
            const st = STATIONS.find((s) => s.id === 'station_limes_tausch');
            const win = window as any;
            if (win.__openStation && st) win.__openStation(st.id);
          },
        },
        {
          id: 'relic_terra_hotspot',
          x: left + 78,
          y: top + 80,
          label: '360°-Quelleninspektor: Terra-Sigillata-Bilderschüssel (E)',
          speaker: 'Römisches Luxusgeschirr',
          text: 'Glänzende rote Keramik aus Gallien.',
          action: () => {
            const rel = GERMAN_RELICS.find((r) => r.id === 'relic_terra_sigillata');
            const win = window as any;
            if (win.__openArtifactInspector && rel) win.__openArtifactInspector(rel.id);
          },
        }
      );
    } else {
      // Longhouse (Wohnstallhaus)
      if (this.textures.exists('cauldron_hanging_fire')) {
        this.add.image(cx, top + 50, 'cauldron_hanging_fire').setScale(0.85).setDepth(top + 50);
      }
      if (this.textures.exists('grain_quern_stone')) {
        this.add.image(left + 78, top + 80, 'grain_quern_stone').setScale(0.85).setDepth(top + 80);
      }
      if (this.textures.exists('pelt_drying_frame')) {
        this.add.image(left + w - 78, top + 80, 'pelt_drying_frame').setScale(0.8).setDepth(top + 80);
      }

      this.add.sprite(cx, top + 68, 'npc_walburg', 0).setScale(1.0).setDepth(top + 68);
      addDomTag(cx, top + 46, '👑 Sippenälteste Walburg (E)', 'rgba(45,26,10,0.92)', '#fde047', '#fde047');
      addDomTag(left + 78, top + 58, '🌾 Handmühle & Getreide (E)');
      addDomTag(left + w - 78, top + 58, '🌿 Webstuhl & Felle (E)');

      this.hotspots.push(
        {
          id: 'mentor_walburg',
          x: cx,
          y: top + 70,
          label: 'Sippenälteste Walburg ansprechen (E)',
          speaker: 'Walburg – Sippenälteste',
          text: 'Willkommen am Herdfeuer unseres Langhauses! Hier leben Mensch und Vieh friedlich unter einem Reetdach.',
        },
        {
          id: 'station_langhaus_hotspot',
          x: left + w - 78,
          y: top + 80,
          label: 'Wohnstallhaus-Konstruktion erkunden (E)',
          speaker: 'Balkengerüst des Langhauses',
          text: 'Konstruktion von Pfosten und Reetdach.',
          action: () => {
            const st = STATIONS.find((s) => s.id === 'station_langhaus');
            const win = window as any;
            if (win.__openStation && st) win.__openStation(st.id);
          },
        },
        {
          id: 'station_ackerbau_hotspot',
          x: left + 78,
          y: top + 80,
          label: 'Dreifelder-Fruchtfolge & Handmühle prüfen (E)',
          speaker: 'Getreidelager der Sippe',
          text: 'Emmer und Einkorn für den Sippenbrei mahlen.',
          action: () => {
            const st = STATIONS.find((s) => s.id === 'station_ackerbau');
            const win = window as any;
            if (win.__openStation && st) win.__openStation(st.id);
          },
        }
      );
    }
  }

  public update(_time: number, delta: number): void {
    if (!this.player || this.isExiting) {
      if (this.player?.body) (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      return;
    }

    if (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.ESC)) {
      this.exitToOverworld();
      return;
    }

    const speed = 105;
    let vx = 0;
    let vy = 0;

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vx = -speed;
    else if (this.cursors?.right.isDown || this.wasd?.D.isDown) vx = speed;

    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vy = -speed;
    else if (this.cursors?.down.isDown || this.wasd?.S.isDown) vy = speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(vx, vy);
    this.player.setDepth(this.player.y);

    const charKey = gameState.gender === 'female' ? 'player_alrun' : 'player_folkmar';
    if (vx !== 0 || vy !== 0) {
      const dir = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      this.player.anims.play(`${charKey}_walk_${dir}`, true);
      this.stepCooldown -= delta;
      if (this.stepCooldown <= 0) {
        sound.playFootstep('wood');
        this.stepCooldown = 280;
      }
    } else {
      this.player.anims.stop();
    }

    let nearest: Hotspot | null = null;
    let minDist = 42;
    for (const h of this.hotspots) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, h.x, h.y);
      if (d < minDist) {
        minDist = d;
        nearest = h;
      }
    }

    const distExit = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitMat.x, this.exitMat.y);
    if (distExit < 26) {
      if (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        this.exitToOverworld();
      }
    } else if (nearest) {
      if (this.wasd && Phaser.Input.Keyboard.JustDown(this.wasd.E)) {
        sound.playClick();
        if (nearest.action) {
          nearest.action();
        } else {
          const ui = this.scene.get('UI') as any;
          if (ui?.showNotification) {
            ui.showNotification(`💬 ${nearest.speaker}: "${nearest.text}"`);
          }
        }
      }
    }
  }

  public exitToOverworld(): void {
    if (this.isExiting) return;
    this.isExiting = true;
    sound.playClick();
    document.getElementById('interior-dom-overlay')?.remove();

    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('InteriorScene');
      this.scene.wake('World');
      const worldScene = this.scene.get('World') as any;
      if (worldScene?.player) {
        worldScene.player.setPosition(this.initData.returnX, this.initData.returnY);
      }
      if (worldScene?.labelLayer) {
        worldScene.labelLayer.style.display = 'block';
      }
    });
  }
}
