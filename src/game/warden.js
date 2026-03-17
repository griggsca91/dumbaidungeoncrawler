/**
 * Warden AI alert escalation system.
 * The Warden is the station's damaged AI — it escalates threat response
 * based on player actions. Alert level is one-way (never decreases).
 *
 * Alert levels:
 *   0-1: Passive — maintenance bots, dormant turrets
 *   2-3: Active  — security patrols spawn, some doors auto-lock
 *   4-5: Critical — hunter-killers, Warden depowers rooms
 */

import { addMessage } from './combat.js';
import { createEnemyFromCatalog } from './enemy.js';
import { pickSpawnEntry } from '../data/enemies.js';

const MAX_ALERT = 5;

/** Turns between Warden reinforcement spawns at alert 2+. */
const REINFORCE_INTERVAL = 8;

/** Reasons the alert can rise (used for deduplication within a turn). */
const ALERT_REASONS = new Set();

/**
 * Raise the Warden alert level.
 * Deduplicates within a single turn — only raises once per reason per turn.
 * @param {object} state - Full game state.
 * @param {number} amount - How much to raise by (usually 1).
 * @param {string} reason - 'combat' | 'hacking' | 'camera' | 'noise'
 */
export function raiseAlert(state, amount, reason) {
  if (state.alertLevel >= MAX_ALERT) return;

  // Deduplicate: only raise once per reason per turn
  const key = `${state.turn}:${reason}`;
  if (ALERT_REASONS.has(key)) return;
  ALERT_REASONS.add(key);

  const prev = state.alertLevel;
  state.alertLevel = Math.min(MAX_ALERT, state.alertLevel + amount);

  if (state.alertLevel === prev) return; // Already at cap

  const messages = {
    combat:  'The Warden detected combat. Alert level rising.',
    hacking: 'Network intrusion detected. The Warden responds.',
    camera:  'Security camera destroyed. The Warden is watching.',
    noise:   'Noise detected. The Warden is alert.',
  };

  addMessage(state, messages[reason] || 'Alert level rising.', 'system');

  // Threshold messages
  if (state.alertLevel === 2) {
    addMessage(state, 'WARDEN: Security protocols engaged. Patrols dispatched.', 'lore');
  } else if (state.alertLevel === 4) {
    addMessage(state, 'WARDEN: Critical threat detected. Hunter units deployed.', 'lore');
  } else if (state.alertLevel === 5) {
    addMessage(state, 'WARDEN: MAXIMUM ALERT. Station lockdown initiated.', 'lore');
  }
}

/**
 * Process Warden behavior at the end of the entity turn phase.
 * Called once per turn after all entities have acted.
 * @param {object} state - Full game state.
 */
export function tickWarden(state) {
  if (!state.tileMap || state.alertLevel < 2) return;

  // Reinforce: spawn enemies in unvisited rooms periodically
  if (state.turn > 0 && state.turn % REINFORCE_INTERVAL === 0) {
    spawnReinforcement(state);
  }

  // At alert 4+: randomly depower a room near the player
  if (state.alertLevel >= 4 && Math.random() < 0.15) {
    depowerNearbyRoom(state);
  }
}

/**
 * Spawn a reinforcement enemy in a random unvisited room.
 */
function spawnReinforcement(state) {
  if (!state.rooms || state.rooms.length === 0) return;

  // Find unvisited rooms (not the current player room)
  const playerRoom = getRoomAt(state.player.x, state.player.y, state.rooms);
  const candidates = state.rooms.filter(r =>
    !r.visited && r !== playerRoom && r.tags.includes('encounter')
  );

  if (candidates.length === 0) return;

  const room = candidates[Math.floor(Math.random() * candidates.length)];
  const catalogId = pickSpawnEntry(state.sectorType || 'docking', state.alertLevel);

  // Find walkable spot in room
  for (let attempt = 0; attempt < 10; attempt++) {
    const x = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
    const y = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
    if (state.tileMap.isWalkable(x, y) &&
        !state.entities.some(e => e.alive && e.x === x && e.y === y)) {
      const enemy = createEnemyFromCatalog(catalogId, x, y);
      state.entities.push(enemy);
      return;
    }
  }
}

/**
 * Depower a room adjacent to the player (Warden tactic at high alert).
 */
function depowerNearbyRoom(state) {
  if (!state.rooms) return;
  const playerRoom = getRoomAt(state.player.x, state.player.y, state.rooms);
  if (!playerRoom) return;

  // Find an adjacent powered room
  const adjacent = state.rooms.filter(r =>
    r !== playerRoom && r.powered !== false &&
    Math.abs(r.cx - playerRoom.cx) < 20 &&
    Math.abs(r.cy - playerRoom.cy) < 20
  );

  if (adjacent.length === 0) return;

  const target = adjacent[Math.floor(Math.random() * adjacent.length)];
  target.powered = false;
  addMessage(state, 'The Warden depowers a nearby section. Darkness spreads.', 'system');
}

/**
 * Find which room a position belongs to.
 */
function getRoomAt(x, y, rooms) {
  return rooms.find(r =>
    x >= r.x && x < r.x + r.w &&
    y >= r.y && y < r.y + r.h
  ) || null;
}

/**
 * Clean up per-turn deduplication cache.
 * Call at the start of each new turn.
 */
export function clearAlertCache() {
  ALERT_REASONS.clear();
}
