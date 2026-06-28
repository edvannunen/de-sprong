<!--
  Main page — tabbed piece list.
  Shows one tab per category (Songs, Exercises).
  Each tab lists its pieces sorted by priority then name, with inline edit and delete.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { KEY_OPTIONS } from '$lib/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Which tab is active (index into data.categories)
	let activeTab = $state(0);

	// The id of the piece currently being edited inline (null = none)
	let editingId = $state<number | null>(null);

	// The pieces belonging to the active category
	let activePieces = $derived(data.categories[activeTab]?.pieces ?? []);
	let activeCategoryId = $derived(data.categories[activeTab]?.id);
</script>

<!-- Top banner — shadow gives it depth; opacity toned down so it doesn't overpower the content -->
<div class="max-w-2xl mx-auto border-y border-base-300 shadow-md">
	<img src="/img/banner_piece.png" alt="De Sprong" class="w-full opacity-50" />
</div>

<main class="max-w-2xl mx-auto px-4 py-6">

	<!-- Category tabs — tabs-lifted gives a clear border around each tab -->
	<div class="tabs tabs-lifted mb-4" role="tablist">
		{#each data.categories as cat, i}
			<button
				role="tab"
				class="tab {activeTab === i ? 'tab-active' : ''}"
				onclick={() => { activeTab = i; editingId = null; }}
			>
				{cat.name}
			</button>
		{/each}
	</div>

	<!-- Inline add form — creates a new piece in the active category -->
	<form method="POST" action="?/addPiece" use:enhance class="mb-4 flex gap-2 items-center">
		<input type="hidden" name="categoryId" value={activeCategoryId} />
		<input
			type="text"
			name="name"
			placeholder="New piece name…"
			class="input input-bordered input-sm flex-1"
			required
			oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
			oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
		/>
		<select name="key" class="select select-bordered select-sm w-20">
			<option value="">Key</option>
			{#each KEY_OPTIONS as k}
				<option value={k}>{k}</option>
			{/each}
		</select>
		<button type="submit" class="btn btn-sm btn-primary">+ Add</button>
	</form>

	<!-- Piece list table -->
	{#if activePieces.length === 0}
		<p class="text-base-content/50 text-sm">No pieces yet. Add one above.</p>
	{:else}
		<table class="table table-zebra w-full">
			<tbody>
				{#each activePieces as p (p.id)}
					{#if editingId === p.id}
						<!-- EDIT ROW -->
						<tr>
							<td class="w-[85%]">
								<form
									id="edit-form-{p.id}"
									method="POST"
									action="?/editPiece"
									use:enhance={() => {
										return async ({ update }) => {
											// After saving, close edit mode then refresh the page data
											editingId = null;
											await update();
										};
									}}
								>
									<input type="hidden" name="id" value={p.id} />
									<input
										type="text"
										name="name"
										value={p.name}
										class="input input-bordered input-sm w-full"
										required
										autofocus
										oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
										oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
									/>
								</form>
							</td>
							<td class="w-[8%]">
								<select name="key" form="edit-form-{p.id}" class="select select-bordered select-sm w-full">
									<option value="">—</option>
									{#each KEY_OPTIONS as k}
										<option value={k} selected={p.key === k}>{k}</option>
									{/each}
								</select>
							</td>
							<td class="text-right whitespace-nowrap">
								<button type="submit" form="edit-form-{p.id}" class="btn btn-sm btn-primary">Save</button>
								<button type="button" class="btn btn-sm btn-ghost" onclick={() => editingId = null}>Cancel</button>
							</td>
						</tr>
					{:else}
						<!-- VIEW ROW -->
						<tr>
							<td class="w-[85%]">
								<!-- Music note icon: ♩ for top priority, ♫ for regular -->
								<span class="mr-1 text-amber-600">{p.topPriority ? '♩' : '♫'}</span>
								<a href="/piece/{p.id}" class="font-medium hover:underline">{p.name}</a>
								{#if p.info}
									<p class="text-sm text-base-content/60 line-clamp-2 mt-0.5">{p.info}</p>
								{/if}
							</td>
							<td class="w-[8%] text-sm text-base-content/70">{p.key ?? ''}</td>
							<td class="text-right whitespace-nowrap">
								<button
									type="button"
									class="btn btn-sm btn-ghost"
									onclick={() => editingId = p.id}
								>Edit</button>

								<!-- Delete: confirm first, then submit a hidden form -->
								<form method="POST" action="?/deletePiece" use:enhance class="inline">
									<input type="hidden" name="id" value={p.id} />
									<button
										type="submit"
										class="btn btn-sm btn-ghost text-error"
										onclick={(e) => {
											if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
												e.preventDefault();
											}
										}}
									>Delete</button>
								</form>
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
	{/if}

</main>

<!-- Footer -->
<div class="max-w-2xl mx-auto mt-8 border-y border-base-300">
	<img src="/img/footer.png" alt="" class="w-full opacity-50" />
</div>
