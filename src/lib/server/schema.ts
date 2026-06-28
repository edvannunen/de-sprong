// Database schema for De Sprong.
// Three tables: category → piece → source, with cascading deletes at each level.
// Drizzle reads this file to generate SQL migrations via `npm run db:migrate`.

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// A category is a tab on the main page (e.g. "Songs", "Exercises").
// The order column is reserved for future dynamic tab reordering.
export const category = sqliteTable('category', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	order: integer('order').notNull().default(0)
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
