/**
 * Main entry point for Derelict Protocol.
 * Initializes the canvas, creates game state, and starts the game loop.
 */

import { initCanvas, getCtx, getCanvasSize } from './engine/canvas.js';
import { startLoop } from './engine/gameLoop.js';
import { TILE_SIZE, gridToScreen } from './engine/grid.js';
import { getCameraOffset, getVisibleBounds } from './engine/camera.js';
import { createGameState } from './game/state.js';

// --- Initialize ---
const { canvas, ctx } = initCanvas('game');
const state = createGameState();

// --- Update ---
function update(dt) {
  // Placeholder: nothing to update yet (turn-based input comes in STORY-0002)
}

// --- Render ---
function render() {
  const { width, height } = getCanvasSize();
  const offset = getCameraOffset(state.camera);
  const bounds = getVisibleBounds(state.camera);

  // Clear screen
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Draw a debug grid of tiles
  if (state.debug.showGrid) {
    drawDebugGrid(ctx, offset, bounds);
  }
}

/**
 * Draw a debug grid showing tile boundaries within the visible area.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ offsetX: number, offsetY: number }} offset
 * @param {{ startX: number, startY: number, endX: number, endY: number }} bounds
 */
function drawDebugGrid(ctx, offset, bounds) {
  for (let gx = bounds.startX; gx <= bounds.endX; gx++) {
    for (let gy = bounds.startY; gy <= bounds.endY; gy++) {
      const { x, y } = gridToScreen(gx, gy, offset);

      // Subtle grid lines
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
    }
  }

  // Draw origin marker
  const origin = gridToScreen(0, 0, offset);
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(origin.x, origin.y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = '#f0a500';
  ctx.font = '10px monospace';
  ctx.fillText('0,0', origin.x + 4, origin.y + 20);
}

// --- Start ---
startLoop(update, render);
