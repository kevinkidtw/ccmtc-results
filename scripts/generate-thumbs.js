/**
 * One-time migration: generate thumbnail (thumb_N.webp) for all existing uploaded images.
 * Run inside the container:
 *   docker exec -it checheng-maker-web node /app/scripts/generate-thumbs.js
 * Or locally (dev):
 *   node scripts/generate-thumbs.js
 */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

async function run() {
  let dirs;
  try {
    dirs = await fs.readdir(uploadsDir);
  } catch {
    console.error('uploads dir not found:', uploadsDir);
    process.exit(1);
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const postId of dirs) {
    const postDir = path.join(uploadsDir, postId);
    const stat = await fs.stat(postDir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(postDir);
    // Process only numbered originals: 0.jpg, 1.jpg, 1.png, etc.
    const originals = files.filter(f => /^\d+\.(jpg|jpeg|png|webp)$/i.test(f));

    for (const filename of originals) {
      const base = path.basename(filename, path.extname(filename)); // "0", "1", ...
      const thumbName = `thumb_${base}.webp`;
      const thumbPath = path.join(postDir, thumbName);

      // Skip if thumb already exists
      try {
        await fs.access(thumbPath);
        skipped++;
        continue;
      } catch {}

      const srcPath = path.join(postDir, filename);
      try {
        await sharp(srcPath)
          .rotate()
          .resize(600, null, { withoutEnlargement: true })
          .webp({ quality: 72 })
          .toFile(thumbPath);
        console.log(`✓ ${postId}/${thumbName}`);
        generated++;
      } catch (err) {
        console.error(`✗ ${postId}/${filename}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} already existed, ${errors} errors`);
}

run();
