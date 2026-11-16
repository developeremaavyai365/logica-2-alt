/* Writes the catalogue built into the website to
   backend/prisma/catalogue-seed.json, for backend/scripts/import-catalogue.js
   to load into the database.

   Usage, from the project root:  node scripts/export-catalogue.mjs

   The website's data files are TypeScript, so they are bundled with esbuild
   (already installed with Vite) into a temporary script and run. */

import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = mkdtempSync(join(tmpdir(), 'logica-catalogue-'));
const bundle = join(workDir, 'export.cjs');

try {
  await build({
    entryPoints: [join(root, 'scripts/catalogue/export-entry.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: bundle,
    logLevel: 'warning',
    // import.meta.env is Vite's; outside it there is no backend to load from.
    define: { 'import.meta.env': '{}' },
  });
  const json = execFileSync(process.execPath, [bundle], { maxBuffer: 64 * 1024 * 1024 }).toString();
  const seed = JSON.parse(json);
  const out = join(root, 'backend/prisma/catalogue-seed.json');
  writeFileSync(out, json + '\n');
  console.log(`Wrote ${seed.products.length} products in ${seed.categories.length} categories to ${out}`);
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
