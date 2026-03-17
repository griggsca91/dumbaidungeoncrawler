/**
 * Game loop using requestAnimationFrame with delta-time tracking.
 * Provides a stable 60fps loop with dt available to update functions.
 */

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;

let running = false;
let lastTimestamp = 0;
let updateFn = null;
let renderFn = null;
let rafId = null;

/**
 * Start the game loop.
 * @param {function(number): void} update - Called each frame with delta time in seconds.
 * @param {function(): void} render - Called each frame after update.
 */
export function startLoop(update, render) {
  updateFn = update;
  renderFn = render;
  running = true;
  lastTimestamp = performance.now();
  rafId = requestAnimationFrame(tick);
}

/**
 * Stop the game loop.
 */
export function stopLoop() {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Check if the loop is currently running.
 * @returns {boolean}
 */
export function isRunning() {
  return running;
}

/**
 * Internal tick function driven by requestAnimationFrame.
 * @param {DOMHighResTimeStamp} timestamp
 */
function tick(timestamp) {
  if (!running) return;

  const elapsed = timestamp - lastTimestamp;

  // Cap delta to avoid spiral of death on tab-switch or long pauses
  const dt = Math.min(elapsed, FRAME_DURATION * 3) / 1000;

  lastTimestamp = timestamp;

  if (updateFn) updateFn(dt);
  if (renderFn) renderFn();

  rafId = requestAnimationFrame(tick);
}
