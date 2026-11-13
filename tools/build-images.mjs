import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = '3D Model';
const OUT = 'public/img';
await fs.mkdir(OUT, { recursive: true });

const jobs = [
  ['brand_logo.jpg', 'logo.webp', 640],
  ['pack_1_front.jpg', 'pack-1.webp', 900],
  ['pack_2_front.jpg', 'pack-2.webp', 900],
  ['pack_3_front.jpg', 'pack-3.webp', 900],
  ['pack_4_front.jpg', 'pack-4.webp', 900],
  ['pack_1_back.jpg', 'back-1.webp', 900],
  ['pack_2_back.jpg', 'back-2.webp', 900],
  ['pack_3_back.jpg', 'back-3.webp', 900],
  ['pack_4_back.jpg', 'back-4.webp', 900],
  ['card_cover.jpg', 'card.webp', 900],
];

for (const [from, to, width] of jobs) {
  await sharp(path.join(SRC, from))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(OUT, to));
}
console.log(`wrote ${jobs.length} images to ${OUT}`);
