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
import { tickResources, getResourceColor } from './game/resources.js';
import { getCoverType } from './game/cover.js';

// ── Initialize ────────────────────────────────────────────────────────────

const { canvas, ctx } = initCanvas('game');
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
      tickResources(state.resources, state.player, state);
      for (const e of state.entities) {
        if (e.alive) e.act(state);
      }
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

  // HUD
  drawHUD(ctx, width, height);
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

function drawHUD(ctx, width, height) {
  const p = state.player;
  const turn = turnManager.getTurnCount();
  const LOG_LINES = 5;
  const LOG_H = LOG_LINES * 16 + 8;
  const LOG_Y = height - LOG_H;

  // Message log
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, LOG_Y, width, LOG_H);
  const typeColors = { combat: '#f39c12', 'combat-kill': '#e74c3c', system: '#b2bec3', lore: '#fdcb6e' };
  ctx.font = '12px monospace';
  state.messages.slice(-LOG_LINES).forEach((msg, i) => {
    ctx.fillStyle = typeColors[msg.type] || '#dfe6e9';
    ctx.fillText(msg.text, 10, LOG_Y + 16 + i * 16);
  });

  // Top stats bar
  const STAT_H = 44;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, width, STAT_H);

  const res = state.resources;
  const weapon = p.equipment?.armLeft || p.equipment?.armRight;
  const weaponLabel = weapon
    ? `${weapon.name} [${weapon.type === 'ranged' ? weapon.ammo + ' ammo' : 'melee'}]`
    : 'Unarmed';

  ctx.font = '12px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText(`HP: ${p.hp}/${p.maxHp}`, 10, 16);
  ctx.fillText(weaponLabel, 140, 16);
  ctx.fillText(`Inv: ${p.inventory.length}/8`, width - 220, 16);
  ctx.fillText(`Alert: ${state.alertLevel}`, width - 140, 16);
  ctx.fillText(`Turn: ${turn}`, width - 70, 16);

  // Resource bars
  const barW = 90, barH = 8, barY = 28;
  [
    { label: 'O2',   value: res.oxygen,        x: 10  },
    { label: 'PWR',  value: res.power,          x: 155 },
    { label: 'SUIT', value: res.suitIntegrity,  x: 300 },
  ].forEach(r => {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#4a4e69';
    ctx.fillText(r.label, r.x, barY + barH);
    const bx = r.x + 34;
    ctx.fillStyle = '#222';
    ctx.fillRect(bx, barY, barW, barH);
    ctx.fillStyle = getResourceColor(r.value, 100);
    ctx.fillRect(bx, barY, Math.floor(barW * r.value / 100), barH);
    ctx.fillStyle = '#dfe6e9';
    ctx.fillText(`${r.value}`, bx + barW + 3, barY + barH);
  });

  // Sector label
  ctx.fillStyle = '#636e72';
  ctx.font = '10px monospace';
  ctx.fillText(`Sector: ${state.sectorType} | R: regen`, 450, 16);

  // Game over overlay
  if (state.phase === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU DIED', width / 2, height / 2);
    ctx.fillStyle = '#b2bec3';
    ctx.font = '18px monospace';
    ctx.fillText(`Turns: ${state.turn}  Kills: ${state.stats.kills}`, width / 2, height / 2 + 40);
    ctx.fillText('Press R to generate a new sector', width / 2, height / 2 + 70);
    ctx.textAlign = 'left';
  }
}

// ── Start ─────────────────────────────────────────────────────────────────

startLoop(update, render);
