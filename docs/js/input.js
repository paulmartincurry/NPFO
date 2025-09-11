const keys = {};

export function initInput(engine) {
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'p') {
      const pause = document.getElementById('pause');
      pause.classList.toggle('visible');
      engine.running = !pause.classList.contains('visible');
    }
    if (e.key === 'd') {
      engine.debug = !engine.debug;
    }
    if (e.key === 'h') {
      const controls = document.getElementById('controls');
      controls.classList.add('visible');
    }
    if (e.key === 'Escape') {
      const controls = document.getElementById('controls');
      controls.classList.remove('visible');
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });
}

export function isDown(key) {
  return keys[key];
}
