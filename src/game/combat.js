/**
 * Combat system.
 * Handles melee attacks, ranged attacks, hit/miss calculation, damage, and death.
 * All combat actions cost 1 AP and produce a message log entry.
 */

import { hasLineOfSight } from './los.js';
import { getCoverModifier, damageDestructible } from './cover.js';
import { rollLoot } from '../data/enemies.js';
import { getItemById } from './items.js';
import { raiseAlert } from './warden.js';

/** Base melee hit chance (no modifiers). */
const BASE_MELEE_HIT_CHANCE = 0.85;

/** Base ranged hit chance at optimal range. Falls off with distance. */
const BASE_RANGED_HIT_CHANCE = 0.80;

/** Optimal ranged attack range (tiles). Beyond this, accuracy drops. */
const OPTIMAL_RANGE = 5;

/**
 * Calculate hit chance for an attack.
 * @param {object} attacker - Attacker entity.
 * @param {object} target - Target entity.
 * @param {boolean} isMelee - Whether this is a melee attack.
 * @param {number} coverModifier - Cover reduction (0 = no cover, 0.5 = half, 0.75 = full).
 * @returns {number} Hit chance 0.0–1.0.
 */
export function calculateHitChance(attacker, target, isMelee, coverModifier = 0) {
  let chance;

  if (isMelee) {
    chance = BASE_MELEE_HIT_CHANCE;
  } else {
    const dist = Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y);
    const rangePenalty = Math.max(0, (dist - OPTIMAL_RANGE) * 0.05);
    chance = Math.max(0.05, BASE_RANGED_HIT_CHANCE - rangePenalty);
  }

  // Apply weapon accuracy bonus if attacker has a weapon
  const weapon = getWeapon(attacker);
  if (weapon) {
    chance += (weapon.accuracy || 0);
  }

  // Reduce by cover
  chance *= (1 - coverModifier);

  return Math.max(0.05, Math.min(0.99, chance));
}

/**
 * Attempt a melee attack from attacker to target.
 * Melee ignores cover (you're in their face).
 * @param {object} attacker - The attacking entity.
 * @param {object} target - The target entity.
 * @param {object} gameState - Full game state for logging.
 * @returns {{ hit: boolean, damage: number, killed: boolean }}
 */
export function meleeAttack(attacker, target, gameState) {
  const hitChance = calculateHitChance(attacker, target, true, 0);
  const hit = Math.random() < hitChance;

  // Raise alert when player is involved in combat (once per turn)
  if (gameState && (attacker === gameState.player || target === gameState.player)) {
    raiseAlert(gameState, 1, 'combat');
  }

  if (!hit) {
    addMessage(gameState, `${attacker.name} swings at ${target.name}... and misses!`, 'combat');
    return { hit: false, damage: 0, killed: false };
  }

  const damage = rollMeleeDamage(attacker);
  applyDamage(target, damage, gameState);

  const killed = !target.alive;
  if (killed) {
    addMessage(gameState, `${attacker.name} kills ${target.name}!`, 'combat-kill');
  } else {
    addMessage(gameState, `${attacker.name} hits ${target.name} for ${damage} damage.`, 'combat');
  }

  return { hit: true, damage, killed };
}

/**
 * Attempt a ranged attack from attacker to target.
 * @param {object} attacker - The attacking entity.
 * @param {object} target - The target entity.
 * @param {number} coverModifier - Cover reduction on target (0–0.75).
 * @param {object} gameState - Full game state for logging.
 * @returns {{ hit: boolean, damage: number, killed: boolean, noAmmo: boolean }}
 */
export function rangedAttack(attacker, target, coverModifier, gameState) {
  // Check ammo on the equipped ranged weapon
  const weapon = getRangedWeapon(attacker);
  if (!weapon) {
    addMessage(gameState, `${attacker.name} has no ranged weapon!`, 'system');
    return { hit: false, damage: 0, killed: false, noAmmo: true };
  }
  if (weapon.ammo <= 0) {
    addMessage(gameState, `${attacker.name}'s ${weapon.name} is out of ammo!`, 'system');
    return { hit: false, damage: 0, killed: false, noAmmo: true };
  }

  // Consume ammo
  if (weapon.id !== 'weapon_energy') weapon.ammo--;

  // Auto-calculate cover from game state if not provided
  let effectiveCover = coverModifier;
  if (effectiveCover === 0 && gameState.tileMap) {
    effectiveCover = getCoverModifier(attacker.x, attacker.y, target.x, target.y, gameState.tileMap);
  }

  const hitChance = calculateHitChance(attacker, target, false, effectiveCover);
  const hit = Math.random() < hitChance;

  if (!hit) {
    addMessage(gameState, `${attacker.name} fires at ${target.name}... and misses!`, 'combat');
    return { hit: false, damage: 0, killed: false, noAmmo: false };
  }

  const damage = rollRangedDamage(weapon);
  applyDamage(target, damage, gameState);

  const killed = !target.alive;
  if (killed) {
    addMessage(gameState, `${attacker.name} shoots ${target.name} dead!`, 'combat-kill');
  } else {
    addMessage(gameState, `${attacker.name} hits ${target.name} for ${damage} damage.`, 'combat');
  }

  return { hit: true, damage, killed, noAmmo: false };
}

/**
 * Apply damage to an entity. Reduces HP, kills if HP <= 0.
 * Also reduces suit integrity if target is the player.
 * @param {object} entity - Target entity.
 * @param {number} damage - Amount of damage to deal.
 * @param {object} gameState - For resource system access.
 */
export function applyDamage(entity, damage, gameState) {
  // Reduce by armor if present
  const armor = getArmor(entity);
  const armorVal = armor ? (armor.armorValue || 0) : 0;
  const finalDamage = Math.max(1, damage - armorVal);

  entity.hp = Math.max(0, entity.hp - finalDamage);

  // Reduce suit integrity when player takes damage
  if (entity === gameState.player && gameState.resources) {
    const suitDmg = Math.ceil(finalDamage * 0.3);
    gameState.resources.suitIntegrity = Math.max(0, gameState.resources.suitIntegrity - suitDmg);
  }

  if (entity.hp <= 0) {
    killEntity(entity, gameState);
  }
}

/**
 * Kill an entity, marking it dead and dropping loot if applicable.
 * @param {object} entity - The entity to kill.
 * @param {object} gameState - Full game state.
 */
export function killEntity(entity, gameState) {
  entity.alive = false;
  entity.hp = 0;

  // Roll loot drop
  if (entity.lootTable && entity.lootTable.length > 0) {
    const droppedId = rollLoot(entity.lootTable);
    if (droppedId) {
      const item = getItemById(droppedId);
      if (item) {
        if (!gameState.itemsOnFloor) gameState.itemsOnFloor = [];
        gameState.itemsOnFloor.push({ x: entity.x, y: entity.y, item });
      }
    }
  }

  // Track kill count for run stats
  if (!gameState.stats) gameState.stats = { kills: 0, itemsFound: 0 };
  gameState.stats.kills++;
}

/**
 * Check if the player can reach a target for melee (adjacent, including diagonal-adjacent).
 * @param {object} attacker
 * @param {object} target
 * @returns {boolean}
 */
export function isAdjacentTo(attacker, target) {
  const dx = Math.abs(attacker.x - target.x);
  const dy = Math.abs(attacker.y - target.y);
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
}

/**
 * Find the entity at a given grid position.
 * @param {number} x
 * @param {number} y
 * @param {object} gameState
 * @returns {object|null} Entity or null.
 */
export function getEntityAt(x, y, gameState) {
  if (gameState.player.x === x && gameState.player.y === y && gameState.player.alive) {
    return gameState.player;
  }
  return gameState.entities.find(e => e.x === x && e.y === y && e.alive) || null;
}

// --- Internal helpers ---

function rollMeleeDamage(attacker) {
  const weapon = getWeapon(attacker);
  if (weapon) {
    return weapon.minDamage + Math.floor(Math.random() * (weapon.maxDamage - weapon.minDamage + 1));
  }
  // Unarmed: 1-3
  return 1 + Math.floor(Math.random() * 3);
}

function rollRangedDamage(weapon) {
  return weapon.minDamage + Math.floor(Math.random() * (weapon.maxDamage - weapon.minDamage + 1));
}

function getWeapon(entity) {
  if (!entity.equipment) return null;
  return entity.equipment.armLeft || entity.equipment.armRight || null;
}

function getRangedWeapon(entity) {
  if (!entity.equipment) return null;
  const left = entity.equipment.armLeft;
  const right = entity.equipment.armRight;
  if (left && left.type === 'ranged') return left;
  if (right && right.type === 'ranged') return right;
  return null;
}

function getArmor(entity) {
  if (!entity.equipment) return null;
  return entity.equipment.torso || null;
}

/**
 * Add a message to the game's message log.
 * @param {object} gameState
 * @param {string} text
 * @param {string} type - 'combat', 'combat-kill', 'system', 'lore'
 */
export function addMessage(gameState, text, type = 'system') {
  if (!gameState.messages) gameState.messages = [];
  gameState.messages.push({ text, type, turn: gameState.turn || 0 });
  // Keep last 50 messages
  if (gameState.messages.length > 50) gameState.messages.shift();
}
