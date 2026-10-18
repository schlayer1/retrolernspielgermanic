import Phaser from 'phaser';

interface AnimalEntity {
  sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  baseX: number;
  baseY: number;
  wanderRadius: number;
  moveTimer: number;
  isMoving: boolean;
  targetX: number;
  targetY: number;
  speed: number;
  baseScale: number;
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

      this.animals.push({
        sprite: img,
        baseX: x,
        baseY: y,
        wanderRadius: radius,
        moveTimer: Math.random() * 2000 + 1000,
        isMoving: false,
        targetX: x,
        targetY: y,
        speed,
        baseScale,
      });
    } catch {
      // Texture not yet loaded or missing
    }
  }

  public update(delta: number, playerX: number, playerY: number): void {
    const dt = delta / 1000;

    for (const a of this.animals) {
      a.moveTimer -= delta;

      // Check proximity to player (animals pause and watch when close)
      const distToPlayer = Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, playerX, playerY);
      if (distToPlayer < 36) {
        a.isMoving = false;
        a.moveTimer = 1500;
        continue;
      }

      if (a.moveTimer <= 0) {
        a.isMoving = !a.isMoving;
        a.moveTimer = Math.random() * 3000 + 2000;

        if (a.isMoving) {
          // Attempt finding a non-blocked target
          for (let attempt = 0; attempt < 5; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * a.wanderRadius;
            const testX = a.baseX + Math.cos(angle) * dist;
            const testY = a.baseY + Math.sin(angle) * dist;

            if (!this.isPointBlocked(testX, testY)) {
              a.targetX = testX;
              a.targetY = testY;
              break;
            }
          }
        }
      }

      if (a.isMoving) {
        const d = Phaser.Math.Distance.Between(a.sprite.x, a.sprite.y, a.targetX, a.targetY);
        if (d > 2) {
          const moveStep = a.speed * dt;
          const angle = Phaser.Math.Angle.Between(a.sprite.x, a.sprite.y, a.targetX, a.targetY);
          const nextX = a.sprite.x + Math.cos(angle) * moveStep;
          const nextY = a.sprite.y + Math.sin(angle) * moveStep;

          // Check obstacle collision before moving
          if (!this.isPointBlocked(nextX, nextY)) {
            a.sprite.x = nextX;
            a.sprite.y = nextY;
            a.sprite.setDepth(a.sprite.y);

            // Flip horizontally based on movement direction without altering scale
            if (Math.cos(angle) < -0.1) {
              a.sprite.setScale(-a.baseScale, a.baseScale);
            } else if (Math.cos(angle) > 0.1) {
              a.sprite.setScale(a.baseScale, a.baseScale);
            }
          } else {
            a.isMoving = false;
          }
        } else {
          a.isMoving = false;
        }
      }
    }
  }
}
