export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 40;
    this.hp = 1;
  }

  update(player) {
    if (this.x > player.x) this.x -= 1;
  }

  draw(ctx) {
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}
