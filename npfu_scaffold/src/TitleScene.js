import Phaser from 'phaser'
import { GAME_WIDTH, GAME_HEIGHT } from '../systems/constants.js'
import { profile } from '../systems/profile.js'
import { Stages } from '../data/stages.js'
import { AudioBus } from '../systems/audio.js'

// TitleScene displays the game title and waits for the player to begin.
// We also expose a stage selection overlay with keys L/H/P that map
// directly to the available stages defined in data/stages.js. The best
// wave reached for each stage is shown alongside the name using values
// loaded from localStorage.
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene')
  }

  create() {
    // Load persisted profile data once on startup. This will populate
    // profile.bestWave. If localStorage is unavailable nothing breaks.
    profile.load?.()

    // Draw a black background over the entire canvas
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0)

    // Game title text
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'NPFU', {
      fontFamily: 'monospace',
      fontSize: 36,
      color: '#f2f2f2'
    }).setOrigin(0.5)

    // Prompt the player to start with Enter. We'll still allow this
    // for players who prefer a default stage.
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 4, 'Press ENTER to Start', {
      fontFamily: 'monospace',
      fontSize: 14,
      color: '#bcbcbc'
    }).setOrigin(0.5)

    // Stage selection instructions. We loop over the defined stages and
    // display each with its key and best wave reached. Keys are fixed
    // for this prototype: L = Lewisham, H = Hafenstraße, P = Portland.
    const stageKeys = {
      L: 'L',
      H: 'H',
      P: 'P'
    }
    const lines = []
    let idx = 0
    for (const id of Object.keys(Stages)) {
      const stage = Stages[id]
      const key = stageKeys[id] || id
      const best = profile.bestWave?.[id] ?? 0
      lines.push(`${key} – ${stage.name} (Best: Wave ${best})`)
      idx++
    }
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 32, lines.join('\n'), {
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#8888ff',
      align: 'center',
      lineSpacing: 4
    })
    text.setOrigin(0.5)

    // Listen for Enter key to start the default stage (Lewisham)
    this.input.keyboard.once('keydown-ENTER', () => {
      this.startStage('L')
    })

    // Listen for stage selection keys. We use uppercase codes for
    // simplicity. When pressed we pass the stage id into PlayScene.
    this.input.keyboard.on('keydown-L', () => this.startStage('L'))
    this.input.keyboard.on('keydown-H', () => this.startStage('H'))
    this.input.keyboard.on('keydown-P', () => this.startStage('P'))
  }

  /**
   * Transition from the title screen into PlayScene with a given
   * stage identifier. Also launches the UI scene alongside the game.
   * @param {string} stageId
   */
  startStage(stageId) {
    // Show an introductory panel sequence before gameplay.
    // Each stage defines a zine-style intro of three lines.
    const intros = {
      L: [
        "LEWISHAM ’77",
        "Street march against NF.",
        "Cops form the line. We break it."
      ],
      H: [
        "HAFENSTRASSE ’87",
        "Night siege over the squats.",
        "They wheel out the Wasserwerfer."
      ],
      P: [
        "PORTLAND ’89",
        "Basement show scatters.",
        "They’re running—then they’re driving."
      ]
    }
    const panels = intros[stageId] || ["", "", ""]
    // Launch PanelScene first; pass next scene and stageId via nextData.
    this.scene.start('PanelScene', { panels, next: 'PlayScene', nextData: { stageId } })
    // Launch the UI scene in parallel; PanelScene will start PlayScene automatically.
    this.scene.launch('UIScene')
    // Play stage music using AudioBus if defined
    const cfg = Stages[stageId]
    if (cfg && cfg.musicTrack) {
      AudioBus.playMusic(cfg.musicTrack)
    }
  }
}