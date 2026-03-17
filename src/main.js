/**
 * Main entry point for Derelict Protocol.
 */

import { initCanvas, getCtx, getCanvasSize } from './engine/canvas.js';
import { startLoop } from './engine/gameLoop.js';
import { TILE_SIZE, gridToScreen } from './engine/grid.js';
import { getCameraOffset } from './engine/camera.js';
import { createRenderer, LAYERS } from './engine/renderer.js';
import { createInput } from './engine/input.js';
import { createTurnManager } from './engine/turnManager.js';
import { createVisibility } from './engine/visibility.js';
import { generateSector } from './engine/procgen.js';
import { createGameState } from './game/state.js';
import { executePlayerAction } from './game/player.js';
import { tickResources } from './game/resources.js';
import { getCoverType } from './game/cover.js';
import { drawHUD, updateLayout } from './ui/hud.js';
import { tickWarden, clearAlertCache } from './game/warden.js';

// ── Initialize ────────────────────────────────────────────────────────────

const { canvas, ctx } = initCanvas('game');
updateLayout();
window.addEventListener('resize', updateLayout);
const state = createGameState();
const renderer = createRenderer(ctx);
const input = createInput();
const turnManager = createTurnManager();

// Generate the starting sector (Docking Ring)
const tileMap = generateSector(state, 'docking');

// Move player to proc-gen spawn point
state.player.x = state.playerSpawnX;
state.player.y = state.playerSpawnY;
state.camera.x = state.player.x;
state.camera.y = state.player.y;

// Expose tileMap on state for enemy AI
state.tileMap = tileMap;

// Visibility system
const visibility = createVisibility(tileMap.width, tileMap.height);
visibility.update(state.player.x, state.player.y, state.player.facing,
  (x, y) => tileMap.blocksLight(x, y));

let debugFovEnabled = true;

// ── Debug toggles ─────────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') debugFovEnabled = !debugFovEnabled;
  // Regenerate map with R (dev tool)
  if (e.key === 'r' || e.key === 'R') {
    regenSector();
  }
});

function regenSector() {
  const sectors = ['docking', 'habitation', 'engineering'];
  const type = sectors[Math.floor(Math.random() * sectors.length)];
  state.entities = [];
  state.itemsOnFloor = [];
  state.rooms = [];
  state.destructibleState = {};
  state.alertLevel = 0;
  state.stats = { kills: 0, itemsFound: 0 };
  const newMap = generateSector(state, type);
  state.tileMap = newMap;
  visibility.reset();
  // Move player to spawn
  state.player.x = state.playerSpawnX;
  state.player.y = state.playerSpawnY;
  state.player.hp = state.player.maxHp;
  state.camera.x = state.player.x;
  state.camera.y = state.player.y;
  state.phase = 'playing';
  visibility.update(state.player.x, state.player.y, state.player.facing,
    (x, y) => state.tileMap.blocksLight(x, y));
  state.messages.push({ text: `Sector regenerated: ${type}`, type: 'system', turn: state.turn });
}

// ── Update ────────────────────────────────────────────────────────────────

function update(dt) {
  if (state.phase !== 'playing') return;
  if (!input.hasPendingAction()) return;

  const action = input.consumeAction();

  const consumed = turnManager.processAction(
    action,
    (act) => executePlayerAction(state.player, act, state.tileMap, state),
    () => {
      state.turn = turnManager.getTurnCount();
      clearAlertCache();
      tickResources(state.resources, state.player, state);
      for (const e of state.entities) {
        if (e.alive) e.act(state);
      }
      tickWarden(state);
    }
  );

  if (consumed) {
    state.turn = turnManager.getTurnCount();

    if (state.player.hp <= 0) {
      state.player.alive = false;
      state.phase = 'gameover';
      state.messages.push({ text: 'YOU DIED. Press R to generate a new sector.', type: 'combat-kill', turn: state.turn });
    }

    state.camera.x = state.player.x;
    state.camera.y = state.player.y;
    visibility.update(state.player.x, state.player.y, state.player.facing,
      (x, y) => state.tileMap.blocksLight(x, y));
  }
}

// ── Render ────────────────────────────────────────────────────────────────

function render() {
  const { width, height } = getCanvasSize();
  const offset = getCameraOffset(state.camera);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // World layers
  renderer.drawLayer(state.tileMap, LAYERS.FLOOR, state.camera);
  renderer.drawLayer(state.tileMap, LAYERS.WALLS, state.camera);
  renderer.drawLayer(state.tileMap, LAYERS.OBJECTS, state.camera);

  // Cover tints
  drawCoverIndicators(ctx, offset);

  // Floor items
  for (const entry of state.itemsOnFloor) {
    drawFloorItem(ctx, entry, offset);
  }

  // Enemies
  for (const e of state.entities) {
    if (e.alive) drawEntity(ctx, e, offset, e.faction === 'mutant' ? '#00b894' : '#e74c3c');
  }

  // Player
  if (state.player.alive) drawPlayer(ctx, state.player, offset);

  // FOV overlay
  if (debugFovEnabled) {
    visibility.renderOutOfBoundsDarkness(ctx, state.camera);
    visibility.renderOverlay(ctx, state.camera);
  }

  // HUD panels (left, right, message log, overlays)
  drawHUD(ctx, state, turnManager);
}

// ── Draw helpers ──────────────────────────────────────────────────────────

function drawPlayer(ctx, player, offset) {
  const { x, y } = gridToScreen(player.x, player.y, offset);
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  const size = TILE_SIZE * 0.35;
  const angles = { north: -Math.PI / 2, south: Math.PI / 2, east: 0, west: Math.PI };
  const angle = angles[player.facing] || 0;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = '#74b9ff';
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size * 0.7);
  ctx.lineTo(-size * 0.4, 0);
  ctx.lineTo(-size, size * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawHpBar(ctx, x, y - 6, TILE_SIZE, player.hp, player.maxHp, '#74b9ff');
}

function drawEntity(ctx, entity, offset, color) {
  const { x, y } = gridToScreen(entity.x, entity.y, offset);
  const half = TILE_SIZE / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + half, y + 4);
  ctx.lineTo(x + TILE_SIZE - 4, y + half);
  ctx.lineTo(x + half, y + TILE_SIZE - 4);
  ctx.lineTo(x + 4, y + half);
  ctx.closePath();
  ctx.fill();
  drawHpBar(ctx, x, y - 6, TILE_SIZE, entity.hp, entity.maxHp, color);
}

function drawCoverIndicators(ctx, offset) {
  const p = state.player;
  for (const enemy of state.entities) {
    if (!enemy.alive) continue;
    const coverType = getCoverType(enemy.x, enemy.y, p.x, p.y, state.tileMap);
    if (coverType === 'none') continue;
    const { x, y } = gridToScreen(p.x, p.y, offset);
    ctx.fillStyle = coverType === 'full' ? 'rgba(46,204,113,0.25)' : 'rgba(243,156,18,0.2)';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  }
}

function drawFloorItem(ctx, entry, offset) {
  const { x, y } = gridToScreen(entry.x, entry.y, offset);
  const pad = 10;
  ctx.fillStyle = '#fdcb6e';
  ctx.fillRect(x + pad, y + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + pad, y + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
}

function drawHpBar(ctx, x, y, width, hp, maxHp, color) {
  const pct = hp / maxHp;
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, width, 4);
  ctx.fillStyle = pct > 0.5 ? '#2ecc71' : pct > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(x, y, Math.floor(width * pct), 4);
}

// (HUD rendering delegated to src/ui/hud.js)

// ── Start ─────────────────────────────────────────────────────────────────

startLoop(update, render);
