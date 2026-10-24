import Phaser from 'phaser';
import { gameState } from '../systems/GameState';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // 1. World Atlases & Ground Tilesets
    this.load.atlas('world_atlas', '/assets/world/world_atlas.png', '/assets/world/world_atlas.json');
    this.load.image('ground_a2', '/assets/world/ground_a2.png');
    this.load.image('germanic_ground_a2', '/assets/world/germanic_ground_a2.png');
    this.load.image('overworld', '/assets/gfx/Overworld.png');
    this.load.image('objects', '/assets/gfx/objects.png');
    this.load.image('farm', '/assets/gfx/farm.png');
    this.load.image('cave_tiles', '/assets/gfx/cave.png');

    // 2. Player Characters (16x32 Spritesheets)
    this.load.spritesheet('player_folkmar', '/assets/gfx/npcs/player_folkmar.png', {
      frameWidth: 16,
      frameHeight: 32,
    });
    this.load.spritesheet('player_alrun', '/assets/gfx/npcs/player_alrun.png', {
      frameWidth: 16,
      frameHeight: 32,
    });

    this.load.spritesheet('dog_wolfhound', '/assets/fauna/dog_wolfhound.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // 3. Mentors & Historical Figures
    const mentorSheets = [
      'npc_walburg',
      'npc_sindolf',
      'npc_marcus',
      'npc_hagano',
      'npc_albruna',
      'npc_arminius',
      'npc_segestes',
      'npc_flavus',
      'npc_chlodio',
    ];
    mentorSheets.forEach((id) => {
      this.load.spritesheet(id, `/assets/gfx/npcs/${id}.png`, {
        frameWidth: 16,
        frameHeight: 32,
      });
    });

    // 4. Props & Structures
    const propKeys = [
      'langhaus_gable_hall',
      'germanic_round_hut',
      'germanic_large_hut',
      'pfahlspeicher_grain',
      'timber_watchtower',
      'palisade_wood_gate',
      'palisade_spikes_row',
      'cattle_pen_fence',
      'wagon_covered_cart',
      'wagon_open_cart',
      'haystack_large',
      'haystack_round',
      'water_barrels_wood',
      'beer_keg_cellar',
      'fauna_wisent_auerochse',
      'fauna_wisent_front',
      'fauna_sheep_flock',
      'fauna_lambs_group',
      'fauna_sheep_black',
      'fauna_sheep_white',
      'fauna_lamb_white',
      'fauna_lamb_brown',
      'fauna_goat_ram',
      'fauna_horse_brown',
      'fauna_horse_saddled',
      'fauna_horse_white',
      'rennofen_clay_smelter',
      'charcoal_meiler_smoke',
      'smithy_furnace_fire',
      'anvil_and_forge',
      'pelt_drying_frame',
      'grain_quern_stone',
      'wood_log_pile',
      'weapon_rack_spears',
      'cauldron_hanging_fire',
      'thing_stone_circle',
      'sacred_dolmen_portal',
      'menhir_pillar_large',
      'sacrificial_altar_carved',
      'carved_wooden_god_idol',
      'braak_totem_pole',
      'bohlenweg_timber_bridge',
      'sacred_fire_ring',
      'runestone_standing_blue',
      'runestone_standing_green',
      'herbs_medicinal_table',
      'roman_trader_canopy',
      'roman_forum_market',
      'limes_watchtower_wood',
      'roman_praetorium_red',
      'scutum_shield_line',
      'legion_aquila_vexillum',
      'rasensodenwall_kalkriese',
      'limes_palisade_barrier',
    ];
    propKeys.forEach((key) => {
      this.load.image(key, `/assets/props/${key}.png`);
    });

    // 5. Icons & Relics
    const iconKeys = [
      'wohnstallhaus',
      'sippe',
      'ackerbau_spelt',
      'auerochse',
      'raseneisenerz',
      'rennofen',
      'fibel',
      'schmiede_hammer',
      'bernstein',
      'terra_sigillata',
      'denar_augustus',
      'waldgirmes',
      'thing',
      'wergeld',
      'allmende',
      'heiliger_hain',
      'mooropfer',
      'seherin_voelva',
      'runen_futhark',
      'varusschlacht',
      'kalkriese',
      'rasensodenwall',
      'limes',
      'limes_wachturm',
      'vicus',
      'foederaten',
      'spaetantike',
      'relic_pflugschar',
      'relic_rollenkappenfibel',
      'relic_terra_sigillata',
      'relic_tacitus_germania',
      'relic_kalkriese_maske',
      'relic_marker_glow',
    ];
    iconKeys.forEach((k) => {
      this.load.image(`icon_${k}`, `/assets/icons/${k}.png`);
      this.load.image(k, `/assets/icons/${k}.png`);
    });
  }

  create() {
    this.createAnimations();

    // Start UI scene & World scene
    this.scene.start('World');
    this.scene.launch('UI');
  }

  private createAnimations(): void {
    const characters = [
      'player_folkmar',
      'player_alrun',
      'npc_walburg',
      'npc_sindolf',
      'npc_marcus',
      'npc_hagano',
      'npc_albruna',
      'npc_arminius',
      'npc_segestes',
      'npc_flavus',
      'npc_chlodio',
    ];

    characters.forEach((charKey) => {
      // 272x256 LPC format: 16x32 frame size, exactly 17 frames per row
      // Row 0: Down (start: 0), Row 1: Right (start: 17), Row 2: Up (start: 34), Row 3: Left (start: 51)
      const dirs = ['down', 'right', 'up', 'left'];
      dirs.forEach((dir, row) => {
        const start = row * 17;
        this.anims.create({
          key: `${charKey}_walk_${dir}`,
          frames: this.anims.generateFrameNumbers(charKey, { start, end: start + 3 }),
          frameRate: 8,
          repeat: -1,
        });
        this.anims.create({
          key: `${charKey}_idle_${dir}`,
          frames: [{ key: charKey, frame: start }],
          frameRate: 1,
        });
      });
    });

    // 🐾 Germanischer Wolfshund (dog_wolfhound)
    this.anims.create({ key: 'dog-wolfhound-idle', frames: [{ key: 'dog_wolfhound', frame: 0 }], frameRate: 1 });
    this.anims.create({ key: 'dog-wolfhound-walk-down', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'dog-wolfhound-walk-right', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 4, end: 7 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'dog-wolfhound-walk-up', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 8, end: 11 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'dog-wolfhound-sniff', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 12, end: 15 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'dog-wolfhound-sit', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 16, end: 19 }), frameRate: 3, repeat: -1 });
    this.anims.create({ key: 'dog-wolfhound-wag', frames: this.anims.generateFrameNumbers('dog_wolfhound', { start: 20, end: 23 }), frameRate: 5, repeat: -1 });
  }
}
