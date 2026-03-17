/**
 * Airlock stash screen.
 * Shows the player's stash (6 slots) and inventory side-by-side.
 * Player can move items between stash and inventory.
 * Opens automatically when the player is at the stash zone.
 */

import { getCanvasSize } from '../engine/canvas.js';
import { stashItem, retrieveFromStash } from '../game/runManager.js';
import { addMessage } from '../game/combat.js';

const SLOT_W = 170, SLOT_H = 32, SLOT_GAP = 4;
const MAX_STASH = 6;

// Cursor: { section: 'stash'|'inv', index }
let stashCursor = { section: 'inv', index: 0 };

export function openStash() {
  stashCursor = { section: 'inv', index: 0 };
}

/**
 * Handle keyboard input for the stash screen.
 * @returns {boolean} True if consumed.
 */
export function handleStashInput(key, state) {
  const inv = state.player.inventory;
  const stash = state.stash;

  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    const max = stashCursor.section === 'inv' ? Math.max(0, inv.length - 1) : Math.max(0, stash.length - 1);
    stashCursor.index = Math.min(max, stashCursor.index + 1);
    return true;
  }
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    stashCursor.index = Math.max(0, stashCursor.index - 1);
    return true;
  }
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    stashCursor.section = 'stash';
    stashCursor.index = Math.min(stashCursor.index, Math.max(0, stash.length - 1));
    return true;
  }
  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    stashCursor.section = 'inv';
    stashCursor.index = Math.min(stashCursor.index, Math.max(0, inv.length - 1));
    return true;
  }
  if (key === 'Enter' || key === 'e' || key === 'E') {
    if (stashCursor.section === 'inv') {
      stashItem(state, stashCursor.index);
      stashCursor.index = Math.max(0, Math.min(stashCursor.index, state.player.inventory.length - 1));
    } else {
      retrieveFromStash(state, stashCursor.index);
      stashCursor.index = Math.max(0, Math.min(stashCursor.index, state.stash.length - 1));
    }
    return true;
  }
  return false;
}

/**
 * Draw the stash screen.
 */
export function drawStashScreen(ctx, state) {
  const { width, height } = getCanvasSize();

  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, width, height);

  const panelW = 500, panelH = 420;
  const px = Math.floor((width - panelW) / 2);
  const py = Math.floor((height - panelH) / 2);

  ctx.fillStyle = '#0d1117';
  ctx.fillRect(px, py, panelW, panelH);
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, panelW, panelH);

  // Title
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(px, py, panelW, 30);
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText('AIRLOCK STASH  [Arrows: navigate | E: transfer | B: close]', px + 14, py + 20);

  const halfW = Math.floor(panelW / 2);
  const contentY = py + 38;
  const padding = 14;

  // ── Stash (left) ──
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText(`STASH  ${state.stash.length}/${MAX_STASH}`, px + padding, contentY);

  for (let i = 0; i < MAX_STASH; i++) {
    const item = state.stash[i];
    const sy = contentY + 14 + i * (SLOT_H + SLOT_GAP);
    const sel = stashCursor.section === 'stash' && stashCursor.index === i;
    drawStashSlot(ctx, item, px + padding, sy, halfW - padding * 2, sel);
  }

  // Divider
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(px + halfW, contentY, 1, MAX_STASH * (SLOT_H + SLOT_GAP) + 24);

  // ── Inventory (right) ──
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#74b9ff';
  ctx.fillText(`INVENTORY  ${state.player.inventory.length}/8`, px + halfW + padding, contentY);

  const inv = state.player.inventory;
  for (let i = 0; i < 8; i++) {
    const item = inv[i];
    const sy = contentY + 14 + i * (SLOT_H + SLOT_GAP);
    const sel = stashCursor.section === 'inv' && stashCursor.index === i;
    drawStashSlot(ctx, item, px + halfW + padding, sy, halfW - padding * 2, sel);
  }

  // Instructions
  const infoY = py + panelH - 30;
  ctx.font = '10px monospace';
  ctx.fillStyle = '#4a4e69';
  ctx.fillText('Left panel = stash (persists between runs). Right = inventory (lost on death).', px + padding, infoY);
}

function drawStashSlot(ctx, item, x, y, w, selected) {
  ctx.fillStyle = selected ? '#1a2744' : '#111827';
  ctx.fillRect(x, y, w, SLOT_H);
  ctx.strokeStyle = selected ? '#f0a500' : '#2d3436';
  ctx.lineWidth = selected ? 2 : 1;
  ctx.strokeRect(x, y, w, SLOT_H);

  if (item) {
    ctx.font = '11px monospace';
    ctx.fillStyle = selected ? '#ffffff' : '#dfe6e9';
    const name = item.name.length > 20 ? item.name.substring(0, 18) + '..' : item.name;
    ctx.fillText(name, x + 8, y + 21);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#636e72';
    ctx.fillText(item.slot, x + w - 44, y + 21);
  } else {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2d3436';
    ctx.fillText('— empty —', x + 8, y + 21);
  }
}
