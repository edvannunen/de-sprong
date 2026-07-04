// Exposes the logged-in user (populated by hooks.server.ts) to every page,
// so +layout.svelte can render the account/logout header.

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	return { user: locals.user };
};
