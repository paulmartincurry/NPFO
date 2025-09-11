import { createEngine } from './engine.js';

const title = document.getElementById('title');
const controls = document.getElementById('controls');
const stage = document.getElementById('stage');
const results = document.getElementById('results');

const engine = createEngine();

function start() {
  title.classList.remove('visible');
  controls.classList.remove('visible');
  stage.classList.add('visible');
  setTimeout(() => {
    stage.classList.remove('visible');
    engine.start();
  }, 1000);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && title.classList.contains('visible')) {
    start();
  }
});
