/**
 * Particle system for combat feedback and environmental effects.
 * Runs in real-time (every frame), NOT turn-based.
 * Particles are in world pixel coordinates (grid * TILE_SIZE).
 *
 * All emit functions are safe to call from turn-based game logic
 * (combat.js, etc.) — they add to a queue that the render loop drains.
 */

import { TILE_SIZE } from './grid.js';

// ── Particle pool ──────────────────────────────────────────────────────────

/** Active particles. */
const particles = [];

/** Screen-edge damage flash (screen-space, not world-space). */
let damageFlash = 0; // alpha 0-1, fades each frame

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Update all particles. Call once per animation frame.
 * @param {number} dt - Delta time in seconds.
 */
export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x  += p.vx * dt;
    p.y  += p.vy * dt;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.life <= 0) particles.splice(i, 1);
  }
  damageFlash = Math.max(0, damageFlash - dt * 3.5);
}

/**
 * Render all particles onto the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ offsetX: number, offsetY: number }} camOffset - Camera pixel offset.
 */
export function renderParticles(ctx, camOffset) {
  ctx.save();

  for (const p of particles) {
    const sx = p.x + camOffset.offsetX;
    const sy = p.y + camOffset.offsetY;
    ctx.globalAlpha = p.alpha;

    switch (p.type) {
      case 'spark':
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
        break;

      case 'trail':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - p.vx * 0.05, sy - p.vy * 0.05);
        ctx.stroke();
        break;

      case 'circle':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * (1 - p.alpha * 0.3), 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ring':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        const radius = p.size * (1 - p.life / p.maxLife) * 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1, radius), 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'slash':
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        const ang = p.angle || 0;
        const len = TILE_SIZE * 0.8;
        ctx.moveTo(sx + Math.cos(ang - 0.5) * len, sy + Math.sin(ang - 0.5) * len);
        ctx.lineTo(sx + Math.cos(ang + 0.5) * len, sy + Math.sin(ang + 0.5) * len);
        ctx.stroke();
        break;

      case 'steam':
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.35;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // Screen-edge damage flash (screen-space)
  if (damageFlash > 0.01) {
    const { width, height } = ctx.canvas;
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.8
    );
    grad.addColorStop(0, 'rgba(231,76,60,0)');
    grad.addColorStop(1, `rgba(231,76,60,${damageFlash * 0.65})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

// ── Emit functions ──────────────────────────────────────────────────────────

/**
 * World position helpers — convert grid coords to pixel coords.
 */
function gx(gridX) { return gridX * TILE_SIZE + TILE_SIZE / 2; }
function gy(gridY) { return gridY * TILE_SIZE + TILE_SIZE / 2; }

/**
 * Muzzle flash at weapon position (grid coords).
 */
export function emitMuzzleFlash(gridX, gridY) {
  const wx = gx(gridX), wy = gy(gridY);
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 60;
    particles.push({
      type: 'circle', x: wx, y: wy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color: i < 3 ? '#fff7ae' : '#f0a500',
      size: 2 + Math.random() * 4,
      life: 0.1 + Math.random() * 0.1, maxLife: 0.2, alpha: 1,
    });
  }
}

/**
 * Bullet trail from (x0,y0) to (x1,y1) — grid coords.
 */
export function emitBulletTrail(gx0, gy0, gx1, gy1) {
  const wx0 = gx(gx0), wy0 = gy(gy0);
  const wx1 = gx(gx1), wy1 = gy(gy1);
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const px = wx0 + (wx1 - wx0) * t;
    const py = wy0 + (wy1 - wy0) * t;
    const dx = (wx1 - wx0) * 200;
    const dy = (wy1 - wy0) * 200;
    particles.push({
      type: 'trail', x: px, y: py,
      vx: dx, vy: dy,
      color: '#fff7ae',
      size: 1.5,
      life: 0.08, maxLife: 0.08, alpha: 1,
    });
  }
}

/**
 * Melee slash arc at attacker position, oriented by facing.
 */
export function emitMeleeSlash(gridX, gridY, facing) {
  const wx = gx(gridX), wy = gy(gridY);
  const facingAngle = { north: -Math.PI/2, south: Math.PI/2, east: 0, west: Math.PI };
  const angle = facingAngle[facing] || 0;
  particles.push({
    type: 'slash', x: wx, y: wy,
    vx: 0, vy: 0,
    angle,
    color: '#dfe6e9',
    size: 1,
    life: 0.18, maxLife: 0.18, alpha: 1,
  });
  // Extra sparks
  for (let i = 0; i < 4; i++) {
    const spread = (Math.random() - 0.5) * 1.2 + angle;
    const speed = 30 + Math.random() * 60;
    particles.push({
      type: 'spark', x: wx, y: wy,
      vx: Math.cos(spread) * speed, vy: Math.sin(spread) * speed,
      color: '#dfe6e9', size: 2,
      life: 0.15, maxLife: 0.15, alpha: 1,
    });
  }
}

/**
 * Explosion ring (destructible object destruction, grenade).
 */
export function emitExplosion(gridX, gridY) {
  const wx = gx(gridX), wy = gy(gridY);
  // Ring
  particles.push({
    type: 'ring', x: wx, y: wy,
    vx: 0, vy: 0,
    color: '#e67e22',
    size: TILE_SIZE,
    life: 0.4, maxLife: 0.4, alpha: 1,
  });
  // Sparks
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const speed = 40 + Math.random() * 100;
    particles.push({
      type: 'spark', x: wx, y: wy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color: Math.random() < 0.5 ? '#e74c3c' : '#f0a500',
      size: 2 + Math.random() * 3,
      life: 0.3 + Math.random() * 0.3, maxLife: 0.6, alpha: 1,
    });
  }
}

/**
 * Electrical sparks (damaged equipment, destroyed camera).
 */
export function emitSparks(gridX, gridY, count = 6) {
  const wx = gx(gridX), wy = gy(gridY);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 80;
    particles.push({
      type: 'spark', x: wx, y: wy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      color: Math.random() < 0.6 ? '#74b9ff' : '#f0a500',
      size: 1 + Math.random() * 2,
      life: 0.15 + Math.random() * 0.2, maxLife: 0.35, alpha: 1,
    });
  }
}

/**
 * Steam vent particles (environmental, from vent object tiles).
 * Emits a small puff — call periodically from the render loop.
 */
export function emitSteam(gridX, gridY) {
  const wx = gx(gridX), wy = gy(gridY);
  for (let i = 0; i < 2; i++) {
    particles.push({
      type: 'steam',
      x: wx + (Math.random() - 0.5) * TILE_SIZE,
      y: wy,
      vx: (Math.random() - 0.5) * 8,
      vy: -15 - Math.random() * 20,
      color: '#dfe6e9',
      size: 4 + Math.random() * 6,
      life: 0.6 + Math.random() * 0.4, maxLife: 1.0, alpha: 0,
    });
  }
}

/**
 * Screen-edge red flash when player takes damage.
 */
export function emitDamageFlash() {
  damageFlash = 1.0;
}
