import Phaser from 'phaser'
import { REBEL_MAX } from '../systems/constants.js'

// UIScene handles the on‑screen UI, such as the Rebel Meter that
// charges when the player lands hits. When full, Riot Mode is
// triggered to temporarily boost the player.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene')
    this.rebel = 0
    this.riotActive = false
  }

  create() {
    this.rebel = 0
    this.riotActive = false

    // Background bar for the Rebel Meter
    this.meterBg = this.add.rectangle(10, 10, 120, 12, 0x222222).setOrigin(0)
    // Fill bar that grows with the meter
    this.meter = this.add.rectangle(12, 12, 0, 8, 0x00ff88).setOrigin(0)
    // Label text
    this.add.text(10, 26, 'Rebel Meter', {
      fontFamily: 'monospace',
      fontSize: 10,
      color: '#cccccc'
    }).setOrigin(0, 0)

    // Listen to hits from PlayScene. Each time a hit lands we add
    // to the meter.
    this.scene.get('PlayScene').events.on('hitLanded', () => this.increment(10))
  }

  /**
   * Increment the Rebel meter. When the meter reaches REBEL_MAX it
   * activates Riot mode, applying temporary buffs and resetting after a
   * delay. If Riot is already active, increments are ignored.
   * @param {number} amount
   */
  increment(amount) {
    if (this.riotActive) return
    this.rebel = Math.min(REBEL_MAX, this.rebel + amount)
    this.meter.width = 116 * (this.rebel / REBEL_MAX)
    if (this.rebel >= REBEL_MAX) {
      this.activateRiotMode()
    }
  }

  /**
   * Activates Riot mode on the player. This sets a flag for the UI
   * scene and applies a speed and damage buff on the player for five
   * seconds. Visual feedback is provided via a camera flash and a
   * small zoom animation.
   */
  activateRiotMode() {
    this.riotActive = true
    const playScene = this.scene.get('PlayScene')
    // Boost player stats during Riot mode
    playScene.playerBuff = { speed: 1.5, damage: 2 }
    // Visual feedback: flash and zoom the camera
    this.cameras.main.flash(150, 255, 255, 255)
    this.tweens.add({ targets: this.cameras.main, zoom: 1.03, duration: 100, yoyo: true })
    // Reset after 5 seconds
    this.time.delayedCall(5000, () => {
      this.rebel = 0
      this.meter.width = 0
      this.riotActive = false
      playScene.playerBuff = null
    })
  }
}