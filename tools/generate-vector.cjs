// Extract interpolatable attributes from the SAME 49 aligned SVG key poses.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tags = source => [...source.matchAll(/<(?!\/|!|\?)[\w:-]+\b[^>]*>/g)].map(match => {
  const attributes = {};
  for (const attr of match[0].matchAll(/([\w:-]+)="([^"]*)"/g)) attributes[attr[1]] = attr[2];
  return { name: match[0].match(/^<([\w:-]+)/)[1], attributes };
});
const sources = Array.from({ length: 49 }, (_, i) => fs.readFileSync(path.join(root, `assets/frames/cat-${String(i).padStart(2, '0')}.svg`), 'utf8'));
const parsed = sources.map(tags), patches = [];
const number = /[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi;
parsed[24].forEach((tag, element) => {
  for (const attribute of Object.keys(tag.attributes)) {
    const values = parsed.map(frame => {
      if (frame.length !== parsed[24].length || frame[element].name !== tag.name) throw new Error('SVG topology differs');
      return frame[element].attributes[attribute];
    });
    if (values.every(value => value === values[24])) continue;
    const parts = values[24].split(number);
    if (!values.every(value => typeof value === 'string' && JSON.stringify(value.split(number)) === JSON.stringify(parts))) throw new Error(`Incompatible attribute ${attribute}`);
    const poses = values.map(value => (value.match(number) || []).map(Number));
    if (!poses[0].length) throw new Error('Expected numeric pose values');
    patches.push({ element, attribute, parts, poses });
  }
});
fs.writeFileSync(path.join(root, 'vector-frames.js'), '/* Generated from the 49 SVG key poses. Regenerate after replacing aligned SVG assets. */\nwindow.CatVectorFrames = ' + JSON.stringify({ template: sources[24], patches }) + ';\n');
console.log(`Extracted ${patches.length} animated attributes from 49 key poses.`);
