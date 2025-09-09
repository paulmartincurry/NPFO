import Phaser from 'phaser'

export default class UIScene extends Phaser.Scene {
  constructor(){ super('UIScene'); this.rebel = 0; this.riotActive = false }

  create(){
    this.rebel = 0; this.riotActive = false

    this.meterBg = this.add.rectangle(10,10,120,12,0x222222).setOrigin(0)
    this.meter   = this.add.rectangle(12,12,0,8,0x00ff88).setOrigin(0)
    this.label   = this.add.text(10,26,'Rebel Meter',{fontFamily:'monospace',fontSize:10,color:'#cccccc'}).setOrigin(0,0)

    this.scene.get('PlayScene').events.on('hitLanded', () => this.increment(10))
  }

  increment(n){
    if (this.riotActive) return
    this.rebel = Math.min(100, this.rebel + n)
    this.meter.width = 116 * (this.rebel / 100)
    if (this.rebel >= 100) this.activateRiotMode()
  }

  activateRiotMode(){
    this.riotActive = true
    const play = this.scene.get('PlayScene')
    play.playerBuff = { speed: 1.5, damage: 2 }
    this.cameras.main.flash(150, 255,255,255)
    this.tweens.add({ targets: this.cameras.main, zoom: 1.03, duration: 100, yoyo: true })

    this.time.delayedCall(5000, () => {
      this.rebel = 0
      this.meter.width = 0
      this.riotActive = false
      play.playerBuff = null
    })
  }
}
