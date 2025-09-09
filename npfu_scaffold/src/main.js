import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import TitleScene from './scenes/TitleScene.js'
import PlayScene from './scenes/PlayScene.js'
import UIScene from './scenes/UIScene.js'
import PauseScene from './scenes/PauseScene.js'
import { GAME_WIDTH, GAME_HEIGHT } from './systems/constants.js'

// Phaser game configuration. This sets up the canvas size, physics engine,
// and the list of scenes that compose our game.
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
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, PlayScene, UIScene, PauseScene]
}

// Instantiate the Phaser.Game with our configuration.
new Phaser.Game(config)
