import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../systems/constants.js'

// PauseScene is displayed when the player presses ESC. It shows a simple
// overlay and waits for ESC again to resume the game.
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene')
  }

  create() {
    // Dark overlay
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0)
    // Pause title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, 'PAUSED', {
      fontFamily: 'monospace',
      fontSize: 18,
      color: '#ffffff'
    }).setOrigin(0.5)
    // Resume instructions
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 14, 'Press ESC to Resume', {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#cccccc'
    }).setOrigin(0.5)

    // Resume on ESC key press
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.stop()
      this.scene.resume('PlayScene')
    })
  }
}
