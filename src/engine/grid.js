/**
 * Grid coordinate system.
 * Defines the tile size and provides conversion between
 * grid coordinates and screen pixel coordinates.
 */

/** Size of each tile in pixels. */
export const TILE_SIZE = 32;

/**
 * Convert grid coordinates to screen pixel coordinates.
 * @param {number} gridX - Grid X position.
 * @param {number} gridY - Grid Y position.
 * @param {{ offsetX: number, offsetY: number }} cameraOffset - Camera pixel offset.
 * @returns {{ x: number, y: number }} Screen pixel coordinates (top-left of tile).
 */
export function gridToScreen(gridX, gridY, cameraOffset) {
  return {
    x: gridX * TILE_SIZE + cameraOffset.offsetX,
    y: gridY * TILE_SIZE + cameraOffset.offsetY,
  };
}

/**
 * Convert screen pixel coordinates to grid coordinates.
 * @param {number} screenX - Screen X pixel position.
 * @param {number} screenY - Screen Y pixel position.
 * @param {{ offsetX: number, offsetY: number }} cameraOffset - Camera pixel offset.
 * @returns {{ x: number, y: number }} Grid coordinates (floored to integer).
 */
export function screenToGrid(screenX, screenY, cameraOffset) {
  return {
    x: Math.floor((screenX - cameraOffset.offsetX) / TILE_SIZE),
    y: Math.floor((screenY - cameraOffset.offsetY) / TILE_SIZE),
  };
}
