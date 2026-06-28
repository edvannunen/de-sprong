// Server-side logic for the piece detail page.
// Loads the piece and its sources; handles edit, delete, and source CRUD actions.

import { db } from '$lib/server/db';
import { piece, source } from '$lib/server/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq, max } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!id) throw error(404, 'Piece not found');

	const pieceData = db.select().from(piece).where(eq(piece.id, id)).get();
	if (!pieceData) throw error(404, 'Piece not found');

	// Load sources in saved display order (set by drag-and-drop)
	const sources = db
		.select()
		.from(source)
		.where(eq(source.pieceId, id))
		.orderBy(asc(source.order))
		.all();

	return { piece: pieceData, sources };
};

export const actions: Actions = {
	// Update the piece's own fields (name, key, info, top priority).
	editPiece: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;
		const info = (data.get('info') as string) || null;
		// Checkboxes only appear in form data when checked.
		const topPriority = data.has('topPriority');

		if (!name) return fail(400, { error: 'Name is required' });

		db.update(piece)
			.set({ name, key, info, topPriority, updatedAt: new Date().toISOString() })
			.where(eq(piece.id, id))
			.run();
	},

	// Delete the piece and redirect home. SQLite cascade removes all its sources.
	deletePiece: async ({ params }) => {
		const id = Number(params.id);
		db.delete(piece).where(eq(piece.id, id)).run();
		redirect(303, '/');
	},

	// Add a new source to this piece.
	addSource: async ({ request, params }) => {
		const pieceId = Number(params.id);
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;
		const info = (data.get('info') as string) || null;
		const link = (data.get('link') as string)?.trim() || null;

		if (!name) return fail(400, { error: 'Source name is required' });

		// Place the new source at the end of the list.
		const maxOrder = db
			.select({ value: max(source.order) })
			.from(source)
			.where(eq(source.pieceId, pieceId))
			.get();
		const nextOrder = (maxOrder?.value ?? -1) + 1;

		db.insert(source).values({ pieceId, name, key, info, link, order: nextOrder }).run();
	},

	// Update an existing source's fields.
	editSource: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;
		const info = (data.get('info') as string) || null;
		const link = (data.get('link') as string)?.trim() || null;

		if (!id) return fail(400, { error: 'Invalid source id' });
		if (!name) return fail(400, { error: 'Source name is required' });

		db.update(source)
			.set({ name, key, info, link, updatedAt: new Date().toISOString() })
			.where(eq(source.id, id))
			.run();
	},

	// Delete a source. No file cleanup needed (attachments not implemented yet).
	deleteSource: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid source id' });
		db.delete(source).where(eq(source.id, id)).run();
	},

	// Update the display order of all sources after a drag-and-drop.
	// Receives a comma-separated list of source IDs in the new order.
	reorderSources: async ({ request }) => {
		const data = await request.formData();
		const ids = (data.get('ids') as string)
			.split(',')
			.map(Number)
			.filter((n) => !isNaN(n) && n > 0);

		for (let i = 0; i < ids.length; i++) {
			db.update(source).set({ order: i }).where(eq(source.id, ids[i])).run();
		}
	}
};
