<!--
  Login page — the only route reachable without a session (see src/hooks.server.ts).
  Submits to the default action in +page.server.ts, which verifies credentials,
  starts a session, and redirects back to wherever the user was headed.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const redirectTo = page.url.searchParams.get('redirectTo') ?? '';
</script>

<svelte:head>
	<title>Log in — De Sprong</title>
</svelte:head>

<div class="flex justify-center pt-16">
	<form method="POST" use:enhance class="w-full max-w-xs flex flex-col gap-3">
		<div class="flex flex-col items-center gap-2 mb-2">
			<img src="{base}/img/desprong_logo.png" alt="De Sprong" class="h-48" />
			<h1 class="text-xl font-semibold">De Sprong</h1>
		</div>

		<input type="hidden" name="redirectTo" value={redirectTo} />

		<input
			type="text"
			name="username"
			placeholder="Username"
			class="input input-bordered w-full"
			autofocus
			required
		/>
		<input
			type="password"
			name="password"
			placeholder="Password"
			class="input input-bordered w-full"
			required
		/>

		{#if form?.error}
			<p class="text-error text-sm">{form.error}</p>
		{/if}

		<button type="submit" class="btn btn-primary w-full">Log in</button>
	</form>
</div>
