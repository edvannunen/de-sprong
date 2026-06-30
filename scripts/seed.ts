// Seed script — creates the two default categories: "Songs" and "Exercises".
// Run with: npm run db:seed
// Safe to run multiple times: skips insert if categories already exist.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/schema';

const sqlite = new Database('data/de-sprong.db');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

const defaults = [
	{ name: 'Songs', order: 1, colorIndex: 0 },      // sky blue
	{ name: 'Exercises', order: 2, colorIndex: 1 }   // violet
];

for (const cat of defaults) {
	// Check whether this category already exists before inserting,
	// so re-running the seed doesn't create duplicates.
	const existing = db
		.select()
		.from(schema.category)
		.where(eq(schema.category.name, cat.name))
		.all();

	if (existing.length === 0) {
		db.insert(schema.category).values(cat).run();
		console.log(`Created category: ${cat.name}`);
	} else {
		console.log(`Skipped (already exists): ${cat.name}`);
	}
}

console.log('Seed complete.');
sqlite.close();
