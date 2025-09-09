import Phaser from 'phaser'
import { WORLD_WIDTH, GAME_HEIGHT } from '../systems/constants.js'

export default class PlayScene extends Phaser.Scene {
  constructor(){ super('PlayScene') }

  create(){
    // ground
    const ground = this.add.rectangle(0, GAME_HEIGHT - 20, WORLD_WIDTH, 20, 0x333333).setOrigin(0,0)
    this.physics.add.existing(ground, true)

    // player
    this.player = this.add.rectangle(100, GAME_HEIGHT - 60, 18, 28, 0x9acd32)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setMaxVelocity(300, 1000)
    this.player.body.setDragX(1200)

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
    this.physics.add.collider(this.player, ground)

    this.cursors = this.input.keyboard.createCursorKeys()
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)

    // enemy
    this.enemy = this.add.rectangle(400, GAME_HEIGHT - 60, 18, 28, 0xff5555)
    this.physics.add.existing(this.enemy)
    this.enemy.body.setCollideWorldBounds(true)
    this.physics.add.collider(this.enemy, ground)

    // very simple AI: step toward player
    this.time.addEvent({
      delay: 250, loop: true,
      callback: () => {
        const dir = Math.sign(this.player.x - this.enemy.x)
        this.enemy.body.setVelocityX(60 * dir)
      }
    })

    // punch hitbox (disabled by default)
    this.punchBox = this.add.rectangle(this.player.x, this.player.y, 20, 20, 0xffffff, 0).setOrigin(0.5)
    this.physics.add.existing(this.punchBox)
    this.punchBox.body.setAllowGravity(false)
    this.punchBox.active = false

    this.physics.add.overlap(this.punchBox, this.enemy, () => {
      if (!this.punchBox.active) return
      const dir = Math.sign(this.enemy.x - this.player.x) || 1
      this.enemy.body.setVelocity(250 * dir, -150)
      this.cameras.main.shake(80, 0.0015)
      this.events.emit('hitLanded')
    })
  }

  update(){
    const body = this.player.body
    const speedMult = this.playerBuff?.speed || 1
    const accel = 800 * speedMult

    // left/right
    if (this.cursors.left.isDown) body.setAccelerationX(-accel)
    else if (this.cursors.right.isDown) body.setAccelerationX(accel)
    else body.setAccelerationX(0)

    // jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && body.blocked.down){
      body.setVelocityY(-400)
    }

    // punch
    if (Phaser.Input.Keyboard.JustDown(this.keyZ)){
      this.punch()
    }

    // keep hitbox in front of player
    const facing = this.cursors.left.isDown ? -1 : 1
    this.punchBox.x = this.player.x + facing * 16
    this.punchBox.y = this.player.y
  }

  punch(){
    if (this.punchBox.active) return
    this.punchBox.active = true
    this.punchBox.setFillStyle(0xffff00, 0.25)
    this.time.delayedCall(100, () => {
      this.punchBox.active = false
      this.punchBox.setFillStyle(0xffffff, 0)
    })
  }
}
