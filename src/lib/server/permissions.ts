// Write-access guard for form actions. The guest account (any non-admin user) can see
// every button and link — nothing is hidden — but every action that changes data is
// rejected here with a Dutch message, so a shared guest link can't be used to edit or
// delete anything. isAdmin is the only distinction; see schema.ts.

import { fail } from '@sveltejs/kit';

type Locals = App.Locals;

export function requireSaveAccess(locals: Locals) {
	if (!locals.user?.isAdmin) {
		return fail(403, { error: 'Niet genoeg rechten om op te slaan' });
	}
	return null;
}

export function requireDeleteAccess(locals: Locals) {
	if (!locals.user?.isAdmin) {
		return fail(403, { error: 'Niet genoeg rechten om te verwijderen' });
	}
	return null;
}
