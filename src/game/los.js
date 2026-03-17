/**
 * Line-of-sight utilities for combat targeting.
 * Used by both combat and enemy AI.
 */

/**
 * Check if there is clear line of sight between two grid positions.
 * Uses Bresenham's line algorithm.
 * @param {number} x0 - Start X.
 * @param {number} y0 - Start Y.
 * @param {number} x1 - End X.
 * @param {number} y1 - End Y.
 * @param {function(number, number): boolean} blocksLight - Returns true if tile blocks LOS.
 * @returns {boolean} True if clear LOS exists.
 */
export function hasLineOfSight(x0, y0, x1, y1, blocksLight) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;

  while (cx !== x1 || cy !== y1) {
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx)  { err += dx; cy += sy; }

    // Blocking tile (but not the destination itself)
    if ((cx !== x1 || cy !== y1) && blocksLight(cx, cy)) {
      return false;
    }
  }

  return true;
}

/**
 * Get the Chebyshev distance (max of dx, dy) between two points.
 * This is the "real" distance for grid games allowing diagonal movement.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @returns {number}
 */
export function chebyshevDist(x0, y0, x1, y1) {
  return Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
}

/**
 * Get the Manhattan distance between two points.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @returns {number}
 */
export function manhattanDist(x0, y0, x1, y1) {
  return Math.abs(x1 - x0) + Math.abs(y1 - y0);
}
