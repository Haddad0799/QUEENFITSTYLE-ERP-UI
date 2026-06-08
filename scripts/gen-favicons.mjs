// Gera os favicons a partir de public/logo.png.
// Uso: npm i -D sharp && node scripts/gen-favicons.mjs
import sharp from 'sharp';

for (const size of [16, 32, 180]) {
  await sharp('public/logo.png')
    // remove a margem transparente para o ícone ocupar melhor o quadrado
    .trim()
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(`public/favicon-${size}.png`);
  console.log(`✓ public/favicon-${size}.png`);
}
console.log('Favicons gerados.');
