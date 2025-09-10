// Stage script for Hafenstraße ’87. Implements a defense phase of
// successive waves followed by a push into a mini‑boss fight with
// the Wasserwerfer (WaterCannonTruck). When the truck is destroyed
// the stage completes.

export function init(scene) {
  scene.stageData = {
    phase: 'defense',
    wavesCleared: 0
  }
  // Spawn initial wave
  scene.spawnWave(3)
}

export function update(scene, dt) {
  const data = scene.stageData
  if (!data || data.phase === 'complete') return
  if (data.phase === 'defense') {
    if (scene.enemies.getLength() === 0) {
      data.wavesCleared++
      if (data.wavesCleared < 3) {
        scene.spawnWave(3)
      } else {
        // Transition to push phase: spawn the Wasserwerfer mini-boss
        data.phase = 'push'
        const truckX = scene.player.x + 300
        scene.spawnEnemy(truckX, 'WaterCannonTruck')
        scene.events.emit('cutin', "Wasserwerfer incoming!")
      }
    }
  } else if (data.phase === 'push') {
    // If the truck is destroyed, mark stage complete
    const truckAlive = scene.enemies.getChildren().some(e => e.getData('type') === 'WaterCannonTruck')
    if (!truckAlive) {
      data.phase = 'complete'
      scene.events.emit('cutin', "Truck disabled!")
    }
  }
}

export function isComplete(scene) {
  return scene.stageData?.phase === 'complete'
}

export function isFailed(scene) {
  return scene.playerHp !== undefined && scene.playerHp <= 0
}