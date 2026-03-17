/**
 * Enemy catalog and sector spawn tables.
 * Defines all enemy types with stats, faction, behavior, and loot.
 * Spawn tables control which enemies appear in each sector at each alert level.
 */

/**
 * Master enemy catalog.
 * Each entry maps to a bot/mutant subtype from enemy.js.
 *
 * lootTable: array of { id: itemId, chance: 0-1 }
 * detectionRange: tiles (overrides enemy.js default of 6 if set)
 */
export const ENEMY_CATALOG = {
  // ── STATION DEFENSE ────────────────────────────────────────────────────
  maintenance_bot: {
    id: 'maintenance_bot',
    name: 'Maintenance Bot',
    faction: 'station',
    subtype: 'drone',
    hp: 8, maxHp: 8,
    passive: true,            // won't attack unless provoked
    detectionRange: 4,
    lootTable: [
      { id: 'consumable_power', chance: 0.3 },
    ],
    description: 'Unarmed cleaning robot. Hostile if attacked.',
  },
  patrol_drone: {
    id: 'patrol_drone',
    name: 'Patrol Drone',
    faction: 'station',
    subtype: 'drone',
    hp: 15, maxHp: 15,
    detectionRange: 6,
    lootTable: [
      { id: 'consumable_power', chance: 0.4 },
      { id: 'weapon_pistol',    chance: 0.1 },
    ],
    description: 'Hovering security unit. Prefers ranged engagement.',
  },
  security_bot: {
    id: 'security_bot',
    name: 'Security Bot',
    faction: 'station',
    subtype: 'bot',
    hp: 30, maxHp: 30,
    detectionRange: 7,
    lootTable: [
      { id: 'consumable_power', chance: 0.5 },
      { id: 'weapon_pistol',    chance: 0.2 },
      { id: 'suit_light_armor', chance: 0.1 },
    ],
    description: 'Armored security unit. Seeks cover and suppresses targets.',
  },
  turret: {
    id: 'turret',
    name: 'Defense Turret',
    faction: 'station',
    subtype: 'turret',
    hp: 50, maxHp: 50,
    detectionRange: 8,
    lootTable: [],
    description: 'Stationary weapon emplacement. Cannot move.',
  },

  // ── MUTATED CREW ───────────────────────────────────────────────────────
  shambler: {
    id: 'shambler',
    name: 'Shambler',
    faction: 'mutant',
    subtype: 'shambler',
    hp: 15, maxHp: 15,
    detectionRange: 5,
    lootTable: [
      { id: 'consumable_o2',    chance: 0.25 },
      { id: 'consumable_medkit', chance: 0.1 },
    ],
    description: 'Slow, aggressive former crew member. Melee only.',
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    faction: 'mutant',
    subtype: 'runner',
    hp: 10, maxHp: 10,
    detectionRange: 7,
    lootTable: [
      { id: 'consumable_o2', chance: 0.15 },
    ],
    description: 'Fast, fragile. Closes distance quickly.',
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    faction: 'mutant',
    subtype: 'brute',
    hp: 40, maxHp: 40,
    detectionRange: 5,
    lootTable: [
      { id: 'consumable_repair', chance: 0.4 },
      { id: 'consumable_medkit', chance: 0.2 },
      { id: 'weapon_pipe',       chance: 0.15 },
    ],
    description: 'Massive, slow, hits extremely hard.',
  },
  spitter: {
    id: 'spitter',
    name: 'Spitter',
    faction: 'mutant',
    subtype: 'shambler',   // uses shambler AI but ranged weapon override applied at spawn
    hp: 20, maxHp: 20,
    detectionRange: 6,
    rangedOverride: {       // spawned with acid spit instead of claws
      name: 'Acid Spit', type: 'ranged',
      minDamage: 4, maxDamage: 8, ammo: 12, accuracy: -0.05,
      durability: 999, maxDurability: 999,
    },
    lootTable: [
      { id: 'consumable_o2', chance: 0.35 },
    ],
    description: 'Ranged mutant. Spits corrosive fluid.',
  },
};

/**
 * Sector spawn tables.
 * Each sector type has spawn weights per alert level (0-2 for MVP, expandable to 5).
 * Weight is relative — higher = more likely to be selected for spawning.
 *
 * Format: sectorType → alertLevel → [{ enemyId, weight }]
 */
export const SPAWN_TABLES = {
  docking: {
    0: [
      { enemyId: 'maintenance_bot', weight: 5 },
      { enemyId: 'patrol_drone',    weight: 2 },
    ],
    1: [
      { enemyId: 'patrol_drone',    weight: 4 },
      { enemyId: 'security_bot',    weight: 1 },
      { enemyId: 'shambler',        weight: 2 },
    ],
    2: [
      { enemyId: 'security_bot',    weight: 3 },
      { enemyId: 'patrol_drone',    weight: 2 },
      { enemyId: 'runner',          weight: 3 },
      { enemyId: 'turret',          weight: 1 },
    ],
  },
  habitation: {
    0: [
      { enemyId: 'shambler',        weight: 5 },
      { enemyId: 'runner',          weight: 3 },
      { enemyId: 'maintenance_bot', weight: 2 },
    ],
    1: [
      { enemyId: 'shambler',        weight: 4 },
      { enemyId: 'runner',          weight: 4 },
      { enemyId: 'brute',           weight: 1 },
      { enemyId: 'patrol_drone',    weight: 1 },
    ],
    2: [
      { enemyId: 'brute',           weight: 2 },
      { enemyId: 'spitter',         weight: 3 },
      { enemyId: 'runner',          weight: 3 },
      { enemyId: 'security_bot',    weight: 1 },
    ],
  },
  engineering: {
    0: [
      { enemyId: 'maintenance_bot', weight: 4 },
      { enemyId: 'patrol_drone',    weight: 3 },
      { enemyId: 'turret',          weight: 1 },
    ],
    1: [
      { enemyId: 'security_bot',    weight: 3 },
      { enemyId: 'patrol_drone',    weight: 3 },
      { enemyId: 'shambler',        weight: 2 },
      { enemyId: 'turret',          weight: 1 },
    ],
    2: [
      { enemyId: 'security_bot',    weight: 4 },
      { enemyId: 'turret',          weight: 2 },
      { enemyId: 'brute',           weight: 2 },
      { enemyId: 'spitter',         weight: 2 },
    ],
  },
};

/**
 * Roll a loot drop from a loot table.
 * @param {Array<{id: string, chance: number}>} lootTable
 * @returns {string|null} Item id to drop, or null if no drop.
 */
export function rollLoot(lootTable) {
  for (const entry of lootTable) {
    if (Math.random() < entry.chance) {
      return entry.id;
    }
  }
  return null;
}

/**
 * Pick a random enemy id from a spawn table entry using weighted random.
 * @param {string} sectorType - 'docking', 'habitation', 'engineering'
 * @param {number} alertLevel - 0, 1, or 2
 * @returns {string} Enemy id from ENEMY_CATALOG.
 */
export function pickSpawnEntry(sectorType, alertLevel) {
  const level = Math.min(alertLevel, 2);
  const table = SPAWN_TABLES[sectorType]?.[level] || SPAWN_TABLES.docking[0];

  const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.enemyId;
  }
  return table[0].enemyId;
}
