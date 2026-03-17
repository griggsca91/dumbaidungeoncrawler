/**
 * Procedural sector generator using BSP (Binary Space Partition).
 *
 * Flow:
 *   1. BSP-split the map area into leaf rectangles
 *   2. Place one room template per leaf
 *   3. Connect sibling pairs with L-shaped corridors
 *   4. Stamp everything onto the TileMap
 *   5. Place enemies and items from spawn/loot tables
 *   6. Return metadata (room list, player spawn, tileMap)
 */

import { createTileMap } from './tileMap.js';
import { LAYERS } from './renderer.js';
import { getTemplatesForSector, getTemplatesByTag } from '../data/rooms.js';
import { pickSpawnEntry } from '../data/enemies.js';
import { createEnemyFromCatalog } from '../game/enemy.js';
import { getItemById } from '../game/items.js';
import { ITEM_CATALOG } from '../game/items.js';

// ── Map constants ──────────────────────────────────────────────────────────

const MAP_W = 80;
const MAP_H = 50;

/** Minimum leaf size (room area) during BSP splitting. */
const MIN_LEAF_W = 14;
const MIN_LEAF_H = 12;

/** Tile IDs */
const T = {
  FLOOR_METAL:   1,
  FLOOR_GRATING: 2,
  FLOOR_CARPET:  3,
  WALL_SOLID:    10,
  WALL_WINDOWED: 11,
  WALL_DAMAGED:  12,
  DOOR_OPEN:     20,
  DOOR_CLOSED:   21,
  DOOR_LOCKED:   22,
  TERM_ON:       30,
  TERM_OFF:      31,
  CRATE:         32,
  LOCKER:        33,
};

/** Map from layout char to tile ID */
const CHAR_TO_FLOOR = { F: T.FLOOR_METAL, G: T.FLOOR_GRATING, C: T.FLOOR_CARPET };
const CHAR_TO_OBJ   = { T: T.TERM_ON, t: T.TERM_OFF, X: T.CRATE, L: T.LOCKER };

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a full sector and populate game state.
 * @param {object} state - Game state to populate (entities, itemsOnFloor, rooms).
 * @param {string} sectorType - 'docking', 'habitation', 'engineering'
 * @returns {object} The populated TileMap.
 */
export function generateSector(state, sectorType = 'docking') {
  const tileMap = createTileMap(MAP_W, MAP_H);

  // Fill everything with solid wall first
  tileMap.fillRect(LAYERS.WALLS, 0, 0, MAP_W - 1, MAP_H - 1, T.WALL_SOLID);

  // BSP split
  const root = { x: 1, y: 1, w: MAP_W - 2, h: MAP_H - 2 };
  const leaves = bspSplit(root, 0);

  // Build room list from templates
  const templates = getTemplatesForSector(sectorType);
  const rooms = [];
  const usedTemplateIds = new Set();

  // Reserve required POI template sets
  const startTemplates    = getTemplatesByTag(sectorType, 'start');
  const lootTemplates     = getTemplatesByTag(sectorType, 'loot');
  const terminalTemplates = getTemplatesByTag(sectorType, 'terminal');
  const encounterTemplates= getTemplatesByTag(sectorType, 'encounter');

  // Assign templates to leaves, guaranteeing POIs in first few rooms
  const shuffledLeaves = shuffle([...leaves]);
  let startPlaced = false, lootPlaced = false, terminalPlaced = false, encounterPlaced = false;

  for (let i = 0; i < shuffledLeaves.length; i++) {
    const leaf = shuffledLeaves[i];
    let tmpl;

    if (!startPlaced && startTemplates.length) {
      tmpl = pickTemplate(startTemplates, leaf, usedTemplateIds);
      if (tmpl) startPlaced = true;
    } else if (!lootPlaced && lootTemplates.length) {
      tmpl = pickTemplate(lootTemplates, leaf, usedTemplateIds);
      if (tmpl) lootPlaced = true;
    } else if (!terminalPlaced && terminalTemplates.length) {
      tmpl = pickTemplate(terminalTemplates, leaf, usedTemplateIds);
      if (tmpl) terminalPlaced = true;
    } else if (!encounterPlaced && encounterTemplates.length) {
      tmpl = pickTemplate(encounterTemplates, leaf, usedTemplateIds);
      if (tmpl) encounterPlaced = true;
    }

    if (!tmpl) {
      tmpl = pickTemplate(templates, leaf, usedTemplateIds);
    }
    if (!tmpl) continue;

    // Centre the room template within the leaf with 1-tile margin
    const rx = leaf.x + 1 + Math.floor((leaf.w - tmpl.w - 2) / 2);
    const ry = leaf.y + 1 + Math.floor((leaf.h - tmpl.h - 2) / 2);

    const roomMeta = {
      id: `${tmpl.id}_${i}`,
      templateId: tmpl.id,
      x: rx, y: ry,
      w: tmpl.w + 2, h: tmpl.h + 2,  // +2 for wall border
      cx: rx + Math.floor((tmpl.w + 2) / 2),
      cy: ry + Math.floor((tmpl.h + 2) / 2),
      tags: tmpl.tags,
      powered: true,
      visited: false,
      leafIndex: i,
    };

    stampRoom(tileMap, tmpl, rx, ry);
    rooms.push(roomMeta);
    usedTemplateIds.add(tmpl.id);
  }

  // Connect rooms via corridors between BSP siblings
  connectLeaves(tileMap, root, rooms, shuffledLeaves);

  // Validate connectivity from first room — retry up to 3 times if disconnected
  // (for MVP just proceed — connectivity issues are rare with BSP)

  // Store rooms on state
  state.rooms = rooms;
  state.sectorType = sectorType;

  // Place player at start room
  const startRoom = rooms.find(r => r.tags.includes('start')) || rooms[0];
  state.playerSpawnX = startRoom.cx;
  state.playerSpawnY = startRoom.cy;

  // Populate enemies
  state.entities = [];
  const alertLevel = state.alertLevel || 0;
  placeEnemies(state, rooms, sectorType, alertLevel, tileMap);

  // Populate floor items
  state.itemsOnFloor = [];
  placeItems(state, rooms, sectorType);

  return tileMap;
}

// ── BSP ────────────────────────────────────────────────────────────────────

/**
 * Recursively split a rectangle into leaves.
 * @param {{ x, y, w, h }} rect
 * @param {number} depth
 * @returns {Array<{x,y,w,h}>}
 */
function bspSplit(rect, depth) {
  const MAX_DEPTH = 4;
  if (depth >= MAX_DEPTH) return [rect];
  if (rect.w < MIN_LEAF_W * 2 && rect.h < MIN_LEAF_H * 2) return [rect];

  // Choose split axis: prefer the longer side
  const canSplitH = rect.w >= MIN_LEAF_W * 2;
  const canSplitV = rect.h >= MIN_LEAF_H * 2;

  if (!canSplitH && !canSplitV) return [rect];

  let splitHoriz;
  if (canSplitH && canSplitV) {
    splitHoriz = Math.random() < 0.5;
  } else {
    splitHoriz = canSplitH;
  }

  if (splitHoriz) {
    // Split left/right
    const splitX = rect.x + MIN_LEAF_W + Math.floor(Math.random() * (rect.w - MIN_LEAF_W * 2));
    const left  = { x: rect.x,    y: rect.y, w: splitX - rect.x,             h: rect.h };
    const right = { x: splitX,    y: rect.y, w: rect.x + rect.w - splitX,    h: rect.h };
    return [...bspSplit(left, depth + 1), ...bspSplit(right, depth + 1)];
  } else {
    // Split top/bottom
    const splitY = rect.y + MIN_LEAF_H + Math.floor(Math.random() * (rect.h - MIN_LEAF_H * 2));
    const top    = { x: rect.x, y: rect.y,    w: rect.w, h: splitY - rect.y            };
    const bottom = { x: rect.x, y: splitY,    w: rect.w, h: rect.y + rect.h - splitY   };
    return [...bspSplit(top, depth + 1), ...bspSplit(bottom, depth + 1)];
  }
}

// ── Room stamping ──────────────────────────────────────────────────────────

/**
 * Stamp a room template onto the tile map at position (rx, ry).
 * The position is the top-left corner of the wall border.
 */
function stampRoom(tileMap, tmpl, rx, ry) {
  const iw = tmpl.w;
  const ih = tmpl.h;

  // Outer walls (border)
  tileMap.fillRect(LAYERS.WALLS, rx, ry, rx + iw + 1, ry, T.WALL_SOLID);          // top
  tileMap.fillRect(LAYERS.WALLS, rx, ry + ih + 1, rx + iw + 1, ry + ih + 1, T.WALL_SOLID);  // bottom
  tileMap.fillRect(LAYERS.WALLS, rx, ry, rx, ry + ih + 1, T.WALL_SOLID);          // left
  tileMap.fillRect(LAYERS.WALLS, rx + iw + 1, ry, rx + iw + 1, ry + ih + 1, T.WALL_SOLID); // right

  // Clear inner walls that may have been stamped previously
  tileMap.fillRect(LAYERS.WALLS, rx + 1, ry + 1, rx + iw, ry + ih, 0);

  // Interior floor and objects from layout
  for (let row = 0; row < ih; row++) {
    const rowStr = tmpl.layout[row] || '';
    for (let col = 0; col < iw; col++) {
      const ch = rowStr[col] || 'F';
      const tx = rx + 1 + col;
      const ty = ry + 1 + row;

      // Floor
      const floorId = CHAR_TO_FLOOR[ch] || tmpl.floorId || T.FLOOR_METAL;
      tileMap.setTile(LAYERS.FLOOR, tx, ty, floorId);

      // Object overlay
      const objId = CHAR_TO_OBJ[ch];
      if (objId) {
        tileMap.setTile(LAYERS.OBJECTS, tx, ty, objId);
      }
    }
  }

  // Place door slots as closed doors on walls
  for (const door of tmpl.doors) {
    const { side, offset } = door;
    let dx, dy;
    if (side === 'north') { dx = rx + 1 + offset; dy = ry; }
    else if (side === 'south') { dx = rx + 1 + offset; dy = ry + ih + 1; }
    else if (side === 'west')  { dx = rx;     dy = ry + 1 + offset; }
    else                       { dx = rx + iw + 1; dy = ry + 1 + offset; }

    tileMap.setTile(LAYERS.WALLS,  dx, dy, T.DOOR_CLOSED);
    tileMap.setTile(LAYERS.FLOOR,  dx, dy, tmpl.floorId || T.FLOOR_METAL);
  }
}

// ── Corridor connection ────────────────────────────────────────────────────

/**
 * Connect rooms in the room list by drawing corridors between their centres.
 * Naive approach: connect each room to the next using an L-shaped corridor.
 */
function connectLeaves(tileMap, root, rooms, leaves) {
  if (rooms.length < 2) return;

  // Build a minimum spanning "chain" — connect room i to room i+1
  // using their centres, sorted by position for a more natural layout
  const sorted = [...rooms].sort((a, b) => a.cx - b.cx || a.cy - b.cy);

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    drawCorridor(tileMap, a.cx, a.cy, b.cx, b.cy);
  }
}

/**
 * Draw an L-shaped corridor from (x0,y0) to (x1,y1).
 * Goes horizontal first then vertical (or vice-versa randomly).
 */
function drawCorridor(tileMap, x0, y0, x1, y1) {
  const horiz = Math.random() < 0.5;
  if (horiz) {
    carveHLine(tileMap, x0, x1, y0);
    carveVLine(tileMap, y0, y1, x1);
  } else {
    carveVLine(tileMap, y0, y1, x0);
    carveHLine(tileMap, x0, x1, y1);
  }
}

function carveHLine(tileMap, x0, x1, y) {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  for (let x = minX; x <= maxX; x++) {
    // Only carve if not already a room floor
    const existing = tileMap.getTile(LAYERS.FLOOR, x, y);
    tileMap.setTile(LAYERS.WALLS, x, y, 0);              // clear wall
    if (!existing) tileMap.setTile(LAYERS.FLOOR, x, y, T.FLOOR_METAL);
    // Add walls above/below the corridor where there's empty space
    for (const dy of [-1, 1]) {
      const ny = y + dy;
      if (tileMap.getTile(LAYERS.FLOOR, x, ny) === 0 && tileMap.getTile(LAYERS.WALLS, x, ny) === 0) {
        tileMap.setTile(LAYERS.WALLS, x, ny, T.WALL_SOLID);
      }
    }
  }
}

function carveVLine(tileMap, y0, y1, x) {
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  for (let y = minY; y <= maxY; y++) {
    const existing = tileMap.getTile(LAYERS.FLOOR, x, y);
    tileMap.setTile(LAYERS.WALLS, x, y, 0);
    if (!existing) tileMap.setTile(LAYERS.FLOOR, x, y, T.FLOOR_METAL);
    for (const dx of [-1, 1]) {
      const nx = x + dx;
      if (tileMap.getTile(LAYERS.FLOOR, x, y) > 0 &&
          tileMap.getTile(LAYERS.FLOOR, nx, y) === 0 &&
          tileMap.getTile(LAYERS.WALLS, nx, y) === 0) {
        tileMap.setTile(LAYERS.WALLS, nx, y, T.WALL_SOLID);
      }
    }
  }
}

// ── Population ─────────────────────────────────────────────────────────────

/**
 * Place enemies in rooms tagged 'encounter', using the sector's spawn table.
 */
function placeEnemies(state, rooms, sectorType, alertLevel, tileMap) {
  const encounterRooms = rooms.filter(r => r.tags.includes('encounter'));

  for (const room of encounterRooms) {
    const count = 1 + Math.floor(Math.random() * 2);  // 1-2 enemies per encounter room
    for (let i = 0; i < count; i++) {
      const catalogId = pickSpawnEntry(sectorType, alertLevel);
      // Find a walkable spot inside the room
      const pos = findWalkableInRoom(room, tileMap, state);
      if (pos) {
        const enemy = createEnemyFromCatalog(catalogId, pos.x, pos.y);
        state.entities.push(enemy);
      }
    }
  }
}

/**
 * Place items in loot rooms and scatter consumables.
 */
function placeItems(state, rooms, sectorType) {
  // Loot rooms: place 1-3 items (equipment)
  const lootRooms = rooms.filter(r => r.tags.includes('loot'));
  const equipItems = ITEM_CATALOG.filter(i => i.slot !== 'consumable');
  const consumables = ITEM_CATALOG.filter(i => i.slot === 'consumable');

  for (const room of lootRooms) {
    const count = 1 + Math.floor(Math.random() * 2);
    for (let k = 0; k < count; k++) {
      const pool = weightedItemPool(equipItems);
      if (!pool) continue;
      const item = { ...pool };
      const pos = randomPosInRoom(room);
      state.itemsOnFloor.push({ x: pos.x, y: pos.y, item });
    }
  }

  // Scatter 2-4 consumables in non-start rooms
  const candidateRooms = rooms.filter(r => !r.tags.includes('start'));
  const shuffled = shuffle([...candidateRooms]);
  const numConsumables = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < Math.min(numConsumables, shuffled.length); i++) {
    const pool = consumables[Math.floor(Math.random() * consumables.length)];
    const item = { ...pool };
    const pos = randomPosInRoom(shuffled[i]);
    state.itemsOnFloor.push({ x: pos.x, y: pos.y, item });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Pick a template that fits in the given leaf, preferring unused templates.
 */
function pickTemplate(templates, leaf, usedIds) {
  const fitting = templates.filter(t =>
    t.w + 2 <= leaf.w - 2 && t.h + 2 <= leaf.h - 2
  );
  if (!fitting.length) return null;

  const unused = fitting.filter(t => !usedIds.has(t.id));
  const pool = unused.length ? unused : fitting;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Find a walkable tile inside a room that is not occupied.
 */
function findWalkableInRoom(room, tileMap, state) {
  for (let attempts = 0; attempts < 20; attempts++) {
    const x = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
    const y = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
    if (!tileMap.isWalkable(x, y)) continue;
    if (state.entities.some(e => e.x === x && e.y === y)) continue;
    if (state.player && state.player.x === x && state.player.y === y) continue;
    return { x, y };
  }
  return null;
}

/**
 * Pick a random interior position in a room (not on wall border).
 */
function randomPosInRoom(room) {
  return {
    x: room.x + 1 + Math.floor(Math.random() * Math.max(1, room.w - 2)),
    y: room.y + 1 + Math.floor(Math.random() * Math.max(1, room.h - 2)),
  };
}

/**
 * Weighted random item pick — rarer items less likely.
 */
function weightedItemPool(items) {
  if (!items.length) return null;
  const weights = { common: 10, uncommon: 4, rare: 1 };
  const totalW = items.reduce((s, i) => s + (weights[i.rarity] || 5), 0);
  let roll = Math.random() * totalW;
  for (const item of items) {
    roll -= (weights[item.rarity] || 5);
    if (roll <= 0) return item;
  }
  return items[0];
}

/** Fisher-Yates shuffle (returns new array). */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
