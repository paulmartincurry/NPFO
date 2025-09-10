import Phaser from 'phaser'

/**
 * PanelScene renders a series of zine‑style panels with text. It serves
 * as an interstitial between the title and gameplay scenes. Pressing
 * Enter will advance to the next scene, passing along any specified
 * data via nextData.
 */
export default class PanelScene extends Phaser.Scene {
  constructor() {
    super('PanelScene');
  }
  init(data) {
    this.panels = data?.panels || [];
    this.next = data?.next || 'PlayScene';
    this.nextData = data?.nextData || {};
  }
  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    // Semi‑transparent backdrop
    this.add.rectangle(0, 0, w, h, 0x000000, 0.9).setOrigin(0);
    // Draw each panel as a box with a light stroke and white text
    this.panels.forEach((txt, i) => {
      const y = 40 + i * 90;
      this.add.rectangle(w / 2, y, w - 60, 70, 0x111111)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff);
      this.add.text(w / 2, y, txt, {
        fontFamily: 'monospace',
        fontSize: 14,
        color: '#eaeaea',
        wordWrap: { width: w - 90 }
      }).setOrigin(0.5);
    });
    // Prompt to continue
    this.add.text(w / 2, h - 28, 'Press ENTER', {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#bbbbbb'
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start(this.next, this.nextData);
    });
  }
}