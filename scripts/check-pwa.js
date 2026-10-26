const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkImage(relativePath, expectedWidth, expectedHeight) {
  const absolutePath = path.join(root, 'public', relativePath);
  assert(fs.existsSync(absolutePath), `Falta el recurso ${relativePath}`);
  const metadata = await sharp(absolutePath).metadata();
  assert(
    metadata.width === expectedWidth && metadata.height === expectedHeight,
    `${relativePath} debe medir ${expectedWidth}x${expectedHeight}`
  );
}

async function main() {
  const publicDirectory = path.join(root, 'public');
  const manifest = JSON.parse(fs.readFileSync(path.join(publicDirectory, 'manifest.json'), 'utf8'));
  const serviceWorker = fs.readFileSync(path.join(publicDirectory, 'sw.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(publicDirectory, 'index.html'), 'utf8');

  assert(manifest.name && manifest.short_name, 'El manifest requiere name y short_name');
  assert(manifest.start_url === '/', 'El start_url debe ser /');
  assert(manifest.scope === '/', 'El scope debe ser /');
  assert(manifest.display === 'standalone', 'La PWA debe usar display standalone');
  assert(indexHtml.includes('rel="manifest"'), 'index.html debe enlazar el manifest');

  await checkImage('logo192.png', 192, 192);
  await checkImage('logo192-maskable.png', 192, 192);
  await checkImage('logo512.png', 512, 512);
  await checkImage('logo512-maskable.png', 512, 512);
  await checkImage('screenshot-desktop.png', 1280, 720);
  await checkImage('screenshot-mobile.png', 720, 1280);

  for (const asset of ['offline.html', 'product-placeholder.svg']) {
    assert(fs.existsSync(path.join(publicDirectory, asset)), `Falta ${asset}`);
    assert(serviceWorker.includes(`'/${asset}'`), `${asset} debe estar precacheado`);
  }

  for (const requiredPattern of [
    'CACHEABLE_PUBLIC_API_PATHS',
    "request.headers.has('Authorization')",
    "status: 503",
    "event.data?.type === 'SKIP_WAITING'",
    'DATA_MAX_AGE_MS',
    'IMAGE_MAX_AGE_MS',
    'DATA_MAX_ENTRIES',
    'IMAGE_MAX_ENTRIES',
    'PWA_CACHED_DATA'
  ]) {
    assert(serviceWorker.includes(requiredPattern), `Falta la política PWA: ${requiredPattern}`);
  }

  assert(!serviceWorker.includes("'/static/js/bundle.js'"), 'No se debe precachear bundle.js');
  console.log('Contrato PWA validado correctamente.');
}

main().catch((error) => {
  console.error(`Validación PWA fallida: ${error.message}`);
  process.exit(1);
});
