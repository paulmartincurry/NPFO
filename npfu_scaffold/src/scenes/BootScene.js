import Phaser from 'phaser'

// BootScene prepares assets before the game starts. It generates a
// single white pixel texture that can be tinted to create simple
// rectangular shapes. After loading it immediately transitions to the
// title screen.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Generate a 1×1 white texture for rectangles and hitboxes. Phaser
    // allows us to draw to an offscreen graphics context and then
    // generate a texture from it.
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xffffff, 1)
    g.fillRect(0, 0, 1, 1)
    g.generateTexture('white', 1, 1)
  }

  create() {
    // Immediately transition to the title screen once the white
    // texture is created.
    this.scene.start('TitleScene')
  }
}
