// Lightweight lookup the source form calls right after a YouTube/Spotify link is
// pasted, so the "Name" field can autofill client-side before the user even submits.
// Read-only and doesn't touch the database — hooks.server.ts already requires a
// logged-in user (guest or admin) for every route but /login, so no extra guard here.

import { json } from '@sveltejs/kit';
import { fetchLinkTitle } from '$lib/server/linkTitle';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const link = url.searchParams.get('link')?.trim();
	if (!link) return json({ title: null });

	const title = await fetchLinkTitle(link);
	return json({ title });
};
