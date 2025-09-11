import { Enemy } from './enemy.js';

export class Level {
  constructor(player) {
    this.player = player;
    this.enemies = [];
    this.spawnTimer = 0;
    this.wave = 0;
    this.score = 0;
    this.attackCooldown = 0;
  }

  playerAttack(player, heavy) {
    if (this.attackCooldown > 0) return;
    const range = heavy ? 30 : 20;
    this.enemies.forEach((e) => {
      if (Math.abs(e.x - player.x) < range) {
        e.hp = 0;
        this.score += 100;
        player.rebel = Math.min(100, player.rebel + 20);
      }
    });
    this.attackCooldown = heavy ? 30 : 15;
  }

  update() {
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (--this.spawnTimer <= 0) {
      this.enemies.push(new Enemy(600, 300));
      this.spawnTimer = 180;
      this.wave++;
    }
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    this.enemies.forEach((e) => e.update(this.player));
  }

  draw(ctx) {
    this.enemies.forEach((e) => e.draw(ctx));
  }
}
