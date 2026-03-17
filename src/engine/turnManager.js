/**
 * Turn manager.
 * Orchestrates the turn-based game flow:
 *   AWAITING_INPUT → PLAYER_ACTING → ENTITIES_ACTING → AWAITING_INPUT
 */

/** Turn phases. */
export const PHASES = {
  AWAITING_INPUT: 'awaiting_input',
  PLAYER_ACTING: 'player_acting',
  ENTITIES_ACTING: 'entities_acting',
};

/**
 * Create a turn manager.
 * @returns {object} Turn manager with processing methods.
 */
export function createTurnManager() {
  let phase = PHASES.AWAITING_INPUT;
  let turnCount = 0;

  return {
    /**
     * Get the current turn phase.
     * @returns {string}
     */
    getPhase() {
      return phase;
    },

    /**
     * Get the current turn count.
     * @returns {number}
     */
    getTurnCount() {
      return turnCount;
    },

    /**
     * Attempt to process a player action.
     * @param {string} action - The action to perform.
     * @param {function(string): boolean} executePlayerAction - Callback that executes the action. Returns true if action was valid.
     * @param {function(): void} executeEntityTurns - Callback to process all entity turns.
     * @returns {boolean} Whether a turn was consumed.
     */
    processAction(action, executePlayerAction, executeEntityTurns) {
      if (phase !== PHASES.AWAITING_INPUT) return false;

      // Player acts
      phase = PHASES.PLAYER_ACTING;
      const valid = executePlayerAction(action);

      if (!valid) {
        // Action was invalid (e.g., walked into wall), reset to awaiting input
        phase = PHASES.AWAITING_INPUT;
        return false;
      }

      // Entities act
      phase = PHASES.ENTITIES_ACTING;
      executeEntityTurns();

      // Advance turn
      turnCount++;
      phase = PHASES.AWAITING_INPUT;
      return true;
    },

    /**
     * Reset the turn manager for a new game.
     */
    reset() {
      phase = PHASES.AWAITING_INPUT;
      turnCount = 0;
    },

    /** Save/load support: advance internal counter without running game logic. */
    _advanceTurn() {
      turnCount++;
    },
  };
}
