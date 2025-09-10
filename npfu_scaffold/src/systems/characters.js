import chars from '../data/characters.json' assert { type: 'json' };

export function getCharacter(key = 'street_punk') {
  return chars[key] || chars['street_punk'];
}

// simple radial special (AOE) around player
export function doSpecial(scene, cfg) {
  const p = scene.player;
  const enemies = scene.enemies.getChildren();
  for (const e of enemies) {
    if (!e.active) continue;
    const dx = e.x - p.x, dy = e.y - p.y;
    if (dx * dx + dy * dy <= cfg.radius * cfg.radius) {
      // knock and damage
      if (e.body) e.body.setVelocity(Math.sign(dx || 1) * 320, -180);
      scene.applyDamageToEnemy?.(e, cfg.dmg, 0);
    }
  }
  scene.cameras.main.flash(120, 255, 255, 255);
}
