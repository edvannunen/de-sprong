// Database schema for De Sprong.
// Three tables: category → piece → source, with cascading deletes at each level.
// Drizzle reads this file to generate SQL migrations via `npm run db:migrate`.

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// A category is a user-managed tab on the main page.
// Categories can be added, renamed, recolored, reordered, and deleted (when empty).
export const category = sqliteTable('category', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	order: integer('order').notNull().default(0),
	// Index into the PALETTE array in src/lib/constants.ts (0–5).
	// Existing rows get 0 (sky blue) when this migration runs.
	colorIndex: integer('color_index').notNull().default(0)
});

// A piece is a single song or exercise the user is practising.
// top_priority pieces sort to the top of the list and get a different icon (♩ vs ♫).
export const piece = sqliteTable('piece', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// When a category is deleted, all its pieces are deleted automatically (cascade).
	categoryId: integer('category_id')
		.notNull()
		.references(() => category.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	info: text('info'), // optional free-text notes
	key: text('key'), // e.g. "Am" — selected from KEY_OPTIONS dropdown
	topPriority: integer('top_priority', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

// A source is a study resource linked to a piece: a YouTube/Spotify URL,
// a file attachment (image or PDF), or just a note with a name and info.
// Sources can be reordered via drag-and-drop; the order column stores their position.
// A user account — exactly two rows in practice: the admin ("Ed") and a guest
// account that can be handed out and later revoked by rotating its password.
// Both have identical read/write access; isAdmin only gates the /account page.
export const user = sqliteTable('user', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

// A login session. The id column stores the SHA-256 hash of the session token,
// never the raw token — the raw token only ever lives in the browser's cookie,
// so a leaked database dump can't be used to impersonate a logged-in user.
export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

export const source = sqliteTable('source', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	// When a piece is deleted, all its sources (and their files) are deleted automatically.
	pieceId: integer('piece_id')
		.notNull()
		.references(() => piece.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	info: text('info'),
	key: text('key'),
	link: text('link'), // YouTube, Spotify, or any URL — converted to embed in the UI
	attachmentPath: text('attachment_path'), // server filesystem path to the uploaded file
	attachmentType: text('attachment_type'), // "image" or "pdf"
	attachmentFilename: text('attachment_filename'), // original filename shown to the user
	order: integer('order').notNull().default(0),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});
