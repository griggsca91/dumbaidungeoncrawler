/**
 * Door and terminal interaction system.
 * Doors have states: open (20), closed (21), locked (22), destroyed (0).
 * Terminals (30=active, 31=inactive) can be hacked to unlock doors,
 * reveal map data, or trigger lore entries.
 */

import { LAYERS } from '../engine/renderer.js';
import { addMessage } from './combat.js';
import { raiseAlert } from './warden.js';

// Tile IDs
const DOOR_OPEN      = 20;
const DOOR_CLOSED    = 21;
const DOOR_LOCKED    = 22;
const TERM_ACTIVE    = 30;
const TERM_INACTIVE  = 31;

/**
 * Get the door state at a tile position.
 * @param {number} x
 * @param {number} y
 * @param {object} tileMap
 * @returns {'open'|'closed'|'locked'|'destroyed'|null}
 */
export function getDoorState(x, y, tileMap) {
  const tile = tileMap.getTile(LAYERS.WALLS, x, y);
  if (tile === DOOR_OPEN)   return 'open';
  if (tile === DOOR_CLOSED) return 'closed';
  if (tile === DOOR_LOCKED) return 'locked';
  // Door tile = 0 but floor present = destroyed
  if (tile === 0 && tileMap.getTile(LAYERS.FLOOR, x, y) > 0) return null;
  return null;
}

/**
 * Get terminal state at a tile position (from OBJECTS layer).
 * @returns {'active'|'inactive'|null}
 */
export function getTerminalState(x, y, tileMap) {
  const tile = tileMap.getTile(LAYERS.OBJECTS, x, y);
  if (tile === TERM_ACTIVE)   return 'active';
  if (tile === TERM_INACTIVE) return 'inactive';
  return null;
}

/**
 * Open a closed door. Makes the tile passable.
 * @param {number} x
 * @param {number} y
 * @param {object} tileMap
 */
export function openDoor(x, y, tileMap) {
  tileMap.setTile(LAYERS.WALLS, x, y, DOOR_OPEN);
}

/**
 * Close an open door.
 */
export function closeDoor(x, y, tileMap) {
  tileMap.setTile(LAYERS.WALLS, x, y, DOOR_CLOSED);
}

/**
 * Destroy a door — clears wall tile, door cannot be closed again.
 */
export function destroyDoor(x, y, tileMap) {
  tileMap.setTile(LAYERS.WALLS, x, y, 0);
}

/**
 * Attempt to interact with an adjacent door or terminal.
 * Checks 4 cardinal neighbors of (px, py).
 * @param {object} player
 * @param {object} tileMap
 * @param {object} state
 * @returns {boolean} True if an interaction occurred (consumes turn).
 */
export function interactAdjacent(player, tileMap, state) {
  const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

  // Prefer the tile the player is facing
  const facingVec = { north: { dx:0,dy:-1 }, south: { dx:0,dy:1 }, east: { dx:1,dy:0 }, west: { dx:-1,dy:0 } };
  const facingDir = facingVec[player.facing];
  const orderedDirs = facingDir
    ? [facingDir, ...dirs.filter(d => d.dx !== facingDir.dx || d.dy !== facingDir.dy)]
    : dirs;

  for (const { dx, dy } of orderedDirs) {
    const tx = player.x + dx;
    const ty = player.y + dy;

    // Check door
    const doorState = getDoorState(tx, ty, tileMap);
    if (doorState === 'closed') {
      openDoor(tx, ty, tileMap);
      addMessage(state, 'You open the door.', 'system');
      return true;
    }
    if (doorState === 'open') {
      closeDoor(tx, ty, tileMap);
      addMessage(state, 'You close the door.', 'system');
      return true;
    }
    if (doorState === 'locked') {
      return handleLockedDoor(player, tx, ty, tileMap, state);
    }

    // Check terminal
    const termState = getTerminalState(tx, ty, tileMap);
    if (termState === 'active') {
      return hackTerminal(player, tx, ty, tileMap, state);
    }
    if (termState === 'inactive') {
      addMessage(state, 'This terminal is unpowered.', 'system');
      return false;
    }
  }

  addMessage(state, 'Nothing to interact with nearby.', 'system');
  return false;
}

/**
 * Handle a locked door interaction.
 * Requires a hacking rig (back slot). Raises alert on attempt.
 */
function handleLockedDoor(player, tx, ty, tileMap, state) {
  const hackBonus = player.equipment?.back?.hackingBonus || 0;

  if (hackBonus === 0) {
    addMessage(state, 'Locked. You need a hacking rig to bypass this.', 'system');
    return false; // No turn consumed
  }

  // Raise alert just for attempting
  raiseAlert(state, 1, 'hacking');

  const successChance = 0.45 + hackBonus;
  if (Math.random() < successChance) {
    openDoor(tx, ty, tileMap);
    addMessage(state, 'Hack successful. Door unlocked.', 'system');
  } else {
    addMessage(state, 'Hack failed. The door remains locked.', 'system');
  }
  return true; // Attempt always consumes a turn
}

/**
 * Hack an active terminal.
 * Effects (pick one randomly based on context):
 *   - Reveal current room and adjacent rooms on minimap
 *   - Unlock the nearest locked door
 *   - Display a lore entry
 * Always raises alert by 1 on success.
 */
export function hackTerminal(player, tx, ty, tileMap, state) {
  const hackBonus = player.equipment?.back?.hackingBonus || 0;
  const successChance = 0.5 + hackBonus;

  raiseAlert(state, 1, 'hacking');

  if (Math.random() >= successChance) {
    addMessage(state, 'Hack failed. The Warden detected the intrusion.', 'system');
    return true;
  }

  // Success — pick an effect
  const effects = ['reveal', 'unlock', 'lore'];
  const effect = effects[Math.floor(Math.random() * effects.length)];

  if (effect === 'reveal') {
    revealNearbyRooms(player, state);
    addMessage(state, 'Hack success. Local map data downloaded.', 'system');
  } else if (effect === 'unlock') {
    const unlocked = unlockNearestDoor(player, tileMap, state);
    if (unlocked) {
      addMessage(state, 'Hack success. Nearby door unlocked.', 'system');
    } else {
      revealNearbyRooms(player, state);
      addMessage(state, 'Hack success. No locked doors nearby — map data downloaded instead.', 'system');
    }
  } else {
    displayLoreEntry(state);
  }

  // Mark terminal as used (dim it)
  tileMap.setTile(LAYERS.OBJECTS, tx, ty, TERM_INACTIVE);
  return true;
}

/**
 * Mark nearby rooms as visited (reveals them on the minimap).
 */
function revealNearbyRooms(player, state) {
  if (!state.rooms) return;
  const REVEAL_RADIUS = 25; // tiles
  for (const room of state.rooms) {
    const dx = room.cx - player.x;
    const dy = room.cy - player.y;
    if (Math.sqrt(dx * dx + dy * dy) <= REVEAL_RADIUS) {
      room.visited = true;
    }
  }
}

/**
 * Find and unlock the nearest locked door within 15 tiles.
 * @returns {boolean} True if a door was unlocked.
 */
function unlockNearestDoor(player, tileMap, state) {
  let best = null;
  let bestDist = 15;

  for (let dy = -bestDist; dy <= bestDist; dy++) {
    for (let dx = -bestDist; dx <= bestDist; dx++) {
      const tx = player.x + dx;
      const ty = player.y + dy;
      if (getDoorState(tx, ty, tileMap) === 'locked') {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist < bestDist) {
          bestDist = dist;
          best = { x: tx, y: ty };
        }
      }
    }
  }

  if (best) {
    openDoor(best.x, best.y, tileMap);
    return true;
  }
  return false;
}

/**
 * Display a random lore entry from the terminal.
 */
const LORE_ENTRIES = [
  'KHARON-7 INCIDENT LOG: Day 12. Three researchers have stopped showing up to meals. Dr. Vasic says they\'re "fine." They are not fine.',
  'MAINTENANCE MEMO: For the last time, stop using the emergency airlock as a shortcut. — Chief Engineer Rho',
  'WARDEN DIAGNOSTIC: Quarantine protocols engaged. Crew vitals: 67% nominal. 33% ERROR. Initiating isolation procedures.',
  'PERSONAL LOG — T. MIRA: The samples are alive. They shouldn\'t be alive. We\'re 400 million kilometres from the nearest... thing. They\'re alive.',
  'CORPORATE DISPATCH: Kharon-7, your research deadline has been extended. Please confirm receipt. Kharon-7? Please confirm.',
  'SAFETY BULLETIN: In the event of a Class-4 containment failure, proceed to airlock C-7. Do NOT use the elevators. The elevators are NOT SAFE.',
  'WARDEN: All crew. This is a quarantine notification. The station is sealed. You are safe. Please remain calm. You are safe. Please remain calm.',
  'DR. VASIC JOURNAL: The structure below the ice is not artificial. At least, not in any sense we understand. It predates the solar system.',
];

function displayLoreEntry(state) {
  if (!state._usedLore) state._usedLore = new Set();
  const unused = LORE_ENTRIES.filter((_, i) => !state._usedLore.has(i));
  if (unused.length === 0) {
    addMessage(state, 'Terminal: No new data.', 'lore');
    return;
  }
  const idx = Math.floor(Math.random() * unused.length);
  const originalIdx = LORE_ENTRIES.indexOf(unused[idx]);
  state._usedLore.add(originalIdx);
  addMessage(state, `TERMINAL: ${unused[idx]}`, 'lore');
}
