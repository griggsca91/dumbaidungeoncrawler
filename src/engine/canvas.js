/**
 * Canvas setup and management.
 * Handles initialization, resizing, and context access.
 */

let canvas = null;
let ctx = null;

/**
 * Initialize the canvas element to fill the window.
 * @param {string} canvasId - The id of the <canvas> element.
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function initCanvas(canvasId = 'game') {
  canvas = document.getElementById(canvasId);
  if (!canvas) {
    throw new Error(`Canvas element #${canvasId} not found`);
  }
  ctx = canvas.getContext('2d');

  // Disable image smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;

  resize();
  window.addEventListener('resize', resize);

  return { canvas, ctx };
}

/**
 * Resize canvas to fill the window.
 */
function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Re-apply after resize since it resets context state
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }
}

/**
 * Get the current canvas element.
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
  return canvas;
}

/**
 * Get the current 2D rendering context.
 * @returns {CanvasRenderingContext2D}
 */
export function getCtx() {
  return ctx;
}

/**
 * Get the current canvas dimensions.
 * @returns {{ width: number, height: number }}
 */
export function getCanvasSize() {
  return { width: canvas.width, height: canvas.height };
}
