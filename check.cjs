const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { quantize, normalizePointer, approach, nearestFrame } = require('./mapping.js');
const manifest = require('./assets/manifest.json');
assert.equal(manifest.frames.length, 49);
const sources = new Set();
for (const frame of manifest.frames) {
  assert.equal(frame.index, frame.row * 7 + frame.col);
  assert.equal(quantize((frame.col - 3) / 3, 3), frame.col);
  assert.equal(quantize((frame.row - 3) / 3, 3), frame.row);
  sources.add(fs.readFileSync(path.join(__dirname, frame.src), 'utf8'));
}
assert.equal(sources.size, 49, 'All 49 frames must differ');
assert.equal(quantize(100, 3), 6);
assert.equal(quantize(-100, 3), 0);
// Oscillations around the boundary must not make the state flip each sample.
let state = 3;
for (let i = 0; i < 100; i++) state = quantize((.5 + (i % 2 ? .04 : -.04)) / 3, state);
assert.equal(state, 3);
state = quantize(.65 / 3, state); assert.equal(state, 4);
for (let i = 0; i < 100; i++) state = quantize((.5 + (i % 2 ? .04 : -.04)) / 3, state);
assert.equal(state, 4);
assert.equal(quantize(.35 / 3, state), 3);
assert.deepEqual(normalizePointer(0, 0, { x: 300, y: 250 }, { width: 1000, height: 800 }), { x: -1, y: -1 });
assert.deepEqual(normalizePointer(1000, 800, { x: 300, y: 250 }, { width: 1000, height: 800 }), { x: 1, y: 1 });
assert.deepEqual(normalizePointer(300, 250, { x: 300, y: 250 }, { width: 1000, height: 800 }), { x: 0, y: 0 });
let position = 0;
for (let i = 0; i < 120; i++) { const next = approach(position, 1, 16); assert(next >= position && next <= 1); position = next; }
assert(position > .999);
assert.equal(nearestFrame(0, []), null);
assert.equal(nearestFrame(24, [0, 23, 48]), 23);
assert.equal(nearestFrame(48, [0, 24, 47]), 47);
// Verify that the live vector renderer's 49 key poses still match the source images.
const sandbox = { window: {} };
require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname, 'vector-frames.js'), 'utf8'), sandbox);
const vector = sandbox.window.CatVectorFrames;
const number = /[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi;
assert.equal(vector.patches.length, 11);
for (const frame of manifest.frames) {
  const tags = [...fs.readFileSync(path.join(__dirname, frame.src), 'utf8').matchAll(/<(?!\/|!|\?)[\w:-]+\b[^>]*>/g)];
  for (const patch of vector.patches) {
    const attributes = Object.fromEntries([...tags[patch.element][0].matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
    const expected = (attributes[patch.attribute].match(number) || []).map(Number);
    assert.deepEqual(Array.from(patch.poses[frame.index]), expected);
  }
}
console.log('PASS: 49 unique assets, all grid directions, bounds, hysteresis, normalization, smoothing, missing-frame fallback.');
console.log('PASS: vector geometry matches all 49 original key poses; no historical image blending.');
