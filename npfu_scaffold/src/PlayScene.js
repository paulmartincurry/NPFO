import Phaser from 'phaser'
import { GAME_HEIGHT, WORLD_WIDTH } from '../systems/constants.js'
import { Stages } from '../data/stages.js'
import { profile } from '../systems/profile.js'
import { FirePool } from '../systems/items.js'
// Helper functions for camera shake and flash toggles, reading values
// from localStorage. Shake returns a float 0..1; flash returns boolean.
function cfgShake(scene) {
  const val = localStorage.getItem('shake');
  const f = parseFloat(val);
  return isNaN(f) ? 0.6 : f;
}
function cfgFlash() {
  const v = localStorage.getItem('flash');
  return v === null ? true : v === 'true';
}

// Display a cut-in caption near the top of the screen for ms milliseconds.
function cutIn(scene, text, ms = 1600) {
  const t = scene.add.text(
    scene.cameras.main.worldView.centerX,
    64,
    text,
    { fontFamily: 'monospace', fontSize: 16, color: '#ffffff', backgroundColor: '#000a', padding: { x: 6, y: 3 } }
  ).setOrigin(0.5).setScrollFactor(0);
  scene.time.delayedCall(ms, () => t.destroy());
}

// Enemy playbooks: run per tick for each enemy. Implements riot cop phalanx,
// K9 lunge, bonehead jab/feint/haymaker and NF leader sweep. Default
// behaviour is to walk towards the player.
function aiTick(scene, enemy) {
  if (!enemy.body || !enemy.active) return;
  const type = enemy.getData('type');
  if ((enemy.getData('stunTime') || 0) > 0) return;
  switch (type) {
    case 'RiotCop': {
      const neighbors = scene.enemies.getChildren().filter(e =>
        e !== enemy &&
        e.active &&
        e.getData('type') === 'RiotCop' &&
        Phaser.Math.Distance.Between(e.x, e.y, enemy.x, enemy.y) < 48
      );
      const speed = neighbors.length >= 1 ? 28 : 45;
      const dir = Math.sign(scene.player.x - enemy.x);
      enemy.body.setVelocityX(speed * dir);
      let cd = enemy.getData('bashCD') ?? (1200 + Math.random() * 1200);
      cd -= scene.game.loop.delta;
      if (cd <= 0 && Math.abs(scene.player.x - enemy.x) < 36) {
        enemy.body.setVelocityX((dir || 1) * 180);
        scene.time.delayedCall(150, () => {
          if (enemy.body) enemy.body.setVelocityX(0);
        });
        scene.hurtPlayer?.(1);
        cd = 2500 + Math.random() * 1000;
      }
      enemy.setData('bashCD', cd);
      break;
    }
    case 'CopK9': {
      let cd = enemy.getData('k9CD') ?? 1600;
      cd -= scene.game.loop.delta;
      if (cd <= 0) {
        enemy.setData('flashTime', 120);
        scene.time.delayedCall(160, () => {
          const dir = Math.sign(scene.player.x - enemy.x) || 1;
          if (enemy.body) {
            enemy.body.setVelocityX(dir * 260);
            scene.time.delayedCall(140, () => {
              if (enemy.body) enemy.body.setVelocityX(0);
            });
          }
          if (Math.abs(scene.player.x - enemy.x) < 24) {
            scene.hurtPlayer?.(1);
          }
        });
        cd = 1900 + Math.random() * 800;
      }
      enemy.setData('k9CD', cd);
      break;
    }
    case 'Bonehead': {
      let phase = enemy.getData('bhPhase') || 0;
      let cd = enemy.getData('bhCD') ?? 1000;
      cd -= scene.game.loop.delta;
      if (cd <= 0) {
        if (phase === 0) {
          if (Math.abs(scene.player.x - enemy.x) < 28) {
            scene.hurtPlayer?.(1);
          }
          enemy.setData('bhPhase', 1);
          cd = 220;
        } else if (phase === 1) {
          enemy.setData('flashTime', 100);
          enemy.setData('bhPhase', 2);
          cd = 420;
        } else {
          if (Math.abs(scene.player.x - enemy.x) < 36) {
            scene.hurtPlayer?.(2);
            scene.cameras.main.shake(100, 0.003 * cfgShake(scene));
          }
          enemy.setData('bhPhase', 0);
          cd = 1400 + Math.random() * 600;
        }
      }
      enemy.setData('bhCD', cd);
      break;
    }
    case 'NFLeader': {
      let cd = enemy.getData('sweepCD') ?? 2200;
      cd -= scene.game.loop.delta;
      if (cd <= 0 && Math.abs(scene.player.x - enemy.x) < 48) {
        scene.hurtPlayer?.(1);
        if (scene.player.body) {
          scene.player.body.setVelocityX(-120 * Math.sign(scene.player.x - enemy.x));
        }
        scene.cameras.main.shake(80, 0.002 * cfgShake(scene));
        cd = 2800 + Math.random() * 700;
      }
      enemy.setData('sweepCD', cd);
      break;
    }
    default: {
      const dir = Math.sign(scene.player.x - enemy.x);
      let speed = 60;
      if (type === 'runner') speed = 120;
      if (type === 'NFCommander') speed = 50;
      enemy.body.setVelocityX(speed * dir);
      break;
    }
  }
}

// PlayScene orchestrates the moment‑to‑moment gameplay. It handles
// player movement, combat, enemy spawning, stage scripts, hazards,
// projectiles, and special mechanics such as rage mode. Each stage
// provides a script in data/stages.js which is interpreted here to
// produce bespoke flows (Lewisham boss fight, Hafenstraße push, etc.).
export default class PlayScene extends Phaser.Scene {
  constructor() {
    super('PlayScene')
    this.stageId = 'L'
    this.stageScript = 'lewisham'
    this.stagePhase = 'start'
    this.stageSegment = ''
    this.currentWave = 1
    this.wavesCleared = 0
    this.debugVisible = false
    this.debugText = null
    // Player state
    this.playerHp = 10
    this.playerMaxHp = 10
    this.usedRage = false
    this.rageActive = false
    this._rageTimer = 0
    // Collections
    this.hazards = []
    this.projectiles = []
    // Pool for recycling projectile objects
    this.deadProjectiles = []
  }

  /**
   * Init lifecycle hook receives data from TitleScene. It sets the
   * stage identifier and resolves the stage script for our flows.
   * @param {object} data
   */
  init(data) {
    if (data && data.stageId) {
      this.stageId = data.stageId
    }
    const cfg = Stages[this.stageId] || {}
    this.stageScript = cfg.script || 'lewisham'
    // Initialise phase/segment defaults based on script
    if (this.stageScript === 'hafen') {
      this.stagePhase = 'defense'
    } else if (this.stageScript === 'portland') {
      this.stageSegment = 'club'
    } else {
      this.stagePhase = 'fight'
    }
  }

  create() {
    // Reset player stats
    this.playerHp = 10
    this.playerMaxHp = 10
    this.usedRage = false
    this.rageActive = false
    this._rageTimer = 0

    this.currentWave = 1
    this.wavesCleared = 0

    // Hazard and projectile arrays
    this.hazards = []
    this.projectiles = []
    this.deadProjectiles = []

    // Create ground
    const ground = this.add.rectangle(0, GAME_HEIGHT - 20, WORLD_WIDTH, 20, 0x333333).setOrigin(0, 0)
    this.physics.add.existing(ground, true)

    // Player
    this.player = this.add.rectangle(100, GAME_HEIGHT - 60, 18, 28, 0x9acd32)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)
    this.player.body.setMaxVelocity(300, 1000)
    this.player.body.setDragX(1200)

    // World bounds and camera
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08)

    // Collisions
    this.physics.add.collider(this.player, ground)

    // Groups
    this.enemies = this.physics.add.group()

    // Punch hitbox
    this.punchBox = this.add.rectangle(this.player.x, this.player.y, 22, 20, 0xffffff, 0).setOrigin(0.5)
    this.physics.add.existing(this.punchBox)
    this.punchBox.body.setAllowGravity(false)
    this.punchBox.active = false

    // Input keys
    this.cursors = this.input.keyboard.createCursorKeys()
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)

    // Overlap detection: punches
    this.physics.add.overlap(this.punchBox, this.enemies, (box, enemy) => {
      if (!this.punchBox.active) return
      // Knockback
      const dir = Math.sign(enemy.x - this.player.x) || 1
      enemy.body.setVelocity(250 * dir, -150)
      // Damage
      const dmg = this.playerBuff?.damage ? 2 : 1
      let hp = enemy.getData('hp') || 1
      hp -= dmg
      enemy.setData('hp', hp)
      enemy.setData('flashTime', 150)
      enemy.setData('stunTime', Math.max(enemy.getData('stunTime') || 0, 200))
      // Commander whistles
      if (enemy.getData('type') === 'NFCommander') {
        const max = enemy.getData('maxHp') || hp + dmg
        const ratio = hp / max
        if (!enemy.getData('whistled75') && ratio <= 0.75) {
          enemy.setData('whistled75', true)
          this.spawnReinforcements()
        }
        if (!enemy.getData('whistled35') && ratio <= 0.35) {
          enemy.setData('whistled35', true)
          this.spawnReinforcements()
        }
      }
      if (hp <= 0) enemy.destroy()
      this.cameras.main.shake(80, 0.0015 * cfgShake(this))
      this.events.emit('hitLanded')
    })

    // Enemy ground collision
    this.physics.add.collider(this.enemies, ground)

    // Spawn initial enemies based on stage
    if (this.stageScript === 'hafen') {
      this.spawnWave(3)
    } else if (this.stageScript === 'portland') {
      this.spawnWave(3)
    } else {
      this.spawnWave(3)
    }

    // Debug HUD
    this.debugText = this.add.text(10, GAME_HEIGHT - 50, '', {
      fontFamily: 'monospace', fontSize: 10, color: '#00ff00'
    }).setDepth(1000).setVisible(false)
    this.debugVisible = false
    this.input.keyboard.on('keydown-F1', () => {
      this.debugVisible = !this.debugVisible
      this.debugText.setVisible(this.debugVisible)
    })

    // Save best wave on shutdown
    this.events.once('shutdown', () => {
      profile.saveBest?.(this.stageId, this.currentWave)
    })
  }

  /**
   * Spawn a wave of basic enemies. For demonstration, we spawn a mix
   * of goons and runners spaced across the screen. The wave index
   * increments currentWave for display and progression.
   * @param {number} count
   */
  spawnWave(count) {
    for (let i = 0; i < count; i++) {
      const type = i % 2 === 0 ? 'goon' : 'runner'
      this.spawnEnemy(300 + i * 60, type)
    }
    this.currentWave++
  }

  /**
   * Spawn an enemy at a given x coordinate. The type determines
   * appearance, HP and behaviour. Additional flags like whistled75 are
   * initialised here.
   * @param {number} x
   * @param {string} type
   */
  spawnEnemy(x, type = 'goon') {
    const colorMap = {
      runner: 0xffaa55,
      goon: 0xff5555,
      NFCommander: 0x99ccff,
      WaterCannonTruck: 0x8888ff,
      NFLeader: 0xdd2222,
      RiotCop: 0x4444aa,
      NaziHooligan: 0xaa5500,
      Bonehead: 0xbb8800,
      CopK9: 0x006600,
      ShieldCop: 0x5555aa
    }
    // Determine size for big enemies. Shield cops are slightly wider.
    let width, height
    if (type === 'WaterCannonTruck') {
      width = 80; height = 40
    } else if (type === 'NFLeader') {
      width = 24; height = 32
    } else if (type === 'ShieldCop') {
      width = 20; height = 28
    } else {
      width = 18; height = 28
    }
    const enemy = this.add.rectangle(x, GAME_HEIGHT - 60, width, height, colorMap[type] || 0xff5555)
    this.physics.add.existing(enemy)
    enemy.body.setCollideWorldBounds(true)
    // Stats
    let maxHp = 2
    if (type === 'runner') maxHp = 1
    if (type === 'NFCommander') maxHp = 10
    if (type === 'WaterCannonTruck') maxHp = 20
    if (type === 'NFLeader') maxHp = 15
    if (type === 'RiotCop') maxHp = 4
    if (type === 'NaziHooligan') maxHp = 3
    if (type === 'Bonehead') maxHp = 3
    if (type === 'CopK9') maxHp = 4
    if (type === 'ShieldCop') maxHp = 5
    enemy.setData('type', type)
    enemy.setData('hp', maxHp)
    enemy.setData('maxHp', maxHp)
    enemy.setData('flashTime', 0)
    enemy.setData('stunTime', 0)
    enemy.setData('whistled75', false)
    enemy.setData('whistled35', false)
    // Whether the enemy starts with a shield. Riot cops, shield cops and commander all have shields.
    enemy.setData('hasShield', type === 'RiotCop' || type === 'ShieldCop' || type === 'NFCommander')
    // For trucks, disable gravity
    if (type === 'WaterCannonTruck') {
      enemy.body.setAllowGravity(false)
    }
    this.enemies.add(enemy)
    // NFLeader special: set flag attack cooldown
    if (type === 'NFLeader') {
      enemy.setData('flagCooldown', 4000)
    }
    // AI: Only for non-truck enemies
    if (type !== 'WaterCannonTruck') {
      this.time.addEvent({
        delay: 250,
        loop: true,
        callback: () => {
          // Use aiTick to run enemy behaviour. It respects stun timers.
          aiTick(this, enemy)
        }
      })
    } else {
      // Water cannon AI: periodically shoot blasts
      enemy.setData('fireCooldown', 3000)
    }
    return enemy
  }

  /**
   * Spawn a pair of reinforcements offscreen to the right. Used by
   * commanders when HP thresholds are crossed.
   */
  spawnReinforcements() {
    const baseX = this.cameras.main.worldView.right + 40
    this.spawnEnemy(baseX, 'goon')
    this.spawnEnemy(baseX + 30, 'runner')
  }

  /**
   * Spawn a water blast projectile fired by the WaterCannonTruck.
   * @param {number} x
   * @param {number} y
   * @param {number} targetX
   * @param {number} speed
   */
  spawnProjectile(type, x, y, targetX, speed = 12) {
    // Reuse a projectile from the pool if available. Otherwise create new.
    let proj = this.deadProjectiles.pop()
    let width, height, color
    if (type === 'flagPole') {
      width = 36; height = 6; color = 0xdd4444
    } else {
      width = 12; height = 4; color = 0x88bbff
    }
    const dxVal = speed * Math.sign(this.player.x - x)
    if (!proj) {
      const sprite = this.add.rectangle(x, y, width, height, color)
      this.physics.add.existing(sprite)
      sprite.body.setAllowGravity(false)
      proj = { type, x, y, dx: dxVal, sprite }
    } else {
      proj.type = type
      proj.x = x; proj.y = y; proj.dx = dxVal
      proj.sprite.setPosition(x, y)
      proj.sprite.setVisible(true)
      proj.sprite.width = width; proj.sprite.height = height
      proj.sprite.fillColor = color
    }
    this.projectiles.push(proj)
  }

  /**
   * Damage the player and trigger rage if applicable. During rage
   * active, the player is invincible and buffed.
   * @param {number} amount
   */
  hurtPlayer(amount = 1) {
    if (this.rageActive) return
    this.playerHp = Math.max(0, this.playerHp - amount)
    if (this.playerHp <= 0) {
      // TODO: handle game over
    }
    this.tryRage()
  }

  /**
   * Try to activate rage mode if conditions are met: HP < 15% and
   * Rebel meter full. Resets the Rebel meter and applies buffs for
   * five seconds.
   */
  tryRage() {
    if (this.usedRage || this.playerHp <= 0) return
    // Acquire Rebel meter from UIScene
    const ui = this.scene.get('UIScene')
    const rebel = ui?.rebel ?? 0
    if (this.playerHp < 0.15 * this.playerMaxHp && rebel >= 100) {
      this.usedRage = true
      if (ui) {
        ui.rebel = 0
        ui.meter.width = 0
        ui.riotActive = false
      }
      this.rageActive = true
      this._rageTimer = 5000
      this.playerBuff = { speed: 1.5, damage: 2 }
      if (cfgFlash()) {
        this.cameras.main.flash(120, 255, 255, 255)
      }
    }
  }

  /**
   * Update loop. Handles input, AI, hazards, projectiles, stage
   * scripts and debug overlay.
   */
  update() {
    // Pause
    if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
      this.scene.pause()
      this.scene.launch('PauseScene')
    }

    const body = /** @type {Phaser.Physics.Arcade.Body} */ (this.player.body)
    const speedMultiplier = this.playerBuff?.speed || 1
    const accel = 800 * speedMultiplier

    // Horizontal movement
    if (this.cursors.left.isDown) body.setAccelerationX(-accel)
    else if (this.cursors.right.isDown) body.setAccelerationX(accel)
    else body.setAccelerationX(0)

    // Jump
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && body.blocked.down) {
      body.setVelocityY(-400)
    }

    // Punch
    if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      this.punch()
    }

    // Molotov / FirePool
    if (Phaser.Input.Keyboard.JustDown(this.keyX)) {
      const dropX = this.player.x + (this.cursors.left.isDown ? -24 : 24)
      const pool = new FirePool(this, dropX, GAME_HEIGHT - 40)
      this.hazards.push(pool)
    }

    // Align punch box
    const facing = this.cursors.left.isDown ? -1 : 1
    this.punchBox.x = this.player.x + facing * 16
    this.punchBox.y = this.player.y

    // Stage script updates
    const dt = this.game.loop.delta
    if (this.stageScript === 'hafen') {
      this.runHafen(dt)
    } else if (this.stageScript === 'portland') {
      this.runPortland(dt)
    } else {
      this.runLewisham(dt)
    }

    // Rage timer countdown
    if (this.rageActive) {
      this._rageTimer -= dt
      if (this._rageTimer <= 0) {
        this.rageActive = false
        this.playerBuff = null
      }
    }

    // Update hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i]
      h.update(dt)
      if (h.duration <= 0) {
        this.hazards.splice(i, 1)
      }
    }

    // Update projectiles and handle collisions/pooling
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]
      p.x += p.dx
      p.sprite.x = p.x
      // Check collision with player
      if (Phaser.Geom.Intersects.RectangleToRectangle(p.sprite.getBounds(), this.player.getBounds())) {
        this.hurtPlayer(1)
        // Knockback effect on hit
        this.player.body.setVelocityX(-200 * Math.sign(p.dx))
        // Recycle projectile
        p.sprite.setVisible(false)
        this.deadProjectiles.push(p)
        this.projectiles.splice(i, 1)
      } else if (p.x < this.cameras.main.worldView.left - 50 || p.x > this.cameras.main.worldView.right + 50) {
        // Remove offscreen and recycle
        p.sprite.setVisible(false)
        this.deadProjectiles.push(p)
        this.projectiles.splice(i, 1)
      }
    }

    // Per‑enemy flashing and stuns
    this.enemies.children.iterate((e) => {
      if (!e || !e.active) return
      let ft = e.getData('flashTime') || 0
      let st = e.getData('stunTime') || 0
      if (ft > 0) {
        ft -= dt
        e.setFillStyle(0xffffff, 0.7)
      } else {
        // Reset colour by type
        const t = e.getData('type')
        const baseColors = { runner: 0xffaa55, goon: 0xff5555, NFCommander: 0x99ccff, WaterCannonTruck: 0x8888ff, NFLeader: 0xdd2222 }
        e.setFillStyle(baseColors[t] || 0xff5555, 1)
      }
      if (st > 0) {
        st -= dt
        // Dampen velocity during stun
        e.body.setVelocityX(e.body.velocity.x * 0.9)
      }
      e.setData('flashTime', Math.max(0, ft))
      e.setData('stunTime', Math.max(0, st))
      // Water cannon firing logic
      if (e.getData('type') === 'WaterCannonTruck') {
        let cd = e.getData('fireCooldown')
        cd -= dt
        if (cd <= 0) {
          cd = 3000
          // Fire a blast at the player
          this.spawnProjectile('waterBlast', e.x - 40, e.y - 10, this.player.x, 10)
        }
        e.setData('fireCooldown', cd)
      }
      // NFLeader flagpole attack
      if (e.getData('type') === 'NFLeader') {
        let cd = e.getData('flagCooldown')
        cd -= dt
        if (cd <= 0) {
          cd = 5000
          // Spawn a slow flagpole swipe across the screen
          // The projectile travels horizontally at medium speed
          this.spawnProjectile('flagPole', e.x, e.y - 10, this.player.x, 6)
        }
        e.setData('flagCooldown', cd)
      }
    })

    // Debug overlay
    if (this.debugVisible) {
      const fps = Math.round(this.game.loop.actualFps)
      const enemies = this.enemies.getLength()
      const uiScene = this.scene.get('UIScene')
      const rebel = uiScene ? uiScene.rebel : 0
      this.debugText.setText([
        `FPS: ${fps}`,
        `Enemies: ${enemies}`,
        `Wave: ${this.currentWave}`,
        `Rebel: ${rebel}`,
        `HP: ${this.playerHp}/${this.playerMaxHp}`
      ])
    }
  }

  /**
   * Player punch action. Activates the hitbox for a short duration.
   */
  punch() {
    if (this.punchBox.active) return
    this.punchBox.active = true
    this.punchBox.setFillStyle(0xffff00, 0.25)
    this.time.delayedCall(100, () => {
      this.punchBox.active = false
      this.punchBox.setFillStyle(0xffffff, 0)
    })
  }

  /**
   * Stage logic for Lewisham. After clearing waves, spawns the boss.
   * A simple demonstration: three waves of goons then a NFLeader.
   * @param {number} dt
   */
  runLewisham(dt) {
    // Stage phases: fight -> wall -> boss -> complete
    if (this.stagePhase === 'complete') return

    // Fight phase: spawn waves until two waves are cleared, then spawn shield wall
    if (this.stagePhase === 'fight') {
      if (this.enemies.getLength() === 0) {
        this.wavesCleared++
        if (this.wavesCleared < 2) {
          this.spawnWave(3)
        } else {
          // Transition to wall phase
          this.stagePhase = 'wall'
          // Spawn shield cops in a line to block progress
          const startX = this.player.x + 120
          for (let i = 0; i < 3; i++) {
            this.spawnEnemy(startX + i * 30, 'ShieldCop')
          }
          // Show a cut-in caption for the wall
          cutIn(this, "Hold the line!")
        }
      }
    } else if (this.stagePhase === 'wall') {
      // Wait until shield cops die
      const wallAlive = this.enemies.getChildren().some(e => e.getData('type') === 'ShieldCop')
      if (!wallAlive) {
        // Spawn boss behind the former wall position
        this.spawnEnemy(this.player.x + 200, 'NFLeader')
        this.stagePhase = 'boss'
        // Show cut-in caption for boss
        cutIn(this, "NF Leader: Flag-waving coward")
      }
    } else if (this.stagePhase === 'boss') {
      if (this.enemies.getLength() === 0) {
        this.stagePhase = 'complete'
        // TODO: victory / proceed
      }
    }
  }

  /**
   * Stage logic for Hafenstraße ’87. Survive a defense phase of
   * successive waves, then push forward into a mini‑boss fight with
   * the WaterCannonTruck.
   * @param {number} dt
   */
  runHafen(dt) {
    if (this.stagePhase === 'defense') {
      if (this.enemies.getLength() === 0) {
        this.wavesCleared++
        if (this.wavesCleared < 3) {
          this.spawnWave(3)
        } else {
          // Transition to push phase
          this.stagePhase = 'push'
          // Spawn the Wasserwerfer (water cannon truck)
          const truckX = this.player.x + 300
          this.spawnEnemy(truckX, 'WaterCannonTruck')
          // Show cut-in caption for Wasserwerfer
          cutIn(this, "Wasserwerfer incoming!")
        }
      }
    } else if (this.stagePhase === 'push') {
      // If the truck is destroyed, stage complete
      const truckAlive = this.enemies.getChildren().some(e => e.getData('type') === 'WaterCannonTruck')
      if (!truckAlive) {
        this.stagePhase = 'complete'
        // Show cut-in caption when truck is disabled
        cutIn(this, "Truck disabled!")
        // TODO: transition to next scene or end
      }
    }
  }

  /**
   * Stage logic for Portland ’89. Progresses through segments: club
   * fight, then a makeshift truck fight and final boss.
   * @param {number} dt
   */
  runPortland(dt) {
    switch (this.stageSegment) {
      case 'club':
        if (this.enemies.getLength() === 0) {
          this.stageSegment = 'truck'
          // Spawn a pickup truck with two thugs
          const truck = this.spawnEnemy(this.player.x + 200, 'WaterCannonTruck')
          this.spawnEnemy(truck.x - 30, 'goon')
          this.spawnEnemy(truck.x + 30, 'goon')
          // Show cut-in caption to chase the truck
          cutIn(this, "Chase!")
        }
        break
      case 'truck':
        // Wait until thugs are dead
        const thugsAlive = this.enemies.getChildren().some(e => e.getData('type') !== 'WaterCannonTruck')
        if (!thugsAlive) {
          this.stageSegment = 'boss'
          // Remove truck
          this.enemies.getChildren().forEach(e => { if (e.getData('type') === 'WaterCannonTruck') e.destroy() })
          // Spawn final boss
          this.spawnEnemy(this.player.x + 200, 'NFLeader')
          // Show cut-in caption after crash
          cutIn(this, "They crashed! Finish it!")
        }
        break
      case 'boss':
        if (this.enemies.getLength() === 0) {
          this.stageSegment = 'complete'
        }
        break
      default:
        break
    }
  }
}