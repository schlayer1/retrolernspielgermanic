import Phaser from 'phaser';

export type AnimalState = 'idle_breathe' | 'graze_eat' | 'wander_tether' | 'player_aware';

interface AnimalEntity {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  baseX: number;
  baseY: number;
  wanderRadius: number;
  speed: number;
  baseScale: number;
  state: AnimalState;
  stateTimer: number;
  targetX: number;
  targetY: number;
  facingRight: boolean;
  stepPhase: number;
  activeTween: Phaser.Tweens.Tween | null;
}

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

// Map obstacles to prevent animals from walking through walls, roofs or into water
const BUILDING_OBSTACLES: BoundingBox[] = [
  // Langhaus
  { minX: 29 * 16, maxX: 41 * 16, minY: 19 * 16, maxY: 28 * 16 },
  // Round hut
  { minX: 21 * 16, maxX: 29 * 16, minY: 22 * 16, maxY: 29 * 16 },
  // Large hut
  { minX: 38 * 16, maxX: 47 * 16, minY: 20 * 16, maxY: 27 * 16 },
  // Pfahlspeicher
  { minX: 37 * 16, maxX: 44 * 16, minY: 15 * 16, maxY: 21 * 16 },
  // Haystacks & Cattle Pen
  { minX: 23 * 16, maxX: 35 * 16, minY: 32 * 16, maxY: 37 * 16 },
  // Smithy, Rennofen, Kiln
  { minX: 43 * 16, maxX: 57 * 16, minY: 30 * 16, maxY: 40 * 16 },
  // Thing sacred circle & Oak glade (protected human sanctuary)
  { minX: 42 * 16, maxX: 58 * 16, minY: 40 * 16, maxY: 64 * 16 },
  // River
  { minX: 11 * 16, maxX: 19 * 16, minY: 0, maxY: 80 * 16 },
];

export class WildlifeManager {
  private scene: Phaser.Scene;
  private animals: AnimalEntity[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public init(mapW: number, mapH: number): void {
    // 1. Wisente & Auerochsen auf den weiten Waldweiden im Osten (96x96 -> ~33px tall bull)
    this.spawnAnimal(68 * 16, 26 * 16, 'fauna_wisent_auerochse', 26, 11, 0.34);
    this.spawnAnimal(74 * 16, 28 * 16, 'fauna_wisent_front', 24, 10, 0.34);
    this.spawnAnimal(70 * 16, 32 * 16, 'fauna_wisent_auerochse', 24, 12, 0.34);

    // 2. Schafe & Lämmer auf der freien Südweide (48x48 -> ~17px sheep, ~13px lambs)
    this.spawnAnimal(27 * 16, 40 * 16, 'fauna_sheep_black', 18, 14, 0.35);
    this.spawnAnimal(31 * 16, 42 * 16, 'fauna_sheep_white', 18, 13, 0.35);
    this.spawnAnimal(24 * 16, 39 * 16, 'fauna_lamb_white', 14, 15, 0.26);
    this.spawnAnimal(29 * 16, 44 * 16, 'fauna_lamb_brown', 14, 14, 0.26);

    // 3. Weideziegen am felsigen Hang im Südwesten (96x96 -> ~21px waist-high goat)
    this.spawnAnimal(34 * 16, 56 * 16, 'fauna_goat_ram', 18, 14, 0.22);
    this.spawnAnimal(38 * 16, 60 * 16, 'fauna_goat_ram', 20, 15, 0.22);

    // 4. Germanische Pferde auf der Koppel (96x96 -> ~29px horse)
    this.spawnAnimal(20 * 16, 30 * 16, 'fauna_horse_brown', 20, 13, 0.30);
    this.spawnAnimal(21 * 16, 34 * 16, 'fauna_horse_saddled', 18, 12, 0.30);
  }

  private isPointBlocked(x: number, y: number): boolean {
    for (const b of BUILDING_OBSTACLES) {
      if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) {
        return true;
      }
    }
    return false;
  }

  private spawnAnimal(x: number, y: number, texKey: string, radius: number, speed: number, baseScale = 0.3): void {
    try {
      const img = this.scene.add.image(x, y, texKey);
      img.setOrigin(0.5, 0.85);
      img.setScale(baseScale);
      img.setDepth(y);

      const entity: AnimalEntity = {
        sprite: img,
        baseX: x,
        baseY: y,
        wanderRadius: radius,
        speed,
        baseScale,
        state: 'idle_breathe',
        stateTimer: Math.random() * 2000 + 1000,
        targetX: x,
        targetY: y,
        facingRight: true,
        stepPhase: 0,
        activeTween: null,
      };

      this.enterState(entity, 'idle_breathe');
      this.animals.push(entity);
    } catch {
      // Texture missing or not yet loaded
    }
  }

  private enterState(a: AnimalEntity, newState: AnimalState): void {
    // Clean up active tweens
    if (a.activeTween) {
      a.activeTween.stop();
      a.activeTween = null;
    }

    a.state = newState;

    switch (newState) {
      case 'idle_breathe': {
        a.stateTimer = 2200 + Math.random() * 2000;
        a.sprite.setAngle(0);
        this.updateDirectionScale(a);

        // Subtle vertical breathing squash & stretch
        a.activeTween = this.scene.tweens.add({
          targets: a.sprite,
          scaleY: a.baseScale * 1.025,
          duration: 1100 + Math.random() * 300,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;
      }

      case 'graze_eat': {
        a.stateTimer = 2500 + Math.random() * 2500;
        this.updateDirectionScale(a);

        // Head tilt down towards grass + chewing micro-bounce
        const grazeAngle = a.facingRight ? 4 : -4;
        a.activeTween = this.scene.tweens.add({
          targets: a.sprite,
          angle: { from: 0, to: grazeAngle },
          duration: 600,
          yoyo: true,
          repeat: 3,
          ease: 'Quad.easeInOut',
        });
        break;
      }

      case 'wander_tether': {
        // Pick valid target in wanderRadius
        let found = false;
        for (let i = 0; i < 6; i++) {
          const ang = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * (a.wanderRadius - 10);
          const tx = a.baseX + Math.cos(ang) * dist;
          const ty = a.baseY + Math.sin(ang) * dist;

          if (!this.isPointBlocked(tx, ty)) {
            a.targetX = tx;
            a.targetY = ty;
            found = true;
            break;
          }
        }

        if (!found) {
          // Stay idle if blocked
          this.enterState(a, 'idle_breathe');
          return;
        }

        a.stateTimer = 4000; // Max wander timeout
        a.sprite.setAngle(0);
        a.facingRight = a.targetX >= a.sprite.x;
        this.updateDirectionScale(a);
        break;
      }

      case 'player_aware': {
        a.stateTimer = 1800;
        a.sprite.setAngle(0);
        this.updateDirectionScale(a);

        // Alert posture (slight head lift)
        a.activeTween = this.scene.tweens.add({
          targets: a.sprite,
          scaleY: a.baseScale * 1.04,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;
      }
    }
  }

  private updateDirectionScale(a: AnimalEntity): void {
    const sx = a.facingRight ? a.baseScale : -a.baseScale;
    a.sprite.setScale(sx, a.baseScale);
  }

  public update(delta: number, playerX: number, playerY: number): void {
    const dt = delta / 1000;

    for (const a of this.animals) {
      const distToPlayer = Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, playerX, playerY);

      // 1. Proximity Awareness Check
      if (distToPlayer < 36) {
        if (a.state !== 'player_aware') {
          a.facingRight = playerX >= a.sprite.x;
          this.enterState(a, 'player_aware');
        }
        continue;
      } else if (a.state === 'player_aware' && distToPlayer > 44) {
        // Player walked away: return to idle
        this.enterState(a, 'idle_breathe');
        continue;
      }

      // 2. State Timer Countdown
      a.stateTimer -= delta;

      if (a.state === 'idle_breathe') {
        if (a.stateTimer <= 0) {
          // Transition to graze (60%) or wander (40%)
          if (Math.random() < 0.6) {
            this.enterState(a, 'graze_eat');
          } else {
            this.enterState(a, 'wander_tether');
          }
        }
      } else if (a.state === 'graze_eat') {
        if (a.stateTimer <= 0) {
          // Transition to idle or wander
          if (Math.random() < 0.5) {
            this.enterState(a, 'wander_tether');
          } else {
            this.enterState(a, 'idle_breathe');
          }
        }
      } else if (a.state === 'wander_tether') {
        const d = Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, a.targetX, a.targetY);

        if (d > 2 && a.stateTimer > 0) {
          const moveStep = a.speed * dt;
          const ang = Phaser.Math.Angle.Between(a.sprite.x, a.sprite.y, a.targetX, a.targetY);
          const nextX = a.sprite.x + Math.cos(ang) * moveStep;
          const nextY = a.sprite.y + Math.sin(ang) * moveStep;

          if (!this.isPointBlocked(nextX, nextY)) {
            a.sprite.x = nextX;
            a.sprite.y = nextY;
            a.sprite.setDepth(a.sprite.y);

            // Step-bobbing (gentle vertical bounce during walk cycle)
            a.stepPhase += moveStep * 0.4;
            const bob = Math.sin(a.stepPhase) * 0.8;
            a.sprite.y += bob;

            a.facingRight = Math.cos(ang) >= 0;
            this.updateDirectionScale(a);
          } else {
            // Path obstructed: stop wander
            this.enterState(a, 'idle_breathe');
          }
        } else {
          // Target reached or timeout
          this.enterState(a, Math.random() < 0.65 ? 'graze_eat' : 'idle_breathe');
        }
      }
    }
  }

  public destroy(): void {
    for (const a of this.animals) {
      if (a.activeTween) {
        a.activeTween.stop();
        a.activeTween = null;
      }
    }
    this.animals = [];
  }
}
