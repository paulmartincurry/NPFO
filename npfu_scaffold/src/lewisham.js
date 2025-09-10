// Stage script for Lewisham ’77.
// This module implements the bespoke flow for the Lewisham level. It
// exposes init, update, isComplete and isFailed functions which the
// PlayScene delegates to. The script maintains its own state on the
// scene via the stageData property rather than storing local module
// variables so that multiple instances of the scene can run safely.

/**
 * Initialise stage state on the scene. Sets up the phase and wave
 * counters. Called once from PlayScene.create().
 * @param {Phaser.Scene} scene
 */
export function init(scene) {
  scene.stageData = {
    phase: 'fight',
    wavesCleared: 0
  }
  // Spawn the first wave of enemies for Lewisham
  scene.spawnWave(3)
}

/**
 * Update logic for Lewisham. Handles waves, the shield wall and
 * boss. Uses the scene’s spawnWave and spawnEnemy helpers and
 * displays cut‑in captions via cutIn(). When complete, the phase is
 * set to 'complete'.
 * @param {Phaser.Scene} scene
 * @param {number} dt
 */
export function update(scene, dt) {
  const data = scene.stageData
  if (!data || data.phase === 'complete') return
  // Fight phase: clear two waves before wall
  if (data.phase === 'fight') {
    if (scene.enemies.getLength() === 0) {
      data.wavesCleared++
      if (data.wavesCleared < 2) {
        scene.spawnWave(3)
      } else {
        // Spawn shield cops ahead of the player to form a wall
        data.phase = 'wall'
        const startX = scene.player.x + 120
        for (let i = 0; i < 3; i++) {
          scene.spawnEnemy(startX + i * 30, 'ShieldCop')
        }
        scene.events.emit('cutin', "Hold the line!")
      }
    }
  } else if (data.phase === 'wall') {
    // Wait for all shield cops to be defeated
    const wallAlive = scene.enemies.getChildren().some(e => e.getData('type') === 'ShieldCop')
    if (!wallAlive) {
      // Spawn the boss behind the wall
      scene.spawnEnemy(scene.player.x + 200, 'NFLeader')
      data.phase = 'boss'
      scene.events.emit('cutin', "NF Leader: Flag-waving coward")
    }
  } else if (data.phase === 'boss') {
    // Check if all enemies are dead to complete stage
    if (scene.enemies.getLength() === 0) {
      data.phase = 'complete'
    }
  }
}

/**
 * Return true if the stage conditions are met for completion.
 * @param {Phaser.Scene} scene
 */
export function isComplete(scene) {
  return scene.stageData?.phase === 'complete'
}

/**
 * Return true if the player has lost (HP <= 0).
 * @param {Phaser.Scene} scene
 */
export function isFailed(scene) {
  return scene.playerHp !== undefined && scene.playerHp <= 0
}