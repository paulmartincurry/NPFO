import Phaser from 'phaser'
import { WORLD_WIDTH, GAME_HEIGHT } from '../systems/constants.js'

// PlayScene contains the main gameplay loop: player movement, enemy AI,
// punch mechanics, and camera control.
export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene')
  }

  create() {
    // Create ground as a static physics object
    const ground = this.add.rectangle(0, GAME_HEIGHT - 20, WORLD_WIDTH, 20, 0x333333).setOrigin(0, 0)
    this.physics.add.existing(ground, true)

    // Player setup
    this.player = this.add.rectangle(100, GAME_HEIGHT - 60, 18, 28, 0x9acd32)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setMaxVelocity(300, 1000)
    this.player.body.setDragX(1200)

    // World and camera bounds
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

    // Collisions
    this.physics.add.collider(this.player, ground)

    // Input keys
    this.cursors = this.input.keyboard.createCursorKeys()
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    // Enemy group
    this.enemies = this.physics.add.group()

    // Punch hitbox
    this.punchBox = this.add.rectangle(this.player.x, this.player.y, 22, 20, 0xffffff, 0).setOrigin(0.5)
    this.physics.add.existing(this.punchBox)
    this.punchBox.body.setAllowGravity(false)
    this.punchBox.active = false

    // Overlap detection between hitbox and enemies
    this.physics.add.overlap(this.punchBox, this.enemies, (box, enemy) => {
      if (!this.punchBox.active) return
      // Knock enemy back on hit
      const dir = Math.sign(enemy.x - this.player.x) || 1
      enemy.body.setVelocity(250 * dir, -150)
      // Reduce enemy HP; remove if depleted
      enemy.setData('hp', (enemy.getData('hp') || 1) - (this.playerBuff?.damage ? 2 : 1))
      if (enemy.getData('hp') <= 0) enemy.destroy()
      // Camera shake for feedback
      this.cameras.main.shake(80, 0.0015)
      // Emit hit event for UI
      this.events.emit('hitLanded')
    })

    // Enemy collision with ground
    this.physics.add.collider(this.enemies, ground)

    // Spawn some initial enemies at various positions
    this.spawnEnemy(400, 'goon')
    this.spawnEnemy(450, 'goon')
    this.spawnEnemy(500, 'runner')

  }

  /**
   * Spawn an enemy at a given x-coordinate. The type determines speed and health.
   * @param {number} x
   * @param {string} type
   */
  spawnEnemy(x, type = 'goon') {
    const color = type === 'runner' ? 0xffaa55 : 0xff5555
    const enemy = this.add.rectangle(x, GAME_HEIGHT - 60, 18, 28, color)
    this.physics.add.existing(enemy)
    enemy.body.setCollideWorldBounds(true)
    enemy.setData('type', type)
    enemy.setData('hp', type === 'runner' ? 1 : 2)
    this.enemies.add(enemy)

    // Simple enemy AI: move towards player at intervals
    this.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => {
        if (!enemy.body) return
        const dir = Math.sign(this.player.x - enemy.x)
        const speed = (enemy.getData('type') === 'runner') ? 120 : 60
        enemy.body.setVelocityX(speed * dir)
      }
    })
  }

  update() {
    // Pause handling
    if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      this.scene.pause()
      this.scene.launch('PauseScene')
    }

    const body = /** @type {Phaser.Physics.Arcade.Body} */(this.player.body)
    const speedMultiplier = this.playerBuff?.speed || 1
    const accel = 800 * speedMultiplier

    // Horizontal movement
    if (this.cursors.left.isDown) body.setAccelerationX(-accel)
    else if (this.cursors.right.isDown) body.setAccelerationX(accel)
    else body.setAccelerationX(0)

    // Jumping
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && body.blocked.down) {
      body.setVelocityY(-400)
    }

    // Punch action
    if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      this.punch()
    }

    // Keep hitbox aligned with player and facing direction
    const facing = this.cursors.left.isDown ? -1 : 1
    this.punchBox.x = this.player.x + facing * 16
    this.punchBox.y = this.player.y
  }

  punch() {
    if (this.punchBox.active) return
    this.punchBox.active = true
    this.punchBox.setFillStyle(0xffff00, 0.25)
    this.time.delayedCall(100, () => {
      this.punchBox.active = false
      this.punchBox.setFillStyle(0xffffff, 0)
    })
  }
}
