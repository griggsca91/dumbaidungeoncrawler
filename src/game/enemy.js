/**
 * Enemy entity factory and AI behavior.
 * Implements patrol → chase → attack state machine for two factions:
 *   - Station Defense Bots (ranged, pattern-based, cover-seeking)
 *   - Mutated Crew (melee-focused, erratic movement)
 */

import { createEntity } from './entity.js';
import { meleeAttack, rangedAttack, getEntityAt, addMessage } from './combat.js';
import { hasLineOfSight, manhattanDist } from './los.js';
import { getNextStep } from './pathfinding.js';
import { getItemById } from './items.js';

/** AI behavior states. */
const AI_STATE = {
  PATROL:  'patrol',
  CHASE:   'chase',
  ATTACK:  'attack',
};

/** Detection radius (tiles) when enemy is in patrol state. */
const DETECTION_RADIUS = 6;

/** Number of turns enemy searches before returning to patrol if player lost. */
const LOST_PLAYER_TURNS = 3;

/**
 * Create a station defense bot enemy.
 * @param {number} x
 * @param {number} y
 * @param {'drone'|'bot'|'turret'} subtype
 * @returns {object} Enemy entity.
 */
export function createBot(x, y, subtype = 'drone') {
  const configs = {
    drone: {
      name: 'Patrol Drone',
      tileId: 41,
      hp: 15, maxHp: 15,
      weapon: getItemById('weapon_pistol'),
      preferRange: 4,
    },
    bot: {
      name: 'Security Bot',
      tileId: 41,
      hp: 30, maxHp: 30,
      weapon: getItemById('weapon_rifle'),
      preferRange: 5,
    },
    turret: {
      name: 'Defense Turret',
      tileId: 41,
      hp: 50, maxHp: 50,
      weapon: getItemById('weapon_rifle'),
      preferRange: 6,
      stationary: true,
    },
  };

  const cfg = configs[subtype] || configs.drone;
  const enemy = createEntity(x, y, 'south', {
    hp: cfg.hp, maxHp: cfg.maxHp,
    name: cfg.name,
    tileId: cfg.tileId,
    faction: 'station',
    weapon: cfg.weapon,
  });

  enemy.aiState       = AI_STATE.PATROL;
  enemy.lastKnownPx   = null;
  enemy.lastKnownPy   = null;
  enemy.lostTimer     = 0;
  enemy.preferRange   = cfg.preferRange || 4;
  enemy.stationary    = cfg.stationary || false;
  enemy.patrolPath    = generatePatrolPath(x, y);
  enemy.patrolIndex   = 0;
  enemy.faction       = 'station';

  enemy.act = (gameState) => actBot(enemy, gameState);
  return enemy;
}

/**
 * Create a mutated crew enemy.
 * @param {number} x
 * @param {number} y
 * @param {'shambler'|'runner'|'brute'} subtype
 * @returns {object} Enemy entity.
 */
export function createMutant(x, y, subtype = 'shambler') {
  const configs = {
    shambler: {
      name: 'Shambler',
      tileId: 42,
      hp: 15, maxHp: 15,
      weapon: { name: 'Claws', type: 'melee', minDamage: 3, maxDamage: 7, accuracy: 0, durability: 999, maxDurability: 999 },
      erraticChance: 0.2,
    },
    runner: {
      name: 'Runner',
      tileId: 42,
      hp: 10, maxHp: 10,
      weapon: { name: 'Bite', type: 'melee', minDamage: 4, maxDamage: 8, accuracy: 0.1, durability: 999, maxDurability: 999 },
      erraticChance: 0.35,
    },
    brute: {
      name: 'Brute',
      tileId: 42,
      hp: 40, maxHp: 40,
      weapon: { name: 'Fists', type: 'melee', minDamage: 8, maxDamage: 14, accuracy: -0.1, durability: 999, maxDurability: 999 },
      erraticChance: 0.1,
    },
  };

  const cfg = configs[subtype] || configs.shambler;
  const enemy = createEntity(x, y, 'south', {
    hp: cfg.hp, maxHp: cfg.maxHp,
    name: cfg.name,
    tileId: cfg.tileId,
    faction: 'mutant',
    weapon: cfg.weapon,
  });

  enemy.aiState       = AI_STATE.PATROL;
  enemy.lastKnownPx   = null;
  enemy.lastKnownPy   = null;
  enemy.lostTimer     = 0;
  enemy.erraticChance = cfg.erraticChance || 0.2;
  enemy.patrolPath    = generatePatrolPath(x, y);
  enemy.patrolIndex   = 0;
  enemy.faction       = 'mutant';

  enemy.act = (gameState) => actMutant(enemy, gameState);
  return enemy;
}

// ── Bot AI ─────────────────────────────────────────────────────────────────

function actBot(enemy, gameState) {
  if (!enemy.alive) return;

  const player    = gameState.player;
  const tileMap   = gameState.tileMap;
  if (!tileMap) return;

  const canSeePlayer = checkDetection(enemy, player, tileMap);

  switch (enemy.aiState) {
    case AI_STATE.PATROL:
      if (canSeePlayer) {
        enemy.aiState     = AI_STATE.CHASE;
        enemy.lastKnownPx = player.x;
        enemy.lastKnownPy = player.y;
        enemy.lostTimer   = 0;
        addMessage(gameState, `${enemy.name} spots you!`, 'combat');
      } else {
        doPatrol(enemy, tileMap);
      }
      break;

    case AI_STATE.CHASE:
      if (canSeePlayer) {
        enemy.lastKnownPx = player.x;
        enemy.lastKnownPy = player.y;
        enemy.lostTimer   = 0;

        const dist = manhattanDist(enemy.x, enemy.y, player.x, player.y);

        // Bots prefer to stay at range and fire
        if (dist <= 1) {
          // Too close — back up or melee
          meleeAttack(enemy, player, gameState);
          enemy.aiState = AI_STATE.ATTACK;
        } else if (dist <= enemy.preferRange) {
          // Good firing position — attack
          const los = hasLineOfSight(enemy.x, enemy.y, player.x, player.y, (x, y) => tileMap.blocksLight(x, y));
          if (los) {
            rangedAttack(enemy, player, 0, gameState);
            enemy.aiState = AI_STATE.ATTACK;
          } else {
            moveToward(enemy, player.x, player.y, tileMap, gameState);
          }
        } else {
          moveToward(enemy, player.x, player.y, tileMap, gameState);
        }
      } else {
        // Lost player
        enemy.lostTimer++;
        if (enemy.lostTimer >= LOST_PLAYER_TURNS) {
          // Move to last known position
          if (enemy.lastKnownPx !== null) {
            const atLast = enemy.x === enemy.lastKnownPx && enemy.y === enemy.lastKnownPy;
            if (!atLast) {
              moveToward(enemy, enemy.lastKnownPx, enemy.lastKnownPy, tileMap, gameState);
            } else {
              // Arrived at last known position, resume patrol
              enemy.aiState = AI_STATE.PATROL;
              enemy.lostTimer = 0;
            }
          } else {
            enemy.aiState = AI_STATE.PATROL;
          }
        }
      }
      break;

    case AI_STATE.ATTACK:
      // Return to chase state — check detection on every turn
      enemy.aiState = AI_STATE.CHASE;
      break;
  }
}

// ── Mutant AI ──────────────────────────────────────────────────────────────

function actMutant(enemy, gameState) {
  if (!enemy.alive) return;

  const player  = gameState.player;
  const tileMap = gameState.tileMap;
  if (!tileMap) return;

  const canSeePlayer = checkDetection(enemy, player, tileMap);

  switch (enemy.aiState) {
    case AI_STATE.PATROL:
      if (canSeePlayer) {
        enemy.aiState     = AI_STATE.CHASE;
        enemy.lastKnownPx = player.x;
        enemy.lastKnownPy = player.y;
        enemy.lostTimer   = 0;
        addMessage(gameState, `${enemy.name} notices you!`, 'combat');
      } else {
        doPatrol(enemy, tileMap);
      }
      break;

    case AI_STATE.CHASE:
      if (canSeePlayer) {
        enemy.lastKnownPx = player.x;
        enemy.lastKnownPy = player.y;
        enemy.lostTimer   = 0;
      }

      // Erratic movement: occasionally move randomly instead of toward player
      if (Math.random() < enemy.erraticChance) {
        moveRandom(enemy, tileMap);
        break;
      }

      const dist = manhattanDist(enemy.x, enemy.y, player.x, player.y);

      if (dist <= 1) {
        // Adjacent — attack
        meleeAttack(enemy, player, gameState);
        enemy.aiState = AI_STATE.ATTACK;
      } else if (enemy.lastKnownPx !== null) {
        moveToward(enemy, enemy.lastKnownPx, enemy.lastKnownPy, tileMap, gameState);
        // Check if we lost track
        if (!canSeePlayer) {
          enemy.lostTimer++;
          if (enemy.lostTimer >= LOST_PLAYER_TURNS) {
            enemy.aiState = AI_STATE.PATROL;
            enemy.lostTimer = 0;
          }
        }
      }
      break;

    case AI_STATE.ATTACK:
      enemy.aiState = AI_STATE.CHASE;
      break;
  }
}

// ── Shared helpers ─────────────────────────────────────────────────────────

/**
 * Check if the player is detectable from the enemy's position.
 */
function checkDetection(enemy, player, tileMap) {
  const dist = manhattanDist(enemy.x, enemy.y, player.x, player.y);
  if (dist > DETECTION_RADIUS) return false;
  return hasLineOfSight(
    enemy.x, enemy.y,
    player.x, player.y,
    (x, y) => tileMap.blocksLight(x, y)
  );
}

/**
 * Move the enemy along its patrol path.
 */
function doPatrol(enemy, tileMap) {
  if (enemy.stationary) return;
  if (!enemy.patrolPath || enemy.patrolPath.length === 0) return;

  const target = enemy.patrolPath[enemy.patrolIndex];
  if (enemy.x === target.x && enemy.y === target.y) {
    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPath.length;
    return;
  }
  moveToward(enemy, target.x, target.y, tileMap, null);
}

/**
 * Move enemy one step toward (tx, ty) using pathfinding.
 */
function moveToward(enemy, tx, ty, tileMap, gameState) {
  const next = getNextStep(
    enemy.x, enemy.y, tx, ty,
    (x, y) => tileMap.isWalkable(x, y) && !isOccupied(x, y, gameState)
  );
  if (next) {
    enemy.x = next.x;
    enemy.y = next.y;
    const dx = next.x - enemy.x;
    const dy = next.y - enemy.y;
    updateFacing(enemy, next.x - (enemy.x - (next.x - enemy.x)), next.y - (enemy.y - (next.y - enemy.y)), next.x, next.y);
  }
}

/**
 * Move enemy one step in a random walkable direction.
 */
function moveRandom(enemy, tileMap) {
  const dirs = [{ dx:0, dy:-1 }, { dx:0, dy:1 }, { dx:-1, dy:0 }, { dx:1, dy:0 }];
  const shuffled = dirs.sort(() => Math.random() - 0.5);
  for (const { dx, dy } of shuffled) {
    const nx = enemy.x + dx;
    const ny = enemy.y + dy;
    if (tileMap.isWalkable(nx, ny)) {
      enemy.x = nx;
      enemy.y = ny;
      return;
    }
  }
}

/**
 * Check if a tile is occupied by an alive entity.
 */
function isOccupied(x, y, gameState) {
  if (!gameState) return false;
  if (gameState.player.x === x && gameState.player.y === y) return true;
  return gameState.entities.some(e => e.alive && e.x === x && e.y === y);
}

/**
 * Update entity facing based on movement direction.
 */
function updateFacing(entity, fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (dx > 0) entity.facing = 'east';
  else if (dx < 0) entity.facing = 'west';
  else if (dy > 0) entity.facing = 'south';
  else if (dy < 0) entity.facing = 'north';
}

/**
 * Generate a simple 4-point square patrol path around a starting position.
 */
function generatePatrolPath(x, y) {
  return [
    { x: x,     y: y     },
    { x: x + 2, y: y     },
    { x: x + 2, y: y + 2 },
    { x: x,     y: y + 2 },
  ];
}
