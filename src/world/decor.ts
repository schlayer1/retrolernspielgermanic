import Phaser from 'phaser';

export class WorldDecorManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public placeDecor(x: number, y: number, frame: string, scale = 1, depthOffset = 0): Phaser.GameObjects.Sprite | null {
    try {
      const sprite = this.scene.add
        .sprite(x, y, 'world_atlas', frame)
        .setScale(scale)
        .setOrigin(0.5, 0.9)
        .setDepth(y + depthOffset);
      return sprite;
    } catch {
      return null;
    }
  }

  public placeProp(x: number, y: number, textureKey: string, scale = 1, depthOffset = 0): Phaser.GameObjects.Image | null {
    try {
      const img = this.scene.add
        .image(x, y, textureKey)
        .setScale(scale)
        .setOrigin(0.5, 0.9)
        .setDepth(y + depthOffset);
      return img;
    } catch {
      return null;
    }
  }
}
