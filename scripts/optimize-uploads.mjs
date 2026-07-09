import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || 'uploads');
const maxSize = Number(process.env.IMAGE_MAX_SIZE || 1920);
const quality = Number(process.env.IMAGE_QUALITY || 78);
const supported = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else yield fullPath;
  }
}

async function optimize(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!supported.has(ext)) return null;

  const before = (await fs.stat(filePath)).size;
  const tmpPath = `${filePath}.tmp`;
  const pipeline = sharp(filePath, { failOn: 'none' })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true });

  if (['.jpg', '.jpeg'].includes(ext)) {
    await pipeline.jpeg({ quality, mozjpeg: true }).toFile(tmpPath);
  } else if (ext === '.png') {
    await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmpPath);
  } else if (ext === '.webp') {
    await pipeline.webp({ quality }).toFile(tmpPath);
  } else if (ext === '.avif') {
    await pipeline.avif({ quality: Math.min(quality, 60) }).toFile(tmpPath);
  }

  const after = (await fs.stat(tmpPath)).size;
  if (after > 0 && after < before) {
    await fs.rename(tmpPath, filePath);
    return { before, after };
  }

  await fs.rm(tmpPath, { force: true });
  return { before, after: before };
}

let scanned = 0;
let optimized = 0;
let saved = 0;

for await (const filePath of walk(uploadsDir)) {
  scanned++;
  try {
    const result = await optimize(filePath);
    if (!result) continue;
    const delta = result.before - result.after;
    if (delta > 0) {
      optimized++;
      saved += delta;
      console.log(`optimized ${path.relative(uploadsDir, filePath)} ${result.before} -> ${result.after}`);
    }
  } catch (error) {
    console.warn(`skip ${path.relative(uploadsDir, filePath)}: ${error.message}`);
  }
}

console.log('');
console.log(`Scanned: ${scanned}`);
console.log(`Optimized: ${optimized}`);
console.log(`Saved: ${(saved / 1024 / 1024).toFixed(2)} MB`);
