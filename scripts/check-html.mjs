#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const root = path.resolve(import.meta.dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith('.html')).sort();
const errors = [];

function localTarget(raw) {
  if (!raw || /^(?:[a-z]+:|#|data:|\/\/)/i.test(raw)) return null;
  const clean = raw.split(/[?#]/)[0];
  if (!clean || clean === './') return 'index.html';
  return clean.replace(/^\.\//, '');
}

for (const name of htmlFiles) {
  const source = fs.readFileSync(path.join(root, name), 'utf8');
  const dom = new JSDOM(source);
  const { document } = dom.window;
  const seen = new Set();

  document.querySelectorAll('[id]').forEach(node => {
    if (seen.has(node.id)) errors.push(`${name}: duplicate id #${node.id}`);
    seen.add(node.id);
  });

  document.querySelectorAll('script[src],link[href],img[src],source[src]').forEach(node => {
    const attr = node.hasAttribute('src') ? 'src' : 'href';
    const target = localTarget(node.getAttribute(attr));
    if (target && !fs.existsSync(path.join(root, target))) errors.push(`${name}: missing ${target}`);
  });

  document.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = new Set((a.getAttribute('rel') || '').split(/\s+/));
    if (!rel.has('noopener') || !rel.has('noreferrer')) errors.push(`${name}: external new-tab link lacks noopener noreferrer`);
  });

  [...document.scripts].filter(s => !s.src && (!s.type || /javascript|module/i.test(s.type))).forEach((script, index) => {
    try { new vm.Script(script.textContent, { filename: `${name}:inline-${index + 1}` }); }
    catch (error) { errors.push(`${name}: inline script ${index + 1}: ${error.message}`); }
  });
}

for (const file of ['assets/state-core.js', 'assets/sync-core.js', 'assets/tracker-core.js', 'assets/app-shell.js', 'assets/notify.js', 'sw.js', 'worker/baby-list-worker.js', 'scripts/send-push.mjs']) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required file ${file}`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  const target = localTarget(icon.src);
  if (target && !fs.existsSync(path.join(root, target))) errors.push(`manifest: missing ${target}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Checked ${htmlFiles.length} HTML files, local assets, inline scripts, and manifest references.`);
