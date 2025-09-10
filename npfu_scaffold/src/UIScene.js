import Phaser from 'phaser'
import { REBEL_MAX } from '../systems/constants.js'
import { Chant } from '../systems/crowd.js'

// UIScene handles the on‑screen UI, such as the Rebel Meter that
// charges when the player lands hits. When full, Riot Mode is
// triggered to temporarily boost the player.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene')
    this.rebel = 0
    this.riotActive = false
    this.chant = null
    this.keyT = null
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
    const playScene = this.scene.get('PlayScene')
    this.scene.get('PlayScene').events.on('hitLanded', () => {
      this.increment(10)
      // Bonus Rebel gain when hitting on-beat
      if (this.chant && this.chant.isOnBeat(120)) this.increment(6)
    })

    // Chant metronome with a default BPM; can be overridden per stage
    this.chant = new Chant(this, 100)

    // Taunt key: T for call-and-response buff
    this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)
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
    // Visual feedback: flash and zoom the camera (respect flash toggle)
    if ((localStorage.getItem('flash') ?? 'true') === 'true') {
      this.cameras.main.flash(150, 255, 255, 255)
    }
    this.tweens.add({ targets: this.cameras.main, zoom: 1.03, duration: 100, yoyo: true })
    // Reset after 5 seconds
    this.time.delayedCall(5000, () => {
      this.rebel = 0
      this.meter.width = 0
      this.riotActive = false
      playScene.playerBuff = null
    })
  }

  /**
   * Per-frame update for the UI. Advances the chant metronome and
   * handles taunt input, applying a temporary buff to the player.
   * @param {number} time
   * @param {number} delta
   */
  update(time, delta) {
    if (this.chant) this.chant.update(delta)
    if (this.keyT && Phaser.Input.Keyboard.JustDown(this.keyT)) {
      const play = this.scene.get('PlayScene')
      const current = play.playerBuff || {}
      play.playerBuff = {
        ...current,
        speed: Math.max(current.speed || 1, 1.25),
        damage: Math.max(current.damage || 1, 2)
      }
      if ((localStorage.getItem('flash') ?? 'true') === 'true') {
        this.cameras.main.flash(80, 255, 255, 255)
      }
      this.time.delayedCall(4000, () => {
        const buff = play.playerBuff || {}
        if (buff.speed <= 1.25) delete buff.speed
        if (buff.damage <= 2) delete buff.damage
        if (Object.keys(buff).length === 0) play.playerBuff = null
        else play.playerBuff = buff
      })
    }
  }
}