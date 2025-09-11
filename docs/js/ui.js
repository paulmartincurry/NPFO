export class UI {
  constructor(engine) {
    this.engine = engine;
  }

  draw(ctx) {
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('Score: ' + this.engine.level.score, 10, 20);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 30, 100, 5);
    ctx.fillStyle = '#f00';
    ctx.fillRect(10, 30, this.engine.player.rebel, 5);
  }

  drawDebug(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.fillText(
      `RUN:${this.engine.running ? 'RUN' : 'PAUSE'} ENEMIES:${this.engine.level.enemies.length} WAVE:${this.engine.level.wave} REBEL:${this.engine.player.rebel}`,
      10,
      50
    );
  }
}
