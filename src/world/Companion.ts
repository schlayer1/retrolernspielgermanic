/**
 * Secret-of-Evermore Begleiter-KI (Companion.ts)
 * Verwaltet den treuen Tierbegleiter des Spielers (Germanischer Wolfshund 'Bran').
 */

import Phaser from 'phaser';
import { sound } from '../audio/sound';

export interface CompanionConfig {
  key: string;              // 'dog_wolfhound'
  animPrefix?: string;      // 'dog-wolfhound'
  name: string;             // 'Bran'
  historicalBreed: string;  // 'Germanischer Wolfshund'
  unlockedChapter: number;
}

export class CompanionManager {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private config: CompanionConfig;
  private state: 'following' | 'idle' | 'sniffing' | 'petting' = 'following';
  private idleTimer: number = 0;
  private alertCooldown: number = 0;
  private isUnlocked: boolean = false;

  constructor(scene: Phaser.Scene, config: CompanionConfig) {
    this.scene = scene;
    this.config = config;
  }

  private get prefix(): string {
    return this.config.animPrefix || this.config.key;
  }

  public unlock(startX: number, startY: number): void {
    if (this.isUnlocked && this.sprite) return;
    this.isUnlocked = true;

    this.sprite = this.scene.add.sprite(startX, startY, this.config.key, 0)
      .setOrigin(0.5, 0.85)
      .setDepth(15);

    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', () => this.pet());

    console.log(`🐾 Begleiter aktiv: ${this.config.name} (${this.config.historicalBreed})`);
  }

  public getSprite(): Phaser.GameObjects.Sprite | null {
    return this.sprite;
  }

  public isAvailable(): boolean {
    return this.isUnlocked && !!this.sprite;
  }

  public getDistanceTo(x: number, y: number): number {
    if (!this.isUnlocked || !this.sprite) return Infinity;
    return Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, x, y);
  }

  public update(player: Phaser.GameObjects.Sprite, targets: any[], deltaMs: number): void {
    if (!this.isUnlocked || !this.sprite) return;

    const dog = this.sprite;
    const distToPlayer = Phaser.Math.Distance.Between(dog.x, dog.y, player.x, player.y);

    if (this.alertCooldown > 0) this.alertCooldown -= deltaMs;

    // 1. Spürsinn: Prüfe vergrabene Relikte / Schätze in der Nähe (< 60px)
    if (this.alertCooldown <= 0 && this.state !== 'petting' && targets) {
      for (const t of targets) {
        if (!t.discovered && (t.kind?.includes('relic') || t.kind?.includes('resource') || t.isRelic)) {
          const tx = t.x ?? t.sprite?.x;
          const ty = t.y ?? t.sprite?.y;
          if (tx !== undefined && ty !== undefined) {
            const distToTarget = Phaser.Math.Distance.Between(dog.x, dog.y, tx, ty);
            if (distToTarget < 58) {
              this.triggerAlert();
              return;
            }
          }
        }
      }
    }

    // 2. Folgen oder Rasten
    if (this.state === 'petting') return;

    if (distToPlayer > 32) {
      this.state = 'following';
      const angle = Phaser.Math.Angle.Between(dog.x, dog.y, player.x, player.y);
      const speed = distToPlayer > 80 ? 115 : 75;
      dog.x += Math.cos(angle) * speed * (deltaMs / 1000);
      dog.y += Math.sin(angle) * speed * (deltaMs / 1000);

      const deg = Phaser.Math.RadToDeg(angle);
      if (Math.abs(deg) < 45) {
        dog.setFlipX(false);
        this.playAnim(`${this.prefix}-walk-right`);
      } else if (Math.abs(deg) > 135) {
        dog.setFlipX(true);
        this.playAnim(`${this.prefix}-walk-right`);
      } else if (deg > 45 && deg <= 135) {
        dog.play(`${this.prefix}-walk-down`, true);
      } else {
        dog.play(`${this.prefix}-walk-up`, true);
      }
      dog.setDepth(dog.y);
      this.idleTimer = 0;
    } else {
      this.idleTimer += deltaMs;
      if (this.idleTimer > 2500) {
        this.playAnim(`${this.prefix}-sit`);
      } else {
        this.playAnim(`${this.prefix}-idle`);
      }
    }
  }

  private playAnim(key: string): void {
    if (!this.sprite) return;
    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
    }
  }

  private triggerAlert(): void {
    if (!this.sprite) return;
    this.state = 'sniffing';
    this.alertCooldown = 12000;

    this.playAnim(`${this.prefix}-sniff`);
    try { sound.playClick(); } catch (e) {}

    this.showEmote('🐾 Wuff! Hier liegt etwas verborgen!');
  }

  public pet(): void {
    if (!this.sprite || this.state === 'petting') return;
    this.state = 'petting';

    this.playAnim(`${this.prefix}-wag`);
    try { sound.playPet(); } catch (e) {}
    const ui = this.scene.scene.get('UI') as any;
    ui?.showNotification(`🐾 ${this.config.name} wedelt freudig mit dem Schwanz!`);

    this.showEmote('❤️ *Wedel! Freut sich über deine Zuwendung*');

    this.scene.time.delayedCall(2200, () => {
      this.state = 'following';
    });
  }

  private showEmote(text: string): void {
    if (!this.sprite) return;
    document.querySelectorAll('.companion-emote-bubble').forEach((node) => node.remove());
    const el = document.createElement('div');
    el.className = 'companion-emote-bubble';
    el.innerHTML = text;
    el.style.cssText = `
      position: fixed;
      transform: translate(-50%, -100%);
      background: rgba(15, 23, 42, 0.92);
      border: 1.5px solid #fbbf24;
      border-radius: 9999px;
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: #fef08a;
      white-space: nowrap;
      pointer-events: none;
      z-index: 50;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      transition: opacity 0.3s;
    `;
    document.body.appendChild(el);

    const updatePos = () => {
      if (!this.sprite) return;
      const cam = this.scene.cameras.main;
      const canvas = this.scene.game.canvas;
      const rect = canvas.getBoundingClientRect();
      const sx = ((this.sprite.x - cam.worldView.x) / cam.worldView.width) * rect.width + rect.left;
      const sy = ((this.sprite.y - 20 - cam.worldView.y) / cam.worldView.height) * rect.height + rect.top;
      el.style.left = `${sx}px`;
      el.style.top = `${sy}px`;
    };

    updatePos();
    el.style.opacity = '1';

    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 2400);
  }
}
