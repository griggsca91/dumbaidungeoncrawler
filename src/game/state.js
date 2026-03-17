/**
 * Game state container.
 * Central place for all runtime game data.
 * This is a placeholder that will be expanded as systems are added.
 */

import { createCamera } from '../engine/camera.js';

/**
 * Create a fresh game state for a new run.
 * @returns {object} The initial game state.
 */
export function createGameState() {
  return {
    /** Current turn number. */
    turn: 0,

    /** Camera position in grid coords. */
    camera: createCamera(12, 8),

    /** Game phase: 'playing', 'paused', 'gameover'. */
    phase: 'playing',

    /** Debug flags. */
    debug: {
      showGrid: true,
    },
  };
}
