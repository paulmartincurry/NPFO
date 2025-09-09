import Phaser from 'phaser'

// BootScene prepares assets before the game starts. It generates a
// single white pixel texture that can be tinted to create simple shapes.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Generate a 1x1 white texture for rectangles and hitboxes
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff, 1)
    g.fillRect(0, 0, 1, 1)
    g.generateTexture('white', 1, 1)
  }

  create() {
    // Immediately transition to the title screen
    this.scene.start('TitleScene')
  }
}
