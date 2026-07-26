const fs = require('fs');
const path = require('path');

const srcPath = path.join('C:', 'Users', 'DELL', 'Downloads', 'Logica Motion Reveal.html');
const html = fs.readFileSync(srcPath, 'utf8');

const manifestStart = html.indexOf('<script type="__bundler/manifest">');
const manifestEnd = html.indexOf('</script>', manifestStart);
const manifestRaw = html.slice(manifestStart + '<script type="__bundler/manifest">'.length, manifestEnd).trim();
const manifest = JSON.parse(manifestRaw);

const outDir = path.join(__dirname, '..', 'public', '_extracted');
fs.mkdirSync(outDir, { recursive: true });

const summary = [];
for (const [id, res] of Object.entries(manifest)) {
  const mime = res.mime;
  const ext = mime.split('/')[1] || 'bin';
  const buf = Buffer.from(res.data, 'base64');
  const file = path.join(outDir, `${id}.${ext}`);
  fs.writeFileSync(file, buf);
  summary.push({ id, mime, bytes: buf.length, file: path.basename(file) });
}

console.log(JSON.stringify(summary, null, 2));
