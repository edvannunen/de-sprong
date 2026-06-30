// Database client module — import `db` from here whenever you need to query the database.
// Uses Drizzle ORM on top of better-sqlite3 (a fast, synchronous SQLite driver for Node.js).
// Synchronous queries are fine for SvelteKit server routes running on a single local machine.

import fs from 'fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Ensure the data directory exists before opening the database.
// In production this directory is a persistent Docker volume; during the Docker
// build the directory doesn't exist yet, so we create it here.
fs.mkdirSync('data', { recursive: true });

// Open (or create) the SQLite database file in a dedicated data/ directory.
// This directory is mounted as a persistent Docker volume in production so the
// database survives redeployments.
const sqlite = new Database('data/de-sprong.db');

// WAL mode improves concurrent read performance (multiple reads alongside one write).
sqlite.pragma('journal_mode = WAL');

// Foreign key enforcement must be enabled explicitly in SQLite.
// Without this, ON DELETE CASCADE would be silently ignored.
sqlite.pragma('foreign_keys = ON');

// Export a typed Drizzle client. Passing the schema enables relational query helpers.
export const db = drizzle(sqlite, { schema });
