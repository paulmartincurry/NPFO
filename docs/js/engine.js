import { WIDTH, HEIGHT, STEP } from './constants.js';
import { initInput } from './input.js';
import { initScenes, update, render, getDebugInfo, renderDebugHUD } from './scenes.js';
import { consumeHitstop, applyShake } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let last = 0;
let acc = 0;
let fps = 0;
let error = '';

function loop(t) {
  try {
    const dt = (t - last) / 1000;
    last = t;
    acc += dt;
    fps = dt > 0 ? 1 / dt : 0;
    while (acc >= STEP) {
      if (!consumeHitstop(STEP)) {
        update(STEP);
      }
      acc -= STEP;
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    applyShake(ctx);
    render(ctx);
    ctx.restore();
    const info = getDebugInfo();
    info.fps = fps;
    renderDebugHUD(ctx, info);
  } catch (e) {
    error = e.toString();
    console.error(e);
  }
  if (error) {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'red';
    ctx.fillText('ERROR: ' + error, 10, 10);
    ctx.restore();
  }
  requestAnimationFrame(loop);
}

export function start() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx.font = '10px monospace';
  ctx.textBaseline = 'top';
  initInput();
  initScenes();
  requestAnimationFrame(loop);
}

start();
