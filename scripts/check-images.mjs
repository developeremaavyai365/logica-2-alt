import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

function loadArray(file, regex) {
  const src = require('node:fs').readFileSync(path.join(root, 'src', file), 'utf8');
  const matches = [...src.matchAll(regex)];
  return matches.map((m) => m[1]);
}

const { createRequire } = await import('node:module');
const require = createRequire(import.meta.url);

const productImages = loadArray('products-data.ts', /"image":\s*"([^"]+)"/g);
const galleryMatches = [...require('node:fs').readFileSync(path.join(root, 'src', 'product-gallery-data.ts'), 'utf8').matchAll(/"(\/products-gallery\/[^"]+)"/g)];
const galleryImages = galleryMatches.map((m) => m[1]);

let missing = [];
for (const img of productImages) {
  const p = path.join(publicDir, img);
  if (!existsSync(p)) missing.push(img);
}
for (const img of galleryImages) {
  const p = path.join(publicDir, img);
  if (!existsSync(p)) missing.push(img);
}

console.log(`Checked ${productImages.length} product images + ${galleryImages.length} gallery images.`);
console.log(`Missing: ${missing.length}`);
if (missing.length) {
  console.log(missing.slice(0, 50).join('\n'));
  if (missing.length > 50) console.log(`...and ${missing.length - 50} more`);
}
