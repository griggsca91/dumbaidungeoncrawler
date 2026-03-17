/**
 * Full-screen map view overlay.
 * Shows all explored rooms with annotations, player position,
 * and room metadata. Toggled with M key.
 *
 * Controls:
 *   Arrow keys — move cursor between rooms
 *   A          — cycle annotation on selected room
 *   M/Esc      — close
 */

import { getCanvasSize } from '../engine/canvas.js';
import { VIS } from '../engine/visibility.js';

// Room annotations
const ANNOTATIONS = [null, '⚠ danger', '✓ looted', '★ poi'];

// Cursor: selected room index in state.rooms
let mapCursor = 0;

export function openMapView() {
  mapCursor = 0;
}

/**
 * Handle keyboard for map view.
 * @returns {boolean} True if consumed.
 */
export function handleMapInput(key, state) {
  const rooms = state.rooms || [];
  if (rooms.length === 0) return false;

  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    mapCursor = (mapCursor + 1) % rooms.length;
    return true;
  }
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    mapCursor = (mapCursor - 1 + rooms.length) % rooms.length;
    return true;
  }
  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    mapCursor = Math.min(rooms.length - 1, mapCursor + 4);
    return true;
  }
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    mapCursor = Math.max(0, mapCursor - 4);
    return true;
  }

  // Cycle annotation on selected room
  if (key === 'Enter' || key === 'e' || key === 'E') {
    const room = rooms[mapCursor];
    if (room) {
      const cur = ANNOTATIONS.indexOf(room.annotation);
      const next = (cur + 1) % ANNOTATIONS.length;
      room.annotation = ANNOTATIONS[next];
    }
    return true;
  }

  return false; // M/Escape handled by main.js
}

/**
 * Draw the full-screen map overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state
 * @param {object} visibility
 */
export function drawMapView(ctx, state, visibility) {
  const { width, height } = getCanvasSize();
  const rooms = state.rooms || [];

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.93)';
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText(`SECTOR MAP — ${(state.sectorType || 'docking').toUpperCase()}`, 20, 28);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#636e72';
  ctx.fillText('Arrow keys: cursor  |  E: annotate  |  M/Esc: close', 20, 46);

  if (rooms.length === 0) {
    ctx.font = '14px monospace';
    ctx.fillStyle = '#4a4e69';
    ctx.fillText('No sector data.', width / 2 - 60, height / 2);
    return;
  }

  // Map area
  const mapPadX = 20, mapPadY = 60;
  const mapW = width - mapPadX * 2 - 220;  // leave right panel for room info
  const mapH = height - mapPadY - 40;

  // Compute bounding box of all rooms
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rooms) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }
  const worldW = maxX - minX || 1;
  const worldH = maxY - minY || 1;
  const scaleX = mapW / worldW;
  const scaleY = mapH / worldH;
  const scale = Math.min(scaleX, scaleY, 6);
  const offX = mapPadX + (mapW - worldW * scale) / 2;
  const offY = mapPadY + (mapH - worldH * scale) / 2;

  // Draw rooms
  const cursorRoom = rooms[mapCursor];

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const rx = offX + (room.x - minX) * scale;
    const ry = offY + (room.y - minY) * scale;
    const rw = Math.max(4, room.w * scale);
    const rh = Math.max(3, room.h * scale);

    // Fill colour based on state
    if (!room.visited) {
      ctx.fillStyle = '#0d1117';
    } else if (room === cursorRoom) {
      ctx.fillStyle = '#1a2744';
    } else if (room.powered === false) {
      ctx.fillStyle = '#1a1a1a';
    } else if (state.alertLevel >= 3) {
      ctx.fillStyle = '#2d1010';
    } else {
      ctx.fillStyle = '#1a1a2e';
    }
    ctx.fillRect(rx, ry, rw, rh);

    // Border
    if (room === cursorRoom) {
      ctx.strokeStyle = '#f0a500';
      ctx.lineWidth = 2;
    } else if (!room.visited) {
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
    } else {
      const isLit = room.powered !== false;
      ctx.strokeStyle = isLit ? '#4a4e69' : '#2d3436';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(rx, ry, rw, rh);

    // Tag indicator (small dot)
    if (room.visited) {
      if (room.tags.includes('terminal')) {
        ctx.fillStyle = '#55efc4';
        ctx.fillRect(rx + rw - 5, ry + 1, 4, 4);
      }
      if (room.tags.includes('loot')) {
        ctx.fillStyle = '#f0a500';
        ctx.fillRect(rx + 1, ry + 1, 4, 4);
      }
    }

    // Annotation text
    if (room.annotation && room.visited) {
      ctx.font = '8px monospace';
      ctx.fillStyle = '#f39c12';
      ctx.fillText(room.annotation, rx + 2, ry + rh - 2);
    }

    // Player position dot
    if (state.player &&
        state.player.x >= room.x && state.player.x < room.x + room.w &&
        state.player.y >= room.y && state.player.y < room.y + room.h) {
      const pdx = offX + (state.player.x - minX) * scale;
      const pdy = offY + (state.player.y - minY) * scale;
      ctx.fillStyle = '#74b9ff';
      ctx.beginPath();
      ctx.arc(pdx, pdy, Math.max(3, scale * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw corridors (simple lines between adjacent room centres)
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 1;
  for (let i = 0; i < rooms.length - 1; i++) {
    const a = rooms[i];
    const b = rooms[i + 1];
    if (!a.visited && !b.visited) continue;
    const ax = offX + (a.cx - minX) * scale;
    const ay = offY + (a.cy - minY) * scale;
    const bx = offX + (b.cx - minX) * scale;
    const by = offY + (b.cy - minY) * scale;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // ── Right info panel ──
  const infoX = width - 210;
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(infoX, mapPadY, 200, mapH);
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 1;
  ctx.strokeRect(infoX, mapPadY, 200, mapH);

  if (cursorRoom) {
    let iy = mapPadY + 16;
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#f0a500';
    ctx.fillText(cursorRoom.templateId || cursorRoom.id, infoX + 10, iy);
    iy += 18;

    ctx.font = '10px monospace';
    ctx.fillStyle = cursorRoom.visited ? '#dfe6e9' : '#4a4e69';
    ctx.fillText(cursorRoom.visited ? 'VISITED' : 'UNEXPLORED', infoX + 10, iy);
    iy += 14;

    ctx.fillStyle = cursorRoom.powered !== false ? '#f0a500' : '#636e72';
    ctx.fillText(cursorRoom.powered !== false ? 'POWERED' : 'UNPOWERED', infoX + 10, iy);
    iy += 14;

    if (cursorRoom.tags.length > 0) {
      ctx.fillStyle = '#636e72';
      ctx.fillText('Tags: ' + cursorRoom.tags.join(', '), infoX + 10, iy);
      iy += 14;
    }

    if (cursorRoom.annotation) {
      ctx.fillStyle = '#f39c12';
      ctx.fillText(cursorRoom.annotation, infoX + 10, iy);
      iy += 14;
    }

    iy += 10;
    ctx.fillStyle = '#4a4e69';
    ctx.font = '9px monospace';
    ctx.fillText('E: cycle annotation', infoX + 10, iy);
  }

  // ── Legend ──
  const legY = height - 30;
  ctx.font = '9px monospace';
  const legend = [
    { color: '#f0a500', label: '■ loot' },
    { color: '#55efc4', label: '■ terminal' },
    { color: '#74b9ff', label: '● you' },
  ];
  let legX = 20;
  for (const l of legend) {
    ctx.fillStyle = l.color;
    ctx.fillText(l.label, legX, legY);
    legX += ctx.measureText(l.label).width + 18;
  }
}