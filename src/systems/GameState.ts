import { GERMAN_BUILDINGS, GERMAN_ITEMS, GERMAN_RECIPES, GERMAN_TRADES, GermanItemId } from '../data/items';
import { PlayerGender, PlayerRole, SaveData, SaveManager } from './SaveManager';

export interface RoleDefinition {
  id: PlayerRole;
  name: string;
  tribalTitle: string;
  description: string;
  bonusText: string;
  icon: string;
}

export const GERMAN_ROLES: RoleDefinition[] = [
  {
    id: 'schmied',
    name: 'Erzsucher & Meisterschmied',
    tribalTitle: 'Schmiedemeister der Sippe',
    description:
      'Du kennst das Geheimnis der Rennöfen und spürst Raseneisenerz in jedem feuchten Moorboden auf.',
    bonusText: '+1 Bonus-Ertrag bei Raseneisenerz, Eisenluppen und Meiler-Holzkohle',
    icon: '/assets/icons/schmiede_hammer.png',
  },
  {
    id: 'kraeuterkundiger',
    name: 'Kräuterkundiger & Heiler',
    tribalTitle: 'Hüter der Heilkräuter & Herde',
    description:
      'Mit Salben, Spelzweizen und Ziegenmilch linderst du Schmerzen und sicherst die Ernährung der Sippe.',
    bonusText: '+1 Bonus-Ertrag bei Spelzweizen, Ziegenmilch, Heuballen und Heilkräutern',
    icon: '/assets/icons/seherin_voelva.png',
  },
  {
    id: 'gesetzessprecher',
    name: 'Gesetzessprecher & Händler',
    tribalTitle: 'Sprecher des Things & Gesandter',
    description:
      'Auf dem Thing schlichtest du Fehden mit dem Wergeld und verhandelst klug mit römischen Fernhändlern.',
    bonusText: '+1 Bonus-Ertrag bei Bernstein, Wergeld-Schätzen und Tauschgeschäften',
    icon: '/assets/icons/thing.png',
  },
];

type Listener = () => void;

export class GameState {
  public chapter = 1;
  public maxUnlockedChapter = 1;
  public completedChapters = new Set<number>();
  public inventory: Partial<Record<GermanItemId, number>> = {};
  public craftedOnce = new Set<GermanItemId>();
  public builtBuildings = new Set<string>();
  public quizPerfect = new Set<number>();
  public discoveredRelics = new Set<string>();
  public lexiconRead = new Set<string>();
  public visitedSanctuary = false;
  public playerX = 35 * 16;
  public playerY = 32 * 16;
  public questCompleted = false;
  public gender: PlayerGender = 'male';
  public role: PlayerRole = 'schmied';
  public playerName = 'Folkmar';
  public playTimeSeconds = 0;
  public walkedDistanceMeters = 0;

  // Chapter 4-point gating criteria tracking
  public chapterObjectives: Record<number, boolean[]> = {
    1: [false, false, false, false],
    2: [false, false, false, false],
    3: [false, false, false, false],
    4: [false, false, false, false],
    5: [false, false, false, false],
    6: [false, false, false, false],
    7: [false, false, false, false],
    8: [false, false, false, false],
  };

  private listeners: Listener[] = [];

  constructor() {
    this.initDefaultInventory();
  }

  private initDefaultInventory(): void {
    this.inventory = {
      spelzweizen: 4,
      ziegenmilch: 2,
      heuballen: 3,
      holz_bohle: 3,
      lehm_ton: 2,
    };
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public notify(): void {
    this.listeners.forEach((fn) => fn());
    this.saveGame();
  }

  public setObjective(ch: number, index: number, done = true): void {
    if (!this.chapterObjectives[ch]) {
      this.chapterObjectives[ch] = [false, false, false, false];
    }
    this.chapterObjectives[ch][index] = done;
    if (this.isChapterGatingComplete(ch)) {
      this.questCompleted = true;
    }
    this.notify();
  }

  public isChapterGatingComplete(ch: number): boolean {
    const objs = this.chapterObjectives[ch] || [false, false, false, false];
    return objs.every((v) => v === true);
  }

  public addItem(item: GermanItemId, amount = 1): void {
    let finalAmount = amount;
    // Apply role perks
    if (this.role === 'schmied' && (item === 'raseneisenerz' || item === 'eisenluppe' || item === 'holzkohle')) {
      finalAmount += 1;
    } else if (
      this.role === 'kraeuterkundiger' &&
      (item === 'spelzweizen' || item === 'ziegenmilch' || item === 'heuballen' || item === 'kraeuter_salbe')
    ) {
      finalAmount += 1;
    } else if (
      this.role === 'gesetzessprecher' &&
      (item === 'bernstein' || item === 'wergeld_schatz' || item === 'silber_denar')
    ) {
      finalAmount += 1;
    }

    const current = this.inventory[item] || 0;
    this.inventory[item] = current + finalAmount;
    this.notify();
  }

  public removeItem(item: GermanItemId, amount = 1): boolean {
    const current = this.inventory[item] || 0;
    if (current < amount) return false;
    this.inventory[item] = current - amount;
    if (this.inventory[item] === 0) {
      delete this.inventory[item];
    }
    this.notify();
    return true;
  }

  public getItemCount(item: GermanItemId): number {
    return this.inventory[item] || 0;
  }

  public canAfford(cost: Partial<Record<GermanItemId, number>>): boolean {
    return Object.entries(cost).every(([it, cnt]) => this.getItemCount(it as GermanItemId) >= (cnt || 0));
  }

  public spend(cost: Partial<Record<GermanItemId, number>>): boolean {
    if (!this.canAfford(cost)) return false;
    Object.entries(cost).forEach(([it, cnt]) => {
      this.removeItem(it as GermanItemId, cnt || 0);
    });
    this.notify();
    return true;
  }

  public unlockChapter(ch: number): void {
    if (ch > this.maxUnlockedChapter && ch <= 8) {
      this.maxUnlockedChapter = ch;
    }
    this.completedChapters.add(ch - 1);
    this.chapter = ch;
    this.questCompleted = false;
    this.notify();
  }

  public markQuizPerfect(ch: number): void {
    this.quizPerfect.add(ch);
    this.notify();
  }

  public markRelicDiscovered(id: string): void {
    this.discoveredRelics.add(id);
    this.notify();
  }

  public markLexiconRead(id: string): void {
    this.lexiconRead.add(id);
    this.notify();
  }

  public getMasterRank(): { rank: string; score: number; maxScore: number; title: string } {
    let score = 0;
    const maxScore = 8 * 10 + 5 * 10 + 27 * 2; // 8 chapters * 10 + 5 relics * 10 + 27 glossary * 2 = 184

    score += this.completedChapters.size * 10;
    score += this.discoveredRelics.size * 10;
    score += this.lexiconRead.size * 2;
    score += this.builtBuildings.size * 5;

    let rank = 'Bronze';
    let title = 'Freibauer der Sippe';

    const ratio = score / maxScore;
    if (ratio >= 0.88) {
      rank = 'S-Rang (Meister)';
      title = 'Oberster Gesetzessprecher & Meisterchronist';
    } else if (ratio >= 0.65) {
      rank = 'Gold';
      title = 'Stammesältester & Hüter des Wissens';
    } else if (ratio >= 0.4) {
      rank = 'Silber';
      title = 'Erfahrener Sippenbauer & Handwerker';
    }

    return { rank, score, maxScore, title };
  }

  public generateClassroomCode(): string {
    const chStr = String(this.chapter).padStart(2, '0');
    const relStr = String(this.discoveredRelics.size).padStart(2, '0');
    const lexStr = String(this.lexiconRead.size).padStart(2, '0');
    const initial = (this.playerName || 'X').substring(0, 2).toUpperCase();
    return `GERM-K${chStr}-${initial}-${relStr}-${lexStr}`;
  }

  public loadFromClassroomCode(code: string): boolean {
    const m = code.trim().toUpperCase().match(/^GERM-K(\d{2})-([A-Z]{1,3})-(\d{2})-(\d{2})$/);
    if (!m) return false;
    const ch = parseInt(m[1], 10);
    const relCount = parseInt(m[3], 10);
    const lexCount = parseInt(m[4], 10);

    if (ch >= 1 && ch <= 8) {
      this.chapter = ch;
      this.maxUnlockedChapter = Math.max(this.maxUnlockedChapter, ch);
      for (let i = 1; i < ch; i++) this.completedChapters.add(i);

      // Pre-mark mock relics and glossary entries if restored
      let rIdx = 0;
      const allRelics = ['relic_pflugschar', 'relic_rollenkappenfibel', 'relic_terra_sigillata', 'relic_tacitus_germania', 'relic_kalkriese_maske'];
      while (this.discoveredRelics.size < Math.min(relCount, allRelics.length)) {
        this.discoveredRelics.add(allRelics[rIdx++]);
      }
      this.notify();
      return true;
    }
    return false;
  }

  public saveGame(): void {
    const data: SaveData = {
      chapter: this.chapter,
      maxUnlockedChapter: this.maxUnlockedChapter,
      completedChapters: Array.from(this.completedChapters),
      inventory: this.inventory,
      craftedOnce: Array.from(this.craftedOnce),
      builtBuildings: Array.from(this.builtBuildings),
      playerX: this.playerX,
      playerY: this.playerY,
      quizPerfect: Array.from(this.quizPerfect),
      gender: this.gender,
      role: this.role,
      discoveredRelics: Array.from(this.discoveredRelics),
      lexiconRead: Array.from(this.lexiconRead),
      playerName: this.playerName,
      playTimeSeconds: this.playTimeSeconds,
      walkedDistanceMeters: this.walkedDistanceMeters,
    };
    SaveManager.save(data);
  }

  public loadGame(): boolean {
    const data = SaveManager.load();
    if (!data) return false;

    this.chapter = data.chapter || 1;
    this.maxUnlockedChapter = data.maxUnlockedChapter || 1;
    this.completedChapters = new Set(data.completedChapters || []);
    this.inventory = data.inventory || {};
    this.craftedOnce = new Set(data.craftedOnce || []);
    this.builtBuildings = new Set(data.builtBuildings || []);
    this.playerX = data.playerX || 35 * 16;
    this.playerY = data.playerY || 32 * 16;
    this.quizPerfect = new Set(data.quizPerfect || []);
    this.gender = data.gender || 'male';
    this.role = data.role || 'schmied';
    this.discoveredRelics = new Set(data.discoveredRelics || []);
    this.lexiconRead = new Set(data.lexiconRead || []);
    this.playerName = data.playerName || 'Folkmar';
    this.playTimeSeconds = data.playTimeSeconds || 0;
    this.walkedDistanceMeters = data.walkedDistanceMeters || 0;
    return true;
  }
}

export const gameState = new GameState();
