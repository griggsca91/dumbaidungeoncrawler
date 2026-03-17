/**
 * Player entity.
 * Handles movement, bump-to-attack, and player-specific logic.
 */

import { createEntity } from './entity.js';
import { getDirectionFromAction } from '../engine/input.js';
import { meleeAttack, rangedAttack, getEntityAt, isAdjacentTo, addMessage } from './combat.js';
import { hasLineOfSight } from './los.js';

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

  // Equipment slots — populated by the equipment system (STORY-0011)
  player.equipment = {
    head: null,
    torso: null,
    armLeft: null,
    armRight: null,
    back: null,
    legs: null,
  };

  // Inventory — populated by the equipment system (STORY-0011)
  player.inventory = [];

  return player;
}

/**
 * Execute a player action for one turn.
 * Handles movement, bump-to-attack, wait, pickup.
 * @param {object} player - The player entity.
 * @param {string} action - The action string.
 * @param {object} tileMap - The tile map for collision checking.
 * @param {object} gameState - Full game state.
 * @returns {boolean} True if a turn was consumed.
 */
export function executePlayerAction(player, action, tileMap, gameState) {
  if (action === 'wait') {
    addMessage(gameState, 'You wait...', 'system');
    return true;
  }

  if (action === 'pickup') {
    return handlePickup(player, tileMap, gameState);
  }

  if (action === 'interact') {
    return handleInteract(player, tileMap, gameState);
  }

  const dir = getDirectionFromAction(action);
  if (!dir) return false;

  const newX = player.x + dir.dx;
  const newY = player.y + dir.dy;

  // Update facing regardless of outcome
  const facingMap = { '0,-1': 'north', '0,1': 'south', '1,0': 'east', '-1,0': 'west' };
  player.facing = facingMap[`${dir.dx},${dir.dy}`] || player.facing;

  // Check for entity in target tile — bump-to-attack
  const targetEntity = getEntityAt(newX, newY, gameState);
  if (targetEntity && targetEntity !== player) {
    meleeAttack(player, targetEntity, gameState);
    return true; // Attack consumes turn even if it misses
  }

  // Movement
  if (!tileMap.isWalkable(newX, newY)) {
    return false; // Blocked — no turn consumed
  }

  player.x = newX;
  player.y = newY;
  return true;
}

/**
 * Handle item pickup action.
 */
function handlePickup(player, tileMap, gameState) {
  // Will be wired to equipment system in STORY-0011
  // For now, check for items on floor layer
  if (gameState.itemsOnFloor) {
    const item = gameState.itemsOnFloor.find(i => i.x === player.x && i.y === player.y);
    if (item) {
      if (player.inventory.length < 8) {
        player.inventory.push(item);
        gameState.itemsOnFloor = gameState.itemsOnFloor.filter(i => i !== item);
        addMessage(gameState, `You pick up ${item.name}.`, 'system');
        return true;
      } else {
        addMessage(gameState, 'Your inventory is full!', 'system');
        return false;
      }
    }
  }
  addMessage(gameState, 'Nothing to pick up here.', 'system');
  return false;
}

/**
 * Handle interact action (terminals, doors, etc.).
 */
function handleInteract(player, tileMap, gameState) {
  // Will be expanded in STORY-0013 (doors/hacking)
  addMessage(gameState, 'Nothing to interact with here.', 'system');
  return false;
}

/**
 * Compute the player's effective stats from base + equipment.
 * @param {object} player
 * @returns {object} Computed stats.
 */
export function getPlayerStats(player) {
  const stats = {
    maxHp: player.maxHp,
    armor: 0,
    meleeDamageBonus: 0,
    rangedDamageBonus: 0,
    visionBonus: 0,
    speedBonus: 0,
    powerDraw: 0,
  };

  if (!player.equipment) return stats;

  for (const item of Object.values(player.equipment)) {
    if (!item) continue;
    stats.armor              += item.armorValue      || 0;
    stats.meleeDamageBonus   += item.meleeDamage     || 0;
    stats.rangedDamageBonus  += item.rangedDamage    || 0;
    stats.visionBonus        += item.visionBonus     || 0;
    stats.speedBonus         += item.speedBonus      || 0;
    stats.powerDraw          += item.powerDraw       || 0;
  }

  return stats;
}
