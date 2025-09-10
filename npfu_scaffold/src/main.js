import Phaser from 'phaser'
import BootScene from './scenes/BootScene.js'
import TitleScene from './scenes/TitleScene.js'
import PanelScene from './scenes/PanelScene.js'
import PlayScene from './scenes/PlayScene.js'
import UIScene from './scenes/UIScene.js'
import PauseScene from './scenes/PauseScene.js'
import { GAME_WIDTH, GAME_HEIGHT } from './systems/constants.js'
import { AudioBus } from './systems/audio.js'

// Phaser game configuration. This sets up the canvas size, physics engine,
// and the list of scenes that compose our game. We expose the stage
// selection and UI scenes here to allow TitleScene to launch them.
const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#111111',
  scale: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    pixelArt: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  // Register PanelScene between TitleScene and PlayScene to handle
  // interstitial zine-style intros. TitleScene will start PanelScene
  // with the appropriate panels and then PanelScene will load
  // PlayScene.
  scene: [BootScene, TitleScene, PanelScene, PlayScene, UIScene, PauseScene]
}

// Instantiate the Phaser.Game with our configuration. When the window
// loads this will kick off BootScene which in turn shows the title.
const game = new Phaser.Game(config)

// On window load, restore audio preferences and bind UI controls. We
// listen for input changes on the volume slider and mute checkbox to
// update the AudioBus and persist values to localStorage. This block
// runs outside of Phaser lifecycle so it will be available from the
// moment the page loads.
window.addEventListener('load', () => {
  try {
    // Restore saved volume/mute values
    const vol  = localStorage.getItem('volume')
    const mute = localStorage.getItem('muted')
    if (vol !== null) {
      const v = parseFloat(vol)
      if (!isNaN(v)) AudioBus.setVolume(v)
      const s = document.getElementById('volumeSlider'); if (s) s.value = vol
    }
    if (mute === 'true') {
      AudioBus.setMute(true)
      const c = document.getElementById('muteCheckbox'); if (c) c.checked = true
    }
    // Bind input events
    const volSlider = document.getElementById('volumeSlider')
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        const v = Number(e.target.value)
        AudioBus.setVolume(v)
        try { localStorage.setItem('volume', String(v)) } catch (e) {}
      })
    }
    const muteBox = document.getElementById('muteCheckbox')
    if (muteBox) {
      muteBox.addEventListener('change', (e) => {
        const m = e.target.checked
        AudioBus.setMute(m)
        try { localStorage.setItem('muted', m ? 'true' : 'false') } catch (e) {}
      })
    }
    // Restore and bind shake slider, flash and grain toggles
    const shakeSlider = document.getElementById('shakeSlider')
    const flashCheckbox = document.getElementById('flashCheckbox')
    const grainCheckbox = document.getElementById('grainCheckbox')
    // Helper to load values from localStorage
    const loadVal = (k, fallback) => {
      const v = localStorage.getItem(k)
      return v !== null ? v : fallback
    }
    if (shakeSlider) {
      shakeSlider.value = loadVal('shake', '0.6')
      shakeSlider.addEventListener('input', (e) => {
        try { localStorage.setItem('shake', String(e.target.value)) } catch (e) {}
      })
    }
    if (flashCheckbox) {
      flashCheckbox.checked = loadVal('flash', 'true') === 'true'
      flashCheckbox.addEventListener('change', (e) => {
        try { localStorage.setItem('flash', e.target.checked ? 'true' : 'false') } catch (e) {}
      })
    }
    if (grainCheckbox) {
      grainCheckbox.checked = loadVal('grain', 'false') === 'true'
      grainCheckbox.addEventListener('change', (e) => {
        try { localStorage.setItem('grain', e.target.checked ? 'true' : 'false') } catch (e) {}
      })
    }
  } catch (e) {
    // silently ignore any DOM/storage errors
  }
})

export default game