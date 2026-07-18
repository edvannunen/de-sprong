// Client-side counterpart to $lib/server/permissions.ts. Every use:enhance callback
// that follows a save/delete action checks the result with this helper first — if the
// server rejected it (guest account), it alerts the Dutch message and the caller bails
// out without applying its optimistic UI changes.

import type { ActionResult } from '@sveltejs/kit';

export function blockedByGuestGuard(result: ActionResult): boolean {
	if (result.type === 'failure' && typeof result.data?.error === 'string') {
		alert(result.data.error);
		return true;
	}
	return false;
}
