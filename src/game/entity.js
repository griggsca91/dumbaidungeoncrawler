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
    hp: options.hp || 10,
    maxHp: options.maxHp || options.hp || 10,
    name: options.name || 'entity',
    tileId: options.tileId || 40,
    alive: true,

    /**
     * Process this entity's turn.
     * Override for specific behavior.
     * @param {object} gameState - The game state.
     */
    act(gameState) {
      // Base entities do nothing. Subclasses override.
    },
  };
}
