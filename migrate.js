const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace('file:', '') 
  : '/app/data/dev.db';

console.log(`[migrate] Connecting to database at ${dbPath}...`);
const db = new Database(dbPath);

const addColumn = (table, column, definition) => {
  try {
    // Check if column exists
    db.prepare(`SELECT ${column} FROM ${table} LIMIT 1`).get();
  } catch (e) {
    if (e.message.includes('no such column')) {
      console.log(`[migrate] Adding column ${column} to ${table}...`);
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    } else {
      console.error(`[migrate] Error checking column ${column}:`, e);
    }
  }
};

try {
  addColumn('Post', 'category', 'TEXT');
  addColumn('Post', 'infoTechDetails', 'TEXT');
  addColumn('Post', 'lifeTechDetails', 'TEXT');
  addColumn('Post', 'policyFocus', 'TEXT');
  addColumn('Post', 'teacher', 'TEXT');
  addColumn('Template', 'category', 'TEXT');

  console.log(`[migrate] Creating Template table if not exists...`);
  db.prepare(`
    CREATE TABLE IF NOT EXISTS "Template" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log("[migrate] Migration complete.");
} catch(err) {
  console.error("[migrate] Critical migration error:", err);
} finally {
  db.close();
}
