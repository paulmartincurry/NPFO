import Phaser from 'phaser'

/**
 * WinScene displays a victory card when the player completes a stage.
 * It shows a triumphant message and allows the player to return to
 * the title screen or replay the stage. The stageId is passed via
 * data.stageId.
 */
export default class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene')
  }
  init(data) {
    this.stageId = data?.stageId || 'L'
  }
  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    this.add.rectangle(0, 0, w, h, 0x000000, 0.92).setOrigin(0)
    // Victory message
    this.add.text(w / 2, h / 2 - 40, 'NO NAZIS IN OUR STREETS', {
      fontFamily: 'monospace', fontSize: 20, color: '#66ff66', align: 'center', wordWrap: { width: w - 60 }
    }).setOrigin(0.5)
    this.add.text(w / 2, h / 2, 'You pushed them back.', {
      fontFamily: 'monospace', fontSize: 14, color: '#bbbbbb'
    }).setOrigin(0.5)
    // Prompt
    this.add.text(w / 2, h / 2 + 40, 'Press ENTER to return to title\nPress R to replay', {
      fontFamily: 'monospace', fontSize: 12, color: '#8888ff', align: 'center'
    }).setOrigin(0.5)
    // Input
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('TitleScene')
    })
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('PlayScene', { stageId: this.stageId })
      this.scene.launch('UIScene')
    })
  }
}