/**
 * TileMap data structure.
 * Stores multiple layers of tile data as flat arrays.
 * Each layer is a 1D array indexed by (y * width + x).
 */

import { LAYERS } from './renderer.js';

/**
 * Create a new empty tile map.
 * @param {number} width - Map width in tiles.
 * @param {number} height - Map height in tiles.
 * @returns {object} TileMap object.
 */
export function createTileMap(width, height) {
  const layers = {};

  // Initialize all layers as empty (filled with 0)
  for (const key of Object.keys(LAYERS)) {
    layers[LAYERS[key]] = new Uint16Array(width * height);
  }

  return {
    width,
    height,

    /**
     * Get a layer's data array.
     * @param {number} layerIndex
     * @returns {Uint16Array|null}
     */
    getLayer(layerIndex) {
      return layers[layerIndex] || null;
    },

    /**
     * Get a tile ID at a position in a specific layer.
     * @param {number} layerIndex
     * @param {number} x - Grid X.
     * @param {number} y - Grid Y.
     * @returns {number} Tile ID, or 0 if out of bounds.
     */
    getTile(layerIndex, x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return 0;
      const layer = layers[layerIndex];
      return layer ? layer[y * width + x] : 0;
    },

    /**
     * Set a tile ID at a position in a specific layer.
     * @param {number} layerIndex
     * @param {number} x - Grid X.
     * @param {number} y - Grid Y.
     * @param {number} tileId - The tile ID to set.
     */
    setTile(layerIndex, x, y, tileId) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const layer = layers[layerIndex];
      if (layer) {
        layer[y * width + x] = tileId;
      }
    },

    /**
     * Fill a rectangular area in a layer with a tile ID.
     * @param {number} layerIndex
     * @param {number} x1 - Start X (inclusive).
     * @param {number} y1 - Start Y (inclusive).
     * @param {number} x2 - End X (inclusive).
     * @param {number} y2 - End Y (inclusive).
     * @param {number} tileId
     */
    fillRect(layerIndex, x1, y1, x2, y2, tileId) {
      for (let x = x1; x <= x2; x++) {
        for (let y = y1; y <= y2; y++) {
          this.setTile(layerIndex, x, y, tileId);
        }
      }
    },

    /**
     * Check if a grid position is within map bounds.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    inBounds(x, y) {
      return x >= 0 && x < width && y >= 0 && y < height;
    },

    /**
     * Check if a tile is walkable (no wall tile present).
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isWalkable(x, y) {
      if (!this.inBounds(x, y)) return false;
      const wallTile = this.getTile(LAYERS.WALLS, x, y);
      // Tile IDs 10-19 are walls, 20 is open door (walkable), 21+ are closed/locked doors (not walkable)
      if (wallTile >= 10 && wallTile <= 19) return false;
      if (wallTile === 21 || wallTile === 22) return false;
      return true;
    },

    /**
     * Check if a tile blocks line of sight.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    blocksLight(x, y) {
      if (!this.inBounds(x, y)) return true;
      const wallTile = this.getTile(LAYERS.WALLS, x, y);
      // Solid walls and closed/locked doors block light
      if (wallTile >= 10 && wallTile <= 12) return true;
      if (wallTile === 21 || wallTile === 22) return true;
      return false;
    },
  };
}

/**
 * Build a test room for development and verification.
 * Creates a 20x15 room with walls, a floor, a door, and some objects.
 * @returns {object} A TileMap with test data.
 */
export function createTestRoom() {
  const map = createTileMap(25, 18);

  // Fill floor (metal plating)
  map.fillRect(LAYERS.FLOOR, 1, 1, 23, 16, 1);

  // Walls around the perimeter
  map.fillRect(LAYERS.WALLS, 0, 0, 24, 0, 10);   // top wall
  map.fillRect(LAYERS.WALLS, 0, 17, 24, 17, 10);  // bottom wall
  map.fillRect(LAYERS.WALLS, 0, 0, 0, 17, 10);    // left wall
  map.fillRect(LAYERS.WALLS, 24, 0, 24, 17, 10);  // right wall

  // Interior walls creating rooms
  map.fillRect(LAYERS.WALLS, 8, 0, 8, 10, 10);    // vertical divider
  map.fillRect(LAYERS.WALLS, 16, 7, 16, 17, 10);  // second vertical divider
  map.fillRect(LAYERS.WALLS, 8, 10, 16, 10, 10);  // horizontal connector

  // Doors in the interior walls
  map.setTile(LAYERS.WALLS, 8, 5, 21);             // closed door
  map.setTile(LAYERS.FLOOR, 8, 5, 1);
  map.setTile(LAYERS.WALLS, 12, 10, 20);           // open door
  map.setTile(LAYERS.FLOOR, 12, 10, 1);
  map.setTile(LAYERS.WALLS, 16, 12, 22);           // locked door (red)
  map.setTile(LAYERS.FLOOR, 16, 12, 1);

  // Some objects
  map.setTile(LAYERS.OBJECTS, 3, 3, 30);           // active terminal
  map.setTile(LAYERS.OBJECTS, 5, 8, 32);           // crate
  map.setTile(LAYERS.OBJECTS, 6, 8, 32);           // crate
  map.setTile(LAYERS.OBJECTS, 20, 3, 31);          // inactive terminal
  map.setTile(LAYERS.OBJECTS, 11, 14, 33);         // locker

  // Grating floor area in engineering section (right side)
  map.fillRect(LAYERS.FLOOR, 17, 1, 23, 6, 2);

  return map;
}
