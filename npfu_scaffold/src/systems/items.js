// systems/items.js
//
// Hazard classes and other interactive items. For now we provide
// FirePool, which represents the burning oil left behind when a
// Molotov cocktail breaks. The pool periodically damages enemies and
// burns off riot shields. Pools expire after a short duration.

export class FirePool {
  /**
   * Construct a FirePool tied to a scene.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.radius = 52;
    this.duration = 5000;      // milliseconds
    this.tickInterval = 1000;  // damage tick every second
    this._tick = 0;
    // Visual representation: faint orange circle behind everything
    this.sprite = scene.add.circle(x, y, this.radius, 0xff5500, 0.25).setDepth(-1);
  }

  /**
   * Update the fire pool. Should be called each frame with the delta
   * time in ms. Damages enemies within the radius every tick. When
   * expired, the pool removes itself from the scene.
   * @param {number} dt
   */
  update(dt) {
    this.duration -= dt;
    if (this.duration <= 0) {
      this.destroy();
      return;
    }
    this._tick += dt;
    if (this._tick >= this.tickInterval) {
      this._tick -= this.tickInterval;
      // Deal damage to enemies standing in the fire
      this.scene.enemies.children.iterate((e) => {
        if (!e || !e.active) return;
        const dx = e.x - this.x, dy = e.y - this.y;
        if (dx * dx + dy * dy <= this.radius * this.radius) {
          let hp = e.getData('hp') || 1;
          hp -= 1;
          e.setData('hp', hp);
          e.setData('flashTime', 150);
          // Burn off shields if the enemy has one
          if (e.getData('hasShield')) {
            e.setData('hasShield', false);
            e.setData('flashTime', 200);
          }
          if (hp <= 0) e.destroy();
        }
      });
    }
  }

  /** Destroy the pool’s sprite. */
  destroy() {
    this.sprite?.destroy();
  }
}
