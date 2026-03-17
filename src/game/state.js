/**
 * Game state container.
 * Central place for all runtime game data.
 */

import { createCamera } from '../engine/camera.js';
import { createPlayer } from './player.js';

/**
 * Create a fresh game state for a new run.
 * @returns {object} The initial game state.
 */
export function createGameState() {
  const player = createPlayer(4, 4);

  return {
    /** The player entity. */
    player,

    /** All non-player entities (enemies, NPCs). */
    entities: [],

    /** Camera position in grid coords (follows player). */
    camera: createCamera(player.x, player.y),

    /** Game phase: 'playing', 'paused', 'gameover'. */
    phase: 'playing',

    /** Debug flags. */
    debug: {
      showGrid: false,
    },
  };
}
