import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { InteriorScene } from './scenes/InteriorScene';
import { UIScene } from './scenes/UIScene';
import { gameState } from './systems/GameState';
import { CHAPTERS } from './data/chapters';
import { GERMAN_RELICS } from './data/relics';
import { STATIONS } from './data/stations';

// 16-Bit-Auflösung (16:9). Wird ganzzahlig-nah auf jedes Gerät skaliert.
export const GAME_W = 480;
export const GAME_H = 270;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_W,
  height: GAME_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#0a100d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, WorldScene, InteriorScene, UIScene],
};

const game = new Phaser.Game(config);

// Expose for automated browser verification & classroom inspection
const w = window as any;
w.game = game;
w.__GAME__ = game;
w.__GERM_GAME__ = game;
w.state = gameState;
w.__STATE__ = gameState;
w.__GERM_STATE__ = gameState;
w.__CHAPTERS = CHAPTERS;
w.__RELICS = GERMAN_RELICS;
w.__STATIONS = STATIONS;
