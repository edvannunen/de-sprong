// Server-side logic for the main page (piece list with tabs).
// The load() function fetches all categories and their pieces from the database.
// Form actions handle adding, editing, and deleting pieces.

import { db } from '$lib/server/db';
import { category, piece } from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch categories in display order, then all pieces in one query.
	// We join them in JavaScript to avoid needing Drizzle's relational query setup.
	const categories = db.select().from(category).orderBy(asc(category.order)).all();
	const pieces = db.select().from(piece).all();

	return {
		categories: categories.map((cat) => ({
			...cat,
			// Keep only pieces belonging to this category, sorted:
			// top_priority pieces first, then alphabetically by name.
			pieces: pieces
				.filter((p) => p.categoryId === cat.id)
				.sort((a, b) => {
					if (a.topPriority !== b.topPriority) return a.topPriority ? -1 : 1;
					return a.name.localeCompare(b.name);
				})
		}))
	};
};

export const actions: Actions = {
	// Create a new piece in the given category and navigate to its detail page.
	addPiece: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const categoryId = Number(data.get('categoryId'));
		const key = (data.get('key') as string) || null;

		if (!name) return fail(400, { error: 'Name is required' });
		if (!categoryId) return fail(400, { error: 'Category is required' });

		const result = db
			.insert(piece)
			.values({ name, categoryId, key })
			.returning({ id: piece.id })
			.get();

		// Redirect to the detail page so the user can add sources and more info.
		redirect(303, `/piece/${result.id}`);
	},

	// Update a piece's name and key from inline edit on the main page.
	editPiece: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));
		const name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;

		if (!id) return fail(400, { error: 'Invalid piece id' });
		if (!name) return fail(400, { error: 'Name is required' });

		db.update(piece)
			.set({ name, key, updatedAt: new Date().toISOString() })
			.where(eq(piece.id, id))
			.run();
	},

	// Delete a piece (its sources are removed automatically via SQLite cascade).
	deletePiece: async ({ request }) => {
		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: 'Invalid piece id' });

		db.delete(piece).where(eq(piece.id, id)).run();
	}
};
