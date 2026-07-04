// Seeds the initial admin and guest accounts from .env.
// Run with: npm run db:seed-users
// Idempotent by role: if an admin (or guest) row already exists, it's left
// alone — rotating a password afterwards happens through the /account page,
// not by re-running this script.

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from '../src/lib/server/schema';
import { hashPassword } from '../src/lib/server/password';

// Load .env if one exists (local dev). On most PaaS hosts the 4 vars below are
// injected directly into the environment instead, so a missing file is fine.
try {
	process.loadEnvFile();
} catch {
	// No .env file — rely on already-set environment variables.
}

const sqlite = new Database('data/de-sprong.db');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`Missing required env var: ${name}`);
	return value;
}

const accounts = [
	{
		isAdmin: true,
		username: requireEnv('ADMIN_USERNAME'),
		password: requireEnv('ADMIN_PASSWORD')
	},
	{
		isAdmin: false,
		username: requireEnv('GUEST_USERNAME'),
		password: requireEnv('GUEST_PASSWORD')
	}
];

for (const account of accounts) {
	const existing = db
		.select()
		.from(schema.user)
		.where(eq(schema.user.isAdmin, account.isAdmin))
		.get();

	const role = account.isAdmin ? 'admin' : 'guest';

	if (existing) {
		console.log(`Skipped (${role} already exists): ${existing.username}`);
		continue;
	}

	db.insert(schema.user)
		.values({
			username: account.username,
			passwordHash: hashPassword(account.password),
			isAdmin: account.isAdmin
		})
		.run();
	console.log(`Created ${role}: ${account.username}`);
}

console.log('Seed complete.');
sqlite.close();
