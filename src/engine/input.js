/**
 * Keyboard input manager.
 * Captures directional input and action keys for turn-based gameplay.
 * One keypress = one action. No repeat-on-hold.
 */

/** Direction vectors for movement. */
export const DIRECTIONS = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east:  { dx: 1, dy: 0 },
  west:  { dx: -1, dy: 0 },
};

/**
 * Create an input manager.
 * @returns {object} Input manager with polling methods.
 */
export function createInput() {
  /** Queue of pending actions (strings). Only the first is consumed per turn. */
  let pendingAction = null;

  /** Whether input is currently accepted. Disabled during entity turns. */
  let inputEnabled = true;

  /** Track which keys are currently held to prevent repeat. */
  const heldKeys = new Set();

  function onKeyDown(e) {
    if (!inputEnabled) return;
    if (heldKeys.has(e.key)) return; // Ignore held-key repeats
    heldKeys.add(e.key);

    const action = mapKeyToAction(e.key);
    if (action) {
      pendingAction = action;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    heldKeys.delete(e.key);
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    /**
     * Check if there is a pending action.
     * @returns {boolean}
     */
    hasPendingAction() {
      return pendingAction !== null;
    },

    /**
     * Consume and return the pending action, clearing it.
     * @returns {string|null} The action name, or null if none.
     */
    consumeAction() {
      const action = pendingAction;
      pendingAction = null;
      return action;
    },

    /**
     * Peek at the pending action without consuming it.
     * @returns {string|null}
     */
    peekAction() {
      return pendingAction;
    },

    /**
     * Enable input processing.
     */
    enable() {
      inputEnabled = true;
    },

    /**
     * Disable input processing (during entity turns).
     */
    disable() {
      inputEnabled = false;
    },

    /**
     * Clean up event listeners.
     */
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

/**
 * Map a keyboard key to a game action.
 * @param {string} key - The KeyboardEvent.key value.
 * @returns {string|null} Action name, or null if unmapped.
 */
function mapKeyToAction(key) {
  switch (key) {
    case 'ArrowUp':    case 'w': case 'W': return 'move_north';
    case 'ArrowDown':  case 's': case 'S': return 'move_south';
    case 'ArrowRight': case 'd': case 'D': return 'move_east';
    case 'ArrowLeft':  case 'a': case 'A': return 'move_west';
    case ' ':                              return 'wait';
    case 'g': case 'G':                   return 'pickup';
    case 'e': case 'E':                   return 'interact';
    default: return null;
  }
}

/**
 * Extract direction from a move action string.
 * @param {string} action - e.g., 'move_north'
 * @returns {{ dx: number, dy: number }|null}
 */
export function getDirectionFromAction(action) {
  if (!action || !action.startsWith('move_')) return null;
  const dir = action.replace('move_', '');
  return DIRECTIONS[dir] || null;
}
