/**
 * Main entry point for Derelict Protocol.
 * Initializes the canvas, creates game state, and starts the game loop.
 */

import { initCanvas, getCtx, getCanvasSize } from './engine/canvas.js';
import { startLoop } from './engine/gameLoop.js';
import { TILE_SIZE, gridToScreen } from './engine/grid.js';
import { getCameraOffset } from './engine/camera.js';
import { createRenderer, LAYERS } from './engine/renderer.js';
import { createTestRoom } from './engine/tileMap.js';
import { createInput } from './engine/input.js';
import { createTurnManager } from './engine/turnManager.js';
import { createGameState } from './game/state.js';
import { executePlayerAction } from './game/player.js';

// --- Initialize ---
const { canvas, ctx } = initCanvas('game');
const state = createGameState();
const renderer = createRenderer(ctx);
const tileMap = createTestRoom();
const input = createInput();
const turnManager = createTurnManager();

/** Debug: which single layer to show, or -1 for all. */
let debugSoloLayer = -1;

// --- Debug layer toggle (backtick key) ---
window.addEventListener('keydown', (e) => {
  if (e.key === '`' || e.key === '~') {
    debugSoloLayer++;
    if (debugSoloLayer > LAYERS.UI) {
      debugSoloLayer = -1;
      for (let i = 0; i <= LAYERS.UI; i++) {
        if (!renderer.isLayerVisible(i)) renderer.toggleLayer(i);
      }
    } else {
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
  if (state.phase !== 'playing') return;

  // Process pending input as a turn action
  if (input.hasPendingAction()) {
    const action = input.consumeAction();

    turnManager.processAction(
      action,
      // Execute player action
      (act) => executePlayerAction(state.player, act, tileMap),
      // Execute entity turns
      () => {
        for (const entity of state.entities) {
          if (entity.alive) {
            entity.act(state);
          }
        }
      }
    );

    // Camera follows player
    state.camera.x = state.player.x;
    state.camera.y = state.player.y;
  }
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

  // Draw player on the entity layer
  if (renderer.isLayerVisible(LAYERS.ENTITIES)) {
    drawPlayer(ctx, state.player, offset);
  }

  // Debug HUD
  drawDebugHUD(ctx, width);
}

/**
 * Draw the player entity as a directional arrow.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} player
 * @param {{ offsetX: number, offsetY: number }} offset
 */
function drawPlayer(ctx, player, offset) {
  const { x, y } = gridToScreen(player.x, player.y, offset);
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.35;

  // Rotation based on facing
  const angles = { north: -Math.PI / 2, south: Math.PI / 2, east: 0, west: Math.PI };
  const angle = angles[player.facing] || 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Draw arrow/triangle
  ctx.fillStyle = '#74b9ff';
  ctx.beginPath();
  ctx.moveTo(size, 0);              // tip
  ctx.lineTo(-size, -size * 0.7);   // top-left
  ctx.lineTo(-size * 0.4, 0);       // notch
  ctx.lineTo(-size, size * 0.7);    // bottom-left
  ctx.closePath();
  ctx.fill();

  // Small dot for center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw debug information.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - Canvas width.
 */
function drawDebugHUD(ctx, width) {
  const p = state.player;
  const turn = turnManager.getTurnCount();

  ctx.fillStyle = '#f0a500';
  ctx.font = '12px monospace';

  const lines = [
    `Turn: ${turn}`,
    `Pos: ${p.x}, ${p.y}`,
    `Facing: ${p.facing}`,
    `WASD to move | Space to wait`,
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, 10, 18 + i * 16);
  });

  // Layer debug
  if (debugSoloLayer >= 0) {
    ctx.fillText(`Layer: ${renderer.getLayerName(debugSoloLayer)} (press \` to cycle)`, 10, 18 + lines.length * 16);
  }
}

// --- Start ---
startLoop(update, render);
