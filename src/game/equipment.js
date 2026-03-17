/**
 * Equipment system.
 * Handles equipping/unequipping items, inventory management,
 * item degradation, and stat application.
 */

import { addMessage } from './combat.js';
import { restoreResource } from './resources.js';

/** Valid equipment slot names. */
export const SLOTS = ['head', 'torso', 'armLeft', 'armRight', 'back', 'legs'];

/** Map from item.slot to player equipment slot names. */
const SLOT_MAP = {
  head:        ['head'],
  torso:       ['torso'],
  arm:         ['armLeft', 'armRight'],  // arms prefer left-empty first
  back:        ['back'],
  legs:        ['legs'],
  consumable:  [],  // not equipped, used immediately on pickup
};

/** Max inventory slots (without backpack). */
const BASE_INVENTORY_SLOTS = 8;

/**
 * Attempt to pick up and equip or stash an item.
 * If the item matches an empty slot it auto-equips; otherwise goes to inventory.
 * Consumables are used immediately on pickup.
 * @param {object} player - Player entity.
 * @param {object} item - Item to pick up.
 * @param {object} gameState - Full game state.
 * @returns {boolean} True if pickup succeeded.
 */
export function pickupItem(player, item, gameState) {
  // Consumables: use immediately
  if (item.slot === 'consumable' && item.restores) {
    restoreResource(gameState.resources, item.restores.type, item.restores.amount, gameState);
    return true;
  }

  // Try to auto-equip into an empty slot
  const targetSlots = SLOT_MAP[item.slot] || [];
  for (const slot of targetSlots) {
    if (!player.equipment[slot]) {
      player.equipment[slot] = item;
      addMessage(gameState, `Equipped ${item.name} (${slot}).`, 'system');
      return true;
    }
  }

  // Otherwise, add to inventory
  const maxSlots = getInventoryCapacity(player);
  if (player.inventory.length < maxSlots) {
    player.inventory.push(item);
    addMessage(gameState, `${item.name} added to inventory.`, 'system');
    return true;
  }

  addMessage(gameState, `Inventory full! Drop something first.`, 'system');
  return false;
}

/**
 * Equip an item from inventory into the appropriate slot.
 * The previously equipped item is moved to inventory.
 * @param {object} player
 * @param {number} inventoryIndex - Index in player.inventory.
 * @param {string} slot - Specific slot to equip into ('armLeft' or 'armRight' for arms).
 * @param {object} gameState
 * @returns {boolean}
 */
export function equipFromInventory(player, inventoryIndex, slot, gameState) {
  const item = player.inventory[inventoryIndex];
  if (!item) return false;

  // Validate slot matches item type
  const validSlots = SLOT_MAP[item.slot] || [];
  if (item.slot !== 'arm' && !validSlots.includes(slot)) {
    addMessage(gameState, `${item.name} can't go in that slot.`, 'system');
    return false;
  }

  // Swap
  const current = player.equipment[slot];
  player.equipment[slot] = item;
  player.inventory.splice(inventoryIndex, 1);

  if (current) {
    player.inventory.push(current);
    addMessage(gameState, `Equipped ${item.name}. ${current.name} returned to inventory.`, 'system');
  } else {
    addMessage(gameState, `Equipped ${item.name}.`, 'system');
  }

  return true;
}

/**
 * Drop an equipped item onto the floor at the player's position.
 * @param {object} player
 * @param {string} slot - Slot to unequip.
 * @param {object} gameState
 */
export function unequipToFloor(player, slot, gameState) {
  const item = player.equipment[slot];
  if (!item) return;

  player.equipment[slot] = null;
  if (!gameState.itemsOnFloor) gameState.itemsOnFloor = [];
  gameState.itemsOnFloor.push({ x: player.x, y: player.y, item });
  addMessage(gameState, `Dropped ${item.name}.`, 'system');
}

/**
 * Degrade an item's durability. Removes it when durability hits 0.
 * @param {object} player
 * @param {string} slot - Which equipment slot to degrade.
 * @param {number} amount - Durability points to remove.
 * @param {object} gameState
 */
export function degradeItem(player, slot, amount, gameState) {
  const item = player.equipment[slot];
  if (!item) return;

  item.durability = Math.max(0, item.durability - amount);

  if (item.durability <= 0) {
    player.equipment[slot] = null;
    addMessage(gameState, `Your ${item.name} breaks!`, 'system');
  } else if (item.durability <= Math.ceil(item.maxDurability * 0.2)) {
    addMessage(gameState, `${item.name} is critically damaged!`, 'system');
  }
}

/**
 * Get the player's maximum inventory capacity.
 * @param {object} player
 * @returns {number}
 */
export function getInventoryCapacity(player) {
  const backpack = player.equipment?.back;
  return BASE_INVENTORY_SLOTS + (backpack?.inventoryBonus || 0);
}

/**
 * Find items on the floor at a given position.
 * @param {number} x
 * @param {number} y
 * @param {object} gameState
 * @returns {object[]} Array of { x, y, item } objects.
 */
export function getItemsAt(x, y, gameState) {
  return (gameState.itemsOnFloor || []).filter(e => e.x === x && e.y === y);
}
