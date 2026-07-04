<!--
  Account settings — visible to the admin only (guarded in +page.server.ts).
  Two independent forms: change my own password, and set a new guest password.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { base } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Account — De Sprong</title>
</svelte:head>

<div class="max-w-sm mx-auto py-8 flex flex-col gap-8">
	<div class="flex flex-col items-center gap-2">
		<img src="{base}/img/desprong_logo.png" alt="De Sprong" class="h-40" />
		<h1 class="text-xl font-semibold">Account</h1>
	</div>

	<!-- The account page only needs a way back and a way out — no duplicate user menu here. -->
	<div class="flex justify-between text-sm">
		<a href="{base}/" class="link link-hover" style="color: #92400E">&larr; Back</a>
		<form method="POST" action="{base}/logout">
			<button type="submit" class="link link-hover" style="color: #92400E">Log out</button>
		</form>
	</div>

	<form method="POST" action="?/changeOwnPassword" use:enhance class="flex flex-col gap-2">
		<h2 class="font-medium">Change my password</h2>
		<input
			type="password"
			name="currentPassword"
			placeholder="Current password"
			class="input input-bordered input-sm w-full"
			required
		/>
		<input
			type="password"
			name="newPassword"
			placeholder="New password"
			class="input input-bordered input-sm w-full"
			required
		/>
		<input
			type="password"
			name="confirmNewPassword"
			placeholder="Confirm new password"
			class="input input-bordered input-sm w-full"
			required
		/>
		{#if form?.ownError}
			<p class="text-error text-sm">{form.ownError}</p>
		{/if}
		{#if form?.ownSuccess}
			<p class="text-success text-sm">Password updated.</p>
		{/if}
		<button type="submit" class="btn btn-sm btn-primary">Save</button>
	</form>

	<form method="POST" action="?/setGuestPassword" use:enhance class="flex flex-col gap-2">
		<h2 class="font-medium">
			Set guest password
			{#if data.guestUsername}
				<span class="font-normal text-base-content/50">({data.guestUsername})</span>
			{/if}
		</h2>
		<p class="text-xs text-base-content/50">
			Also signs the guest out everywhere — the old password stops working immediately.
		</p>
		<input
			type="password"
			name="newGuestPassword"
			placeholder="New guest password"
			class="input input-bordered input-sm w-full"
			required
		/>
		<input
			type="password"
			name="confirmNewGuestPassword"
			placeholder="Confirm new guest password"
			class="input input-bordered input-sm w-full"
			required
		/>
		{#if form?.guestError}
			<p class="text-error text-sm">{form.guestError}</p>
		{/if}
		{#if form?.guestSuccess}
			<p class="text-success text-sm">Guest password updated.</p>
		{/if}
		<button type="submit" class="btn btn-sm btn-primary">Save</button>
	</form>
</div>
