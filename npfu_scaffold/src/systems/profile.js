// profile.js
//
// This module persists per‑stage progress to localStorage. Each stage
// tracks the highest wave the player has reached. The values are
// loaded when the game boots and saved whenever the PlayScene ends. If
// localStorage is unavailable (for example during server‑side
// rendering), the values remain in memory only.

export const profile = {
  // Highest wave cleared per stage. Keys correspond to stage IDs such as
  // 'L', 'H' and 'P'. Values default to 0 until loaded.
  bestWave: { L: 0, H: 0, P: 0 },

  /**
   * Load best wave values from localStorage if available. Each key is
   * stored under 'bestWave_?' where ? is the stage ID. Missing values
   * are left at their defaults. This should be called once on
   * startup, typically from TitleScene.
   */
  load() {
    try {
      const ids = Object.keys(this.bestWave)
      ids.forEach(id => {
        const key = 'bestWave_' + id
        const val = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
        if (val !== null && !isNaN(parseInt(val))) {
          this.bestWave[id] = parseInt(val) || 0
        }
      })
    } catch (e) {
      // If localStorage is not available we silently ignore errors.
    }
  },

  /**
   * Save a new best wave for a given stage. Only records values higher
   * than the previously saved best. Writes to localStorage if
   * available.
   * @param {string} stageId
   * @param {number} wave
   */
  saveBest(stageId, wave) {
    if (!stageId) return
    const current = this.bestWave[stageId] || 0
    if (wave > current) {
      this.bestWave[stageId] = wave
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('bestWave_' + stageId, String(wave))
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
