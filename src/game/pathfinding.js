/**
 * BFS pathfinding for enemy AI.
 * Finds the shortest walkable path between two grid positions.
 */

/**
 * Find a path from (x0,y0) to (x1,y1) using BFS.
 * @param {number} x0 - Start X.
 * @param {number} y0 - Start Y.
 * @param {number} x1 - Target X.
 * @param {number} y1 - Target Y.
 * @param {function(number, number): boolean} isWalkable - Returns true if tile is passable.
 * @param {number} maxDist - Maximum search distance (prevents runaway searches).
 * @returns {Array<{x:number,y:number}>} Path from start (exclusive) to goal (inclusive), or empty if no path.
 */
export function findPath(x0, y0, x1, y1, isWalkable, maxDist = 20) {
  if (x0 === x1 && y0 === y1) return [];

  const queue = [{ x: x0, y: y0, path: [] }];
  const visited = new Set([`${x0},${y0}`]);

  const dirs = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
  ];

  while (queue.length > 0) {
    const { x, y, path } = queue.shift();

    if (path.length >= maxDist) continue;

    for (const { dx, dy } of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const newPath = [...path, { x: nx, y: ny }];

      // Reached goal
      if (nx === x1 && ny === y1) return newPath;

      // Only expand walkable tiles (but we allow targeting non-walkable goal for melee)
      if (isWalkable(nx, ny)) {
        queue.push({ x: nx, y: ny, path: newPath });
      }
    }
  }

  return []; // No path found
}

/**
 * Get the next step toward a target using BFS.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {function(number, number): boolean} isWalkable
 * @returns {{x: number, y: number}|null} Next tile to step to, or null if no path.
 */
export function getNextStep(x0, y0, x1, y1, isWalkable) {
  const path = findPath(x0, y0, x1, y1, isWalkable);
  return path.length > 0 ? path[0] : null;
}
