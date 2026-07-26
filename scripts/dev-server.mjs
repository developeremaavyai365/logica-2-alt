// Launches Vite with this project as the working directory.
//
// Without this, when the process is spawned by an external harness that
// doesn't run `npm --prefix`, process.cwd() stays at whatever directory the
// harness spawned from. PostCSS's config loader (postcss-load-config) walks
// up from process.cwd() to find postcss.config.js / tailwind.config.js — so
// if this project lives inside/alongside another Tailwind project, the
// wrong config (and wrong content globs) can get picked up, silently
// contaminating the generated CSS with classes from the other project.
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
process.chdir(fileURLToPath(root));
await import(new URL('node_modules/vite/bin/vite.js', root));
