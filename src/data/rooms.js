/**
 * Room templates for procedural sector generation.
 * Each template defines a small tileable room pattern
 * with walls, floors, objects, and tagged door positions.
 *
 * Tile IDs (from renderer.js PLACEHOLDER_COLORS):
 *   Floor:   1=metal, 2=grating, 3=carpet
 *   Walls:   10=solid, 11=windowed, 12=damaged
 *   Objects: 30=terminal(on), 31=terminal(off), 32=crate, 33=locker
 * Door slots are specified separately and placed at wall positions.
 *
 * tags: used by proc-gen to satisfy guaranteed POI requirements
 *   'start'      — valid player spawn room
 *   'loot'       — contains loot-worthy objects
 *   'terminal'   — contains at least one terminal
 *   'encounter'  — good enemy placement room
 *   'corridor'   — narrow connecting room
 */

/**
 * Room template definition.
 * w/h are interior dimensions (excluding the 1-tile wall border added by proc-gen).
 * layout rows run top-to-bottom, cols left-to-right.
 * 'F'=floor, 'G'=grating floor, 'C'=carpet floor, 'W'=wall,
 * 'T'=terminal(on), 't'=terminal(off), 'X'=crate, 'L'=locker, ' '=empty(skip)
 * Doors are listed as { side:'north'|'south'|'east'|'west', offset } where
 * offset is tiles from the left/top of that wall edge.
 */
export const ROOM_TEMPLATES = {

  // ── DOCKING SECTOR ───────────────────────────────────────────────────────

  docking_start: {
    id: 'docking_start',
    sectorTypes: ['docking'],
    tags: ['start'],
    w: 7, h: 5,
    floorId: 1,   // metal plating
    layout: [
      'FFFFFFF',
      'FFFFFFF',
      'FFFFFFF',
      'FFFFFFF',
      'FFFFFFF',
    ],
    objects: [],
    doors: [
      { side: 'east', offset: 2 },
      { side: 'south', offset: 3 },
    ],
  },

  docking_airlock: {
    id: 'docking_airlock',
    sectorTypes: ['docking'],
    tags: ['loot', 'start'],
    w: 6, h: 4,
    floorId: 1,
    layout: [
      'FFFFFF',
      'FFFFFF',
      'FFXFFF',
      'FFFFFF',
    ],
    objects: [{ col: 2, row: 2, id: 32 }],  // crate at col2,row2
    doors: [
      { side: 'east',  offset: 1 },
      { side: 'north', offset: 3 },
    ],
  },

  docking_checkpoint: {
    id: 'docking_checkpoint',
    sectorTypes: ['docking'],
    tags: ['terminal', 'encounter'],
    w: 8, h: 5,
    floorId: 1,
    layout: [
      'FFFFFFFF',
      'TFFFFFFF',
      'FFFFFFFF',
      'FFXFFXFF',
      'FFFFFFFF',
    ],
    objects: [
      { col: 0, row: 1, id: 30 },  // terminal
      { col: 2, row: 3, id: 32 },  // crate
      { col: 5, row: 3, id: 32 },  // crate
    ],
    doors: [
      { side: 'west',  offset: 2 },
      { side: 'east',  offset: 2 },
      { side: 'north', offset: 4 },
    ],
  },

  docking_cargo: {
    id: 'docking_cargo',
    sectorTypes: ['docking'],
    tags: ['loot', 'encounter'],
    w: 9, h: 6,
    floorId: 2,  // grating
    layout: [
      'GGGGGGGGG',
      'GGGGGGGGG',
      'XGGGGGGXG',
      'GGGGGGGGG',
      'XGGGGGGXG',
      'GGGGGGGGG',
    ],
    objects: [
      { col: 0, row: 2, id: 32 },
      { col: 7, row: 2, id: 32 },
      { col: 0, row: 4, id: 32 },
      { col: 7, row: 4, id: 32 },
    ],
    doors: [
      { side: 'north', offset: 4 },
      { side: 'south', offset: 4 },
      { side: 'west',  offset: 2 },
    ],
  },

  docking_security: {
    id: 'docking_security',
    sectorTypes: ['docking'],
    tags: ['terminal', 'encounter'],
    w: 6, h: 5,
    floorId: 1,
    layout: [
      'FFFFFF',
      'FTFFFF',
      'FFFFFF',
      'FFTFFF',
      'FFFFFF',
    ],
    objects: [
      { col: 1, row: 1, id: 30 },
      { col: 2, row: 3, id: 31 },
    ],
    doors: [
      { side: 'north', offset: 3 },
      { side: 'east',  offset: 2 },
      { side: 'south', offset: 2 },
    ],
  },

  // ── HABITATION SECTOR ────────────────────────────────────────────────────

  hab_quarters: {
    id: 'hab_quarters',
    sectorTypes: ['habitation'],
    tags: ['loot'],
    w: 6, h: 5,
    floorId: 3,  // carpet
    layout: [
      'CCCCCC',
      'CLLCCC',
      'CCCCCC',
      'CCCLLC',
      'CCCCCC',
    ],
    objects: [
      { col: 1, row: 1, id: 33 },
      { col: 2, row: 1, id: 33 },
      { col: 3, row: 3, id: 33 },
      { col: 4, row: 3, id: 33 },
    ],
    doors: [
      { side: 'east',  offset: 2 },
      { side: 'north', offset: 3 },
    ],
  },

  hab_medbay: {
    id: 'hab_medbay',
    sectorTypes: ['habitation'],
    tags: ['loot', 'terminal'],
    w: 7, h: 6,
    floorId: 3,
    layout: [
      'CCCCCCC',
      'CTCCCCC',
      'CCCCCCC',
      'CCCCCCC',
      'CXCCCXC',
      'CCCCCCC',
    ],
    objects: [
      { col: 1, row: 1, id: 30 },
      { col: 1, row: 4, id: 32 },
      { col: 5, row: 4, id: 32 },
    ],
    doors: [
      { side: 'south', offset: 3 },
      { side: 'west',  offset: 3 },
      { side: 'north', offset: 3 },
    ],
  },

  hab_mess_hall: {
    id: 'hab_mess_hall',
    sectorTypes: ['habitation'],
    tags: ['encounter', 'loot'],
    w: 10, h: 6,
    floorId: 3,
    layout: [
      'CCCCCCCCCC',
      'CCCCCCCCCC',
      'CCCCCCCCCC',
      'CCCCCCCCCC',
      'CCCCCCCCCC',
      'CCCCCCCCCC',
    ],
    objects: [],
    doors: [
      { side: 'north', offset: 5 },
      { side: 'south', offset: 5 },
      { side: 'west',  offset: 2 },
      { side: 'east',  offset: 2 },
    ],
  },

  hab_corridor: {
    id: 'hab_corridor',
    sectorTypes: ['habitation'],
    tags: ['corridor'],
    w: 3, h: 8,
    floorId: 3,
    layout: [
      'CCC',
      'CCC',
      'CCC',
      'CCC',
      'CCC',
      'CCC',
      'CCC',
      'CCC',
    ],
    objects: [],
    doors: [
      { side: 'north', offset: 1 },
      { side: 'south', offset: 1 },
    ],
  },

  hab_lounge: {
    id: 'hab_lounge',
    sectorTypes: ['habitation'],
    tags: ['encounter'],
    w: 7, h: 5,
    floorId: 3,
    layout: [
      'CCCCCCC',
      'CLLCCCC',
      'CCCCCCC',
      'CCCCLLC',
      'CCCCCCC',
    ],
    objects: [
      { col: 1, row: 1, id: 33 },
      { col: 2, row: 1, id: 33 },
      { col: 4, row: 3, id: 33 },
      { col: 5, row: 3, id: 33 },
    ],
    doors: [
      { side: 'north', offset: 3 },
      { side: 'east',  offset: 2 },
      { side: 'west',  offset: 2 },
    ],
  },

  // ── ENGINEERING SECTOR ───────────────────────────────────────────────────

  eng_reactor: {
    id: 'eng_reactor',
    sectorTypes: ['engineering'],
    tags: ['loot', 'encounter'],
    w: 8, h: 7,
    floorId: 2,  // grating
    layout: [
      'GGGGGGGG',
      'GGGGGGGG',
      'GXGGGGXG',
      'GGGGGGGG',
      'GXGGGGXG',
      'GGGGGGGG',
      'GGGGGGGG',
    ],
    objects: [
      { col: 1, row: 2, id: 32 },
      { col: 6, row: 2, id: 32 },
      { col: 1, row: 4, id: 32 },
      { col: 6, row: 4, id: 32 },
    ],
    doors: [
      { side: 'north', offset: 4 },
      { side: 'south', offset: 4 },
      { side: 'east',  offset: 3 },
    ],
  },

  eng_control: {
    id: 'eng_control',
    sectorTypes: ['engineering'],
    tags: ['terminal', 'encounter'],
    w: 8, h: 5,
    floorId: 2,
    layout: [
      'GGGGGGGG',
      'TGGGGGGT',
      'GGGGGGGG',
      'GGGGGGGG',
      'GGGGGGGG',
    ],
    objects: [
      { col: 0, row: 1, id: 30 },
      { col: 7, row: 1, id: 30 },
    ],
    doors: [
      { side: 'south', offset: 4 },
      { side: 'west',  offset: 2 },
      { side: 'east',  offset: 2 },
    ],
  },

  eng_maintenance: {
    id: 'eng_maintenance',
    sectorTypes: ['engineering'],
    tags: ['corridor', 'encounter'],
    w: 4, h: 8,
    floorId: 2,
    layout: [
      'GGGG',
      'GGGG',
      'GGGG',
      'GXGG',
      'GGGG',
      'GGGG',
      'GXGG',
      'GGGG',
    ],
    objects: [
      { col: 1, row: 3, id: 32 },
      { col: 1, row: 6, id: 32 },
    ],
    doors: [
      { side: 'north', offset: 2 },
      { side: 'south', offset: 2 },
      { side: 'east',  offset: 4 },
    ],
  },

  eng_power_junction: {
    id: 'eng_power_junction',
    sectorTypes: ['engineering'],
    tags: ['terminal', 'loot'],
    w: 6, h: 6,
    floorId: 2,
    layout: [
      'GGGGGG',
      'GGGGGG',
      'GTGGGG',
      'GGGGGG',
      'GGGGXG',
      'GGGGGG',
    ],
    objects: [
      { col: 1, row: 2, id: 30 },
      { col: 4, row: 4, id: 32 },
    ],
    doors: [
      { side: 'north', offset: 3 },
      { side: 'east',  offset: 3 },
      { side: 'west',  offset: 3 },
    ],
  },

  eng_storage: {
    id: 'eng_storage',
    sectorTypes: ['engineering'],
    tags: ['loot'],
    w: 7, h: 5,
    floorId: 2,
    layout: [
      'GGGGGGG',
      'GXGXGXG',
      'GGGGGGG',
      'GXGXGXG',
      'GGGGGGG',
    ],
    objects: [
      { col: 1, row: 1, id: 32 },
      { col: 3, row: 1, id: 32 },
      { col: 5, row: 1, id: 32 },
      { col: 1, row: 3, id: 33 },
      { col: 3, row: 3, id: 32 },
      { col: 5, row: 3, id: 33 },
    ],
    doors: [
      { side: 'north', offset: 3 },
      { side: 'west',  offset: 2 },
    ],
  },
};

/**
 * Get all room templates valid for a given sector type.
 * @param {string} sectorType - 'docking', 'habitation', 'engineering'
 * @returns {object[]} Array of template objects.
 */
export function getTemplatesForSector(sectorType) {
  return Object.values(ROOM_TEMPLATES).filter(t => t.sectorTypes.includes(sectorType));
}

/**
 * Get room templates with a specific tag.
 * @param {string} sectorType
 * @param {string} tag
 * @returns {object[]}
 */
export function getTemplatesByTag(sectorType, tag) {
  return getTemplatesForSector(sectorType).filter(t => t.tags.includes(tag));
}
