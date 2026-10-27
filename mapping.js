/* Shared pure math: browser global + Node self-check, no dependencies. */
(function (root) {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const GRID = 7, CENTER = 3, HYSTERESIS = 0.12;
  function quantize(value, previous, margin = HYSTERESIS) {
    const scaled = (clamp(value, -1, 1) + 1) * CENTER;
    if (scaled > previous + 0.5 + margin || scaled < previous - 0.5 - margin) {
      return clamp(Math.round(scaled), 0, GRID - 1);
    }
    return previous;
  }
  // Normalize around the CHARACTER'S EYES. Each side reaches its own viewport edge.
  function normalizePointer(x, y, eye, viewport) {
    const axis = (v, center, length) => clamp((v - center) / Math.max(v < center ? center : length - center, 1), -1, 1);
    return { x: axis(x, eye.x, viewport.width), y: axis(y, eye.y, viewport.height) };
  }
  function approach(current, target, dt, timeConstant = 80) {
    return current + (target - current) * (1 - Math.exp(-Math.min(dt, 64) / timeConstant));
  }
  function nearestFrame(wanted, loaded) {
    let best = null, distance = Infinity;
    for (const index of loaded) {
      const d = (Math.floor(index / GRID) - Math.floor(wanted / GRID)) ** 2 + (index % GRID - wanted % GRID) ** 2;
      if (d < distance) { best = index; distance = d; }
    }
    return best;
  }
  const api = { GRID, CENTER, HYSTERESIS, clamp, quantize, normalizePointer, approach, nearestFrame };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CatMapping = api;
})(typeof window !== 'undefined' ? window : globalThis);
