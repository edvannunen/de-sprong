<!--
  Small username menu overlaid on the top banner. Opens on click/tap (not
  hover — a hover-triggered dropdown closes the instant the mouse leaves the
  narrow gap between trigger and menu, which made it nearly unclickable on
  desktop). Clicking the trigger focuses it, which opens the menu via
  :focus-within and keeps it open until focus moves elsewhere — this also
  works naturally on mobile taps. Admins see "Account" + "Log out"; guests
  only see "Log out".
-->
<script lang="ts">
	import { base } from '$app/paths';

	let { user }: { user: { username: string; isAdmin: boolean } } = $props();

	// Dark honey — the same color as the primary buttons (btn-primary) and the
	// wooden category-tab palette, so the overlay reads as part of the same brand.
	const HONEY = '#92400E';
</script>

<div class="dropdown dropdown-end">
	<div
		tabindex="0"
		role="button"
		class="flex items-center gap-1 font-semibold cursor-pointer select-none text-sm sm:text-base"
		style="color: {HONEY}"
	>
		{user.username}
		<span class="text-[10px]">▾</span>
	</div>
	<div
		class="dropdown-content z-20 mt-1 w-32 overflow-hidden rounded-lg bg-base-100 text-sm shadow-md"
		style="border: 1px solid {HONEY}44"
	>
		{#if user.isAdmin}
			<a href="{base}/account" class="block px-3 py-2 hover:bg-base-200" style="color: {HONEY}">
				Account
			</a>
		{/if}
		<form method="POST" action="{base}/logout">
			<button
				type="submit"
				class="block w-full px-3 py-2 text-left hover:bg-base-200"
				style="color: {HONEY}"
			>
				Log out
			</button>
		</form>
	</div>
</div>
