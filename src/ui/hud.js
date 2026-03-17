/**
 * Full-screen HUD.
 * Renders equipment slots, resource bars, Warden alert pips,
 * minimap, and message log around the game viewport.
 *
 * Layout (per spec A.3.5):
 *
 *  ┌──────────────┬──────────────────────────────┬───────────────┐
 *  │ LEFT PANEL   │       GAME VIEWPORT          │  RIGHT PANEL  │
 *  │  (200px)     │   (fills remaining width)    │   (180px)     │
 *  │ Equipment    │                              │  Minimap      │
 *  │ Resources    │                              │  Alert        │
 *  └──────────────┴──────────────────────────────┴───────────────┘
 *  │                   MESSAGE LOG (full width, 96px)             │
 *  └──────────────────────────────────────────────────────────────┘
 */

import { getCanvasSize } from '../engine/canvas.js';
import { setViewport } from '../engine/camera.js';
import { getResourceColor } from '../game/resources.js';

// ── Layout constants ────────────────────────────────────────────────────────

const LEFT_W   = 200;   // left panel width (equipment + resources)
const RIGHT_W  = 180;   // right panel width (minimap + alert)
const LOG_H    = 96;    // message log height at bottom
const LOG_LINES = 5;

// Minimap rendering
const MINI_ROOM_W  = 6;   // pixels per room on minimap
const MINI_ROOM_H  = 4;
const MINI_SCALE_X = 0.08; // world-tile → minimap-pixel
const MINI_SCALE_Y = 0.08;

// Colours
const C = {
  panelBg:    'rgba(10, 10, 20, 0.92)',
  border:     '#2d3436',
  label:      '#636e72',
  value:      '#dfe6e9',
  highlight:  '#f0a500',
  slotEmpty:  '#1a1a2e',
  slotBorder: '#2d3436',
  logBg:      'rgba(0, 0, 0, 0.88)',
  alert0:     '#2d3436',
  alert1:     '#e74c3c',
};

const SLOT_COLORS = {
  head:     '#74b9ff',
  torso:    '#55efc4',
  armLeft:  '#fdcb6e',
  armRight: '#fdcb6e',
  back:     '#a29bfe',
  legs:     '#fd79a8',
};

const TYPE_COLORS = {
  combat:       '#f39c12',
  'combat-kill':'#e74c3c',
  system:       '#b2bec3',
  lore:         '#fdcb6e',
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute and register the game viewport based on current canvas size.
 * Must be called on init and on every canvas resize.
 * @returns {{ x, y, w, h }} The game viewport rect.
 */
export function updateLayout() {
  const { width, height } = getCanvasSize();
  const vp = {
    x: LEFT_W,
    y: 0,
    w: width - LEFT_W - RIGHT_W,
    h: height - LOG_H,
  };
  setViewport(vp);
  return vp;
}

/**
 * Draw the complete HUD over the already-rendered game world.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state - Full game state.
 * @param {object} turnManager - For turn count.
 */
export function drawHUD(ctx, state, turnManager) {
  const { width, height } = getCanvasSize();
  const vp = {
    x: LEFT_W,
    y: 0,
    w: width - LEFT_W - RIGHT_W,
    h: height - LOG_H,
  };

  drawLeftPanel(ctx, state, vp, height);
  drawRightPanel(ctx, state, vp, width, height);
  drawMessageLog(ctx, state, width, height);
  drawViewportBorder(ctx, vp, height);

  if (state.phase === 'gameover') {
    drawGameOver(ctx, state, turnManager, width, height);
  }
}

// ── Left panel ──────────────────────────────────────────────────────────────

function drawLeftPanel(ctx, state, vp, height) {
  const p = state.player;
  const panelH = height - LOG_H;

  // Background
  ctx.fillStyle = C.panelBg;
  ctx.fillRect(0, 0, LEFT_W, panelH);
  // Right border
  ctx.fillStyle = C.border;
  ctx.fillRect(LEFT_W - 1, 0, 1, panelH);

  let y = 14;

  // ── Title ──
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = C.highlight;
  ctx.fillText('SALVAGER', 10, y);
  y += 4;

  // ── HP bar ──
  y += 14;
  drawLabel(ctx, 'HP', 10, y);
  drawBar(ctx, 40, y - 9, 148, 10, p.hp, p.maxHp, '#e74c3c', '#2ecc71');
  ctx.font = '10px monospace';
  ctx.fillStyle = C.value;
  ctx.fillText(`${p.hp}/${p.maxHp}`, 40, y);
  y += 16;

  // ── Resources ──
  const res = state.resources;
  const resources = [
    { label: 'O2',  value: res.oxygen,         max: 100 },
    { label: 'PWR', value: res.power,           max: 100 },
    { label: 'SUIT',value: res.suitIntegrity,   max: 100 },
  ];
  for (const r of resources) {
    drawLabel(ctx, r.label, 10, y);
    const color = getResourceColor(r.value, r.max);
    drawBar(ctx, 40, y - 9, 110, 8, r.value, r.max, color, color);
    ctx.font = '9px monospace';
    ctx.fillStyle = C.value;
    ctx.fillText(`${r.value}%`, 154, y);
    y += 15;
  }

  y += 6;
  // ── Separator ──
  ctx.fillStyle = C.border;
  ctx.fillRect(10, y, LEFT_W - 20, 1);
  y += 10;

  // ── Equipment slots ──
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = C.label;
  ctx.fillText('EQUIPMENT', 10, y);
  y += 12;

  const slots = [
    { key: 'head',     label: 'HEAD' },
    { key: 'torso',    label: 'TORSO' },
    { key: 'armLeft',  label: 'ARM-L' },
    { key: 'armRight', label: 'ARM-R' },
    { key: 'back',     label: 'BACK' },
    { key: 'legs',     label: 'LEGS' },
  ];

  for (const slot of slots) {
    const item = p.equipment?.[slot.key];
    const color = SLOT_COLORS[slot.key] || '#b2bec3';

    // Slot box
    ctx.fillStyle = C.slotEmpty;
    ctx.fillRect(10, y - 10, LEFT_W - 20, 14);
    ctx.strokeStyle = color + '55';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, y - 10, LEFT_W - 20, 14);

    // Slot label
    ctx.font = '9px monospace';
    ctx.fillStyle = color;
    ctx.fillText(slot.label, 14, y);

    // Item name
    if (item) {
      ctx.fillStyle = C.value;
      const name = item.name.length > 16 ? item.name.substring(0, 14) + '..' : item.name;
      ctx.fillText(name, 52, y);
      // Durability micro-bar
      if (item.durability !== undefined && item.maxDurability > 1) {
        const durPct = item.durability / item.maxDurability;
        const bx = LEFT_W - 28;
        ctx.fillStyle = '#333';
        ctx.fillRect(bx, y - 7, 22, 4);
        ctx.fillStyle = durPct > 0.5 ? '#2ecc71' : durPct > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillRect(bx, y - 7, Math.floor(22 * durPct), 4);
      }
    } else {
      ctx.fillStyle = C.slotBorder;
      ctx.fillText('—', 52, y);
    }

    y += 17;
  }

  y += 4;
  // ── Inventory count ──
  const cap = 8 + (p.equipment?.back?.inventoryBonus || 0);
  ctx.font = '10px monospace';
  ctx.fillStyle = C.label;
  ctx.fillText(`INV: ${p.inventory.length}/${cap}`, 10, y);

  // ── Turn + sector ──
  y += 14;
  ctx.fillStyle = C.label;
  ctx.fillText(`TURN: ${state.turn}`, 10, y);
  y += 13;
  ctx.fillStyle = C.label;
  ctx.fillText(`SECTOR: ${(state.sectorType || 'docking').toUpperCase()}`, 10, y);
}

// ── Right panel ─────────────────────────────────────────────────────────────

function drawRightPanel(ctx, state, vp, width, height) {
  const panelX = width - RIGHT_W;
  const panelH = height - LOG_H;

  // Background
  ctx.fillStyle = C.panelBg;
  ctx.fillRect(panelX, 0, RIGHT_W, panelH);
  // Left border
  ctx.fillStyle = C.border;
  ctx.fillRect(panelX, 0, 1, panelH);

  let y = 14;
  const px = panelX + 10;

  // ── Minimap ──
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = C.label;
  ctx.fillText('MAP', px, y);
  y += 8;

  const mapAreaW = RIGHT_W - 20;
  const mapAreaH = 120;
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(px, y, mapAreaW, mapAreaH);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(px, y, mapAreaW, mapAreaH);

  drawMinimap(ctx, state, px + 2, y + 2, mapAreaW - 4, mapAreaH - 4);
  y += mapAreaH + 10;

  // ── Alert pips ──
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = C.label;
  ctx.fillText('WARDEN ALERT', px, y);
  y += 14;

  const alertLevel = state.alertLevel || 0;
  const MAX_ALERT = 5;
  const pipW = 22, pipH = 14, pipGap = 4;
  for (let i = 0; i < MAX_ALERT; i++) {
    const filled = i < alertLevel;
    const pipX = px + i * (pipW + pipGap);
    ctx.fillStyle = filled ? C.alert1 : C.alert0;
    ctx.fillRect(pipX, y, pipW, pipH);
    ctx.strokeStyle = filled ? '#ff6b6b' : '#4a4e69';
    ctx.lineWidth = 1;
    ctx.strokeRect(pipX, y, pipW, pipH);
    if (filled) {
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('!', pipX + pipW / 2, y + 10);
      ctx.textAlign = 'left';
    }
  }
  y += pipH + 10;

  // ── Alert description ──
  const alertLabels = ['DORMANT', 'ACTIVE', 'ELEVATED', 'HIGH', 'CRITICAL', 'LOCKDOWN'];
  ctx.font = '9px monospace';
  ctx.fillStyle = alertLevel > 2 ? C.alert1 : C.label;
  ctx.fillText(alertLabels[alertLevel] || 'UNKNOWN', px, y);
  y += 18;

  // ── Controls reminder ──
  ctx.fillStyle = C.border;
  ctx.fillRect(px, y, RIGHT_W - 20, 1);
  y += 8;
  const controls = ['WASD  move', 'G     pickup', 'E     interact', 'I     inventory', 'Space wait', 'F     FOV', 'R     regen'];
  ctx.font = '9px monospace';
  ctx.fillStyle = C.label;
  for (const line of controls) {
    if (y > panelH - 10) break;
    ctx.fillText(line, px, y);
    y += 12;
  }
}

// ── Minimap ─────────────────────────────────────────────────────────────────

function drawMinimap(ctx, state, mx, my, mw, mh) {
  if (!state.rooms || state.rooms.length === 0) {
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '9px monospace';
    ctx.fillStyle = C.label;
    ctx.fillText('no data', mx + 4, my + 12);
    return;
  }

  // Find bounding box of all rooms in world coords
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of state.rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }

  const worldW = maxX - minX || 1;
  const worldH = maxY - minY || 1;
  const scaleX = mw / worldW;
  const scaleY = mh / worldH;
  const scale = Math.min(scaleX, scaleY, 2.5);

  const offsetX = mx + (mw - worldW * scale) / 2;
  const offsetY = my + (mh - worldH * scale) / 2;

  for (const room of state.rooms) {
    const rx = offsetX + (room.x - minX) * scale;
    const ry = offsetY + (room.y - minY) * scale;
    const rw = Math.max(3, room.w * scale);
    const rh = Math.max(2, room.h * scale);

    if (!room.visited) {
      ctx.fillStyle = '#1a1a2e';
    } else if (room.powered === false) {
      ctx.fillStyle = '#2d3436';
    } else {
      ctx.fillStyle = '#4a4e69';
    }
    ctx.fillRect(rx, ry, rw, rh);

    // Tags glow
    if (room.tags.includes('terminal') && room.visited) {
      ctx.fillStyle = 'rgba(85,239,196,0.4)';
      ctx.fillRect(rx, ry, rw, rh);
    }
  }

  // Player dot
  if (state.player) {
    const pdx = offsetX + (state.player.x - minX) * scale;
    const pdy = offsetY + (state.player.y - minY) * scale;
    ctx.fillStyle = '#74b9ff';
    ctx.beginPath();
    ctx.arc(pdx, pdy, Math.max(2, scale * 0.8), 0, Math.PI * 2);
    ctx.fill();
  }

  // Mark visited rooms
  if (state.rooms) {
    for (const room of state.rooms) {
      if (
        state.player &&
        state.player.x >= room.x && state.player.x < room.x + room.w &&
        state.player.y >= room.y && state.player.y < room.y + room.h
      ) {
        room.visited = true;
      }
    }
  }
}

// ── Message log ──────────────────────────────────────────────────────────────

function drawMessageLog(ctx, state, width, height) {
  const logY = height - LOG_H;

  ctx.fillStyle = C.logBg;
  ctx.fillRect(0, logY, width, LOG_H);
  ctx.fillStyle = C.border;
  ctx.fillRect(0, logY, width, 1);

  ctx.font = '12px monospace';
  const recent = state.messages.slice(-LOG_LINES);
  recent.forEach((msg, i) => {
    ctx.fillStyle = TYPE_COLORS[msg.type] || C.value;
    ctx.fillText(`> ${msg.text}`, 12, logY + 16 + i * 16);
  });
}

// ── Game over overlay ────────────────────────────────────────────────────────

function drawGameOver(ctx, state, turnManager, width, height) {
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 52px monospace';
  ctx.fillText('YOU DIED', width / 2, height / 2 - 50);

  const summary = state.runSummary || { turns: state.turn, kills: state.stats?.kills || 0, sector: state.sectorType };
  ctx.fillStyle = '#b2bec3';
  ctx.font = '16px monospace';
  ctx.fillText(
    `Sector: ${summary.sector}   Turns: ${summary.turns}   Kills: ${summary.kills}`,
    width / 2, height / 2
  );

  // New run button area
  const btnW = 260, btnH = 44;
  const btnX = width / 2 - btnW / 2;
  const btnY = height / 2 + 30;
  ctx.fillStyle = '#1a2744';
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.strokeStyle = '#74b9ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(btnX, btnY, btnW, btnH);
  ctx.fillStyle = '#74b9ff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('[ N ] START NEW RUN', width / 2, btnY + 29);

  ctx.fillStyle = '#4a4e69';
  ctx.font = '12px monospace';
  ctx.fillText('Stash items persist. Equipped gear is lost.', width / 2, btnY + 70);
  ctx.textAlign = 'left';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function drawBar(ctx, x, y, w, h, value, max, lowColor, highColor) {
  const pct = Math.max(0, Math.min(1, value / max));
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = pct > 0.5 ? highColor : pct > 0.25 ? '#f39c12' : lowColor;
  ctx.fillRect(x, y, Math.floor(w * pct), h);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function drawLabel(ctx, text, x, y) {
  ctx.font = '9px monospace';
  ctx.fillStyle = C.label;
  ctx.fillText(text, x, y);
}

function drawViewportBorder(ctx, vp, height) {
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(vp.x, vp.y, vp.w, height - LOG_H);
}
