import { isDown } from './input.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 40;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.rebel = 0;
    this.rebelActive = 0;
  }

  update(level) {
    if (isDown('ArrowLeft')) this.x -= 2;
    if (isDown('ArrowRight')) this.x += 2;
    if (isDown('ArrowUp') && this.onGround) {
      this.vy = -5;
      this.onGround = false;
    }
    this.vy += 0.2;
    this.y += this.vy;
    if (this.y >= 300) {
      this.y = 300;
      this.vy = 0;
      this.onGround = true;
    }
    if (isDown('z')) level.playerAttack(this, false);
    if (isDown('x')) level.playerAttack(this, true);
    if (isDown('c')) this.x += isDown('ArrowLeft') ? -5 : 5;
    if (isDown('v') && this.rebel >= 100 && this.rebelActive <= 0) {
      this.rebelActive = 240;
      this.rebel = 0;
    }
    if (this.rebelActive > 0) this.rebelActive--;
  }

  draw(ctx) {
    ctx.fillStyle = this.rebelActive > 0 ? '#f00' : '#fff';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
