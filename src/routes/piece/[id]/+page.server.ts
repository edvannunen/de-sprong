// Server-side logic for the piece detail page.
// Loads the piece and its sources; handles edit, delete, and source CRUD actions.
// Also handles file attachment upload, serving, and deletion for sources.

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import { piece, source } from '$lib/server/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { asc, eq, max } from 'drizzle-orm';
import { requireDeleteAccess, requireSaveAccess } from '$lib/server/permissions';
import { fetchLinkTitle } from '$lib/server/linkTitle';
import type { Actions, PageServerLoad } from './$types';

// ── File upload helpers ──────────────────────────────────────────────────────

// Maps MIME types to the two attachment categories the app supports.
// Only these file types are accepted; anything else is silently ignored.
const ALLOWED_MIME_TYPES: Record<string, { attachmentType: string; ext: string }> = {
	'image/jpeg': { attachmentType: 'image', ext: '.jpg' },
	'image/png': { attachmentType: 'image', ext: '.png' },
	'image/gif': { attachmentType: 'image', ext: '.gif' },
	'image/webp': { attachmentType: 'image', ext: '.webp' },
	'application/pdf': { attachmentType: 'pdf', ext: '.pdf' }
};

// Saves an uploaded File to the uploads/ directory and returns metadata for storage.
// Returns null if no file was provided, if the file is empty, or if the type is not allowed.
async function saveUploadedFile(
	file: File | null
): Promise<{ filename: string; attachmentType: string } | null> {
	if (!file || file.size === 0) return null;

	const allowed = ALLOWED_MIME_TYPES[file.type];
	if (!allowed) return null;

	// Use a UUID so filenames are unique and never collide, even across users or renames.
	const filename = randomUUID() + allowed.ext;

	// Create uploads/ if it doesn't exist yet — this happens on first upload.
	const uploadsDir = join(process.cwd(), 'uploads');
	mkdirSync(uploadsDir, { recursive: true });

	const buffer = Buffer.from(await file.arrayBuffer());
	writeFileSync(join(uploadsDir, filename), buffer);

	return { filename, attachmentType: allowed.attachmentType };
}

// Deletes a previously uploaded file from the uploads/ directory.
// Safe to call with null (does nothing) and ignores errors if the file is already gone.
function deleteFile(filename: string | null | undefined) {
	if (!filename) return;
	const filePath = join(process.cwd(), 'uploads', filename);
	if (existsSync(filePath)) {
		try {
			unlinkSync(filePath);
		} catch {
			// If deletion fails (race condition, permissions), continue silently —
			// the database record will still be cleaned up.
		}
	}
}

// ── Page load ────────────────────────────────────────────────────────────────

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

// ── Actions ──────────────────────────────────────────────────────────────────

export const actions: Actions = {
	// Update the piece's own fields (name, key, info, top priority).
	editPiece: async ({ request, params, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

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

	// Delete the piece and redirect home to the tab it came from.
	// SQLite cascade removes all its sources.
	// Note: source files are NOT cleaned up here — cascade delete bypasses our deleteFile helper.
	// For a single-user local app this is acceptable; the uploads/ dir can be manually cleaned.
	deletePiece: async ({ params, locals }) => {
		const blocked = requireDeleteAccess(locals);
		if (blocked) return blocked;

		const id = Number(params.id);
		const existing = db.select().from(piece).where(eq(piece.id, id)).get();
		db.delete(piece).where(eq(piece.id, id)).run();
		redirect(303, existing ? `${base}/?tab=${existing.categoryId}` : `${base}/`);
	},

	// Add a new source to this piece, optionally with a file attachment.
	addSource: async ({ request, params, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const pieceId = Number(params.id);
		// request.formData() handles multipart/form-data automatically — no extra library needed.
		const data = await request.formData();
		let name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;
		const info = (data.get('info') as string) || null;
		const link = (data.get('link') as string)?.trim() || null;
		const file = data.get('attachment') as File | null;

		if (!name && link) name = (await fetchLinkTitle(link)) ?? '';
		if (!name) return fail(400, { error: 'Source name is required' });

		// Place the new source at the end of the list.
		const maxOrder = db
			.select({ value: max(source.order) })
			.from(source)
			.where(eq(source.pieceId, pieceId))
			.get();
		const nextOrder = (maxOrder?.value ?? -1) + 1;

		const saved = await saveUploadedFile(file);

		db.insert(source)
			.values({
				pieceId,
				name,
				key,
				info,
				link,
				order: nextOrder,
				// attachmentPath stores just the filename (e.g. "uuid.jpg").
				// The full filesystem path is uploads/filename; the URL is /uploads/filename.
				attachmentPath: saved?.filename ?? null,
				attachmentType: saved?.attachmentType ?? null,
				attachmentFilename: saved ? (file?.name ?? null) : null
			})
			.run();
	},

	// Update an existing source's fields. A new file upload replaces the old attachment;
	// submitting without a file leaves the existing attachment unchanged.
	editSource: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));
		let name = (data.get('name') as string)?.trim();
		const key = (data.get('key') as string) || null;
		const info = (data.get('info') as string) || null;
		const link = (data.get('link') as string)?.trim() || null;
		const file = data.get('attachment') as File | null;

		if (!id) return fail(400, { error: 'Invalid source id' });
		if (!name && link) name = (await fetchLinkTitle(link)) ?? '';
		if (!name) return fail(400, { error: 'Source name is required' });

		// Fetch the current record so we know whether there's an old file to delete.
		const existing = db.select().from(source).where(eq(source.id, id)).get();

		const saved = await saveUploadedFile(file);

		// If a new file was uploaded and the source already had one, delete the old file.
		if (saved && existing?.attachmentPath) {
			deleteFile(existing.attachmentPath);
		}

		db.update(source)
			.set({
				name,
				key,
				info,
				link,
				updatedAt: new Date().toISOString(),
				// Only overwrite attachment columns if a new file was actually uploaded.
				// Spreading conditionally lets us leave the existing attachment in place otherwise.
				...(saved
					? {
							attachmentPath: saved.filename,
							attachmentType: saved.attachmentType,
							attachmentFilename: file?.name ?? null
						}
					: {})
			})
			.where(eq(source.id, id))
			.run();
	},

	// Delete a source and its attachment file (if any).
	deleteSource: async ({ request, locals }) => {
		const blocked = requireDeleteAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid source id' });

		// Fetch the source before deleting so we can clean up its file.
		const existing = db.select().from(source).where(eq(source.id, id)).get();
		deleteFile(existing?.attachmentPath);

		db.delete(source).where(eq(source.id, id)).run();
	},

	// Remove the attachment from a source without deleting the source itself.
	// Used by the "Remove" button shown next to existing attachments in edit mode.
	deleteAttachment: async ({ request, locals }) => {
		const blocked = requireDeleteAccess(locals);
		if (blocked) return blocked;

		const data = await request.formData();
		const id = Number(data.get('id'));
		if (!id) return fail(400, { error: 'Invalid source id' });

		const existing = db.select().from(source).where(eq(source.id, id)).get();
		deleteFile(existing?.attachmentPath);

		db.update(source)
			.set({
				attachmentPath: null,
				attachmentType: null,
				attachmentFilename: null,
				updatedAt: new Date().toISOString()
			})
			.where(eq(source.id, id))
			.run();
	},

	// Toggle top_priority without entering full edit mode.
	// Called when the user clicks the checkbox in view mode.
	toggleTopPriority: async ({ request, params, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

		const id = Number(params.id);
		const data = await request.formData();
		const topPriority = data.has('topPriority');

		db.update(piece)
			.set({ topPriority, updatedAt: new Date().toISOString() })
			.where(eq(piece.id, id))
			.run();
	},

	// Update the display order of all sources after a drag-and-drop.
	// Receives a comma-separated list of source IDs in the new order.
	reorderSources: async ({ request, locals }) => {
		const blocked = requireSaveAccess(locals);
		if (blocked) return blocked;

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
