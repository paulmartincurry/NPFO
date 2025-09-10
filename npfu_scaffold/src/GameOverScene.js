import Phaser from 'phaser'

/**
 * GameOverScene shows a defeat card when the player runs out of
 * health or otherwise fails the stage. It displays a simple
 * zine‑style message and allows the player to return to the title
 * screen or retry the same stage. The stageId is passed via
 * data.stageId.
 */
export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene')
  }
  init(data) {
    this.stageId = data?.stageId || 'L'
  }
  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    this.add.rectangle(0, 0, w, h, 0x000000, 0.92).setOrigin(0)
    // Defeat message
    this.add.text(w / 2, h / 2 - 40, 'DOWN BUT NOT OUT', {
      fontFamily: 'monospace', fontSize: 24, color: '#ff6666'
    }).setOrigin(0.5)
    this.add.text(w / 2, h / 2, 'You were overwhelmed.', {
      fontFamily: 'monospace', fontSize: 14, color: '#bbbbbb'
    }).setOrigin(0.5)
    // Prompt
    this.add.text(w / 2, h / 2 + 40, 'Press ENTER to return to title\nPress R to retry', {
      fontFamily: 'monospace', fontSize: 12, color: '#8888ff', align: 'center'
    }).setOrigin(0.5)
    // Input handlers
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('TitleScene')
    })
    this.input.keyboard.once('keydown-R', () => {
      // Restart the play scene with the same stageId
      this.scene.start('PlayScene', { stageId: this.stageId })
      this.scene.launch('UIScene')
    })
  }
}