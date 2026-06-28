// Database client module — import `db` from here whenever you need to query the database.
// Uses Drizzle ORM on top of better-sqlite3 (a fast, synchronous SQLite driver for Node.js).
// Synchronous queries are fine for SvelteKit server routes running on a single local machine.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Open (or create) the SQLite database file in the project root.
const sqlite = new Database('de-sprong.db');

// WAL mode improves concurrent read performance (multiple reads alongside one write).
sqlite.pragma('journal_mode = WAL');

// Foreign key enforcement must be enabled explicitly in SQLite.
// Without this, ON DELETE CASCADE would be silently ignored.
sqlite.pragma('foreign_keys = ON');

// Export a typed Drizzle client. Passing the schema enables relational query helpers.
export const db = drizzle(sqlite, { schema });
