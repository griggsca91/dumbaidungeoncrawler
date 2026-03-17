/**
 * Visibility state manager.
 * Tracks which tiles have been seen (memory) vs currently visible vs unseen.
 * Provides the darkness overlay rendering.
 */

import { TILE_SIZE, gridToScreen } from './grid.js';
import { getCameraOffset, getVisibleBounds } from './camera.js';
import { calculateFOV } from './fov.js';

/** Visibility states. */
export const VIS = {
  UNSEEN: 0,
  REMEMBERED: 1,
  VISIBLE: 2,
};

/**
 * Create a visibility manager for a map.
 * @param {number} mapWidth - Map width in tiles.
 * @param {number} mapHeight - Map height in tiles.
 * @returns {object} Visibility manager.
 */
export function createVisibility(mapWidth, mapHeight) {
  /** Per-tile visibility state. */
  const state = new Uint8Array(mapWidth * mapHeight);

  /** Currently visible tiles (recalculated each turn). */
  let currentVisible = new Set();

  return {
    /**
     * Get the visibility state of a tile.
     * @param {number} x
     * @param {number} y
     * @returns {number} VIS.UNSEEN, VIS.REMEMBERED, or VIS.VISIBLE
     */
    getState(x, y) {
      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return VIS.UNSEEN;
      return state[y * mapWidth + x];
    },

    /**
     * Update visibility based on player position and facing.
     * @param {number} px - Player grid X.
     * @param {number} py - Player grid Y.
     * @param {string} facing - Player facing direction.
     * @param {function(number, number): boolean} blocksLight - Tile light-blocking check.
     */
    update(px, py, facing, blocksLight) {
      // Demote all currently VISIBLE tiles to REMEMBERED
      for (let i = 0; i < state.length; i++) {
        if (state[i] === VIS.VISIBLE) {
          state[i] = VIS.REMEMBERED;
        }
      }

      // Calculate new FOV
      currentVisible = calculateFOV(px, py, facing, blocksLight, mapWidth, mapHeight);

      // Mark visible tiles
      for (const key of currentVisible) {
        const [x, y] = key.split(',').map(Number);
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
          state[y * mapWidth + x] = VIS.VISIBLE;
        }
      }
    },

    /**
     * Check if a tile is currently visible.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isVisible(x, y) {
      return this.getState(x, y) === VIS.VISIBLE;
    },

    /**
     * Check if a tile has ever been seen.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    hasBeenSeen(x, y) {
      return this.getState(x, y) !== VIS.UNSEEN;
    },

    /**
     * Render the darkness/fog-of-war overlay.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} camera - The camera object.
     */
    renderOverlay(ctx, camera) {
      const offset = getCameraOffset(camera);
      const bounds = getVisibleBounds(camera);

      const sx = Math.max(0, bounds.startX);
      const sy = Math.max(0, bounds.startY);
      const ex = Math.min(mapWidth - 1, bounds.endX);
      const ey = Math.min(mapHeight - 1, bounds.endY);

      for (let gx = sx; gx <= ex; gx++) {
        for (let gy = sy; gy <= ey; gy++) {
          const vis = this.getState(gx, gy);
          const { x, y } = gridToScreen(gx, gy, offset);

          if (vis === VIS.UNSEEN) {
            // Fully black
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 1.0;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          } else if (vis === VIS.REMEMBERED) {
            // Dark overlay — desaturated memory
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          }
          // VISIBLE tiles get no overlay
        }
      }

      // Reset alpha
      ctx.globalAlpha = 1.0;
    },

    /**
     * Render darkness for all tiles outside the map bounds that are in viewport.
     * @param {CanvasRenderingContext2D} ctx
     * @param {object} camera
     */
    renderOutOfBoundsDarkness(ctx, camera) {
      const offset = getCameraOffset(camera);
      const bounds = getVisibleBounds(camera);

      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 1.0;

      for (let gx = bounds.startX; gx <= bounds.endX; gx++) {
        for (let gy = bounds.startY; gy <= bounds.endY; gy++) {
          if (gx < 0 || gx >= mapWidth || gy < 0 || gy >= mapHeight) {
            const { x, y } = gridToScreen(gx, gy, offset);
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    },

    /**
     * Reset all visibility (for new run).
     */
    reset() {
      state.fill(VIS.UNSEEN);
      currentVisible = new Set();
    },

    /** Save/load support: expose raw state array. */
    _getStateArray() { return state; },

    /** Save/load support: restore raw state array. */
    _restoreStateArray(arr) {
      const len = Math.min(arr.length, state.length);
      for (let i = 0; i < len; i++) state[i] = arr[i];
    },
  };
}
