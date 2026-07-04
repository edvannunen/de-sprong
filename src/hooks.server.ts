// Runs on every request. Populates locals.user from the session cookie and
// redirects any request that isn't the login page (or a static asset) to /login
// when there's no logged-in user. Guest and admin share full access — the only
// role check anywhere in the app lives in the /account route itself.

import { redirect, type Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { getSessionUser } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = getSessionUser(event.cookies);

	// event.route.id excludes the /de-sprong base prefix (e.g. '/login', '/piece/[id]'),
	// and is null for requests that don't match any route (static assets, 404s) —
	// those are let through untouched rather than redirected.
	const isPublicRoute = event.route.id === null || event.route.id === '/login';

	if (!isPublicRoute && !event.locals.user) {
		// event.url.pathname already includes the /de-sprong base prefix, so it's
		// used as-is here rather than prepending base a second time.
		const redirectTo = event.url.pathname + event.url.search;
		redirect(303, `${base}/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	return resolve(event);
};
