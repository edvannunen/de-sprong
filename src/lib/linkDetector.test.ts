import { describe, it, expect } from 'vitest';
import { detectLink } from './linkDetector';

describe('detectLink', () => {
	it('returns none for null', () => {
		expect(detectLink(null)).toEqual({ type: 'none' });
	});

	it('returns none for empty string', () => {
		expect(detectLink('')).toEqual({ type: 'none' });
	});

	it('returns none for whitespace', () => {
		expect(detectLink('   ')).toEqual({ type: 'none' });
	});

	it('detects youtube.com/watch?v= URL', () => {
		const result = detectLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
		expect(result).toEqual({
			type: 'youtube',
			embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
		});
	});

	it('detects youtu.be short URL', () => {
		const result = detectLink('https://youtu.be/dQw4w9WgXcQ');
		expect(result).toEqual({
			type: 'youtube',
			embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
		});
	});

	it('detects Spotify track URL', () => {
		const result = detectLink('https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC');
		expect(result).toEqual({
			type: 'spotify',
			embedUrl: 'https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC'
		});
	});

	it('returns link for a plain https URL', () => {
		const result = detectLink('https://example.com/sheet.pdf');
		expect(result).toEqual({ type: 'link', url: 'https://example.com/sheet.pdf' });
	});

	it('returns link for a plain http URL', () => {
		const result = detectLink('http://example.com');
		expect(result).toEqual({ type: 'link', url: 'http://example.com' });
	});

	it('returns none for a non-URL string', () => {
		expect(detectLink('not a url')).toEqual({ type: 'none' });
	});
});
