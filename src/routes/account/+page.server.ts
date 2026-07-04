// Admin-only account page — this is the one deliberate role check in the app;
// every other route treats admin and guest identically. Two actions:
// changing the admin's own password (requires the current password), and
// setting a brand-new guest password (the admin doesn't need the old one).

import { db } from '$lib/server/db';
import { user } from '$lib/server/schema';
import { hashPassword, verifyPassword } from '$lib/server/password';
import { destroyAllSessionsForUser } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.user?.isAdmin) {
		redirect(303, `${base}/`);
	}

	const guest = db.select().from(user).where(eq(user.isAdmin, false)).get();
	return { guestUsername: guest?.username ?? null };
};

export const actions: Actions = {
	// Changing your own password requires proving you know the current one.
	changeOwnPassword: async ({ request, locals }) => {
		const data = await request.formData();
		const currentPassword = data.get('currentPassword') as string;
		const newPassword = data.get('newPassword') as string;
		const confirmNewPassword = data.get('confirmNewPassword') as string;

		const me = db.select().from(user).where(eq(user.id, locals.user!.id)).get();
		if (!me || !verifyPassword(currentPassword, me.passwordHash)) {
			return fail(400, { ownError: 'Current password is incorrect' });
		}
		if (!newPassword || newPassword !== confirmNewPassword) {
			return fail(400, { ownError: 'New passwords do not match' });
		}

		db.update(user).set({ passwordHash: hashPassword(newPassword) }).where(eq(user.id, me.id)).run();
		return { ownSuccess: true };
	},

	// The admin can set a new guest password outright — no old password needed.
	// This also kills any existing guest session, so a previously shared
	// password actually stops working immediately, not just on next login.
	setGuestPassword: async ({ request }) => {
		const data = await request.formData();
		const newPassword = data.get('newGuestPassword') as string;
		const confirmNewPassword = data.get('confirmNewGuestPassword') as string;

		if (!newPassword || newPassword !== confirmNewPassword) {
			return fail(400, { guestError: 'New passwords do not match' });
		}

		const guest = db.select().from(user).where(eq(user.isAdmin, false)).get();
		if (!guest) {
			return fail(400, { guestError: 'No guest account exists' });
		}

		db.update(user).set({ passwordHash: hashPassword(newPassword) }).where(eq(user.id, guest.id)).run();
		destroyAllSessionsForUser(guest.id);
		return { guestSuccess: true };
	}
};
