// Static checks across every .html file in the repository.
// Usage: node tests/lint.mjs
// Exits non-zero on any failure. PLACEHOLDER: counts are printed as warnings.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const SKIP_DIRS = new Set(['node_modules', '.git']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT).map((p) => relative(ROOT, p).split(sep).join('/')).sort();
const failures = [];
const warnings = [];
const fail = (file, msg) => failures.push(`${file}: ${msg}`);

const indexHtml = existsSync(join(ROOT, 'index.html')) ? readFileSync(join(ROOT, 'index.html'), 'utf8') : '';
const claudeMd = existsSync(join(ROOT, 'CLAUDE.md')) ? readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8') : '';
const filesSection = (claudeMd.split(/^## Files\s*$/m)[1] || '').split(/^---\s*$/m)[0];

for (const file of files) {
  // Files under reference/ are excluded from every check.
  if (file.startsWith('reference/')) continue;
  const src = readFileSync(join(ROOT, file), 'utf8');

  // 1. <meta charset="utf-8"> present and first in <head>
  const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(src);
  if (!head) fail(file, 'no <head> element');
  else {
    const firstTag = /<([a-z]+)[^>]*>/i.exec(head[1].replace(/<!--[\s\S]*?-->/g, ''));
    if (!firstTag || !/^<meta\s+charset=["']?utf-8["']?\s*\/?>$/i.test(firstTag[0])) {
      fail(file, '<meta charset="utf-8"> is not the first element in <head>');
    }
  }

  // 2. No network URLs in src, url(), @import, fetch or XMLHttpRequest.
  //    href to an outbound reading link is permitted; href on <link> is not.
  const netPatterns = [
    [/\ssrc\s*=\s*["']?\s*https?:/gi, 'http(s) URL in src'],
    [/<link\b[^>]*href\s*=\s*["']?\s*https?:/gi, 'http(s) URL in <link href>'],
    [/url\(\s*["']?\s*https?:/gi, 'http(s) URL in url()'],
    [/@import\s+(url\()?\s*["']?\s*https?:/gi, 'http(s) URL in @import'],
    [/\bfetch\s*\(/g, 'fetch() call'],
    [/XMLHttpRequest/g, 'XMLHttpRequest'],
  ];
  for (const [re, msg] of netPatterns) if (re.test(src)) fail(file, msg);

  // 3. No curly quotes inside <script> blocks
  const scripts = src.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
  scripts.forEach((block) => {
    const m = block.match(/[‘’“”]/g);
    if (m) {
      const line = src.slice(0, src.indexOf(block)).split('\n').length;
      fail(file, `${m.length} curly quote(s) inside <script> starting at line ${line}`);
    }
  });

  // 4. No border-radius other than 0 and 50%
  const radii = src.match(/border-radius\s*:\s*[^;"}]+/gi) || [];
  radii.forEach((r) => {
    const v = r.split(':')[1].trim().replace(/\s*!important/, '');
    if (!/^(0|0px|0rem|50%)$/.test(v)) fail(file, `border-radius value "${v}"`);
  });

  // 5. Decks are linked from index.html and listed in CLAUDE.md Files
  const isDeck = /^(courses\/[^/]+|standalone)\/[^/]+\.html$/.test(file);
  if (isDeck) {
    if (!indexHtml.includes(`href="${file}"`)) fail(file, 'not linked from index.html');
    if (!filesSection.includes('`' + file + '`')) fail(file, 'not listed in the Files section of CLAUDE.md');
    if (file.startsWith('standalone/')) {
      const brief = file.replace(/\.html$/, '.brief.md');
      if (!existsSync(join(ROOT, brief))) fail(file, `missing brief ${brief}`);
    }
    const ph = (src.match(/PLACEHOLDER:/g) || []).length;
    if (ph) warnings.push(`${file}: ${ph} PLACEHOLDER: string(s)`);
  }
}

// 6. Every course folder has a COURSE.md
const coursesDir = join(ROOT, 'courses');
if (existsSync(coursesDir)) {
  for (const name of readdirSync(coursesDir)) {
    const p = join(coursesDir, name);
    if (statSync(p).isDirectory() && !existsSync(join(p, 'COURSE.md'))) failures.push(`courses/${name}: missing COURSE.md`);
  }
}

console.log(`Linted ${files.filter((f) => !f.startsWith('reference/')).length} file(s): ${files.filter((f) => !f.startsWith('reference/')).map((f) => basename(f)).join(', ')}`);
warnings.forEach((w) => console.log('WARN  ' + w));
failures.forEach((f) => console.log('FAIL  ' + f));
if (failures.length) {
  console.log(`\n${failures.length} failure(s).`);
  process.exit(1);
}
console.log('\nAll lint checks passed.');
