import Phaser from 'phaser';

export interface FireSource {
  x: number;
  y: number;
  hasSmoke: boolean;
  smokeRate?: number;
  glowRadius?: number;
  glowColor?: number;
}

export interface ResourceHotspot {
  x: number;
  y: number;
  lastSparkle?: number;
  sparkleInterval?: number;
}

export class LivingWorldManager {
  private scene: Phaser.Scene;
  private floraSprites: Phaser.GameObjects.Sprite[] = [];
  private bannerSprites: Phaser.GameObjects.Image[] = [];
  private mysticalSprites: Phaser.GameObjects.Image[] = [];
  private fireSources: FireSource[] = [];
  private fireGlows: Phaser.GameObjects.Arc[] = [];
  private smokeParticles: Phaser.GameObjects.Arc[] = [];
  private waterRipples: Phaser.GameObjects.Rectangle[] = [];
  private resourceSpots: ResourceHotspot[] = [];

  // Wind state
  private windTime = 0;
  private smokeTimer = 0;
  private waterTimer = 0;

  // Mentors & Player Idle
  private mentorSprites: Phaser.GameObjects.Sprite[] = [];
  private mentorLookTimers: Map<Phaser.GameObjects.Sprite, number> = new Map();
  private playerSprite: Phaser.GameObjects.Sprite | null = null;
  private playerPrevMoving = false;
  private playerIdleTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ---------------------------------------------------------------------------
  // 1. FLORA & WIND
  // ---------------------------------------------------------------------------
  public registerFlora(sprite: Phaser.GameObjects.Sprite | null): void {
    if (!sprite) return;
    this.floraSprites.push(sprite);

    // Subtle individual phase offset to prevent robotic synchronous swaying
    const delay = Math.random() * 2500;
    const duration = 2400 + Math.random() * 1200;
    const maxAngle = 1.0 + Math.random() * 0.8;

    this.scene.tweens.add({
      targets: sprite,
      angle: { from: -maxAngle, to: maxAngle },
      duration,
      delay,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ---------------------------------------------------------------------------
  // 2. FIRE, SMOKE & GLOW
  // ---------------------------------------------------------------------------
  public registerFireSource(
    x: number,
    y: number,
    hasSmoke = true,
    glowRadius = 36,
    glowColor = 0xffa533
  ): void {
    // 1. Warm radial light glow with ADD blendmode
    const glow = this.scene.add
      .circle(x, y - 6, glowRadius, glowColor, 0.22)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(y - 2);

    this.fireGlows.push(glow);

    // Flame flicker on the glow
    this.scene.tweens.add({
      targets: glow,
      scaleX: { from: 0.94, to: 1.06 },
      scaleY: { from: 0.92, to: 1.08 },
      alpha: { from: 0.16, to: 0.28 },
      duration: 130 + Math.random() * 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.fireSources.push({
      x,
      y,
      hasSmoke,
      smokeRate: 500 + Math.random() * 300,
      glowRadius,
      glowColor,
    });
  }

  // ---------------------------------------------------------------------------
  // 3. WATER SHIMMER & RIPPLES
  // ---------------------------------------------------------------------------
  public initWaterEffects(riverCenterTiles: number[] = [15]): void {
    // Spawn subtle flowing specular lines along the river in the West
    for (let i = 0; i < 18; i++) {
      const rx = (13 + Math.random() * 4) * 16;
      const ry = (4 + Math.random() * 70) * 16;
      const w = 12 + Math.random() * 16;
      const h = 2;

      const ripple = this.scene.add
        .rectangle(rx, ry, w, h, 0xe0f2fe, 0.28)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(15); // Just above water terrain

      // Subtle flowing motion drifting downstream (South)
      this.scene.tweens.add({
        targets: ripple,
        y: ry + 16,
        alpha: { from: 0, to: 0.35 },
        duration: 2200 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
        ease: 'Sine.easeInOut',
      });

      this.waterRipples.push(ripple);
    }

    // Moor pond ripples in the East (tx: 76..80, ty: 46..48)
    for (let i = 0; i < 6; i++) {
      const mx = (76 + Math.random() * 4) * 16;
      const my = (46 + Math.random() * 2.5) * 16;
      const moorRipple = this.scene.add
        .rectangle(mx, my, 8 + Math.random() * 10, 2, 0xdcfce7, 0.22)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(15);

      this.scene.tweens.add({
        targets: moorRipple,
        scaleX: { from: 0.6, to: 1.3 },
        alpha: { from: 0.08, to: 0.26 },
        duration: 1800 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1500,
        ease: 'Sine.easeInOut',
      });

      this.waterRipples.push(moorRipple);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. BANNERS, RUNES & RESOURCE SPOTS
  // ---------------------------------------------------------------------------
  public registerBanner(img: Phaser.GameObjects.Image | null): void {
    if (!img) return;
    this.bannerSprites.push(img);

    this.scene.tweens.add({
      targets: img,
      angle: { from: -2.5, to: 2.5 },
      scaleX: { from: 0.98, to: 1.02 },
      duration: 1600 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerMysticalProp(img: Phaser.GameObjects.Image | null): void {
    if (!img) return;
    this.mysticalSprites.push(img);

    // Zartes mystisches Pulsieren
    this.scene.tweens.add({
      targets: img,
      alpha: { from: 0.82, to: 1.0 },
      duration: 2200 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerResourceHotspot(x: number, y: number): void {
    this.resourceSpots.push({
      x,
      y,
      lastSparkle: 0,
      sparkleInterval: 3500 + Math.random() * 2500,
    });
  }

  private triggerSparkle(spot: ResourceHotspot): void {
    const star = this.scene.add
      .star(spot.x, spot.y - 12, 4, 2, 5, 0xfffbeb, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(spot.y + 10)
      .setScale(0);

    this.scene.tweens.add({
      targets: star,
      scale: 1.2,
      angle: 90,
      alpha: { from: 0.9, to: 0 },
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => star.destroy(),
    });
  }

  // ---------------------------------------------------------------------------
  // 5. NPCS & PLAYER IDLE BREATHING & AWARENESS
  // ---------------------------------------------------------------------------
  public registerMentor(sprite: Phaser.GameObjects.Sprite | null): void {
    if (!sprite) return;
    this.mentorSprites.push(sprite);
    this.mentorLookTimers.set(sprite, 4000 + Math.random() * 4000);

    // Subtle 1-pixel breathing squash
    this.scene.tweens.add({
      targets: sprite,
      scaleY: { from: 0.985, to: 1.0 },
      duration: 1400 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public registerPlayer(player: Phaser.GameObjects.Sprite): void {
    this.playerSprite = player;
  }

  public clearMentors(): void {
    this.mentorSprites = [];
    this.mentorLookTimers.clear();
  }

  // ---------------------------------------------------------------------------
  // 6. MAIN UPDATE CYCLE
  // ---------------------------------------------------------------------------
  public update(delta: number, playerX: number, playerY: number, playerMoving: boolean): void {
    this.windTime += delta;
    this.smokeTimer += delta;
    this.waterTimer += delta;

    // A. Player Idle Breathing state sync
    if (this.playerSprite) {
      if (playerMoving && !this.playerPrevMoving) {
        // Player started moving: stop idle tween
        if (this.playerIdleTween) {
          this.playerIdleTween.stop();
          this.playerIdleTween = null;
        }
        this.playerSprite.setScale(1, 1);
      } else if (!playerMoving && this.playerPrevMoving) {
        // Player stopped moving: start subtle breathing
        this.playerIdleTween = this.scene.tweens.add({
          targets: this.playerSprite,
          scaleY: { from: 0.98, to: 1.0 },
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
      this.playerPrevMoving = playerMoving;
    }

    // B. Spawn rising smoke puffs from active fire sources
    if (this.smokeTimer > 280) {
      this.smokeTimer = 0;
      for (const fire of this.fireSources) {
        if (!fire.hasSmoke) continue;
        if (Math.random() > 0.45) continue; // Natural staggered puff rate

        const puffX = fire.x + (Math.random() * 6 - 3);
        const puffY = fire.y - 10;
        const puffRadius = 3 + Math.random() * 2.5;

        const puff = this.scene.add
          .circle(puffX, puffY, puffRadius, 0x94a3b8, 0.45)
          .setDepth(fire.y + 20);

        // Puffs rise and drift North-East with wind
        this.scene.tweens.add({
          targets: puff,
          x: puffX + 16 + Math.random() * 12,
          y: puffY - 36 - Math.random() * 18,
          scale: 1.8,
          alpha: 0,
          duration: 1800 + Math.random() * 600,
          ease: 'Quad.easeOut',
          onComplete: () => puff.destroy(),
        });
      }
    }

    // C. Resource sparkle intervals
    for (const spot of this.resourceSpots) {
      spot.lastSparkle = (spot.lastSparkle || 0) + delta;
      if (spot.lastSparkle >= (spot.sparkleInterval || 4000)) {
        spot.lastSparkle = 0;
        this.triggerSparkle(spot);
      }
    }

    // D. Mentor look-around & player-awareness
    for (const mentor of this.mentorSprites) {
      if (!mentor.active) continue;

      const dist = Phaser.Math.Distance.Between(mentor.x, mentor.y, playerX, playerY);

      if (dist < 44) {
        // Face the player when close
        const dx = playerX - mentor.x;
        const dy = playerY - mentor.y;
        if (Math.abs(dx) > Math.abs(dy)) {
          mentor.setFrame(dx > 0 ? 4 : 12); // right or left
        } else {
          mentor.setFrame(dy > 0 ? 0 : 8); // down or up
        }
      } else {
        // Intermittent look around every 6-10 seconds
        let timer = this.mentorLookTimers.get(mentor) || 5000;
        timer -= delta;
        if (timer <= 0) {
          timer = 6000 + Math.random() * 4000;
          // Random slight turn (down or idle side)
          const frames = [0, 4, 12];
          const rf = frames[Math.floor(Math.random() * frames.length)];
          mentor.setFrame(rf);
        }
        this.mentorLookTimers.set(mentor, timer);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 7. CLEANUP
  // ---------------------------------------------------------------------------
  public destroy(): void {
    this.floraSprites = [];
    this.bannerSprites = [];
    this.mysticalSprites = [];
    this.fireSources = [];
    this.fireGlows.forEach((g) => g.destroy());
    this.fireGlows = [];
    this.waterRipples.forEach((r) => r.destroy());
    this.waterRipples = [];
    this.clearMentors();
  }
}
