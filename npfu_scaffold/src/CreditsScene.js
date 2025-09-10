import Phaser from 'phaser'

/**
 * CreditsScene scrolls a list of acknowledgments and thank‑yous. The
 * scroll is simple; pressing any key returns to the title screen.
 */
export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene')
  }
  create() {
    const w = this.cameras.main.width
    const h = this.cameras.main.height
    // Credits text lines
    const lines = [
      'CREDITS',
      '',
      'Code & Design:',
      '  – The Pit Collective',
      '',
      'Historical Context & Research:',
      '  – Anti‑fascist activists worldwide',
      '',
      'Music:',
      '  – DIY punk and hardcore bands (placeholder)',
      '',
      'Special Thanks:',
      '  – Anti‑Racist Action (ARA)',
      '  – SHARP',
      '  – The Hafenstraße squatters',
      '  – Portland punk community',
      '',
      'This game is a tribute to everyone who stood up against fascism.',
      '',
      'No Nazis. No KKK. No Fascist USA.'
    ]
    const content = lines.join('\n')
    // Create a text object that will scroll upward
    const text = this.add.text(w / 2, h, content, {
      fontFamily: 'monospace', fontSize: 14, color: '#ffffff', align: 'center', lineSpacing: 4, wordWrap: { width: w - 60 }
    }).setOrigin(0.5, 0)
    // Set up scrolling: move up at 30 pixels/second
    this.tweens.add({
      targets: text,
      y: -text.height - 20,
      duration: (text.height + h + 20) * 1000 / 30,
      ease: 'Linear'
    })
    // Input to return to title
    this.input.keyboard.once('keydown-ESC', () => {
      this.scene.start('TitleScene')
    })
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('TitleScene')
    })
  }
}