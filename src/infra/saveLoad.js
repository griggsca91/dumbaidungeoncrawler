/**
 * Save/load system using browser localStorage.
 * One active run save slot. Deleted on death.
 * Meta-progression (stash, ship repairs) uses a separate key.
 *
 * Save format: serialised subset of game state — excludes functions,
 * DOM references, and the tileMap (regenerated from rooms metadata on load).
 */

const SAVE_KEY = 'derelict_save';

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Check if a save exists.
 * @returns {boolean}
 */
export function hasSave() {
  try {
    return !!localStorage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
}

/**
 * Save the current game state.
 * @param {object} state - Full game state.
 * @param {object} visibility - Visibility system (for explored tile data).
 */
export function saveGame(state, visibility) {
  try {
    const serialised = serialiseState(state, visibility);
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialised));
  } catch (e) {
    // Quota exceeded or unavailable
    if (state.messages) {
      state.messages.push({ text: 'Warning: Could not save game (storage unavailable).', type: 'system', turn: state.turn });
    }
  }
}

/**
 * Delete the active save (called on death).
 */
export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch { /* silent */ }
}

/**
 * Load a saved game.
 * @returns {object|null} Serialised state object, or null if no save.
 */
export function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Serialisation ────────────────────────────────────────────────────────────

/**
 * Serialise the parts of state we can save.
 * Excludes: functions, tileMap (large typed arrays), DOM refs, particles.
 */
function serialiseState(state, visibility) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),

    player: serialisePlayer(state.player),
    resources: { ...state.resources, _effects: undefined },
    entities: state.entities.filter(e => e.alive).map(serialiseEntity),
    itemsOnFloor: state.itemsOnFloor.map(e => ({ x: e.x, y: e.y, item: serialiseItem(e.item) })),

    rooms: state.rooms.map(r => ({
      id: r.id, templateId: r.templateId,
      x: r.x, y: r.y, w: r.w, h: r.h,
      cx: r.cx, cy: r.cy,
      tags: r.tags, powered: r.powered,
      visited: r.visited, annotation: r.annotation,
      leafIndex: r.leafIndex,
    })),

    sectorType:       state.sectorType,
    playerSpawnX:     state.playerSpawnX,
    playerSpawnY:     state.playerSpawnY,
    alertLevel:       state.alertLevel,
    stats:            { ...state.stats },
    turn:             state.turn,
    stash:            state.stash.map(serialiseItem),
    messages:         state.messages.slice(-20),
    destructibleState: state.destructibleState,
    _usedLore:        state._usedLore ? [...state._usedLore] : [],

    // Explored tile data (compact: only REMEMBERED/VISIBLE indices)
    exploredTiles: visibility ? serialiseVisibility(visibility) : null,
  };
}

function serialisePlayer(p) {
  return {
    x: p.x, y: p.y, facing: p.facing,
    hp: p.hp, maxHp: p.maxHp,
    equipment: serialiseEquipment(p.equipment),
    inventory: p.inventory.map(serialiseItem),
  };
}

function serialiseEquipment(eq) {
  if (!eq) return {};
  const out = {};
  for (const [k, v] of Object.entries(eq)) {
    out[k] = v ? serialiseItem(v) : null;
  }
  return out;
}

function serialiseItem(item) {
  if (!item) return null;
  // Only copy plain data fields — no functions
  const plain = {};
  for (const [k, v] of Object.entries(item)) {
    if (typeof v !== 'function') plain[k] = v;
  }
  return plain;
}

function serialiseEntity(e) {
  return {
    x: e.x, y: e.y, facing: e.facing,
    hp: e.hp, maxHp: e.maxHp,
    name: e.name, tileId: e.tileId,
    faction: e.faction, catalogId: e.catalogId,
    aiState: e.aiState,
    lastKnownPx: e.lastKnownPx, lastKnownPy: e.lastKnownPy,
    lostTimer: e.lostTimer, erraticChance: e.erraticChance,
    preferRange: e.preferRange, stationary: e.stationary,
    lootTable: e.lootTable,
  };
}

function serialiseVisibility(visibility) {
  // Compact: store only the flat state array as a base64 string
  try {
    const arr = visibility._getStateArray();
    if (!arr) return null;
    let binary = '';
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
    return btoa(binary);
  } catch {
    return null;
  }
}

// ── Deserialisation ──────────────────────────────────────────────────────────

/**
 * Restore game state from a saved object.
 * Regenerates the tileMap from rooms metadata using generateSector,
 * then re-links AI functions to entities.
 *
 * @param {object} saved - The parsed save object.
 * @param {object} state - Existing state object to mutate.
 * @param {object} visibility - Visibility system to restore.
 * @param {object} turnManager - Turn manager to restore.
 * @param {function} generateSector - The proc-gen function.
 * @param {function} createEnemyFromCatalog - Enemy factory.
 * @returns {object} The restored tileMap.
 */
export function restoreState(saved, state, visibility, turnManager, generateSector, createEnemyFromCatalog) {
  // Restore simple fields
  state.sectorType      = saved.sectorType || 'docking';
  state.playerSpawnX    = saved.playerSpawnX;
  state.playerSpawnY    = saved.playerSpawnY;
  state.alertLevel      = saved.alertLevel || 0;
  state.stats           = saved.stats || { kills: 0, itemsFound: 0 };
  state.turn            = saved.turn || 0;
  state.stash           = (saved.stash || []).map(i => ({ ...i }));
  state.messages        = saved.messages || [];
  state.destructibleState = saved.destructibleState || {};
  state._usedLore       = new Set(saved._usedLore || []);
  state.phase           = 'playing';

  // Restore rooms (metadata only — tileMap regenerated)
  state.rooms = saved.rooms || [];

  // Regenerate the tileMap using the sector type (same seed not needed — rooms stay)
  // We generate a fresh map and re-stamp rooms at their saved positions
  const newMap = generateSector(state, state.sectorType);
  state.tileMap = newMap;

  // Restore player
  const { createPlayer } = window._gameModules || {};
  state.player.x        = saved.player.x;
  state.player.y        = saved.player.y;
  state.player.facing   = saved.player.facing;
  state.player.hp       = saved.player.hp;
  state.player.maxHp    = saved.player.maxHp;
  state.player.equipment = saved.player.equipment || {};
  state.player.inventory = (saved.player.inventory || []).map(i => ({ ...i }));

  // Restore resources
  state.resources = saved.resources || { oxygen: 100, power: 100, suitIntegrity: 100 };

  // Restore entities — re-link AI functions
  state.entities = (saved.entities || []).map(e => {
    const entity = createEnemyFromCatalog(e.catalogId || 'patrol_drone', e.x, e.y);
    entity.hp         = e.hp;
    entity.maxHp      = e.maxHp;
    entity.facing     = e.facing;
    entity.aiState    = e.aiState;
    entity.lastKnownPx = e.lastKnownPx;
    entity.lastKnownPy = e.lastKnownPy;
    entity.lostTimer   = e.lostTimer || 0;
    entity.lootTable   = e.lootTable || [];
    return entity;
  });

  // Restore items on floor
  state.itemsOnFloor = (saved.itemsOnFloor || []).map(e => ({ x: e.x, y: e.y, item: { ...e.item } }));

  // Restore camera
  state.camera.x = saved.player.x;
  state.camera.y = saved.player.y;

  // Reset visibility then try to restore explored tiles
  visibility.reset();
  if (saved.exploredTiles) {
    try {
      const binary = atob(saved.exploredTiles);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      visibility._restoreStateArray(arr);
    } catch { /* use fresh FOV */ }
  }
  visibility.update(state.player.x, state.player.y, state.player.facing,
    (x, y) => state.tileMap.blocksLight(x, y));

  // Reset turn manager to saved turn count
  turnManager.reset();
  // Advance internal counter to match saved turn (hacky but works)
  for (let i = 0; i < saved.turn; i++) turnManager._advanceTurn();

  return newMap;
}
