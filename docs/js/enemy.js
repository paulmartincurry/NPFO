import { HEIGHT } from './constants.js';

export class Enemy {
  constructor(x) {
    this.x = x;
    this.y = HEIGHT - 20;
    this.vx = -30;
    this.w = 16;
    this.h = 16;
    this.hp = 1;
    this.dead = false;
  }

  update(dt) {
    this.x += this.vx * dt;
  }

  render(ctx) {
    ctx.fillStyle = '#f00';
    ctx.fillRect(this.x, this.y - this.h, this.w, this.h);
  }
}
