import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../systems/constants.js'

// TitleScene displays the game title and waits for the player to begin.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene')
  }

  create() {
    // Draw a black background over the entire canvas
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0)

    // Game title text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, 'NPFU', {
      fontFamily: 'monospace',
      fontSize: 36,
      color: '#f2f2f2'
    }).setOrigin(0.5)

    // Prompt the player to start
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10, 'Press ENTER to Start', {
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#bcbcbc'
    }).setOrigin(0.5)

    // Listen for the ENTER key to start the game
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('PlayScene')
      this.scene.launch('UIScene')
    })
  }
}
