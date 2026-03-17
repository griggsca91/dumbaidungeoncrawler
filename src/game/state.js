/**
 * Game state container.
 * Central place for all runtime game data.
 * Enemies, items, and map are populated by the procedural generator.
 */

import { createCamera } from '../engine/camera.js';
import { createPlayer } from './player.js';
import { createResources } from './resources.js';

/**
 * Create a fresh game state shell for a new run.
 * The tileMap and entity/item lists are filled in by generateSector()
 * which is called from main.js immediately after.
 * @returns {object} Partially-populated game state.
 */
export function createGameState() {
  const player = createPlayer(4, 4);  // position will be overridden by proc-gen

  return {
    /** The player entity. */
    player,

    /** All non-player entities (enemies, NPCs). Populated by proc-gen. */
    entities: [],

    /** Player resources: oxygen, power, suitIntegrity. */
    resources: createResources(),

    /** Items lying on the floor. Populated by proc-gen. */
    itemsOnFloor: [],

    /** Message log — array of { text, type, turn } */
    messages: [
      { text: 'Station Kharon-7. Something is very wrong here.', type: 'lore', turn: 0 },
      { text: 'WASD: move  G: pickup  E: interact  Space: wait  I: inventory', type: 'system', turn: 0 },
    ],

    /** Destructible object HP map: "x,y" -> { hp, maxHp } */
    destructibleState: {},

    /** Room metadata array. Populated by proc-gen. */
    rooms: [],

    /** Current sector type. Set by proc-gen. */
    sectorType: 'docking',

    /** Warden alert level 0-5. */
    alertLevel: 0,

    /** Run stats. */
    stats: { kills: 0, itemsFound: 0 },

    /** Current turn count. */
    turn: 0,

    /** Camera position in grid coords (follows player). */
    camera: createCamera(4, 4),

    /** Game phase: 'playing', 'paused', 'gameover'. */
    phase: 'playing',

    /** Airlock stash (persists across runs). Populated from localStorage. */
    stash: [],
  };
}
