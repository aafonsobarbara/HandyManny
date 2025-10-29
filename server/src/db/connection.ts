import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'handyman.sqlite');
const dir = path.dirname(dbPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

enum MigrationStatus {
  Applied = 'applied'
}

export const runMigrations = () => {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY, status TEXT NOT NULL, applied_at TEXT NOT NULL)`);

  for (const file of files) {
    const id = file.replace('.sql', '');
    const already = db.prepare('SELECT 1 FROM migrations WHERE id = ?').get(id);
    if (already) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
    db.prepare('INSERT INTO migrations (id, status, applied_at) VALUES (?, ?, ?)').run(id, MigrationStatus.Applied, new Date().toISOString());
  }
};

export default db;
