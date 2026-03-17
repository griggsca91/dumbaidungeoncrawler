/**
 * Inventory & Equipment management screen.
 * Full-canvas modal overlay. Game turns pause while open.
 * Keyboard-navigable: arrow keys to move, E/Enter to act, X to drop, Esc/I to close.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  INVENTORY (left half)    │  EQUIPMENT (right half)     │
 *  │  [item][item][item][item] │  HEAD:    [item or empty]   │
 *  │  [item][item][item][item] │  TORSO:   [item or empty]   │
 *  │                           │  ARM-L:   [item or empty]   │
 *  │                           │  ARM-R:   [item or empty]   │
 *  │                           │  BACK:    [item or empty]   │
 *  │                           │  LEGS:    [item or empty]   │
 *  ├───────────────────────────────────────────────────────  ┤
 *  │  ITEM DETAIL (bottom third): name, type, stats, desc    │
 *  └─────────────────────────────────────────────────────────┘
 */

import { getCanvasSize } from '../engine/canvas.js';
import { equipFromInventory, unequipToFloor, getInventoryCapacity, pickupItem } from '../game/equipment.js';
import { addMessage } from '../game/combat.js';
import { restoreResource } from '../game/resources.js';

// ── Layout ──────────────────────────────────────────────────────────────────

const SLOT_W = 140;
const SLOT_H = 28;
const SLOT_GAP = 4;
const COLS = 2;      // inventory grid columns
const PADDING = 20;

const EQUIP_SLOTS = [
  { key: 'head',     label: 'HEAD' },
  { key: 'torso',    label: 'TORSO' },
  { key: 'armLeft',  label: 'ARM-L' },
  { key: 'armRight', label: 'ARM-R' },
  { key: 'back',     label: 'BACK' },
  { key: 'legs',     label: 'LEGS' },
];

// Slot type colours
const SLOT_COLORS = {
  head: '#74b9ff', torso: '#55efc4', armLeft: '#fdcb6e',
  armRight: '#fdcb6e', back: '#a29bfe', legs: '#fd79a8',
};

// Navigation sections
const SEC = { INVENTORY: 'inv', EQUIPMENT: 'equip' };

// ── State ───────────────────────────────────────────────────────────────────

let cursor  = { section: SEC.INVENTORY, index: 0 };
let contextMenu = null;  // null | { items: ['Equip','Drop'], selected: 0, forInventoryIdx, forEquipSlot }

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Reset cursor to top of inventory when screen opens.
 */
export function openInventory() {
  cursor = { section: SEC.INVENTORY, index: 0 };
  contextMenu = null;
}

/**
 * Handle a keydown event for the inventory screen.
 * @param {string} key - KeyboardEvent.key value.
 * @param {object} state - Game state.
 * @returns {boolean} True if the event was consumed (prevents game action).
 */
export function handleInventoryInput(key, state) {
  if (contextMenu) {
    return handleContextMenuInput(key, state);
  }

  const inv = state.player.inventory;
  const cap = getInventoryCapacity(state.player);

  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    if (cursor.section === SEC.INVENTORY) {
      cursor.index = Math.min(inv.length - 1, cursor.index + COLS);
    } else {
      cursor.index = Math.min(EQUIP_SLOTS.length - 1, cursor.index + 1);
    }
    return true;
  }
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    if (cursor.section === SEC.INVENTORY) {
      cursor.index = Math.max(0, cursor.index - COLS);
    } else {
      cursor.index = Math.max(0, cursor.index - 1);
    }
    return true;
  }
  if (key === 'ArrowRight' || key === 'd' || key === 'D') {
    if (cursor.section === SEC.INVENTORY) {
      cursor.index = Math.min(inv.length - 1, cursor.index + 1);
    } else {
      cursor.section = SEC.INVENTORY;
      cursor.index = 0;
    }
    return true;
  }
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
    if (cursor.section === SEC.EQUIPMENT) {
      cursor.index = Math.min(cursor.index, EQUIP_SLOTS.length - 1);
    } else {
      cursor.section = SEC.EQUIPMENT;
      cursor.index = 0;
    }
    return true;
  }

  if (key === 'Enter' || key === 'e' || key === 'E') {
    openContextMenu(state);
    return true;
  }
  if (key === 'x' || key === 'X') {
    dropSelected(state);
    return true;
  }

  return false; // Not consumed — let main.js close with I/Escape
}

/**
 * Draw the inventory screen as a full-canvas modal overlay.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state - Game state.
 */
export function drawInventoryScreen(ctx, state) {
  const { width, height } = getCanvasSize();

  // Dim background
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fillRect(0, 0, width, height);

  const panelW = Math.min(900, width - 40);
  const panelH = Math.min(600, height - 40);
  const panelX = Math.floor((width - panelW) / 2);
  const panelY = Math.floor((height - panelH) / 2);

  // Panel background
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = '#2d3436';
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Title bar
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(panelX, panelY, panelW, 30);
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText('INVENTORY  [Arrow keys: navigate | E: use | X: drop | I/Esc: close]', panelX + PADDING, panelY + 20);

  const contentY = panelY + 36;
  const halfW = Math.floor(panelW / 2);
  const detailH = 140;
  const listH = panelH - 36 - detailH - 8;

  // ── Inventory section (left) ──
  drawSectionHeader(ctx, 'INVENTORY', panelX + PADDING, contentY);
  const inv = state.player.inventory;
  const cap = getInventoryCapacity(state.player);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#636e72';
  ctx.fillText(`${inv.length}/${cap} slots`, panelX + PADDING + 100, contentY);

  drawInventoryGrid(ctx, state, panelX + PADDING, contentY + 14, halfW - PADDING * 2, listH - 14);

  // ── Divider ──
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(panelX + halfW, contentY, 1, listH + detailH);

  // ── Equipment section (right) ──
  drawSectionHeader(ctx, 'EQUIPPED', panelX + halfW + PADDING, contentY);
  drawEquipmentList(ctx, state, panelX + halfW + PADDING, contentY + 14, halfW - PADDING * 2, listH - 14);

  // ── Item detail (bottom) ──
  const detailY = panelY + panelH - detailH;
  ctx.fillStyle = '#111827';
  ctx.fillRect(panelX, detailY, panelW, detailH);
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(panelX, detailY, panelW, 1);
  drawItemDetail(ctx, state, panelX + PADDING, detailY + PADDING, panelW - PADDING * 2);

  // ── Context menu ──
  if (contextMenu) {
    drawContextMenu(ctx, panelX + panelW / 2, panelY + panelH / 2);
  }
}

// ── Private drawing helpers ──────────────────────────────────────────────────

function drawSectionHeader(ctx, label, x, y) {
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#74b9ff';
  ctx.fillText(label, x, y + 10);
}

function drawInventoryGrid(ctx, state, x, y, w, h) {
  const inv = state.player.inventory;
  const slotW = Math.floor((w - SLOT_GAP) / COLS);

  inv.forEach((item, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const sx = x + col * (slotW + SLOT_GAP);
    const sy = y + row * (SLOT_H + SLOT_GAP);
    const selected = cursor.section === SEC.INVENTORY && cursor.index === i;
    drawItemSlot(ctx, item, sx, sy, slotW, selected, null);
  });

  // Empty slots
  const cap = getInventoryCapacity(state.player);
  for (let i = inv.length; i < Math.min(cap, inv.length + 4); i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const sx = x + col * (slotW + SLOT_GAP);
    const sy = y + row * (SLOT_H + SLOT_GAP);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(sx, sy, slotW, SLOT_H);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, slotW, SLOT_H);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2d3436';
    ctx.fillText('—', sx + 6, sy + 18);
  }
}

function drawEquipmentList(ctx, state, x, y, w, h) {
  EQUIP_SLOTS.forEach((slot, i) => {
    const sy = y + i * (SLOT_H + SLOT_GAP);
    const item = state.player.equipment?.[slot.key] || null;
    const selected = cursor.section === SEC.EQUIPMENT && cursor.index === i;
    drawItemSlot(ctx, item, x, sy, w, selected, slot);
  });
}

function drawItemSlot(ctx, item, x, y, w, selected, slotDef) {
  // Background
  ctx.fillStyle = selected ? '#1a2744' : '#111827';
  ctx.fillRect(x, y, w, SLOT_H);

  // Border
  const borderColor = selected ? '#74b9ff' : (slotDef ? (SLOT_COLORS[slotDef.key] || '#4a4e69') + '66' : '#2d3436');
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = selected ? 2 : 1;
  ctx.strokeRect(x, y, w, SLOT_H);

  // Slot label (for equipment list)
  if (slotDef) {
    ctx.font = '9px monospace';
    ctx.fillStyle = SLOT_COLORS[slotDef.key] || '#636e72';
    ctx.fillText(slotDef.label, x + 4, y + 18);
  }

  const nameX = slotDef ? x + 46 : x + 6;

  if (item) {
    // Item name
    ctx.font = '11px monospace';
    ctx.fillStyle = selected ? '#ffffff' : '#dfe6e9';
    const maxChars = Math.floor((w - (nameX - x) - 50) / 7);
    const name = item.name.length > maxChars ? item.name.substring(0, maxChars - 2) + '..' : item.name;
    ctx.fillText(name, nameX, y + 18);

    // Durability micro-bar (right side)
    if (item.durability !== undefined && item.maxDurability > 1) {
      const dur = item.durability / item.maxDurability;
      const bx = x + w - 36;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(bx, y + 9, 30, 6);
      ctx.fillStyle = dur > 0.5 ? '#2ecc71' : dur > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(bx, y + 9, Math.floor(30 * dur), 6);
    }
  } else {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2d3436';
    ctx.fillText('empty', nameX, y + 18);
  }
}

function drawItemDetail(ctx, state, x, y, w) {
  const item = getSelectedItem(state);
  if (!item) {
    ctx.font = '11px monospace';
    ctx.fillStyle = '#4a4e69';
    ctx.fillText('Select an item to view details.', x, y + 16);
    return;
  }

  // Name
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#f0a500';
  ctx.fillText(item.name, x, y + 14);

  // Type / slot / rarity
  ctx.font = '10px monospace';
  ctx.fillStyle = '#636e72';
  const meta = [item.slot, item.type, item.rarity].filter(Boolean).join(' · ');
  ctx.fillText(meta.toUpperCase(), x, y + 28);

  // Stats
  const stats = [];
  if (item.armorValue)       stats.push(`Armor +${item.armorValue}`);
  if (item.minDamage)        stats.push(`Dmg ${item.minDamage}-${item.maxDamage}`);
  if (item.ammo !== undefined && item.type === 'ranged') stats.push(`Ammo ${item.ammo}/${item.maxAmmo || item.ammo}`);
  if (item.visionBonus)      stats.push(`Vision +${item.visionBonus}`);
  if (item.hackingBonus)     stats.push(`Hacking +${Math.round(item.hackingBonus * 100)}%`);
  if (item.inventoryBonus)   stats.push(`Inv +${item.inventoryBonus}`);
  if (item.powerDraw)        stats.push(`Power -${item.powerDraw}/turn`);
  if (item.speedBonus)       stats.push(`Speed ${item.speedBonus > 0 ? '+' : ''}${item.speedBonus}`);
  if (item.durability !== undefined && item.maxDurability > 1) {
    stats.push(`Durability ${item.durability}/${item.maxDurability}`);
  }
  if (item.restores)         stats.push(`Restores ${item.restores.type} +${item.restores.amount}`);

  ctx.font = '11px monospace';
  ctx.fillStyle = '#b2bec3';
  const statsStr = stats.join('  ');
  ctx.fillText(statsStr, x, y + 46);

  // Description
  ctx.font = '11px monospace';
  ctx.fillStyle = '#74b9ff';
  ctx.fillText(item.description || '', x, y + 64);

  // Actions hint
  ctx.font = '10px monospace';
  ctx.fillStyle = '#4a4e69';
  const actions = cursor.section === SEC.INVENTORY ? 'E: Equip / Use   X: Drop' : 'E: Unequip to inventory   X: Drop';
  ctx.fillText(actions, x, y + 100);
}

function drawContextMenu(ctx, cx, cy) {
  const mw = 200, mh = contextMenu.items.length * 32 + 20;
  const mx = cx - mw / 2;
  const my = cy - mh / 2;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(mx, my, mw, mh);
  ctx.strokeStyle = '#74b9ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, my, mw, mh);

  contextMenu.items.forEach((label, i) => {
    const iy = my + 10 + i * 32;
    if (i === contextMenu.selected) {
      ctx.fillStyle = '#1a2744';
      ctx.fillRect(mx + 2, iy, mw - 4, 28);
    }
    ctx.font = '13px monospace';
    ctx.fillStyle = i === contextMenu.selected ? '#f0a500' : '#dfe6e9';
    ctx.fillText(label, mx + 14, iy + 19);
  });
}

// ── Input helpers ────────────────────────────────────────────────────────────

function openContextMenu(state) {
  if (cursor.section === SEC.INVENTORY) {
    const item = state.player.inventory[cursor.index];
    if (!item) return;
    const items = item.slot === 'consumable' ? ['Use', 'Drop'] : ['Equip', 'Drop'];
    contextMenu = { items, selected: 0, forInventoryIdx: cursor.index };
  } else {
    const slotKey = EQUIP_SLOTS[cursor.index]?.key;
    const item = state.player.equipment?.[slotKey];
    if (!item) return;
    contextMenu = { items: ['Unequip', 'Drop'], selected: 0, forEquipSlot: slotKey };
  }
}

function handleContextMenuInput(key, state) {
  if (key === 'ArrowUp' || key === 'w' || key === 'W') {
    contextMenu.selected = Math.max(0, contextMenu.selected - 1);
    return true;
  }
  if (key === 'ArrowDown' || key === 's' || key === 'S') {
    contextMenu.selected = Math.min(contextMenu.items.length - 1, contextMenu.selected + 1);
    return true;
  }
  if (key === 'Escape') {
    contextMenu = null;
    return true;
  }
  if (key === 'Enter' || key === 'e' || key === 'E') {
    const action = contextMenu.items[contextMenu.selected];
    executeContextAction(action, state);
    contextMenu = null;
    return true;
  }
  return false;
}

function executeContextAction(action, state) {
  const player = state.player;

  if (action === 'Equip' || action === 'Use') {
    const item = player.inventory[contextMenu.forInventoryIdx];
    if (!item) return;
    if (item.slot === 'consumable') {
      player.inventory.splice(contextMenu.forInventoryIdx, 1);
      triggerConsumableUse(item, state);
    } else {
      // Find a fitting slot
      const slotMap = { head: 'head', torso: 'torso', arm: 'armLeft', back: 'back', legs: 'legs' };
      const targetSlot = slotMap[item.slot] || 'armLeft';
      // Check other arm if left is occupied
      const actualSlot = (item.slot === 'arm' && player.equipment.armLeft)
        ? (player.equipment.armRight ? 'armLeft' : 'armRight')  // prefer right if left full
        : targetSlot;
      equipFromInventory(player, contextMenu.forInventoryIdx, actualSlot, state);
    }
    cursor.index = Math.max(0, Math.min(cursor.index, player.inventory.length - 1));
  }

  if (action === 'Unequip') {
    const slotKey = contextMenu.forEquipSlot;
    // Move equipped item to inventory if space, else drop
    const item = player.equipment[slotKey];
    if (item && player.inventory.length < getInventoryCapacity(player)) {
      player.equipment[slotKey] = null;
      player.inventory.push(item);
      addMessage(state, `${item.name} moved to inventory.`, 'system');
    } else if (item) {
      unequipToFloor(player, slotKey, state);
    }
  }

  if (action === 'Drop') {
    if (contextMenu.forInventoryIdx !== undefined) {
      const item = player.inventory.splice(contextMenu.forInventoryIdx, 1)[0];
      if (item) {
        state.itemsOnFloor.push({ x: player.x, y: player.y, item });
        addMessage(state, `Dropped ${item.name}.`, 'system');
      }
      cursor.index = Math.max(0, Math.min(cursor.index, player.inventory.length - 1));
    } else if (contextMenu.forEquipSlot) {
      unequipToFloor(player, contextMenu.forEquipSlot, state);
    }
  }
}

function dropSelected(state) {
  const player = state.player;
  if (cursor.section === SEC.INVENTORY) {
    const item = player.inventory[cursor.index];
    if (!item) return;
    player.inventory.splice(cursor.index, 1);
    state.itemsOnFloor.push({ x: player.x, y: player.y, item });
    addMessage(state, `Dropped ${item.name}.`, 'system');
    cursor.index = Math.max(0, Math.min(cursor.index, player.inventory.length - 1));
  } else {
    const slotKey = EQUIP_SLOTS[cursor.index]?.key;
    if (slotKey) unequipToFloor(player, slotKey, state);
  }
}

function getSelectedItem(state) {
  if (cursor.section === SEC.INVENTORY) {
    return state.player.inventory[cursor.index] || null;
  }
  const slotKey = EQUIP_SLOTS[cursor.index]?.key;
  return state.player.equipment?.[slotKey] || null;
}

function triggerConsumableUse(item, state) {
  const player = state.player;
  if (item.restores) {
    if (item.restores.type === 'hp') {
      player.hp = Math.min(player.maxHp, player.hp + item.restores.amount);
      addMessage(state, `HP restored (+${item.restores.amount}).`, 'system');
    } else {
      restoreResource(state.resources, item.restores.type, item.restores.amount, state);
    }
  }
  if (item.restoresAlso) {
    restoreResource(state.resources, item.restoresAlso.type, item.restoresAlso.amount, state);
  }
}
