// Session management: opaque random tokens in a cookie, hashed before they're
// stored in the database — a leaked DB dump never yields a usable session.
// Sessions use sliding expiration: renewed to a fresh 30 days whenever less than
// half the lifetime remains, so an active user is never logged out but an
// abandoned session still dies within 30 days of last use.

import { createHash, randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import { base } from '$app/paths';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { session, user } from './schema';

const SESSION_COOKIE_NAME = 'session';
const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RENEW_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 15; // renew once less than half remains

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAgeMs: number) {
	return {
		path: base,
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: !dev,
		maxAge: Math.floor(maxAgeMs / 1000)
	};
}

// Creates a new session for the given user and sets the session cookie.
export function createSession(cookies: Cookies, userId: number): void {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

	db.insert(session)
		.values({ id: hashToken(token), userId, expiresAt: expiresAt.toISOString() })
		.run();

	cookies.set(SESSION_COOKIE_NAME, token, cookieOptions(SESSION_LIFETIME_MS));
}

// Reads the session cookie, validates it against the database, and renews it if
// it's more than half expired. Returns the logged-in user, or null if not logged in
// (also clearing an invalid/expired cookie in that case).
export function getSessionUser(
	cookies: Cookies
): { id: number; username: string; isAdmin: boolean } | null {
	const token = cookies.get(SESSION_COOKIE_NAME);
	if (!token) return null;

	const tokenHash = hashToken(token);
	const row = db
		.select({
			userId: user.id,
			username: user.username,
			isAdmin: user.isAdmin,
			expiresAt: session.expiresAt
		})
		.from(session)
		.innerJoin(user, eq(session.userId, user.id))
		.where(eq(session.id, tokenHash))
		.get();

	if (!row || new Date(row.expiresAt).getTime() <= Date.now()) {
		db.delete(session).where(eq(session.id, tokenHash)).run();
		cookies.delete(SESSION_COOKIE_NAME, { path: base });
		return null;
	}

	const msRemaining = new Date(row.expiresAt).getTime() - Date.now();
	if (msRemaining < RENEW_THRESHOLD_MS) {
		const newExpiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
		db.update(session)
			.set({ expiresAt: newExpiresAt.toISOString() })
			.where(eq(session.id, tokenHash))
			.run();
		cookies.set(SESSION_COOKIE_NAME, token, cookieOptions(SESSION_LIFETIME_MS));
	}

	return { id: row.userId, username: row.username, isAdmin: row.isAdmin };
}

// Deletes the session tied to the current request's cookie (used by logout).
export function destroySession(cookies: Cookies): void {
	const token = cookies.get(SESSION_COOKIE_NAME);
	if (token) {
		db.delete(session).where(eq(session.id, hashToken(token))).run();
	}
	cookies.delete(SESSION_COOKIE_NAME, { path: base });
}

// Deletes every session belonging to a user. Used when the admin sets a new
// guest password, so a stale, still-valid guest session can't keep working.
export function destroyAllSessionsForUser(userId: number): void {
	db.delete(session).where(eq(session.userId, userId)).run();
}
