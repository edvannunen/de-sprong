import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	// Run the dev server before starting e2e tests
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:5173'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
