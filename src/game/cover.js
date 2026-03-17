/**
 * Cover system.
 * Determines cover value between two positions and handles destructible cover.
 * Cover reduces incoming hit chance: half cover = 0.5, full cover = 0.75.
 */

import { LAYERS } from '../engine/renderer.js';

/** Cover values by type. */
export const COVER_VALUE = {
  none:  0,
  half:  0.5,
  full:  0.75,
};

/**
 * Tile IDs that provide cover, and what type.
 * Walls always provide full cover (checked separately via blocksLight).
 */
const COVER_TILES = {
  32: 'half',   // crate — half cover
  33: 'half',   // locker — half cover
  10: 'full',   // solid wall — full cover (in walls layer)
  11: 'half',   // windowed wall — half cover
  12: 'half',   // damaged wall — half cover
};

/** Tile IDs for destructible objects (in OBJECTS layer). */
export const DESTRUCTIBLE_TILES = new Set([32, 33]); // crate, locker

/** HP of destructible objects when first placed. */
export const DESTRUCTIBLE_HP = {
  32: 15,  // crate
  33: 20,  // locker
};

/** Tile ID to replace destroyed objects with (rubble). */
const RUBBLE_TILE = 35;

/**
 * Calculate the cover modifier for an attack from (ax, ay) to (tx, ty).
 * Checks if there are cover-providing tiles between attacker and target
 * that are closer to the target than to the attacker.
 * @param {number} ax - Attacker X.
 * @param {number} ay - Attacker Y.
 * @param {number} tx - Target X.
 * @param {number} ty - Target Y.
 * @param {object} tileMap - The tile map.
 * @returns {number} Cover value: 0, 0.5, or 0.75.
 */
export function getCoverModifier(ax, ay, tx, ty, tileMap) {
  // Gather all tiles between attacker and target using Bresenham
  const tiles = getTilesBetween(ax, ay, tx, ty);

  // Remove the attacker's own tile and the target's tile
  const middleTiles = tiles.slice(1, -1);

  let bestCover = COVER_VALUE.none;

  for (const { x, y } of middleTiles) {
    // Check walls layer
    const wallTile = tileMap.getTile(LAYERS.WALLS, x, y);
    if (wallTile && COVER_TILES[wallTile]) {
      const val = COVER_VALUE[COVER_TILES[wallTile]] || 0;
      bestCover = Math.max(bestCover, val);
    }

    // Check objects layer (crates, lockers)
    const objTile = tileMap.getTile(LAYERS.OBJECTS, x, y);
    if (objTile && COVER_TILES[objTile]) {
      const val = COVER_VALUE[COVER_TILES[objTile]] || 0;
      bestCover = Math.max(bestCover, val);
    }
  }

  return bestCover;
}

/**
 * Check whether the target has any cover at all (for display purposes).
 * @param {number} ax
 * @param {number} ay
 * @param {number} tx
 * @param {number} ty
 * @param {object} tileMap
 * @returns {'none'|'half'|'full'}
 */
export function getCoverType(ax, ay, tx, ty, tileMap) {
  const val = getCoverModifier(ax, ay, tx, ty, tileMap);
  if (val >= COVER_VALUE.full) return 'full';
  if (val >= COVER_VALUE.half) return 'half';
  return 'none';
}

/**
 * Apply damage to a destructible object tile.
 * Replaces it with rubble when it reaches 0 HP.
 * @param {number} x - Tile X.
 * @param {number} y - Tile Y.
 * @param {number} damage - Damage to deal.
 * @param {object} tileMap - The tile map.
 * @param {object} destructibleState - Map of `"x,y" -> { hp, maxHp }`.
 * @returns {boolean} True if the object was destroyed.
 */
export function damageDestructible(x, y, damage, tileMap, destructibleState) {
  const key = `${x},${y}`;
  const tileId = tileMap.getTile(LAYERS.OBJECTS, x, y);

  if (!DESTRUCTIBLE_TILES.has(tileId)) return false;

  if (!destructibleState[key]) {
    destructibleState[key] = {
      hp: DESTRUCTIBLE_HP[tileId] || 15,
      maxHp: DESTRUCTIBLE_HP[tileId] || 15,
    };
  }

  destructibleState[key].hp = Math.max(0, destructibleState[key].hp - damage);

  if (destructibleState[key].hp <= 0) {
    // Destroy — replace with rubble
    tileMap.setTile(LAYERS.OBJECTS, x, y, RUBBLE_TILE);
    delete destructibleState[key];
    return true;
  }

  return false;
}

/**
 * Get tiles along a Bresenham line from (x0,y0) to (x1,y1).
 * @returns {Array<{x:number,y:number}>}
 */
function getTilesBetween(x0, y0, x1, y1) {
  const tiles = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;

  while (true) {
    tiles.push({ x: cx, y: cy });
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx)  { err += dx; cy += sy; }
  }

  return tiles;
}
