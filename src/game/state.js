/**
 * Game state container.
 * Central place for all runtime game data.
 */

import { createCamera } from '../engine/camera.js';
import { createPlayer } from './player.js';
import { createResources } from './resources.js';
import { getItemById } from './items.js';
import { createBot, createMutant } from './enemy.js';

/**
 * Create a fresh game state for a new run.
 * @returns {object} The initial game state.
 */
export function createGameState() {
  const player = createPlayer(4, 4);

  // Place test enemies (will be replaced by proc-gen in STORY-0006)
  const enemies = [
    createBot(10, 3, 'drone'),
    createBot(18, 2, 'bot'),
    createMutant(5, 12, 'shambler'),
    createMutant(14, 14, 'runner'),
  ];

  return {
    /** The player entity. */
    player,

    /** All non-player entities (enemies, NPCs). */
    entities: enemies,

    /** Player resources: oxygen, power, suitIntegrity. */
    resources: createResources(),

    /** Items lying on the floor: array of { x, y, item } */
    itemsOnFloor: [
      { x: 3,  y: 5,  item: getItemById('weapon_pistol') },
      { x: 7,  y: 3,  item: getItemById('weapon_crowbar') },
      { x: 2,  y: 8,  item: getItemById('suit_light_armor') },
      { x: 4,  y: 6,  item: getItemById('consumable_o2') },
      { x: 6,  y: 3,  item: getItemById('consumable_power') },
      { x: 18, y: 4,  item: getItemById('weapon_rifle') },
      { x: 20, y: 2,  item: getItemById('legs_sprint') },
    ],

    /** Message log — array of { text, type, turn } */
    messages: [
      { text: 'Station Kharon-7. Something is very wrong here.', type: 'lore', turn: 0 },
      { text: 'WASD: move | G: pickup | E: interact | Space: wait', type: 'system', turn: 0 },
    ],

    /** Destructible object HP map: "x,y" -> { hp, maxHp } */
    destructibleState: {},

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


