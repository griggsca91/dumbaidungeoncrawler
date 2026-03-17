/**
 * Resource management system.
 * Tracks oxygen, power cell, and suit integrity.
 * Each resource depletes from specific actions and has consequences at zero.
 */

import { addMessage } from './combat.js';

/** Starting values for all resources. */
export const RESOURCE_DEFAULTS = {
  oxygen:       100,
  power:        100,
  suitIntegrity: 100,
};

/** Depletion rates per turn (passive). */
const DEPLETION = {
  oxygen: 1,   // O2 drains 1/turn always
  power:  0,   // Power only drains on active use
};

/** Damage per turn when O2 = 0 (suffocation). */
const SUFFOCATION_DAMAGE = 5;

/**
 * Create a fresh resource state.
 * @returns {object} Resources object.
 */
export function createResources() {
  return {
    oxygen:        RESOURCE_DEFAULTS.oxygen,
    power:         RESOURCE_DEFAULTS.power,
    suitIntegrity: RESOURCE_DEFAULTS.suitIntegrity,

    /** Flags for this-turn effects (reset each turn). */
    _effects: {
      suffocating: false,
      noPower: false,
    },
  };
}

/**
 * Process resource depletion at the end of each player turn.
 * @param {object} resources - The resources object on gameState.
 * @param {object} player - The player entity (to apply suffocation damage).
 * @param {object} gameState - Full game state for messaging.
 */
export function tickResources(resources, player, gameState) {
  resources._effects.suffocating = false;
  resources._effects.noPower = false;

  // ── Oxygen ──
  resources.oxygen = Math.max(0, resources.oxygen - DEPLETION.oxygen);

  if (resources.oxygen === 0) {
    resources._effects.suffocating = true;
    player.hp = Math.max(0, player.hp - SUFFOCATION_DAMAGE);
    addMessage(gameState, `No oxygen! You take ${SUFFOCATION_DAMAGE} suffocation damage!`, 'combat');
  } else if (resources.oxygen <= 20) {
    addMessage(gameState, `WARNING: Oxygen critically low (${resources.oxygen}%)!`, 'system');
  }

  // ── Power ──
  // Power drain from equipment is handled in consumePower().
  // Passive drain could be added here later (e.g., if powered suit is worn).

  // ── Suit Integrity ──
  // Suit integrity only decreases from damage (handled in combat.js applyDamage).
  // No passive depletion.
}

/**
 * Consume power for an action (powered weapon fire, hacking, flashlight toggle).
 * @param {object} resources - The resources object.
 * @param {number} amount - Power units to consume.
 * @param {object} gameState - For messaging.
 * @returns {boolean} True if power was available, false if action should fail.
 */
export function consumePower(resources, amount, gameState) {
  if (resources.power < amount) {
    resources._effects.noPower = true;
    addMessage(gameState, 'No power! Recharge your power cell.', 'system');
    return false;
  }
  resources.power = Math.max(0, resources.power - amount);
  return true;
}

/**
 * Restore a resource (pickup O2 canister, power cell, repair kit).
 * @param {object} resources - The resources object.
 * @param {'oxygen'|'power'|'suitIntegrity'} type - Which resource to restore.
 * @param {number} amount - Amount to restore.
 * @param {object} gameState - For messaging.
 */
export function restoreResource(resources, type, amount, gameState) {
  const max = RESOURCE_DEFAULTS[type];
  if (max === undefined) return;
  resources[type] = Math.min(max, resources[type] + amount);

  const labels = { oxygen: 'Oxygen', power: 'Power', suitIntegrity: 'Suit integrity' };
  addMessage(gameState, `${labels[type]} restored (+${amount}).`, 'system');
}

/**
 * Get color for a resource bar based on percentage.
 * @param {number} value
 * @param {number} max
 * @returns {string} CSS color string.
 */
export function getResourceColor(value, max) {
  const pct = value / max;
  if (pct > 0.5) return '#2ecc71';   // green
  if (pct > 0.25) return '#f39c12';  // orange
  return '#e74c3c';                   // red
}
