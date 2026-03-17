/**
 * Game state container.
 * Central place for all runtime game data.
 */

import { createCamera } from '../engine/camera.js';
import { createPlayer } from './player.js';
import { createEntity } from './entity.js';

/**
 * Create a fresh game state for a new run.
 * @returns {object} The initial game state.
 */
export function createGameState() {
  const player = createPlayer(4, 4);

  // Place a couple of test enemies
  const enemies = [
    createTestEnemy(10, 3, 'bot'),
    createTestEnemy(15, 8, 'bot'),
    createTestEnemy(5, 12, 'mutant'),
  ];

  return {
    /** The player entity. */
    player,

    /** All non-player entities (enemies, NPCs). */
    entities: enemies,

    /** Items lying on the floor { x, y, item } */
    itemsOnFloor: [],

    /** Message log — array of { text, type, turn } */
    messages: [
      { text: 'Station Kharon-7. Something is very wrong here.', type: 'lore', turn: 0 },
      { text: 'WASD: move | G: pickup | E: interact | Space: wait', type: 'system', turn: 0 },
    ],

    /** Current turn count. */
    turn: 0,

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

/**
 * Create a simple test enemy for development.
 * @param {number} x
 * @param {number} y
 * @param {'bot'|'mutant'} type
 * @returns {object} Enemy entity.
 */
function createTestEnemy(x, y, type) {
  if (type === 'bot') {
    return createEntity(x, y, 'south', {
      hp: 20,
      maxHp: 20,
      name: 'Patrol Drone',
      tileId: 41,
      faction: 'station',
      weapon: { name: 'Laser Emitter', type: 'ranged', minDamage: 4, maxDamage: 8, ammo: 20, accuracy: 0 },
    });
  } else {
    return createEntity(x, y, 'south', {
      hp: 15,
      maxHp: 15,
      name: 'Shambler',
      tileId: 42,
      faction: 'mutant',
      weapon: { name: 'Claws', type: 'melee', minDamage: 3, maxDamage: 6, accuracy: 0.05 },
    });
  }
}
