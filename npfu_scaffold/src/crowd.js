export class Chant {
  constructor(scene, bpm = 96) {
    this.scene = scene;
    this.bpm = bpm;
    this.msPerBeat = 60000 / bpm;
    this.timer = 0;
    this.listeners = [];
    this.enabled = true;
    this.lastBeatTime = 0;
  }
  update(dt) {
    if (!this.enabled) return;
    this.timer += dt;
    while (this.timer >= this.msPerBeat) {
      this.timer -= this.msPerBeat;
      this.lastBeatTime = this.scene.time.now;
      this.listeners.forEach(fn => fn());
    }
  }
  onBeat(fn) {
    this.listeners.push(fn);
  }
  isOnBeat(windowMs = 120) {
    return (this.scene.time.now - this.lastBeatTime) <= windowMs;
  }
}