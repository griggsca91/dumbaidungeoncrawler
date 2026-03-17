/**
 * Main entry point for Derelict Protocol.
 * Initializes the canvas, creates game state, and starts the game loop.
 */

import { initCanvas, getCtx, getCanvasSize } from './engine/canvas.js';
import { startLoop } from './engine/gameLoop.js';
import { TILE_SIZE, gridToScreen } from './engine/grid.js';
import { getCameraOffset, getVisibleBounds } from './engine/camera.js';
import { createRenderer, LAYERS } from './engine/renderer.js';
import { createTestRoom } from './engine/tileMap.js';
import { createGameState } from './game/state.js';

// --- Initialize ---
const { canvas, ctx } = initCanvas('game');
const state = createGameState();
const renderer = createRenderer(ctx);
const tileMap = createTestRoom();

/** Debug: which single layer to show, or -1 for all. */
let debugSoloLayer = -1;

// --- Input: debug layer toggle ---
window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    debugSoloLayer++;
    if (debugSoloLayer > LAYERS.UI) {
      debugSoloLayer = -1;
      // Restore all layers
      for (let i = 0; i <= LAYERS.UI; i++) {
        if (!renderer.isLayerVisible(i)) renderer.toggleLayer(i);
      }
    } else {
      // Solo this layer
      for (let i = 0; i <= LAYERS.UI; i++) {
        const shouldBeVisible = (i === debugSoloLayer);
        if (renderer.isLayerVisible(i) !== shouldBeVisible) {
          renderer.toggleLayer(i);
        }
      }
    }
  }
});

// --- Update ---
function update(dt) {
  // Placeholder: nothing to update yet (turn-based input comes in STORY-0002)
}

// --- Render ---
function render() {
  const { width, height } = getCanvasSize();
  const offset = getCameraOffset(state.camera);

  // Clear screen
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Draw tile map layers
  renderer.drawLayer(tileMap, LAYERS.FLOOR, state.camera);
  renderer.drawLayer(tileMap, LAYERS.WALLS, state.camera);
  renderer.drawLayer(tileMap, LAYERS.OBJECTS, state.camera);
  renderer.drawLayer(tileMap, LAYERS.ENTITIES, state.camera);
  renderer.drawLayer(tileMap, LAYERS.FX, state.camera);
  // LIGHTING and UI layers rendered later when those systems exist

  // Debug: show current layer mode
  if (debugSoloLayer >= 0) {
    ctx.fillStyle = '#f0a500';
    ctx.font = '14px monospace';
    ctx.fillText(`Layer: ${renderer.getLayerName(debugSoloLayer)} (press \` to cycle)`, 10, 20);
  } else {
    ctx.fillStyle = '#4a4e69';
    ctx.font = '12px monospace';
    ctx.fillText('Press ` to cycle layers', 10, 20);
  }
}

// --- Start ---
startLoop(update, render);
