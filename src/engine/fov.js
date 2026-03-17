/**
 * Field-of-View calculation.
 * Implements raycasting-based FOV with a directional vision cone.
 * The player sees in a 90-degree arc in their facing direction,
 * plus a small peripheral radius around them.
 */

/**
 * Facing direction angles in radians (pointing direction).
 */
const FACING_ANGLES = {
  north: -Math.PI / 2,
  south: Math.PI / 2,
  east: 0,
  west: Math.PI,
};

/** Number of rays to cast across the vision cone. */
const RAY_COUNT = 90;

/** Vision cone half-angle in radians (45 degrees = 90 degree total cone). */
const CONE_HALF_ANGLE = Math.PI / 4;

/** Maximum vision range in tiles. */
const VISION_RANGE = 10;

/** Peripheral vision radius (always visible around player). */
const PERIPHERAL_RADIUS = 2;

/**
 * Calculate visible tiles from a position and facing direction.
 * @param {number} px - Player grid X.
 * @param {number} py - Player grid Y.
 * @param {string} facing - Player facing direction.
 * @param {function(number, number): boolean} blocksLight - Returns true if tile blocks LOS.
 * @param {number} mapWidth - Map width in tiles.
 * @param {number} mapHeight - Map height in tiles.
 * @returns {Set<string>} Set of "x,y" strings for currently visible tiles.
 */
export function calculateFOV(px, py, facing, blocksLight, mapWidth, mapHeight) {
  const visible = new Set();

  // Player's own tile is always visible
  visible.add(`${px},${py}`);

  // Peripheral vision: small radius around player always visible (through walls if adjacent)
  addPeripheralVision(px, py, visible, blocksLight, mapWidth, mapHeight);

  // Directional cone: cast rays in the facing direction's 90-degree arc
  const centerAngle = FACING_ANGLES[facing] || 0;
  castConeRays(px, py, centerAngle, visible, blocksLight, mapWidth, mapHeight);

  return visible;
}

/**
 * Add peripheral vision tiles (small radius around player).
 */
function addPeripheralVision(px, py, visible, blocksLight, mapWidth, mapHeight) {
  for (let dx = -PERIPHERAL_RADIUS; dx <= PERIPHERAL_RADIUS; dx++) {
    for (let dy = -PERIPHERAL_RADIUS; dy <= PERIPHERAL_RADIUS; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > PERIPHERAL_RADIUS) continue;

      const tx = px + dx;
      const ty = py + dy;
      if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) continue;

      // For peripheral, only mark visible if we have line-of-sight (no wall between)
      if (hasLineOfSight(px, py, tx, ty, blocksLight)) {
        visible.add(`${tx},${ty}`);
      }
    }
  }
}

/**
 * Cast rays in a cone to determine visible tiles.
 */
function castConeRays(px, py, centerAngle, visible, blocksLight, mapWidth, mapHeight) {
  const startAngle = centerAngle - CONE_HALF_ANGLE;
  const angleStep = (CONE_HALF_ANGLE * 2) / RAY_COUNT;

  for (let i = 0; i <= RAY_COUNT; i++) {
    const angle = startAngle + i * angleStep;
    castRay(px, py, angle, visible, blocksLight, mapWidth, mapHeight);
  }
}

/**
 * Cast a single ray from origin at an angle, marking tiles as visible.
 * Stops when hitting a wall or reaching max range.
 */
function castRay(px, py, angle, visible, blocksLight, mapWidth, mapHeight) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  for (let step = 1; step <= VISION_RANGE; step++) {
    // Sample along the ray at sub-tile resolution
    const fx = px + dx * step * 0.5;
    const fy = py + dy * step * 0.5;
    const tx = Math.round(fx);
    const ty = Math.round(fy);

    if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) break;

    visible.add(`${tx},${ty}`);

    // If this tile blocks light, mark it visible (we see the wall) but stop
    if (blocksLight(tx, ty)) break;
  }
}

/**
 * Simple line-of-sight check between two points using Bresenham-like stepping.
 * @returns {boolean} True if there is clear LOS.
 */
function hasLineOfSight(x0, y0, x1, y1, blocksLight) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;

  while (cx !== x1 || cy !== y1) {
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }

    // If we hit a blocking tile before reaching target, no LOS
    if ((cx !== x1 || cy !== y1) && blocksLight(cx, cy)) {
      return false;
    }
  }

  return true;
}
