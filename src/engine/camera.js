/**
 * Camera for viewport management.
 * Tracks a position in grid coordinates and provides
 * world-to-screen offset calculations.
 */

import { TILE_SIZE } from './grid.js';
import { getCanvasSize } from './canvas.js';

/**
 * Create a new camera.
 * @param {number} x - Initial grid X position.
 * @param {number} y - Initial grid Y position.
 * @returns {object} Camera object.
 */
export function createCamera(x = 0, y = 0) {
  return { x, y };
}

/**
 * Get the pixel offset for rendering based on camera position.
 * Centers the camera position in the viewport.
 * @param {object} camera - The camera object.
 * @returns {{ offsetX: number, offsetY: number }}
 */
export function getCameraOffset(camera) {
  const { width, height } = getCanvasSize();
  const offsetX = Math.floor(width / 2 - camera.x * TILE_SIZE - TILE_SIZE / 2);
  const offsetY = Math.floor(height / 2 - camera.y * TILE_SIZE - TILE_SIZE / 2);
  return { offsetX, offsetY };
}

/**
 * Get the range of visible grid tiles for the current camera and viewport.
 * @param {object} camera - The camera object.
 * @returns {{ startX: number, startY: number, endX: number, endY: number }}
 */
export function getVisibleBounds(camera) {
  const { width, height } = getCanvasSize();
  const tilesX = Math.ceil(width / TILE_SIZE);
  const tilesY = Math.ceil(height / TILE_SIZE);

  const startX = Math.floor(camera.x - tilesX / 2) - 1;
  const startY = Math.floor(camera.y - tilesY / 2) - 1;
  const endX = startX + tilesX + 2;
  const endY = startY + tilesY + 2;

  return { startX, startY, endX, endY };
}
