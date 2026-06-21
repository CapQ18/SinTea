// Convert public/icon.svg to PNG icons of various sizes
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '..', 'public', 'icon.svg');
const publicDir = join(__dirname, '..', 'public');

const svgBuffer = readFileSync(svgPath);

const sizes = [192, 512];

for (const size of sizes) {
  const outputPath = join(publicDir, `icon-${size}.png`);
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅ Generated ${outputPath} (${size}x${size})`);
}

console.log('\n🎉 All PWA icons generated!');
