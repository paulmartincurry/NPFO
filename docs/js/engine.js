import { initInput } from './input.js';
import { Player } from './player.js';
import { Level } from './level.js';
import { UI } from './ui.js';

const STEP = 1000 / 60;

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = new Player(50, 300);
    this.level = new Level(this.player);
    this.ui = new UI(this);
    this.last = 0;
    this.acc = 0;
    this.running = true;
    this.debug = false;
    initInput(this);
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  loop = (t) => {
    try {
      const dt = t - this.last;
      this.last = t;
      this.acc += dt;
      if (this.running) {
        while (this.acc >= STEP) {
          this.player.update(this.level);
          this.level.update();
          this.acc -= STEP;
        }
      }
      this.draw();
      requestAnimationFrame(this.loop);
    } catch (err) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.fillText('ERROR: ' + err.message, 10, 20);
      console.error(err);
    }
  };

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.level.draw(this.ctx);
    this.player.draw(this.ctx);
    if (this.player.rebelActive > 0) {
      this.ctx.fillStyle = 'rgba(255,0,0,0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    this.ui.draw(this.ctx);
    if (this.debug) this.ui.drawDebug(this.ctx);
  }
}

export function createEngine() {
  const canvas = document.getElementById('game');
  return new Engine(canvas);
}
