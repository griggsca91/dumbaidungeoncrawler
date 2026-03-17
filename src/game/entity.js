/**
 * Base entity.
 * Any positioned object in the game world: player, enemies, NPCs.
 */

/**
 * Create a base entity.
 * @param {number} x - Grid X position.
 * @param {number} y - Grid Y position.
 * @param {string} facing - Direction facing: 'north','south','east','west'.
 * @param {object} options - Additional properties.
 * @returns {object} Entity object.
 */
export function createEntity(x, y, facing = 'south', options = {}) {
  return {
    x,
    y,
    facing,
    hp: options.hp ?? 10,
    maxHp: options.maxHp ?? options.hp ?? 10,
    name: options.name || 'entity',
    tileId: options.tileId || 40,
    faction: options.faction || 'neutral',
    alive: true,

    // Equipment slots (null until equipped)
    equipment: {
      head: null,
      torso: null,
      armLeft: options.weapon || null,  // enemies start with a built-in weapon
      armRight: null,
      back: null,
      legs: null,
    },

    /**
     * Process this entity's turn.
     * Override per entity type.
     * @param {object} gameState - The game state.
     */
    act(gameState) {
      // Base entities do nothing. Enemy types override this.
    },
  };
}
