import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	// The TypeScript schema file where we define our tables
	schema: './src/lib/server/schema.ts',
	// Where Drizzle Kit will write the generated SQL migration files
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: './de-sprong.db'
	}
});
