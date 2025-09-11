import { Enemy } from './enemy.js';
import { Player } from './player.js';
import { hit } from './audio.js';
import { REBEL_GAIN, REBEL_MAX, HITSTOP_TIME, SHAKE_MAG } from './constants.js';
import { addHitstop, addShake } from './ui.js';

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y && a.y + a.h > b.y - b.h;
}

export class Level {
  constructor() {
    this.player = new Player(this);
    this.enemies = [];
    this.attacks = [];
    this.spawnInterval = 2;
    this.spawnTimer = this.spawnInterval;
    this.score = 0;
    this.wave = 1;
    this.kills = 0;
    this.pops = [];
  }

  update(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnInterval = Math.max(0.5, 2 - this.wave * 0.1);
      this.spawnTimer = this.spawnInterval;
      this.enemies.push(new Enemy(320));
    }
    this.player.update(dt);
    for (const e of this.enemies) e.update(dt);

    for (const atk of this.attacks) {
      for (const e of this.enemies) {
        if (!e.dead && rectsOverlap(atk, e)) {
          e.dead = true;
          hit();
          addHitstop(HITSTOP_TIME);
          addShake(SHAKE_MAG);
          this.pops.push({ x: e.x, y: e.y - 10, t: 0.5 });
          this.score += 100;
          this.kills++;
          if (this.kills % 5 === 0) { this.wave++; }
          this.player.rebel = Math.min(REBEL_MAX, this.player.rebel + REBEL_GAIN);
        }
      }
    }
    this.attacks.length = 0;
    this.enemies = this.enemies.filter(e => !e.dead && e.x > -20);
    for (const p of this.pops) p.t -= dt;
    this.pops = this.pops.filter(p => p.t > 0);
  }

  render(ctx) {
    this.player.render(ctx);
    for (const e of this.enemies) e.render(ctx);
    ctx.fillStyle = '#fff';
    for (const p of this.pops) {
      ctx.fillText('KO', p.x, p.y - (0.5 - p.t) * 20);
    }
  }
}
