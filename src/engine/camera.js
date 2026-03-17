/**
 * Camera for viewport management.
 * Tracks a position in grid coordinates and provides
 * world-to-screen offset calculations.
 *
 * Supports an optional viewport rect { x, y, w, h } so the camera
 * can be centred within a sub-region of the canvas (e.g. the game
 * viewport panel, not the full window).
 */

import { TILE_SIZE } from './grid.js';
import { getCanvasSize } from './canvas.js';

/** The active game viewport rectangle (pixels). Set by the HUD on init. */
let viewport = null;

/**
 * Set the game viewport rectangle.
 * Call this whenever the canvas resizes or the HUD layout changes.
 * @param {{ x: number, y: number, w: number, h: number }} rect
 */
export function setViewport(rect) {
  viewport = rect;
}

/**
 * Get the current game viewport rectangle.
 * Falls back to the full canvas if not set.
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function getViewport() {
  if (viewport) return viewport;
  const { width, height } = getCanvasSize();
  return { x: 0, y: 0, w: width, h: height };
}

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
 * Centres the camera within the active viewport.
 * @param {object} camera - The camera object.
 * @returns {{ offsetX: number, offsetY: number }}
 */
export function getCameraOffset(camera) {
  const vp = getViewport();
  const offsetX = Math.floor(vp.x + vp.w / 2 - camera.x * TILE_SIZE - TILE_SIZE / 2);
  const offsetY = Math.floor(vp.y + vp.h / 2 - camera.y * TILE_SIZE - TILE_SIZE / 2);
  return { offsetX, offsetY };
}

/**
 * Get the range of visible grid tiles for the current camera and viewport.
 * @param {object} camera - The camera object.
 * @returns {{ startX: number, startY: number, endX: number, endY: number }}
 */
export function getVisibleBounds(camera) {
  const vp = getViewport();
  const tilesX = Math.ceil(vp.w / TILE_SIZE);
  const tilesY = Math.ceil(vp.h / TILE_SIZE);

  const startX = Math.floor(camera.x - tilesX / 2) - 1;
  const startY = Math.floor(camera.y - tilesY / 2) - 1;
  const endX = startX + tilesX + 2;
  const endY = startY + tilesY + 2;

  return { startX, startY, endX, endY };
}
