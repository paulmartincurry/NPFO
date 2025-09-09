// stages.js
//
// This module declares the metadata for each playable stage. Each stage
// definition includes a descriptive name, a year, an optional colour
// palette and a list of enemies that can appear. Later features may
// reference additional properties such as cutscenes or music tracks.

export const Stages = {
  // Lewisham ’77 – Battle of Lewisham: the National Front are stopped
  // by antifascists. Palette is olive drab and stone grey.
  L: {
    name: "Lewisham ’77 – Battle of Lewisham",
    year: 1977,
    palette: ["#6B8E23", "#C2B280", "#708090", "#FFFFFF"],
    enemySet: ["Skinhead", "RiotCop"],
    musicTrack: "soundtrack_lewisham.mp3",
    script: 'lewisham'
  },
  // Hafenstraße ’87 – Squat Siege: Hamburg’s occupied waterfront becomes
  // a battleground. Palette is black, orange and grey.
  H: {
    name: "Hafenstraße ’87 – Squat Siege",
    year: 1987,
    palette: ["#0A0A0A", "#D9771A", "#5A5A5A", "#FFEF99"],
    enemySet: ["RiotCop", "NaziHooligan"],
    musicTrack: "soundtrack_hafen.mp3",
    script: 'hafen'
  },
  // Portland ’89 – Punk Brawl: West coast punks face boneheads. Neon
  // blues and magenta light the street.
  P: {
    name: "Portland ’89 – Punk Brawl",
    year: 1989,
    palette: ["#1B3351", "#D94295", "#718EFF", "#CCCCCC"],
    enemySet: ["Bonehead", "CopK9"],
    musicTrack: "soundtrack_portland.mp3",
    script: 'portland'
  }
}

/**
 * Return a list of all stage identifiers. Useful for iterating over
 * defined stages in UI code.
 * @returns {string[]}
 */
export function getStageIds() {
  return Object.keys(Stages)
}

/**
 * Get the stage definition by ID.
 * @param {string} id
 */
export function getStage(id) {
  return Stages[id]
}
