// Server-side logic for the main page (piece list with tabs).
// The load() function fetches all categories and their pieces from the database.
// Form actions cover two areas:
//   - Category management: add, update (name + color), reorder, delete
//   - Piece CRUD: add, edit, delete

import { db } from '$lib/server/db';
import { category, piece } from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { asc, eq } from 'drizzle-orm';
import { requireDeleteAccess, requireSaveAccess } from '$lib/server/permissions';
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

	// ── CATEGORY ACTIONS ──

	// Create a new category with a name and color index.
	// Assigns the next available order value so it appears last in the tab row.
	addCategory: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const colorIndex = Number(data.get('colorIndex') ?? 0);

		if (!name) return fail(400, { error: 'Name is required' });

		// Place the new category at the end of the current order
		const existing = db.select().from(category).all();
		const nextOrder = existing.length > 0
			? Math.max(...existing.map((c) => c.order)) + 1
			: 1;

		db.insert(category).values({ name, colorIndex, order: nextOrder }).run();
	},

	// Update a category's name and/or color index.
	// Both fields are always submitted together from the edit panel.
	updateCategory: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));
		const name = (data.get('name') as string)?.trim();
		const colorIndex = Number(data.get('colorIndex') ?? 0);

		if (!id) return fail(400, { error: 'Invalid category id' });
		if (!name) return fail(400, { error: 'Name is required' });

		db.update(category).set({ name, colorIndex }).where(eq(category.id, id)).run();
	},

	// Reorder categories after a drag-and-drop.
	// The client submits a comma-separated list of ids in the new desired order.
	reorderCategories: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const ids = (data.get('ids') as string ?? '')
			.split(',')
			.map(Number)
			.filter(Boolean);

		for (let i = 0; i < ids.length; i++) {
			db.update(category).set({ order: i + 1 }).where(eq(category.id, ids[i])).run();
		}
	},

	// Delete a category — only allowed when it contains no pieces.
	// The server enforces this rule regardless of what the client shows.
	deleteCategory: async ({ request, locals }) => {
		const blocked = requireDeleteAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: 'Invalid category id' });

		// Refuse to delete if pieces still exist (they would cascade-delete unintentionally)
		const remaining = db.select().from(piece).where(eq(piece.categoryId, id)).all();
		if (remaining.length > 0) {
			return fail(400, { error: `Cannot delete: category still has ${remaining.length} piece(s)` });
		}

		db.delete(category).where(eq(category.id, id)).run();
	},

	// ── PIECE ACTIONS ──

	// Create a new piece in the given category and navigate to its detail page.
	addPiece: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

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
		redirect(303, `${base}/piece/${result.id}`);
	},

	// Update a piece's name and key from inline edit on the main page.
	editPiece: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

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
	deletePiece: async ({ request, locals }) => {
		const blocked = requireDeleteAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: 'Invalid piece id' });

		db.delete(piece).where(eq(piece.id, id)).run();
	}
};
