/**
 * Layered tile renderer.
 * Draws tile map layers in order with viewport culling.
 * Falls back to colored rectangles when sprite assets are unavailable.
 */

import { TILE_SIZE, gridToScreen } from './grid.js';
import { getVisibleBounds, getCameraOffset } from './camera.js';

/** Layer constants defining render order. */
export const LAYERS = {
  FLOOR: 0,
  WALLS: 1,
  OBJECTS: 2,
  ENTITIES: 3,
  FX: 4,
  LIGHTING: 5,
  UI: 6,
};

/** Layer names for debug display. */
const LAYER_NAMES = ['floor', 'walls', 'objects', 'entities', 'fx', 'lighting', 'ui'];

/**
 * Placeholder colors for tile IDs when no spritesheet is loaded.
 * Keyed by tile ID. 0 = empty (not drawn).
 */
const PLACEHOLDER_COLORS = {
  // Floor tiles
  1: '#1a1a2e',   // metal floor
  2: '#16213e',   // grating floor
  3: '#1b1b3a',   // carpet (habitation)

  // Wall tiles
  10: '#4a4e69',  // solid wall
  11: '#6c757d',  // windowed wall
  12: '#3d405b',  // damaged wall

  // Door tiles
  20: '#f0a500',  // open door
  21: '#e67e22',  // closed door
  22: '#e74c3c',  // locked door

  // Object tiles
  30: '#55efc4',  // terminal (active)
  31: '#2d3436',  // terminal (inactive)
  32: '#636e72',  // crate
  33: '#b2bec3',  // locker

  // Entity placeholder
  40: '#74b9ff',  // player
  41: '#e74c3c',  // enemy (bot)
  42: '#00b894',  // enemy (mutant)
};

/**
 * Create a renderer instance.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @returns {object} Renderer with draw methods.
 */
export function createRenderer(ctx) {
  /** Which layers are visible (for debug toggling). */
  const layerVisibility = new Array(7).fill(true);

  /** Spritesheet image (null until loaded). */
  let spritesheet = null;

  /** Sprite map: tileId -> { sx, sy, sw, sh } source rect in spritesheet. */
  let spriteMap = null;

  return {
    /**
     * Set the spritesheet and sprite map for tile rendering.
     * @param {HTMLImageElement} image - The loaded spritesheet image.
     * @param {object} map - Map of tileId -> { sx, sy, sw, sh }.
     */
    setSpritesheet(image, map) {
      spritesheet = image;
      spriteMap = map;
    },

    /**
     * Toggle a layer's visibility.
     * @param {number} layerIndex - The layer to toggle.
     */
    toggleLayer(layerIndex) {
      if (layerIndex >= 0 && layerIndex < layerVisibility.length) {
        layerVisibility[layerIndex] = !layerVisibility[layerIndex];
      }
    },

    /**
     * Check if a layer is visible.
     * @param {number} layerIndex
     * @returns {boolean}
     */
    isLayerVisible(layerIndex) {
      return layerVisibility[layerIndex];
    },

    /**
     * Get the name of a layer by index.
     * @param {number} layerIndex
     * @returns {string}
     */
    getLayerName(layerIndex) {
      return LAYER_NAMES[layerIndex] || 'unknown';
    },

    /**
     * Draw a single tile map layer.
     * @param {object} tileMap - The TileMap object.
     * @param {number} layerIndex - Which layer to draw.
     * @param {object} camera - The camera object.
     */
    drawLayer(tileMap, layerIndex, camera) {
      if (!layerVisibility[layerIndex]) return;

      const offset = getCameraOffset(camera);
      const bounds = getVisibleBounds(camera);
      const layer = tileMap.getLayer(layerIndex);
      if (!layer) return;

      const mapW = tileMap.width;
      const mapH = tileMap.height;

      // Clamp bounds to map dimensions
      const sx = Math.max(0, bounds.startX);
      const sy = Math.max(0, bounds.startY);
      const ex = Math.min(mapW - 1, bounds.endX);
      const ey = Math.min(mapH - 1, bounds.endY);

      for (let gx = sx; gx <= ex; gx++) {
        for (let gy = sy; gy <= ey; gy++) {
          const tileId = layer[gy * mapW + gx];
          if (tileId === 0) continue; // empty tile

          const { x, y } = gridToScreen(gx, gy, offset);
          this.drawTile(tileId, x, y);
        }
      }
    },

    /**
     * Draw all tile map layers in order.
     * @param {object} tileMap - The TileMap object.
     * @param {object} camera - The camera object.
     */
    drawAllLayers(tileMap, camera) {
      for (let i = 0; i <= LAYERS.UI; i++) {
        this.drawLayer(tileMap, i, camera);
      }
    },

    /**
     * Draw a single tile at screen coordinates.
     * Uses spritesheet if available, otherwise colored rectangle.
     * @param {number} tileId - The tile ID to draw.
     * @param {number} screenX - Screen X pixel position.
     * @param {number} screenY - Screen Y pixel position.
     */
    drawTile(tileId, screenX, screenY) {
      if (spritesheet && spriteMap && spriteMap[tileId]) {
        const { sx, sy, sw, sh } = spriteMap[tileId];
        ctx.drawImage(spritesheet, sx, sy, sw, sh, screenX, screenY, TILE_SIZE, TILE_SIZE);
      } else {
        // Fallback: colored rectangle
        const color = PLACEHOLDER_COLORS[tileId];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    },

    /** Expose layer visibility array for debug UI. */
    layerVisibility,
  };
}
