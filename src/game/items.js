/**
 * Item definitions and item factory.
 * All items are plain data objects loaded from this module.
 * The equipment system reads these definitions at runtime.
 */

/**
 * Master item catalog.
 * Each entry defines one item template.
 * Fields: id, name, slot, type, rarity, description, stats
 */
export const ITEM_CATALOG = [
  // ── HEAD ──────────────────────────────────────────────────────────────
  {
    id: 'helmet_basic',
    name: 'EVA Helmet',
    slot: 'head',
    rarity: 'common',
    description: 'Standard-issue helmet. Seals against vacuum.',
    durability: 30, maxDurability: 30,
    armorValue: 1,
    visionBonus: 0,
    powerDraw: 0,
  },
  {
    id: 'helmet_flashlight',
    name: 'Flashlight Visor',
    slot: 'head',
    rarity: 'common',
    description: 'Wider beam than your built-in torch.',
    durability: 25, maxDurability: 25,
    armorValue: 0,
    visionBonus: 2,
    powerDraw: 1,
  },
  {
    id: 'helmet_rebreather',
    name: 'Rebreather Mask',
    slot: 'head',
    rarity: 'uncommon',
    description: 'Recycles exhaled air. Slows O2 consumption.',
    durability: 20, maxDurability: 20,
    armorValue: 0,
    oxygenSave: 0.5,   // 50% chance to save O2 each turn
    visionBonus: 0,
    powerDraw: 0,
  },
  {
    id: 'helmet_ir',
    name: 'IR Scanner',
    slot: 'head',
    rarity: 'uncommon',
    description: 'Infrared overlay. Reveals heat signatures.',
    durability: 20, maxDurability: 20,
    armorValue: 0,
    visionBonus: 3,
    powerDraw: 2,
  },

  // ── TORSO ─────────────────────────────────────────────────────────────
  {
    id: 'suit_jumpsuit',
    name: 'Salvager Jumpsuit',
    slot: 'torso',
    rarity: 'common',
    description: 'Light, flexible. Better than nothing.',
    durability: 20, maxDurability: 20,
    armorValue: 1,
    powerDraw: 0,
  },
  {
    id: 'suit_light_armor',
    name: 'Light Armor Vest',
    slot: 'torso',
    rarity: 'common',
    description: 'Ceramic plate inserts over a pressure suit.',
    durability: 35, maxDurability: 35,
    armorValue: 3,
    powerDraw: 0,
  },
  {
    id: 'suit_heavy_armor',
    name: 'Power Armor',
    slot: 'torso',
    rarity: 'rare',
    description: 'Powered exoskeleton. Excellent protection.',
    durability: 60, maxDurability: 60,
    armorValue: 6,
    powerDraw: 3,
  },
  {
    id: 'suit_hazmat',
    name: 'Hazmat Suit',
    slot: 'torso',
    rarity: 'uncommon',
    description: 'Full chemical protection. Minimal armor.',
    durability: 30, maxDurability: 30,
    armorValue: 1,
    hazmatProtection: true,
    powerDraw: 0,
  },
  {
    id: 'suit_stealth',
    name: 'Stealth Suit',
    slot: 'torso',
    rarity: 'rare',
    description: 'Noise-dampening weave. Enemies detect you later.',
    durability: 25, maxDurability: 25,
    armorValue: 2,
    stealthBonus: 2,
    powerDraw: 1,
  },

  // ── ARM — MELEE ───────────────────────────────────────────────────────
  {
    id: 'weapon_pipe',
    name: 'Metal Pipe',
    slot: 'arm',
    type: 'melee',
    rarity: 'common',
    description: 'Heavy pipe. Reliable. Surprisingly lethal.',
    durability: 40, maxDurability: 40,
    minDamage: 4, maxDamage: 8,
    accuracy: 0,
    powerDraw: 0,
  },
  {
    id: 'weapon_crowbar',
    name: 'Crowbar',
    slot: 'arm',
    type: 'melee',
    rarity: 'common',
    description: "The classic. Also opens doors and breaks terminals.",
    durability: 50, maxDurability: 50,
    minDamage: 3, maxDamage: 7,
    accuracy: 0.05,
    powerDraw: 0,
  },
  {
    id: 'weapon_stun_baton',
    name: 'Stun Baton',
    slot: 'arm',
    type: 'melee',
    rarity: 'uncommon',
    description: 'Electrified. Higher damage but drains power.',
    durability: 30, maxDurability: 30,
    minDamage: 6, maxDamage: 12,
    accuracy: 0,
    powerDraw: 2,
  },
  {
    id: 'weapon_plasma_cutter',
    name: 'Plasma Cutter',
    slot: 'arm',
    type: 'melee',
    rarity: 'rare',
    description: 'Industrial cutting tool repurposed as a weapon.',
    durability: 25, maxDurability: 25,
    minDamage: 10, maxDamage: 18,
    accuracy: -0.05,
    powerDraw: 4,
  },

  // ── ARM — RANGED ──────────────────────────────────────────────────────
  {
    id: 'weapon_pistol',
    name: 'Security Pistol',
    slot: 'arm',
    type: 'ranged',
    rarity: 'common',
    description: 'Standard sidearm. Low damage, easy to carry.',
    durability: 40, maxDurability: 40,
    minDamage: 5, maxDamage: 9,
    accuracy: 0,
    ammo: 12, maxAmmo: 12,
    powerDraw: 0,
  },
  {
    id: 'weapon_shotgun',
    name: 'Breacher Shotgun',
    slot: 'arm',
    type: 'ranged',
    rarity: 'uncommon',
    description: 'Devastating at close range. Useless at distance.',
    durability: 35, maxDurability: 35,
    minDamage: 12, maxDamage: 22,
    accuracy: -0.15,
    ammo: 8, maxAmmo: 8,
    powerDraw: 0,
  },
  {
    id: 'weapon_rifle',
    name: 'Combat Rifle',
    slot: 'arm',
    type: 'ranged',
    rarity: 'uncommon',
    description: 'Long range, accurate. Military surplus.',
    durability: 40, maxDurability: 40,
    minDamage: 8, maxDamage: 14,
    accuracy: 0.1,
    ammo: 20, maxAmmo: 20,
    powerDraw: 0,
  },
  {
    id: 'weapon_energy',
    name: 'Energy Pistol',
    slot: 'arm',
    type: 'ranged',
    rarity: 'rare',
    description: 'Fires coherent energy bolts. Uses power cell instead of ammo.',
    durability: 30, maxDurability: 30,
    minDamage: 10, maxDamage: 16,
    accuracy: 0.05,
    ammo: 999,  // "ammo" is just a flag; uses powerDraw instead
    powerDraw: 3,
  },

  // ── BACK ──────────────────────────────────────────────────────────────
  {
    id: 'back_backpack',
    name: 'Salvager Backpack',
    slot: 'back',
    rarity: 'common',
    description: '+4 inventory slots.',
    durability: 30, maxDurability: 30,
    inventoryBonus: 4,
    powerDraw: 0,
  },
  {
    id: 'back_shield',
    name: 'Shield Generator',
    slot: 'back',
    rarity: 'rare',
    description: 'Energy shield absorbs first hit each turn.',
    durability: 20, maxDurability: 20,
    shieldValue: 5,
    powerDraw: 4,
  },
  {
    id: 'back_o2_tank',
    name: 'Extra O2 Tank',
    slot: 'back',
    rarity: 'uncommon',
    description: 'Carries 50 extra oxygen units.',
    durability: 20, maxDurability: 20,
    oxygenBonus: 50,
    powerDraw: 0,
  },
  {
    id: 'back_hacking_rig',
    name: 'Hacking Rig',
    slot: 'back',
    rarity: 'rare',
    description: 'Boosts hacking success chance significantly.',
    durability: 15, maxDurability: 15,
    hackingBonus: 0.3,
    powerDraw: 2,
  },

  // ── LEGS ──────────────────────────────────────────────────────────────
  {
    id: 'legs_boots',
    name: 'Standard Boots',
    slot: 'legs',
    rarity: 'common',
    description: 'Basic footwear. No special properties.',
    durability: 30, maxDurability: 30,
    powerDraw: 0,
  },
  {
    id: 'legs_mag_boots',
    name: 'Mag-Boots',
    slot: 'legs',
    rarity: 'uncommon',
    description: 'Magnetic clamps. Prevents floating in zero-g areas.',
    durability: 25, maxDurability: 25,
    magBoots: true,
    speedBonus: -1,
    powerDraw: 1,
  },
  {
    id: 'legs_sprint',
    name: 'Sprint Boosters',
    slot: 'legs',
    rarity: 'uncommon',
    description: 'Servos in the knee joints. Faster movement.',
    durability: 20, maxDurability: 20,
    speedBonus: 1,
    powerDraw: 1,
  },
  {
    id: 'legs_armored',
    name: 'Armored Greaves',
    slot: 'legs',
    rarity: 'uncommon',
    description: 'Heavy leg protection. Slow but sturdy.',
    durability: 50, maxDurability: 50,
    armorValue: 2,
    speedBonus: -1,
    powerDraw: 0,
  },

  // ── CONSUMABLES (floor items, not equipped) ───────────────────────────
  {
    id: 'consumable_o2',
    name: 'O2 Canister',
    slot: 'consumable',
    rarity: 'common',
    description: 'Refills 30 oxygen units.',
    durability: 1, maxDurability: 1,
    restores: { type: 'oxygen', amount: 30 },
  },
  {
    id: 'consumable_power',
    name: 'Power Cell',
    slot: 'consumable',
    rarity: 'common',
    description: 'Recharges 40 power units.',
    durability: 1, maxDurability: 1,
    restores: { type: 'power', amount: 40 },
  },
  {
    id: 'consumable_repair',
    name: 'Repair Kit',
    slot: 'consumable',
    rarity: 'uncommon',
    description: 'Restores 25 suit integrity.',
    durability: 1, maxDurability: 1,
    restores: { type: 'suitIntegrity', amount: 25 },
  },
];

/**
 * Get an item template by id.
 * @param {string} id - Item id.
 * @returns {object|null} Item template (deep copy), or null if not found.
 */
export function getItemById(id) {
  const template = ITEM_CATALOG.find(i => i.id === id);
  if (!template) return null;
  // Return a fresh copy so items have independent durability
  return { ...template };
}

/**
 * Get all items for a given slot type.
 * @param {string} slot
 * @returns {object[]}
 */
export function getItemsBySlot(slot) {
  return ITEM_CATALOG.filter(i => i.slot === slot).map(i => ({ ...i }));
}
