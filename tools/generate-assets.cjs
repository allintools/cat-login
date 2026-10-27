const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'assets/frames');
fs.mkdirSync(dir, { recursive: true });
function cat(row, col) {
  const x = (col - 3) / 3, y = (row - 3) / 3;
  const hx = x * 21, hy = y * 15, angle = x * 5;
  const pupilX = x * 12, pupilY = y * 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <title>原创猫咪，方向行 ${row + 1} 列 ${col + 1}</title>
  <g stroke="#493d32" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M391 461 C505 484 503 392 464 395 C436 398 472 452 398 424" fill="#c9a17a"/>
    <path d="M224 347 C194 379 191 453 204 488 C215 515 383 516 397 484 C408 449 401 382 374 350" fill="#e3bc92"/>
    <path d="M258 381 C231 419 238 485 262 493 L344 493 C365 460 363 414 337 383" fill="#f8e5c7" stroke="none"/>
    <path d="M234 445 L230 489 C229 510 283 514 286 490 L289 458 M318 458 L320 490 C322 514 375 510 373 490 L368 445" fill="#e3bc92"/>
    <path d="M249 491 L249 501 M268 492 L268 502 M339 492 L339 502 M358 491 L358 501" stroke-width="3.5"/>
    <g transform="translate(${hx} ${hy}) rotate(${angle} 300 295)">
      <path d="M174 239 C157 199 153 118 175 109 C195 101 239 139 259 154 C285 146 322 146 349 154 C372 132 410 104 427 110 C449 120 443 204 426 241 C449 274 446 330 416 359 C368 410 228 410 181 357 C153 326 151 276 174 239Z" fill="#efd1a8"/>
      <path d="M179 133 C176 159 180 186 187 206 L227 166Z M422 133 C426 158 419 188 414 207 L376 166Z" fill="#d59f8d" stroke="none"/>
      <path d="M275 156 L282 186 M302 151 L304 185 M330 157 L325 187" stroke="#ba9067" stroke-width="12"/>
      <path d="M171 286 L197 293 M173 314 L196 316 M430 286 L407 293 M428 314 L407 316" stroke="#ba9067" stroke-width="9"/>
      <ellipse cx="241" cy="264" rx="39" ry="43" fill="#fff8e9"/>
      <ellipse cx="363" cy="264" rx="39" ry="43" fill="#fff8e9"/>
      <ellipse cx="${241 + pupilX}" cy="${265 + pupilY}" rx="20" ry="27" fill="#493d32" stroke="none"/>
      <ellipse cx="${363 + pupilX}" cy="${265 + pupilY}" rx="20" ry="27" fill="#493d32" stroke="none"/>
      <ellipse cx="${235 + pupilX}" cy="${256 + pupilY}" rx="6" ry="8" fill="#fffdf6" stroke="none"/>
      <ellipse cx="${357 + pupilX}" cy="${256 + pupilY}" rx="6" ry="8" fill="#fffdf6" stroke="none"/>
      <path d="M212 212 Q231 ${201 + y * 4} 252 211 M351 211 Q371 ${201 + y * 4} 391 212" fill="none" stroke-width="4"/>
      <ellipse cx="208" cy="321" rx="20" ry="10" fill="#dfab95" stroke="none"/>
      <ellipse cx="397" cy="321" rx="20" ry="10" fill="#dfab95" stroke="none"/>
      <g transform="translate(${x * 8} ${y * 6})">
        <path d="M280 310 Q302 300 324 310 C321 332 283 333 280 310Z" fill="#fff4dd" stroke="none"/>
        <path d="M292 304 Q302 299 312 304 L302 314Z" fill="#a36d61" stroke-width="3.5"/>
        <path d="M302 314 L302 324 M282 325 Q292 337 302 324 Q312 337 322 325" fill="none" stroke-width="3.5"/>
      </g>
      <path d="M199 328 L146 318 M198 342 L148 350 M404 328 L457 318 M406 342 L455 351" fill="none" stroke-width="3.5"/>
    </g>
    <path d="M240 390 Q302 411 367 388 L365 410 Q305 431 241 412Z" fill="#738269" stroke="none"/>
    <circle cx="305" cy="416" r="13" fill="#d9b56b" stroke-width="3"/>
    <path d="M305 410 L305 416" stroke-width="3"/>
  </g></svg>`;
}
const frames = [];
for (let row = 0; row < 7; row++) for (let col = 0; col < 7; col++) {
  const index = row * 7 + col;
  const name = `cat-${String(index).padStart(2, '0')}.svg`;
  fs.writeFileSync(path.join(dir, name), cat(row, col));
  frames.push({ index, row, col, src: `assets/frames/${name}` });
}
fs.writeFileSync(path.join(root, 'assets/manifest.json'), JSON.stringify({
  grid: 7, width: 600, height: 600, center: 24,
  order: 'row-major, top-left to bottom-right; zero-based',
  author: 'Original programmatic vector character created for this prototype.', frames
}, null, 2));
fs.writeFileSync(path.join(root, 'assets/contact-sheet.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1510" viewBox="0 0 1400 1510"><rect width="1400" height="1510" fill="#f8f5ec"/><text x="32" y="48" font-family="sans-serif" font-size="25" fill="#493d32">MAOZAI — 49 directional frames / row × column / center 24</text>${frames.map(f => `<g transform="translate(${f.col * 200} ${f.row * 200 + 80})">${cat(f.row, f.col).replace(/<svg[^>]*>/, '<svg width="200" height="180" viewBox="0 0 600 600">')}<text x="100" y="193" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#493d32">${String(f.index).padStart(2, '0')} · r${f.row} c${f.col}</text></g>`).join('')}</svg>`);
console.log('Generated 49 SVG frames, manifest, and standalone contact sheet.');
