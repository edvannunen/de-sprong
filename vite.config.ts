import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Store Vite's cache outside Dropbox to avoid file-locking conflicts with Dropbox sync.
	cacheDir: 'C:/Users/edvan/AppData/Local/Temp/vite-cache/de-sprong',
	plugins: [
		tailwindcss(),
		sveltekit()
	]
});
