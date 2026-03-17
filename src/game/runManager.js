/**
 * Run lifecycle manager.
 * Handles permadeath, run statistics, airlock stash, and new-run bootstrapping.
 *
 * Persistent data (survives death, stored in localStorage):
 *   - stash: array of items (max 6)
 *   - runCount: total runs started
 *
 * Per-run data (lost on death):
 *   - everything else on state
 */

import { addMessage } from './combat.js';
import { createPlayer } from './player.js';
import { createResources } from './resources.js';
import { createCamera } from '../engine/camera.js';
import { generateSector } from '../engine/procgen.js';
import { getInventoryCapacity } from './equipment.js';

const STASH_KEY     = 'derelict_stash';
const META_KEY      = 'derelict_meta';
const MAX_STASH     = 6;

// ── Stash persistence ────────────────────────────────────────────────────────

/**
 * Load the stash from localStorage.
 * @returns {object[]} Array of item objects.
 */
export function loadStash() {
  try {
    const raw = localStorage.getItem(STASH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save the stash to localStorage.
 * @param {object[]} items
 */
export function saveStash(items) {
  try {
    localStorage.setItem(STASH_KEY, JSON.stringify(items.slice(0, MAX_STASH)));
  } catch {
    // localStorage unavailable — continue without saving
  }
}

/**
 * Load meta-progression data.
 * @returns {{ runCount: number, shipRepairs: object }}
 */
export function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : { runCount: 0, shipRepairs: {} };
  } catch {
    return { runCount: 0, shipRepairs: {} };
  }
}

/**
 * Save meta-progression data.
 */
export function saveMeta(meta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch { /* silent */ }
}

// ── Death handling ────────────────────────────────────────────────────────────

/**
 * Handle player death.
 * Transitions state to 'gameover', computes final stats.
 * Stash is preserved; equipped/inventory items are lost.
 * @param {object} state
 */
export function handleDeath(state) {
  state.player.alive = false;
  state.phase = 'gameover';

  // Build run summary
  state.runSummary = {
    turns:      state.turn,
    kills:      state.stats?.kills || 0,
    itemsFound: state.stats?.itemsFound || 0,
    sector:     state.sectorType || 'docking',
    cause:      state.player.hp <= 0 ? 'combat' : 'suffocation',
  };

  addMessage(state, `Run over. Turns: ${state.runSummary.turns}  Kills: ${state.runSummary.kills}`, 'combat-kill');

  // Meta
  const meta = loadMeta();
  meta.runCount++;
  saveMeta(meta);
}

// ── Stash interaction ────────────────────────────────────────────────────────

/**
 * Stash an item from the player's inventory.
 * @param {object} state
 * @param {number} inventoryIndex - Index in player.inventory.
 * @returns {boolean} True if stashed.
 */
export function stashItem(state, inventoryIndex) {
  const stash = state.stash;
  if (stash.length >= MAX_STASH) {
    addMessage(state, `Airlock stash is full (${MAX_STASH} slots).`, 'system');
    return false;
  }
  const item = state.player.inventory[inventoryIndex];
  if (!item) return false;

  state.player.inventory.splice(inventoryIndex, 1);
  stash.push(item);
  saveStash(stash);
  addMessage(state, `${item.name} stashed in airlock.`, 'system');
  return true;
}

/**
 * Retrieve an item from the stash into the player's inventory.
 * @param {object} state
 * @param {number} stashIndex
 * @returns {boolean}
 */
export function retrieveFromStash(state, stashIndex) {
  const cap = getInventoryCapacity(state.player);
  if (state.player.inventory.length >= cap) {
    addMessage(state, 'Inventory full.', 'system');
    return false;
  }
  const item = state.stash[stashIndex];
  if (!item) return false;

  state.stash.splice(stashIndex, 1);
  state.player.inventory.push(item);
  saveStash(state.stash);
  addMessage(state, `${item.name} retrieved from stash.`, 'system');
  return true;
}

// ── New run ────────────────────────────────────────────────────────────────

/**
 * Reset and start a new run, preserving stash.
 * Modifies state in-place and regenerates the sector.
 * @param {object} state - Existing game state (modified in-place).
 * @param {object} visibility - Visibility system (will be reset).
 * @param {object} turnManager - Turn manager (will be reset).
 */
export function startNewRun(state, visibility, turnManager) {
  // Preserve stash
  const stash = [...state.stash];

  // Reset player
  const player = createPlayer(4, 4);
  state.player = player;
  state.resources = createResources();

  // Restore stash items to new player's inventory (up to cap)
  state.stash = stash;

  // Reset run state
  state.entities = [];
  state.itemsOnFloor = [];
  state.messages = [
    { text: 'Cryo revive complete. The station is still there.', type: 'lore', turn: 0 },
    { text: 'Your stash is available. WASD: move  G: pickup  E: interact  I: inventory', type: 'system', turn: 0 },
  ];
  state.destructibleState = {};
  state.rooms = [];
  state.alertLevel = 0;
  state.stats = { kills: 0, itemsFound: 0 };
  state.turn = 0;
  state.phase = 'playing';
  state.runSummary = null;
  state._usedLore = new Set();

  // Generate new sector
  const newMap = generateSector(state, 'docking');
  state.tileMap = newMap;
  state.camera = createCamera(state.playerSpawnX, state.playerSpawnY);
  state.player.x = state.playerSpawnX;
  state.player.y = state.playerSpawnY;

  // Reset visibility
  visibility.reset();
  visibility.update(state.player.x, state.player.y, state.player.facing,
    (x, y) => state.tileMap.blocksLight(x, y));

  // Reset turn manager
  turnManager.reset();
}

// ── Stash zone detection ────────────────────────────────────────────────────

/**
 * Check if the player is at the airlock stash zone (spawn tile area).
 * Returns true if player is within 2 tiles of the sector spawn point.
 * @param {object} state
 * @returns {boolean}
 */
export function isAtStashZone(state) {
  if (state.sectorType !== 'docking') return false;
  if (!state.playerSpawnX) return false;
  const dx = Math.abs(state.player.x - state.playerSpawnX);
  const dy = Math.abs(state.player.y - state.playerSpawnY);
  return dx <= 2 && dy <= 2;
}
