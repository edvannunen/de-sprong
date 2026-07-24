import { describe, expect, it } from 'vitest';
import { getRelativeMajor } from './keySignature';

describe('getRelativeMajor', () => {
	it('returns null for no key', () => {
		expect(getRelativeMajor(null)).toBeNull();
		expect(getRelativeMajor(undefined)).toBeNull();
		expect(getRelativeMajor('')).toBeNull();
	});

	it('maps major keys to themselves', () => {
		expect(getRelativeMajor('C')).toBe('C');
		expect(getRelativeMajor('Gb')).toBe('Gb');
	});

	it('maps minor keys to their relative major', () => {
		expect(getRelativeMajor('Am')).toBe('C');
		expect(getRelativeMajor('Em')).toBe('G');
		expect(getRelativeMajor('Bm')).toBe('D');
		expect(getRelativeMajor('Dm')).toBe('F');
		expect(getRelativeMajor('Ebm')).toBe('Gb');
		expect(getRelativeMajor('Bbm')).toBe('Db');
	});
});
