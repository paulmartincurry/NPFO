// Stage script for Portland ’89. Consists of a club brawl, a truck
// chase/fight sequence and a final boss fight. Each segment
// transitions linearly. Completion occurs when the boss is defeated.

export function init(scene) {
  scene.stageData = {
    segment: 'club'
  }
  // Spawn initial club wave
  scene.spawnWave(3)
}

export function update(scene, dt) {
  const data = scene.stageData
  if (!data || data.segment === 'complete') return
  switch (data.segment) {
    case 'club': {
      // After clearing club enemies, transition to truck segment
      if (scene.enemies.getLength() === 0) {
        data.segment = 'truck'
        // Spawn a pickup truck and two thugs
        const truck = scene.spawnEnemy(scene.player.x + 200, 'WaterCannonTruck')
        scene.spawnEnemy(truck.x - 30, 'goon')
        scene.spawnEnemy(truck.x + 30, 'goon')
        scene.events.emit('cutin', "Chase!")
      }
      break
    }
    case 'truck': {
      // Wait until all non-truck enemies (thugs) are dead
      const thugsAlive = scene.enemies.getChildren().some(e => e.getData('type') !== 'WaterCannonTruck')
      if (!thugsAlive) {
        // Transition to boss segment
        data.segment = 'boss'
        // Remove the truck
        scene.enemies.getChildren().forEach(e => {
          if (e.getData('type') === 'WaterCannonTruck') e.destroy()
        })
        // Spawn final boss
        scene.spawnEnemy(scene.player.x + 200, 'NFLeader')
        scene.events.emit('cutin', "They crashed! Finish it!")
      }
      break
    }
    case 'boss': {
      if (scene.enemies.getLength() === 0) {
        data.segment = 'complete'
      }
      break
    }
    default:
      break
  }
}

export function isComplete(scene) {
  return scene.stageData?.segment === 'complete'
}

export function isFailed(scene) {
  return scene.playerHp !== undefined && scene.playerHp <= 0
}