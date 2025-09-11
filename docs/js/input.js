import { initAudio } from './audio.js';

const keys = new Set();
let audioInit = false;

export function initInput() {
  window.addEventListener('keydown', e => {
    keys.add(e.key.toLowerCase());
    if (!audioInit) { initAudio(); audioInit = true; }
  });
  window.addEventListener('keyup', e => {
    keys.delete(e.key.toLowerCase());
  });
}

export function keyDown(k) {
  return keys.has(k.toLowerCase());
}
