// File-serving route for uploaded attachments.
// Reads files from the uploads/ directory at the project root and streams them
// to the browser with the correct Content-Type header.
// This avoids putting user uploads inside static/ (which is bundled with the build).

import { existsSync, readFileSync } from 'fs';
import { extname, join } from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Maps file extensions to their MIME types so browsers know how to display them.
const MIME_TYPES: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.pdf': 'application/pdf'
};

export const GET: RequestHandler = ({ params }) => {
	const filename = params.filename;

	// Block path traversal attacks: a legitimate filename is just "uuid.ext",
	// never a path with slashes or parent-directory segments.
	if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
		throw error(400, 'Invalid filename');
	}

	const filePath = join(process.cwd(), 'uploads', filename);

	if (!existsSync(filePath)) {
		throw error(404, 'File not found');
	}

	const ext = extname(filename).toLowerCase();
	const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
	const file = readFileSync(filePath);

	return new Response(file, {
		headers: { 'Content-Type': contentType }
	});
};
