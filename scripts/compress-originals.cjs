// Compresses all existing original photos in /app/public/uploads/
// Run inside the container: node /app/compress-originals.cjs
const sharp = require('/app/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = '/app/public/uploads';
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 82;

async function compressDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await compressDir(full);
    } else if (/^thumb_/i.test(entry.name)) {
      // Delete old thumbnail files
      fs.unlinkSync(full);
      console.log(`Deleted thumb: ${full}`);
    } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      const stat = fs.statSync(full);
      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      // Only compress if larger than 500KB (already-compressed files can be skipped)
      if (stat.size < 512000) {
        console.log(`Skip (already small, ${sizeMB}MB): ${full}`);
        continue;
      }
      const tmp = full + '.tmp';
      try {
        await sharp(full)
          .rotate()
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY })
          .toFile(tmp);
        const newStat = fs.statSync(tmp);
        const newSizeMB = (newStat.size / 1024 / 1024).toFixed(2);
        fs.renameSync(tmp, full);
        console.log(`Compressed: ${path.relative(UPLOADS_DIR, full)} ${sizeMB}MB → ${newSizeMB}MB`);
      } catch (err) {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        console.log(`Skip (sharp error: ${err.message}): ${full}`);
      }
    }
  }
}

compressDir(UPLOADS_DIR)
  .then(() => console.log('\nDone.'))
  .catch(err => { console.error(err); process.exit(1); });
