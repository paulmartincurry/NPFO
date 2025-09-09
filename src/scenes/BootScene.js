import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor(){ super('BootScene') }
  preload(){
    const gfx = this.make.graphics({ x:0, y:0, add:false })
    gfx.fillStyle(0xffffff, 1)
    gfx.fillRect(0, 0, 1, 1)
    gfx.generateTexture('white', 1, 1)
  }
  create(){
    this.scene.start('PlayScene')
    this.scene.launch('UIScene')
  }
}
