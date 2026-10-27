/* All images stay local. This prototype never sends or persists credentials. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const { clamp, quantize, normalizePointer, approach, nearestFrame } = CatMapping;
  // Replace these 49 paths to swap in PNG/WebP/reference-character images.
  const FRAME_URLS = Array.from({ length: 49 }, (_, i) => `assets/frames/cat-${String(i).padStart(2, '0')}.svg`);
  // Set false when replacing the default SVG character with unrelated artwork.
  const USE_VECTOR_FRAMES = true;
  const canvas = $('cat-canvas'), ctx = canvas.getContext('2d');
  let vector = null, vectorPatches = [];
  const images = new Map(), failed = new Set(), buttons = [];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let desired = { x: 0, y: 0 }, smooth = { x: 0, y: 0 }, col = 3, row = 3;
  let current = null, pinned = null, passwordPrivate = false;
  let previousTime = null, raf = 0;
  let settled = 0, ready = false, touchPointer = null, leaveTimer = 0;
  const reduced = () => motionPreference.matches || $('gentle-mode').checked;

  function startVector() {
    if (!USE_VECTOR_FRAMES || !window.CatVectorFrames || failed.size) return;
    const data = window.CatVectorFrames;
    const svg = new DOMParser().parseFromString(data.template, 'image/svg+xml').documentElement;
    if (svg.localName !== 'svg') return;
    vector = document.importNode(svg, true);
    vector.id = 'cat-vector'; vector.classList.add('cat-vector');
    vector.dataset.frame = String(current);
    vector.setAttribute('role', 'img');
    vector.setAttribute('aria-label', canvas.getAttribute('aria-label'));
    const elements = [vector, ...vector.querySelectorAll('*')];
    vectorPatches = data.patches.map(patch => ({ ...patch, node: elements[patch.element] }));
    canvas.before(vector);
    canvas.hidden = true; $('cat-fallback').hidden = true;
  }

  function paintVector() {
    // Interpolate GEOMETRY, never translucent whole cats. One sharp outline per part.
    const gx = (clamp(smooth.x, -1, 1) + 1) * 3, gy = (clamp(smooth.y, -1, 1) + 1) * 3;
    const left = Math.min(5, Math.floor(gx)), top = Math.min(5, Math.floor(gy));
    const tx = gx - left, ty = gy - top;
    const indices = [top * 7 + left, top * 7 + left + 1, (top + 1) * 7 + left, (top + 1) * 7 + left + 1];
    const weights = [(1 - tx) * (1 - ty), tx * (1 - ty), (1 - tx) * ty, tx * ty];
    for (const patch of vectorPatches) {
      let value = patch.parts[0];
      for (let n = 0; n < patch.poses[0].length; n++) {
        const number = indices.reduce((sum, index, corner) => sum + patch.poses[index][n] * weights[corner], 0);
        value += Number(number.toFixed(5)) + patch.parts[n + 1];
      }
      patch.node.setAttribute(patch.attribute, value);
    }
  }

  function show(index) {
    const available = nearestFrame(index, images.keys());
    if (available === null || available === current) return;
    if (current !== null) buttons[current].setAttribute('aria-pressed', 'false');
    current = available;
    buttons[current].setAttribute('aria-pressed', 'true');
    $('frame-index').textContent = `${String(current).padStart(2, '0')} / 48`;
    $('frame-coordinate').textContent = `行 ${Math.floor(current / 7) + 1} · 列 ${current % 7 + 1}`;
    canvas.dataset.frame = String(current);
    if (vector) vector.dataset.frame = String(current);
    else if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images.get(current), 0, 0, canvas.width, canvas.height);
    } else $('cat-fallback').src = FRAME_URLS[current];
  }

  function wake() {
    if (!raf && images.size && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    const dt = previousTime === null ? 16 : now - previousTime;
    previousTime = now;
    const fixed = passwordPrivate ? 0 : pinned;
    const target = fixed === null ? desired : { x: (fixed % 7 - 3) / 3, y: (Math.floor(fixed / 7) - 3) / 3 };
    smooth.x = reduced() ? target.x : approach(smooth.x, target.x, dt, 45);
    smooth.y = reduced() ? target.y : approach(smooth.y, target.y, dt, 45);
    if (Math.abs(smooth.x - target.x) < .0005) smooth.x = target.x;
    if (Math.abs(smooth.y - target.y) < .0005) smooth.y = target.y;
    col = quantize(smooth.x, col); row = quantize(smooth.y, row);
    show(fixed ?? row * 7 + col);
    if (vector) paintVector();
    if (smooth.x !== target.x || smooth.y !== target.y) wake();
    else previousTime = null;
  }

  function caption() {
    const invitation = matchMedia('(pointer: coarse)').matches ? '按住猫咪区域拖动，和我打个招呼。' : '动动鼠标，和我打个招呼。';
    $('cat-caption').textContent = passwordPrivate ? '放心输入，我先看一会儿别处。' : pinned !== null ? '这一刻的目光，为你停留。' : touchPointer !== null ? '你的手指，我的小小全世界。' : invitation;
    $('follow-mode').textContent = passwordPrivate ? '密码保护 · 看向别处' : pinned !== null ? '逐帧预览 · 已暂停跟随' : '正在跟随';
  }

  function point(clientX, clientY) {
    // Use the actual rendered image rect, including the mobile layout.
    const rect = (vector || (ctx ? canvas : $('cat-fallback'))).getBoundingClientRect();
    desired = normalizePointer(clientX, clientY,
      { x: rect.left + rect.width * .5, y: rect.top + rect.height * .44 },
      { width: innerWidth, height: innerHeight });
    wake();
  }
  function reset() { pinned = null; caption(); wake(); }
  function centerSoon() {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => { desired = { x: 0, y: 0 }; wake(); }, 220);
  }

  for (let i = 0; i < 49; i++) {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = String(i).padStart(2, '0');
    button.setAttribute('aria-label', `预览第 ${i + 1} 张，行 ${Math.floor(i / 7) + 1} 列 ${i % 7 + 1}`);
    button.setAttribute('aria-pressed', 'false');
    button.disabled = true;
    button.addEventListener('click', () => { pinned = i; caption(); wake(); });
    $('frame-grid').append(button); buttons.push(button);
  }
  $('inspector-toggle').addEventListener('click', () => {
    const open = $('inspector').hidden;
    $('inspector').hidden = !open;
    $('inspector-toggle').setAttribute('aria-expanded', String(open));
    $('inspector-toggle').innerHTML = open ? '收起面板 <span aria-hidden="true">↙</span>' : '方向面板 <span aria-hidden="true">↗</span>';
  });
  $('resume').addEventListener('click', reset);
  $('gentle-mode').addEventListener('change', wake);
  motionPreference.addEventListener('change', wake);

  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' && event.pointerId !== touchPointer) return;
    clearTimeout(leaveTimer);
    point(event.clientX, event.clientY);
  }, { passive: true });
  $('cat-stage').addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' || touchPointer !== null) return;
    touchPointer = event.pointerId;
    $('cat-stage').setPointerCapture(event.pointerId);
    pinned = null; point(event.clientX, event.clientY); caption();
  });
  function endTouch(event) {
    if (event.pointerId !== touchPointer) return;
    touchPointer = null; caption(); centerSoon();
  }
  document.addEventListener('pointerup', endTouch);
  document.addEventListener('pointercancel', endTouch);
  $('cat-stage').addEventListener('lostpointercapture', endTouch);
  document.documentElement.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') centerSoon(); });
  window.addEventListener('blur', () => { touchPointer = null; desired = { x: 0, y: 0 }; caption(); wake(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; previousTime = null; }
    else wake();
  });
  window.addEventListener('resize', () => { desired = { x: 0, y: 0 }; wake(); }, { passive: true });
  function keyboard(event) {
    const deltas = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (event.key === 'Escape') { event.preventDefault(); reset(); return; }
    if (!deltas[event.key]) return;
    event.preventDefault();
    const base = pinned ?? current ?? 24, [dy, dx] = deltas[event.key];
    pinned = clamp(Math.floor(base / 7) + dy, 0, 6) * 7 + clamp(base % 7 + dx, 0, 6);
    caption(); wake();
    if ($('frame-grid').contains(event.target)) buttons[pinned].focus();
  }
  $('cat-stage').addEventListener('keydown', keyboard);
  $('frame-grid').addEventListener('keydown', keyboard);

  $('password').addEventListener('focus', () => { passwordPrivate = true; caption(); wake(); });
  $('password').addEventListener('blur', () => { passwordPrivate = false; caption(); wake(); });
  $('password-toggle').addEventListener('click', () => {
    const visible = $('password').type === 'password';
    $('password').type = visible ? 'text' : 'password';
    $('password-toggle').setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
    $('password-toggle').setAttribute('aria-pressed', String(visible));
    $('eye-slash').toggleAttribute('hidden', !visible);
    $('password').focus();
  });
  $('forgot').addEventListener('click', () => {
    $('form-message').textContent = '这是本地演示，尚未接入找回密码服务。可使用任意有效邮箱和至少 6 位演示密码。';
  });
  function enter() {
    $('password').value = ''; $('email').value = '';
    passwordPrivate = false;
    document.querySelector('.login-content').hidden = true;
    $('welcome').hidden = false;
    $('welcome-title').focus(); reset();
  }
  $('login-form').addEventListener('submit', event => { event.preventDefault(); enter(); });
  $('demo').addEventListener('click', enter);
  $('back').addEventListener('click', () => {
    $('welcome').hidden = true;
    document.querySelector('.login-content').hidden = false;
    $('form-message').textContent = '';
    $('email').focus();
  });

  async function loadFrame(index) {
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { image.onload = null; image.onerror = null; reject(new Error('load timeout')); }, 10000);
        image.onload = () => { clearTimeout(timeout); resolve(); };
        image.onerror = () => { clearTimeout(timeout); reject(new Error('image unavailable')); };
        image.src = FRAME_URLS[index];
      });
      // Decode before any frame is eligible for display: prevents first-use flashes.
      if (image.decode) await image.decode();
      images.set(index, image); buttons[index].disabled = false;
      if (current === null || index === 24) {
        show(24);
        if (ctx) { canvas.hidden = false; $('cat-fallback').hidden = true; }
      }
    } catch { failed.add(index); }
    settled++;
    $('load-text').textContent = `正在唤醒猫咪 ${settled} / 49`;
    if (settled === 49) {
      ready = true;
      startVector();
      $('load-status').classList.toggle('error', failed.size > 0);
      $('load-text').textContent = failed.size ? (images.size ? `${images.size} / 49 帧就绪 · 已启用就近替代` : '素材加载失败 · 请检查 assets/frames') : '49 / 49 帧 · 准备好陪你';
      if (!images.size) {
        $('cat-caption').textContent = '猫咪素材未找到，请检查图片路径后刷新。';
        $('cat-fallback').alt = '猫咪素材加载失败，请检查 assets/frames 文件夹';
      }
    }
    wake();
  }
  // Read-only diagnostics for verifying mapping/loading without exposing form data.
  Object.defineProperty(window, 'catPrototype', { value: Object.freeze({
    getState: () => ({ ready, loaded: images.size, failed: [...failed], frame: current,
      row: current === null ? null : Math.floor(current / 7), col: current === null ? null : current % 7,
      pinned, passwordPrivate, desired: { ...desired }, smooth: { ...smooth }, reducedMotion: reduced(),
      renderer: vector ? 'vector-geometry' : 'single-frame', version: '20261026-2' })
  }) });
  // Start the neutral frame first, then warm the complete 7×7 set.
  caption();
  loadFrame(24);
  for (let i = 0; i < 49; i++) if (i !== 24) loadFrame(i);
})();
