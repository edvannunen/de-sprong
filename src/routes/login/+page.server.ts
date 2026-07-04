// Login page. Already-logged-in visitors are bounced back to the main page;
// the login action verifies credentials, starts a session, and redirects on
// to wherever the user was originally headed (validated to stay inside the app).

import { db } from '$lib/server/db';
import { user } from '$lib/server/schema';
import { verifyPassword } from '$lib/server/password';
import { createSession } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

// Only allow redirecting back to a path inside the app — never to another
// origin — so a crafted `?redirectTo=` link can't be used as an open redirect.
function safeRedirectTarget(redirectTo: string | null): string {
	if (redirectTo && redirectTo.startsWith(`${base}/`) && !redirectTo.includes('://')) {
		return redirectTo;
	}
	return `${base}/`;
}

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) {
		redirect(303, safeRedirectTarget(url.searchParams.get('redirectTo')));
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = (data.get('username') as string)?.trim();
		const password = data.get('password') as string;
		const redirectTo = data.get('redirectTo') as string | null;

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required' });
		}

		// Case-insensitive lookup — "ed", "Ed", and "ED" should all match the same
		// account, while the stored username keeps its original display casing.
		const found = db
			.select()
			.from(user)
			.where(sql`lower(${user.username}) = lower(${username})`)
			.get();

		// Same generic error whether the username or the password is wrong —
		// with only 2 fixed accounts there's no meaningful secret in "which".
		if (!found || !verifyPassword(password, found.passwordHash)) {
			return fail(400, { error: 'Invalid username or password' });
		}

		createSession(cookies, found.id);
		redirect(303, safeRedirectTarget(redirectTo));
	}
};
