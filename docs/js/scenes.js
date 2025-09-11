import { WIDTH, HEIGHT } from './constants.js';
import { Level } from './level.js';
import { keyDown } from './input.js';
import { renderHUD, updateUI, renderDebug } from './ui.js';

let level;
let state = 'intro';
let introTimer = 0.8;
let prevP = false;

export function initScenes() {
  level = new Level();
  state = 'intro';
  introTimer = 0.8;
}

export function update(dt) {
  if (state === 'intro') {
    introTimer -= dt;
    if (introTimer <= 0 || keyDown('enter')) state = 'play';
  } else if (state === 'play') {
    if (keyDown('p') && !prevP) state = 'pause';
    level.update(dt);
  } else if (state === 'pause') {
    if (keyDown('p') && !prevP) state = 'play';
  }
  prevP = keyDown('p');
  updateUI();
}

export function render(ctx) {
  if (state !== 'intro') {
    level.render(ctx);
    renderHUD(ctx, level);
  }
  ctx.fillStyle = '#fff';
  if (state === 'intro') {
    ctx.fillText('STAGE 1', WIDTH / 2 - 20, HEIGHT / 2);
    ctx.fillText('PRESS ENTER', WIDTH / 2 - 30, HEIGHT / 2 + 10);
  } else if (state === 'pause') {
    ctx.fillText('PAUSED', WIDTH / 2 - 20, HEIGHT / 2);
  }
}

export function renderDebugHUD(ctx, info) {
  renderDebug(ctx, info);
}

export function getDebugInfo() {
  return {
    state,
    fps: 0,
    entities: level.enemies.length + 1,
    wave: level.wave,
    rebel: level.player.rebel,
    hp: level.player.hp
  };
}

export { level, state };
