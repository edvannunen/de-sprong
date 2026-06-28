import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	// Store Vite's cache outside Dropbox to avoid file-locking conflicts with Dropbox sync.
	cacheDir: 'C:/Users/edvan/AppData/Local/Temp/vite-cache/de-sprong',
	plugins: [sveltekit()],
	test: {
		// Run tests in a Node.js environment (not a browser).
		// This is appropriate for unit tests of pure logic like linkDetector.ts.
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
