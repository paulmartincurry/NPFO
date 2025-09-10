// systems/audio.js
//
// This module exposes a simple audio bus for controlling global audio
// properties. It centralizes music playback and volume/mute toggles,
// and it can be extended later with separate SFX channels. The bus
// stores only one music track at a time; new tracks replace the old.

export const AudioBus = {
  _master: 1,
  _muted: false,
  _music: null,

  /**
   * Set the master volume between 0 and 1. Values outside the range
   * are clamped. The change is applied immediately to the music.
   * @param {number} v
   */
  setVolume(v) {
    this._master = Math.max(0, Math.min(1, v));
    this._apply();
  },

  /**
   * Mute or unmute all audio. When muted, music volume is forced to 0.
   * @param {boolean} m
   */
  setMute(m) {
    this._muted = !!m;
    this._apply();
  },

  /**
   * Play a music track from the given URL. If another track is
   * currently playing, it is stopped and replaced. Music loops
   * indefinitely. If playback is blocked (e.g. by the browser until
   * user interaction), the promise rejection is ignored silently.
   * @param {string} src
   */
  playMusic(src) {
    try {
      if (this._music) {
        this._music.pause();
      }
      const el = new Audio(src);
      el.loop = true;
      this._music = el;
      this._apply();
      el.play().catch(() => {});
    } catch (e) {
      // Fail silently if Audio cannot be constructed
    }
  },

  /**
   * Stop any currently playing music.
   */
  stopMusic() {
    if (this._music) {
      try { this._music.pause(); } catch (e) {}
      this._music = null;
    }
  },

  /**
   * Apply current volume/mute settings to the music instance.
   */
  _apply() {
    const vol = this._muted ? 0 : this._master;
    if (this._music) {
      try { this._music.volume = vol; } catch (e) {}
    }
  }
};
