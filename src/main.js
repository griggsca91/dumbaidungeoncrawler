/**
 * Main entry point for Derelict Protocol.
 */

import { initCanvas, getCtx, getCanvasSize } from './engine/canvas.js';
import { startLoop } from './engine/gameLoop.js';
import { TILE_SIZE, gridToScreen } from './engine/grid.js';
import { getCameraOffset } from './engine/camera.js';
import { createRenderer, LAYERS } from './engine/renderer.js';
import { createTestRoom } from './engine/tileMap.js';
import { createInput } from './engine/input.js';
import { createTurnManager } from './engine/turnManager.js';
import { createVisibility } from './engine/visibility.js';
import { createGameState } from './game/state.js';
import { executePlayerAction } from './game/player.js';
import { tickResources, getResourceColor } from './game/resources.js';

// --- Initialize ---
const { canvas, ctx } = initCanvas('game');
const state = createGameState();
const renderer = createRenderer(ctx);
const tileMap = createTestRoom();
const input = createInput();
const turnManager = createTurnManager();
const visibility = createVisibility(tileMap.width, tileMap.height);

// Initial FOV
visibility.update(state.player.x, state.player.y, state.player.facing,
  (x, y) => tileMap.blocksLight(x, y));

let debugFovEnabled = true;

// --- Debug toggles ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'f' || e.key === 'F') debugFovEnabled = !debugFovEnabled;
});

// --- Update ---
function update(dt) {
  if (state.phase !== 'playing') return;
  if (!input.hasPendingAction()) return;

  const action = input.consumeAction();

  const consumed = turnManager.processAction(
    action,
    (act) => executePlayerAction(state.player, act, tileMap, state),
    () => {
      state.turn = turnManager.getTurnCount();
      // Tick resources every turn
      tickResources(state.resources, state.player, state);
      for (const e of state.entities) {
        if (e.alive) e.act(state);
      }
    }
  );

  if (consumed) {
    state.turn = turnManager.getTurnCount();

    // Check player death
    if (state.player.hp <= 0) {
      state.player.alive = false;
      state.phase = 'gameover';
      state.messages.push({ text: 'YOU DIED. Reload to play again.', type: 'combat-kill', turn: state.turn });
    }

    state.camera.x = state.player.x;
    state.camera.y = state.player.y;
    visibility.update(state.player.x, state.player.y, state.player.facing,
      (x, y) => tileMap.blocksLight(x, y));
  }
}

// --- Render ---
function render() {
  const { width, height } = getCanvasSize();
  const offset = getCameraOffset(state.camera);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Tile layers
  renderer.drawLayer(tileMap, LAYERS.FLOOR, state.camera);
  renderer.drawLayer(tileMap, LAYERS.WALLS, state.camera);
  renderer.drawLayer(tileMap, LAYERS.OBJECTS, state.camera);

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

  // HUD
  drawHUD(ctx, width, height);
}

// --- Draw helpers ---

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

  // HP bar above player
  drawHpBar(ctx, x, y - 6, TILE_SIZE, player.hp, player.maxHp, '#74b9ff');
}

function drawEntity(ctx, entity, offset, color) {
  const { x, y } = gridToScreen(entity.x, entity.y, offset);
  const half = TILE_SIZE / 2;

  // Diamond shape for enemies
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + half, y + 4);
  ctx.lineTo(x + TILE_SIZE - 4, y + half);
  ctx.lineTo(x + half, y + TILE_SIZE - 4);
  ctx.lineTo(x + 4, y + half);
  ctx.closePath();
  ctx.fill();

  // HP bar
  drawHpBar(ctx, x, y - 6, TILE_SIZE, entity.hp, entity.maxHp, color);
}

function drawHpBar(ctx, x, y, width, hp, maxHp, color) {
  const pct = hp / maxHp;
  ctx.fillStyle = '#333';
  ctx.fillRect(x, y, width, 4);
  ctx.fillStyle = pct > 0.5 ? '#2ecc71' : pct > 0.25 ? '#f39c12' : '#e74c3c';
  ctx.fillRect(x, y, Math.floor(width * pct), 4);
}

function drawHUD(ctx, width, height) {
  const p = state.player;
  const turn = turnManager.getTurnCount();
  const LOG_LINES = 5;
  const LOG_H = LOG_LINES * 16 + 8;
  const LOG_Y = height - LOG_H;

  // ── Message log ──
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, LOG_Y, width, LOG_H);

  const recent = state.messages.slice(-LOG_LINES);
  const typeColors = {
    'combat':       '#f39c12',
    'combat-kill':  '#e74c3c',
    'system':       '#b2bec3',
    'lore':         '#fdcb6e',
  };
  ctx.font = '12px monospace';
  recent.forEach((msg, i) => {
    ctx.fillStyle = typeColors[msg.type] || '#dfe6e9';
    ctx.fillText(msg.text, 10, LOG_Y + 16 + i * 16);
  });

  // ── Player stats bar ──
  const STAT_H = 44;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, width, STAT_H);

  const res = state.resources;
  const weapon = p.equipment?.armLeft || p.equipment?.armRight;
  const weaponLabel = weapon
    ? `${weapon.name} [${weapon.type === 'ranged' ? weapon.ammo + ' ammo' : 'melee'}]`
    : 'Unarmed';

  // Row 1: HP, weapon, turn
  ctx.font = '12px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText(`HP: ${p.hp}/${p.maxHp}`, 10, 16);
  ctx.fillText(`${weaponLabel}`, 140, 16);
  ctx.fillText(`Turn: ${turn}`, width - 100, 16);

  // Row 2: Resource bars
  const barW = 100, barH = 8, barY = 26;
  const resources = [
    { label: 'O2',   value: res.oxygen,        max: 100, x: 10  },
    { label: 'PWR',  value: res.power,          max: 100, x: 160 },
    { label: 'SUIT', value: res.suitIntegrity,  max: 100, x: 310 },
  ];
  ctx.font = '10px monospace';
  for (const r of resources) {
    ctx.fillStyle = '#4a4e69';
    ctx.fillText(r.label, r.x, barY + barH - 1);
    const bx = r.x + 32;
    ctx.fillStyle = '#222';
    ctx.fillRect(bx, barY, barW, barH);
    ctx.fillStyle = getResourceColor(r.value, r.max);
    ctx.fillRect(bx, barY, Math.floor(barW * (r.value / r.max)), barH);
    ctx.fillStyle = '#dfe6e9';
    ctx.fillText(`${r.value}%`, bx + barW + 4, barY + barH - 1);
  }

  // ── Game over overlay ──
  if (state.phase === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', width / 2, height / 2);
    ctx.fillStyle = '#b2bec3';
    ctx.font = '20px monospace';
    ctx.fillText('Reload to try again.', width / 2, height / 2 + 44);
    ctx.textAlign = 'left';
  }
}

// --- Start ---
startLoop(update, render);
