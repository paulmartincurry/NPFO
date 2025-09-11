import { REBEL_MAX } from './constants.js';
import { keyDown } from './input.js';

let showDebug = false;
let prevD = false;
let hitstop = 0;
let shake = 0;

export function addHitstop(t) {
  hitstop = Math.max(hitstop, t);
}

export function addShake(s) {
  shake = Math.max(shake, s);
}

export function consumeHitstop(dt) {
  if (hitstop <= 0) return false;
  hitstop = Math.max(0, hitstop - dt);
  return true;
}

export function applyShake(ctx) {
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    shake *= 0.9;
  }
}

export function updateUI() {
  const d = keyDown('d');
  if (d && !prevD) showDebug = !showDebug;
  prevD = d;
  return showDebug;
}

export function renderHUD(ctx, level) {
  ctx.fillStyle = '#fff';
  ctx.fillText(`Score ${level.score}`, 4, 8);
  ctx.fillStyle = '#555';
  ctx.fillRect(4, 12, 100, 5);
  ctx.fillStyle = '#0ff';
  ctx.fillRect(4, 12, 100 * (level.player.rebel / REBEL_MAX), 5);
}

export function renderDebug(ctx, info) {
  if (!showDebug) return;
  ctx.fillStyle = 'yellow';
  ctx.fillText(info.state.toUpperCase(), 4, 30);
  ctx.fillText(`FPS:${info.fps.toFixed(0)}`, 4, 40);
  ctx.fillText(`ENT:${info.entities}`, 4, 50);
  ctx.fillText(`WAVE:${info.wave}`, 4, 60);
  ctx.fillText(`REBEL:${info.rebel}`, 4, 70);
  ctx.fillText(`HP:${info.hp}`, 4, 80);
}
