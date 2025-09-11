import { WIDTH, HEIGHT, GRAVITY, PLAYER_SPEED, JUMP_VEL, REBEL_MAX, REBEL_GAIN, SURGE_TIME, DASH_IFRAME, HEAVY_ARMOR } from './constants.js';
import { keyDown } from './input.js';

export class Player {
  constructor(level) {
    this.level = level;
    this.x = WIDTH / 2;
    this.y = HEIGHT - 20;
    this.vx = 0;
    this.vy = 0;
    this.w = 16;
    this.h = 16;
    this.dir = 1;
    this.onGround = true;
    this.attackTimer = 0;
    this.rebel = 0;
    this.surge = 0;
    this.hp = 100;
    this.armor = 0;
    this.iframe = 0;
  }

  update(dt) {
    this.armor = Math.max(0, this.armor - dt);
    this.iframe = Math.max(0, this.iframe - dt);
    this.vx = 0;
    if (keyDown('arrowleft')) { this.vx = -PLAYER_SPEED; this.dir = -1; }
    if (keyDown('arrowright')) { this.vx = PLAYER_SPEED; this.dir = 1; }
    if (this.onGround && keyDown('arrowup')) {
      this.vy = JUMP_VEL;
      this.onGround = false;
    }
    if (keyDown('c')) {
      this.vx = this.dir * PLAYER_SPEED * 3;
      this.iframe = DASH_IFRAME;
    }
    this.attackTimer -= dt;
    if (this.attackTimer <= 0 && keyDown('z')) {
      this.attackTimer = 0.3;
      const atk = { x: this.x + this.dir * 10, y: this.y - 8, w: 8, h: 8, dir: this.dir };
      this.level.attacks.push(atk);
    }
    if (this.attackTimer <= 0 && keyDown('x')) {
      this.attackTimer = 0.6;
      this.armor = HEAVY_ARMOR;
      const atk = { x: this.x + this.dir * 12, y: this.y - 8, w: 12, h: 12, dir: this.dir, heavy: true };
      this.level.attacks.push(atk);
    }
    if (this.rebel >= REBEL_MAX && keyDown('v') && this.surge <= 0) {
      this.rebel = 0;
      this.surge = SURGE_TIME;
    }
    if (this.surge > 0) this.surge -= dt;

    this.x += this.vx * dt;
    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= HEIGHT - 4) { // ground
      this.y = HEIGHT - 4;
      this.vy = 0;
      this.onGround = true;
    }
    this.x = Math.max(0, Math.min(WIDTH - this.w, this.x));
  }

  render(ctx) {
    ctx.fillStyle = this.surge > 0 ? '#f0f' : '#0f0';
    ctx.fillRect(this.x, this.y - this.h, this.w, this.h);
  }
}
