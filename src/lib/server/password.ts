// Password hashing for the two fixed accounts (admin + guest).
// Uses Node's built-in crypto (scrypt) instead of adding a hashing dependency —
// this app only ever has 2 accounts, so scrypt + a random salt is plenty.

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

// Returns "saltHex:hashHex", ready to store in user.passwordHash.
export function hashPassword(password: string): string {
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, KEY_LENGTH);
	return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

// Re-derives the hash using the stored salt and compares in constant time.
export function verifyPassword(password: string, stored: string): boolean {
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return false;

	const salt = Buffer.from(saltHex, 'hex');
	const expected = Buffer.from(hashHex, 'hex');
	const actual = scryptSync(password, salt, expected.length);

	// timingSafeEqual throws if the buffers differ in length, so guard first.
	if (actual.length !== expected.length) return false;
	return timingSafeEqual(actual, expected);
}
