/**
 * Player entity.
 * Extends base entity with player-specific logic.
 */

import { createEntity } from './entity.js';
import { getDirectionFromAction } from '../engine/input.js';

/**
 * Create the player entity.
 * @param {number} x - Starting grid X.
 * @param {number} y - Starting grid Y.
 * @returns {object} Player entity.
 */
export function createPlayer(x, y) {
  const player = createEntity(x, y, 'south', {
    hp: 100,
    maxHp: 100,
    name: 'Salvager',
    tileId: 40,
  });

  return player;
}

/**
 * Execute a player movement action.
 * @param {object} player - The player entity.
 * @param {string} action - The action string (e.g., 'move_north').
 * @param {object} tileMap - The tile map for collision checking.
 * @returns {boolean} True if the action was valid and consumed a turn.
 */
export function executePlayerAction(player, action, tileMap) {
  if (action === 'wait') {
    // Waiting is a valid turn action
    return true;
  }

  const dir = getDirectionFromAction(action);
  if (!dir) return false;

  const newX = player.x + dir.dx;
  const newY = player.y + dir.dy;

  // Update facing regardless of whether move succeeds
  const facingMap = { '0,-1': 'north', '0,1': 'south', '1,0': 'east', '-1,0': 'west' };
  player.facing = facingMap[`${dir.dx},${dir.dy}`] || player.facing;

  // Check walkability
  if (!tileMap.isWalkable(newX, newY)) {
    return false; // Blocked — no turn consumed
  }

  // Move player
  player.x = newX;
  player.y = newY;

  return true;
}
