// Logout endpoint — deletes the current session and sends the user back to /login.
// A POST-only +server.ts (rather than a page) since this route has no UI of its own.

import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { destroySession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies }) => {
	destroySession(cookies);
	redirect(303, `${base}/login`);
};
