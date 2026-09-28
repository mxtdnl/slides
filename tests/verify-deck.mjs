// Per-deck verification harnesses (SLIDES.md section 16).
// Usage: node tests/verify-deck.mjs <path-to-deck.html> [--shots <dir>]
//
// Runs in headless Chromium via Playwright: fit at three sizes in the
// initial and worst state of every slide, keyboard guards and focus
// states, persistence (reload, export, reset, import, storage throwing),
// contrast at 1280x720, print in both modes, and the 360px layout.
// The deck must expose window.DECK (show, current, worst; selectPart and fillBoard
// where used). A deck with no response store sets DECK.hasStore = false and the
// persistence harness is skipped. Slides with [data-activity] or [data-reveal]
// are also measured in their worst state.
// Exits non-zero on any failure.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

async function loadPlaywright() {
  try { return await import('playwright'); } catch (e) { /* fall through to a global install */ }
  const root = execSync('npm root -g').toString().trim();
  const req = createRequire(join(root, 'noop.js'));
  return req('playwright');
}

const args = process.argv.slice(2);
const deckPath = args.find((a) => !a.startsWith('--') && a.endsWith('.html'));
if (!deckPath) { console.error('Usage: node tests/verify-deck.mjs <deck.html> [--shots <dir>]'); process.exit(2); }
const shotsIdx = args.indexOf('--shots');
const shotsDir = shotsIdx >= 0 ? args[shotsIdx + 1] : null;
if (shotsDir) mkdirSync(shotsDir, { recursive: true });

const url = pathToFileURL(resolve(deckPath)).href;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const failures = [];
const log = (s) => console.log(s);
const fail = (area, msg) => { failures.push(`${area}: ${msg}`); };

const SIZES = [[1920, 1080], [1440, 900], [1280, 720]];

async function openDeck(context, hash = '') {
  const page = await context.newPage();
  page.on('pageerror', (e) => fail('JS', e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(url + hash);
  await page.waitForFunction(() => window.DECK);
  return page;
}

async function slideInfo(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.slide')).map((s) => ({
    id: s.id, archetype: s.getAttribute('data-archetype'), activity: !!s.querySelector('[data-activity], [data-reveal]'),
  })));
}

// Overflow of .s-body content past the content box: bottom and right, in px and in rem.
async function measureFit(page) {
  return page.evaluate(() => {
    const s = document.querySelector('.slide.active');
    const inner = s.querySelector('.slide-inner');
    const cs = getComputedStyle(inner);
    const ir = inner.getBoundingClientRect();
    const limitB = ir.bottom - parseFloat(cs.paddingBottom);
    const limitR = ir.right - parseFloat(cs.paddingRight);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let mb = -Infinity, mr = -Infinity;
    const body = s.querySelector('.s-body') || inner;
    const measured = body === inner ? [...body.querySelectorAll('*')] : [body, ...body.querySelectorAll('*')];
    measured.forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.height > 0 && b.width > 0 && getComputedStyle(el).display !== 'none') {
        if (b.bottom > mb) mb = b.bottom;
        if (b.right > mr) mr = b.right;
      }
    });
    // Anything below .s-body inside the inner (for example a source line) also counts
    if (body !== inner) inner.querySelectorAll(':scope > *').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.height > 0 && b.bottom > mb) mb = b.bottom;
    });
    // Timer overlap: no body element may intersect the timer plate
    let timerOverlap = false;
    const timer = s.querySelector('.timer');
    if (timer) {
      const t = timer.getBoundingClientRect();
      body.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width && b.height && b.left < t.right && b.right > t.left && b.top < t.bottom && b.bottom > t.top) timerOverlap = true;
      });
    }
    // Internal overflow: a flexible box (flex-grow with min-height 0) whose content spills out of it
    const spills = [];
    [body, ...body.querySelectorAll('*')].forEach((el) => {
      const cs2 = getComputedStyle(el);
      if (parseFloat(cs2.flexGrow) > 0 && cs2.minHeight === '0px' && el.scrollHeight > el.clientHeight + 2) {
        spills.push(`${el.className || el.tagName} by ${((el.scrollHeight - el.clientHeight) / rem).toFixed(2)}rem`);
      }
    });
    return { bottom: (mb - limitB) / rem, right: (mr - limitR) / rem, timerOverlap, spills };
  });
}

function fmtFit(f) { return `${f.bottom > 0 ? '+' : ''}${f.bottom.toFixed(2)}rem`; }

// ---------- Fit and states at three sizes ----------

log(`\nDeck: ${deckPath}`);
log('\n== FIT (overflow past the content box; negative is spare room) ==');
const fitRows = {};
let slides;
for (const [w, h] of SIZES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await openDeck(ctx);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.DECK);
  slides = await slideInfo(page);
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    await page.evaluate((n) => window.DECK.show(n), i);
    await page.waitForTimeout(400);
    const states = [];
    states.push(['initial', await measureFit(page)]);
    if (shotsDir && w === 1920) await page.screenshot({ path: join(shotsDir, `${String(i + 1).padStart(2, '0')}-${s.id}-initial.png`) });
    if (s.id === 's-hierarchy') {
      for (let p = 0; p < 3; p++) {
        await page.evaluate(([id, n]) => window.DECK.selectPart(id, n), [s.id, p]);
        states.push([`part ${p + 1}`, await measureFit(page)]);
      }
    }
    if (s.id === 's-board') {
      for (const n of [4, 5, 8, 9, 20]) {
        await page.evaluate((k) => window.DECK.fillBoard(k), n);
        states.push([`board ${n}`, await measureFit(page)]);
      }
    } else if (s.activity || s.archetype === 'worked-example') {
      await page.evaluate((id) => window.DECK.worst(id), s.id);
      await page.waitForTimeout(700);
      states.push(['worst', await measureFit(page)]);
    }
    if (shotsDir && w === 1920 && states.length > 1) await page.screenshot({ path: join(shotsDir, `${String(i + 1).padStart(2, '0')}-${s.id}-final.png`) });
    fitRows[s.id] = fitRows[s.id] || { n: i + 1, archetype: s.archetype, sizes: {} };
    fitRows[s.id].sizes[`${w}x${h}`] = states;
    for (const [label, f] of states) {
      if (f.bottom > 0.05) fail('FIT', `slide ${i + 1} ${s.id} (${label}) at ${w}x${h} overflows the bottom by ${f.bottom.toFixed(2)}rem`);
      if (f.right > 0.05) fail('FIT', `slide ${i + 1} ${s.id} (${label}) at ${w}x${h} overflows the right by ${f.right.toFixed(2)}rem`);
      if (f.timerOverlap) fail('FIT', `slide ${i + 1} ${s.id} (${label}) at ${w}x${h}: content overlaps the timer`);
      if (f.spills.length) fail('FIT', `slide ${i + 1} ${s.id} (${label}) at ${w}x${h}: content spills out of ${f.spills.join(', ')}`);
    }
  }
  await ctx.close();
}
for (const [id, r] of Object.entries(fitRows)) {
  const parts = Object.entries(r.sizes).map(([size, states]) => `${size}: ` + states.map(([l, f]) => `${l} ${fmtFit(f)}`).join(', '));
  log(`${String(r.n).padStart(2)} ${id.padEnd(20)} ${String(r.archetype).padEnd(18)} ${parts[0]}`);
  parts.slice(1).forEach((p) => log(' '.repeat(42) + p));
}

// ---------- Keyboard ----------

log('\n== KEYBOARD ==');
{
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await openDeck(ctx);
  await page.evaluate(() => localStorage.clear());
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate((n) => window.DECK.show(n), i);
    await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    // Tab through controls on this slide and confirm a visible focus state
    let checked = 0, missing = [];
    for (let k = 0; k < 40; k++) {
      await page.keyboard.press('Tab');
      const r = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const inSlide = !!a.closest('.slide.active');
        const cs = getComputedStyle(a);
        return { inSlide, outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, tag: a.tagName, cls: a.className };
      });
      if (!r) continue;
      if (!r.inSlide) continue;
      checked++;
      if (!r.outline) missing.push(`${r.tag}.${r.cls}`);
    }
    if (missing.length) fail('KEYBOARD', `slide ${i + 1}: no visible focus on ${[...new Set(missing)].join(', ')}`);
    // Typing into inputs must not change the slide
    const inputs = await page.$$('.slide.active input:not([type=file]), .slide.active select');
    for (const inp of inputs) {
      if (!(await inp.isVisible()) || !(await inp.isEnabled())) continue;
      await inp.focus();
      await page.keyboard.press('Space');
      await page.keyboard.press('5');
      await page.keyboard.press('ArrowRight');
      const cur = await page.evaluate(() => window.DECK.current());
      if (cur !== i) { fail('KEYBOARD', `slide ${i + 1}: typing in an input changed the slide`); await page.evaluate((n) => window.DECK.show(n), i); }
      await page.keyboard.press('Escape');
    }
    // Space on a focused button must not advance
    const btn = await page.$('.slide.active button:not([disabled])');
    if (btn && await btn.isVisible()) {
      await btn.focus();
      await page.keyboard.press('Space');
      const cur = await page.evaluate(() => window.DECK.current());
      if (cur !== i) { fail('KEYBOARD', `slide ${i + 1}: Space on a focused button changed the slide`); }
    }
    await page.evaluate((n) => window.DECK.show(n), i);
    log(`${String(i + 1).padStart(2)} ${slides[i].id.padEnd(20)} focus checked on ${checked} control(s), ${inputs.length} input(s) guarded`);
  }
  // Navigation keys and blackout
  await page.evaluate(() => { window.DECK.show(0); document.activeElement.blur(); });
  await page.keyboard.press('ArrowRight');
  if (await page.evaluate(() => window.DECK.current()) !== 1) fail('KEYBOARD', 'ArrowRight did not advance');
  await page.keyboard.press('b');
  if (!(await page.evaluate(() => document.getElementById('blackout').classList.contains('on')))) fail('KEYBOARD', 'b did not black out');
  await page.keyboard.press('x');
  if (await page.evaluate(() => document.getElementById('blackout').classList.contains('on'))) fail('KEYBOARD', 'a key did not restore from blackout');
  await page.keyboard.press('End');
  if (await page.evaluate(() => window.DECK.current()) !== slides.length - 1) fail('KEYBOARD', 'End did not go to the last slide');
  // Deep link
  const p2 = await openDeck(ctx, '#7');
  if (await p2.evaluate(() => window.DECK.current()) !== 6) fail('KEYBOARD', 'deep link #7 did not open slide 7');
  await ctx.close();
}

// ---------- Persistence ----------

log('\n== PERSISTENCE ==');
const hasStore = await (async () => {
  const ctx = await browser.newContext();
  const page = await openDeck(ctx);
  const r = await page.evaluate(() => window.DECK.hasStore !== false);
  await ctx.close();
  return r;
})();
if (!hasStore) log('Skipped: the deck declares no response store (interaction level none).');
else {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
  const page = await openDeck(ctx);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForFunction(() => window.DECK);
  const hook = slides.findIndex((s) => s.archetype === 'claim-tally');
  const board = slides.findIndex((s) => s.archetype === 'live-board');
  await page.evaluate((n) => { window.DECK.show(n); document.activeElement.blur(); }, hook);
  await page.keyboard.press('Digit1'); await page.keyboard.press('Digit1'); await page.keyboard.press('Digit2');
  await page.evaluate((n) => window.DECK.show(n), board);
  await page.fill('#board-text', 'Sessions completed this week');
  await page.keyboard.press('Enter');
  await page.reload(); await page.waitForFunction(() => window.DECK);
  const after = await page.evaluate(() => window.DECK.state().activities);
  const hookId = slides[hook].id, boardId = slides[board].id;
  const okReload = after[hookId] && after[hookId].round1.join(',') === '2,1,0' && after[boardId] && after[boardId].entries.length === 1;
  log(`Reload keeps tally and board: ${okReload ? 'yes' : 'NO'}`);
  if (!okReload) fail('PERSISTENCE', 'tally or board did not survive a reload');

  // Export
  await page.evaluate(() => { document.getElementById('resp-btn').click(); });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#export-btn')]);
  const exportPath = join(tmpdir(), 'deck-export.json');
  await dl.saveAs(exportPath);
  const exported = JSON.parse(readFileSync(exportPath, 'utf8'));
  log(`Export file: ${dl.suggestedFilename()}`);
  if (!/^standalone-|^[a-z0-9-]+-/.test(dl.suggestedFilename())) fail('PERSISTENCE', 'export file name does not follow <collection>-<deck>-<date>.json');
  // Reset
  await page.evaluate(() => { document.getElementById('resp-btn').click(); });
  await Promise.all([page.waitForEvent('load'), page.click('#reset-btn')]);
  await page.waitForFunction(() => window.DECK);
  const cleared = await page.evaluate(() => Object.keys(window.DECK.state().activities).filter((k) => {
    const a = window.DECK.state().activities[k];
    return (a.round1 && a.round1.some((v) => v > 0)) || (a.entries && a.entries.length);
  }).length === 0);
  log(`Reset clears responses: ${cleared ? 'yes' : 'NO'}`);
  if (!cleared) fail('PERSISTENCE', 'reset did not clear responses');
  // Import
  await page.evaluate(() => { document.getElementById('resp-btn').click(); });
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('#import-btn')]);
  await Promise.all([page.waitForEvent('load'), fc.setFiles(exportPath)]);
  await page.waitForFunction(() => window.DECK);
  const imported = await page.evaluate(() => window.DECK.state().activities);
  const okImport = JSON.stringify(imported[hookId].round1) === JSON.stringify(exported.activities[hookId].round1) && imported[boardId].entries.length === exported.activities[boardId].entries.length;
  log(`Import restores the export: ${okImport ? 'yes' : 'NO'}`);
  if (!okImport) fail('PERSISTENCE', 'import did not restore the exported state');
  await ctx.close();

  // Storage throwing
  const ctx2 = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx2.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  const p3 = await openDeck(ctx2);
  const noStore = await p3.evaluate(() => !window.DECK.storageOK() && /not persist/.test(document.getElementById('resp-note').textContent));
  await p3.evaluate((n) => { window.DECK.show(n); document.activeElement.blur(); }, hook);
  await p3.keyboard.press('Digit1');
  await p3.keyboard.press('ArrowRight');
  const moved = await p3.evaluate(() => window.DECK.current());
  const works = noStore && moved === hook + 1;
  log(`Runs with storage throwing, and says so: ${works ? 'yes' : 'NO'}`);
  if (!works) fail('PERSISTENCE', 'deck does not run, or does not warn, when localStorage throws');
  await ctx2.close();
}

// ---------- Contrast at 1280x720 ----------

log('\n== CONTRAST (1280x720, initial and worst states) ==');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await openDeck(ctx);
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForFunction(() => window.DECK);
  const scan = () => page.evaluate(() => {
    function parse(c) {
      let m = /rgba?\(([^)]+)\)/.exec(c);
      if (m) { const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
      m = /color\(srgb ([^)]+)\)/.exec(c);
      if (m) { const p = m[1].split(/[\s\/]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1]; }
      return [0, 0, 0, 0];
    }
    function blend(top, under) {
      const a = top[3];
      return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
    }
    function bgOf(el) {
      const layers = [];
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor);
        if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
      }
      let base = [255, 255, 255, 1];
      for (let i = layers.length - 1; i >= 0; i--) base = blend(layers[i], base);
      return base;
    }
    function lum(c) {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
    }
    function visible(el) {
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) return false;
        if (e.getAttribute('aria-hidden') === 'true') return false;
      }
      return true;
    }
    const out = [];
    const root = document.querySelector('.slide.active');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const t = walker.currentNode;
      if (!t.textContent.trim()) continue;
      const el = t.parentElement;
      if (seen.has(el) || el.closest('.notes') || !visible(el)) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      const fg = parse(cs.color);
      const bg = bgOf(el);
      const fgb = blend(fg, bg);
      const L1 = lum(fgb), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const px = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight, 10);
      const large = px >= 24 || (px >= 18.66 && w >= 700);
      const need = large ? 3 : 4.5;
      if (ratio + 0.005 < need) out.push(`"${t.textContent.trim().slice(0, 40)}" ${ratio.toFixed(2)}:1 (needs ${need}, ${px.toFixed(1)}px/${w})`);
    }
    return out;
  });
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate((n) => window.DECK.show(n), i);
    await page.waitForTimeout(350);
    const a = await scan();
    let b = [];
    if (slides[i].activity || slides[i].archetype === 'worked-example') {
      if (slides[i].id === 's-board') await page.evaluate(() => window.DECK.fillBoard(8));
      else await page.evaluate((id) => window.DECK.worst(id), slides[i].id);
      await page.waitForTimeout(700);
      b = await scan();
    }
    if (slides[i].id === 's-hierarchy') {
      for (let p = 0; p < 3; p++) { await page.evaluate((n) => window.DECK.selectPart('s-hierarchy', n), p); b = b.concat(await scan()); }
    }
    const all = [...new Set([...a, ...b])];
    log(`${String(i + 1).padStart(2)} ${slides[i].id.padEnd(20)} ${all.length ? 'FAIL ' + all.length : 'pass'}`);
    all.forEach((x) => { log('     ' + x); fail('CONTRAST', `slide ${i + 1}: ${x}`); });
  }
  await ctx.close();
}

// ---------- Print ----------

log('\n== PRINT (A4, 10mm margins) ==');
for (const mode of ['student', 'instructor']) {
  const ctx = await browser.newContext({ viewport: { width: 718, height: 1047 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail('JS', e.message));
  await page.goto(url + (mode === 'instructor' ? '?instructor' : ''));
  await page.waitForFunction(() => window.DECK);
  await page.emulateMedia({ media: 'print' });
  const heights = await page.evaluate(() => Array.from(document.querySelectorAll('.slide')).map((s) => Math.round(s.getBoundingClientRect().height)));
  const over = heights.map((h, i) => [i + 1, h]).filter(([, h]) => h > 1047);
  over.forEach(([n, h]) => fail('PRINT', `${mode}: slide ${n} is ${h}px, taller than the 1047px A4 content box`));
  const pdf = await page.pdf({ format: 'A4', margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }, printBackground: true, preferCSSPageSize: true });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const expected = slides.length + await page.evaluate(() => document.querySelectorAll('.exit-page').length);
  log(`${mode.padEnd(10)} pages ${pages} (expected ${expected}); tallest slide ${Math.max(...heights)}px`);
  if (pages !== expected) fail('PRINT', `${mode}: ${pages} pages, expected ${expected}`);
  if (shotsDir) writeFileSync(join(shotsDir, `print-${mode}.pdf`), pdf);
  if (mode === 'student') {
    const leaked = await page.evaluate(() => {
      const text = document.body.innerText;
      const found = [];
      Object.values(ACTIVITIES).forEach((a) => {
        (a.options || []).forEach((o) => { if (o.why && text.includes(o.why)) found.push(o.why.slice(0, 30)); });
        (a.prompts || []).forEach((p) => { if (p.answer && text.includes(p.answer)) found.push(p.answer.slice(0, 30)); });
        (a.passage || []).forEach((p) => { if (p.why && text.includes(p.why.replace(/^(Flaw|Sound)\.\s*/, ''))) found.push(p.why.slice(0, 30)); });
        if (a.outcome && text.includes(a.outcome)) found.push(a.outcome.slice(0, 30));
      });
      if (/SPEAKER NOTES/.test(text)) found.push('speaker notes');
      return found;
    });
    log(`student    answers leaked: ${leaked.length ? leaked.join(' | ') : 'none'}`);
    leaked.forEach((l) => fail('PRINT', `student mode shows answer text "${l}"`));
  }
  await ctx.close();
}

// ---------- Narrow layout ----------

log('\n== NARROW (360x740) ==');
{
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true });
  const page = await openDeck(ctx);
  const bad = [];
  for (let i = 0; i < slides.length; i++) {
    await page.evaluate((n) => window.DECK.show(n), i);
    const r = await page.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const small = [];
      document.querySelectorAll('.slide.active button, .slide.active input, .slide.active select, .deck-chrome button').forEach((b) => {
        const rc = b.getBoundingClientRect();
        if (rc.width && rc.height && (rc.height < 43.5 || rc.width < 43.5) && !b.classList.contains('flaw-seg')) small.push(b.className || b.tagName);
      });
      return { sw, small: [...new Set(small)] };
    });
    if (r.sw > 361) bad.push(`slide ${i + 1}: horizontal scroll (${r.sw}px)`);
    if (r.small.length) bad.push(`slide ${i + 1}: touch targets under 44px: ${r.small.join(', ')}`);
    if (shotsDir && [1, 11, 16, 21].includes(i + 1)) await page.screenshot({ path: join(shotsDir, `narrow-${String(i + 1).padStart(2, '0')}.png`), fullPage: true });
  }
  log(bad.length ? bad.join('\n') : 'No horizontal scroll; touch targets at least 44px');
  bad.forEach((b) => fail('NARROW', b));
  await ctx.close();
}

await browser.close();
log('\n== SUMMARY ==');
if (failures.length) {
  failures.forEach((f) => log('FAIL  ' + f));
  log(`${failures.length} failure(s).`);
  process.exit(1);
}
log('All harnesses passed.');
