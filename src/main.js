import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import PlayScene from './scenes/PlayScene.js'
import UIScene from './scenes/UIScene.js'
import { GAME_WIDTH, GAME_HEIGHT } from './systems/constants.js'

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#111111',
  scale: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    pixelArt: true
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1000 }, debug: false }
  },
  scene: [BootScene, PlayScene, UIScene]
}

new Phaser.Game(config)
