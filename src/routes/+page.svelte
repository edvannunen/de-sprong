<!--
  Main page — tabbed piece list.
  Categories are fully user-managed: add, rename, recolor, drag-to-reorder, delete (when empty).
  Each tab shows its pieces with a name/key filter and inline edit.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { KEY_OPTIONS, PALETTE } from '$lib/constants';
	import { dndzone } from 'svelte-dnd-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Track the active tab by category ID rather than by array index.
	// This keeps the correct tab highlighted even after drag-and-drop reordering.
	// On load, restore the tab from the ?tab= param (set by the back link on the detail page).
	const tabParam = Number(page.url.searchParams.get('tab'));
	let activeTabId = $state<number | null>(
		tabParam && data.categories.some((c) => c.id === tabParam)
			? tabParam
			: (data.categories[0]?.id ?? null)
	);

	// Which category's edit panel is currently open (null = none).
	let editingTabId = $state<number | null>(null);
	// Fields used by the edit panel's form — populated when the panel opens.
	let editTabName = $state('');
	let editColorIndex = $state(0);

	// Whether the "add category" panel is visible
	let showAddCategory = $state(false);
	let newColorIndex = $state(0);

	// The id of the piece currently being edited inline (null = none)
	let editingId = $state<number | null>(null);

	// Search and key filter — both reset when switching tabs so they don't bleed across categories
	let searchQuery = $state('');
	let filterKey = $state('');

	// Local copy of categories for drag-and-drop reordering.
	// Mirrors data.categories and is re-synced whenever the server refreshes after a form action.
	// (Same pattern used by the sources DnD on the detail page.)
	let tabOrder = $state([...data.categories]);
	$effect(() => { tabOrder = [...data.categories]; });

	// If the active tab was just deleted, fall back to the first remaining category.
	// This runs automatically whenever tabOrder changes.
	$effect(() => {
		const ids = tabOrder.map((c) => c.id);
		if (activeTabId !== null && !ids.includes(activeTabId)) {
			activeTabId = tabOrder[0]?.id ?? null;
		}
	});

	// Hidden form and bound value for the category reorder action (same pattern as source reorder)
	let reorderCatsForm: HTMLFormElement;
	let reorderCatIds = $state('');

	// The category and filtered pieces currently on display
	let activeCategory = $derived(tabOrder.find((c) => c.id === activeTabId));
	let activePieces = $derived(
		(activeCategory?.pieces ?? []).filter((p) => {
			const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
			const keyMatch = filterKey === '' || p.key === filterKey;
			return nameMatch && keyMatch;
		})
	);

	function handleTabConsider(e: CustomEvent) {
		// Update local order while dragging (gives visual feedback during the drag)
		tabOrder = e.detail.items;
	}

	async function handleTabFinalize(e: CustomEvent) {
		// Drag ended — persist the new order to the server
		tabOrder = e.detail.items;
		reorderCatIds = tabOrder.map((c) => c.id).join(',');
		// Wait one tick so reorderCatIds is bound to the hidden input before submit
		await Promise.resolve();
		reorderCatsForm.requestSubmit();
	}

	// Open the edit panel for a category, pre-filling the input fields
	function startEditTab(cat: typeof tabOrder[0]) {
		editingTabId = cat.id;
		editTabName = cat.name;
		editColorIndex = cat.colorIndex;
		showAddCategory = false; // close the add panel if it was open
	}
</script>

<!-- Top banner -->
<div class="max-w-2xl mx-auto shadow-xl mb-0 rounded-b-none">
	<img src="{base}/img/banner.png" alt="De Sprong" class="w-full" />
</div>

<main class="max-w-2xl mx-auto px-4 py-6">

	<!-- ── CATEGORY TABS ── -->

	<!--
	  Hidden form for category reorder — submitted programmatically after a drag finishes.
	  Must live outside the DnD zone (but can be anywhere in the DOM) because it's
	  identified by its bind:this reference, not by position.
	-->
	<form
		bind:this={reorderCatsForm}
		method="POST"
		action="?/reorderCategories"
		use:enhance={() => {
			// invalidateAll: false — avoid a full page reload; the local tabOrder is already correct
			return async ({ update }) => { await update({ invalidateAll: false }); };
		}}
	>
		<input type="hidden" name="ids" bind:value={reorderCatIds} />
	</form>

	<div class="mb-6">
		<!-- Row: draggable tab pills + "add category" button — sticky so tabs stay visible while scrolling -->
		<div class="flex items-center gap-2 flex-wrap py-3 border-b border-base-300 mb-4 bg-base-100 sticky top-0 z-10">

			<!--
			  DnD zone — contains only the draggable category pills.
			  The "+ Category" button is intentionally placed outside this zone
			  so it can't be accidentally grabbed during a drag.
			-->
			<div
				use:dndzone={{ items: tabOrder, flipDurationMs: 150 }}
				onconsider={handleTabConsider}
				onfinalize={handleTabFinalize}
				class="flex gap-2 flex-wrap"
				role="tablist"
			>
				{#each tabOrder as cat (cat.id)}
					{@const color = PALETTE[cat.colorIndex % PALETTE.length]}
					{@const isActive = cat.id === activeTabId}
					{@const isEditing = cat.id === editingTabId}
					<button
						role="tab"
						class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
						       {isActive ? 'shadow-md' : 'opacity-60 hover:opacity-90'}"
						style="background-color: {color.bg}; {isActive ? `outline: 2px solid ${color.dark}; outline-offset: 2px;` : ''}"
						onclick={() => {
							activeTabId = cat.id;
							editingId = null;
							searchQuery = '';
							filterKey = '';
						}}
					>
						<!-- Coloured circle icon -->
						<span
							class="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white shrink-0"
							style="background-color: {color.dark}"
						>♩</span>

						{cat.name}

						<!-- Piece count badge -->
						<span
							class="text-xs font-bold rounded-full px-2 py-0.5 text-white"
							style="background-color: {color.dark}"
						>{cat.pieces.length}</span>

						<!--
						  Pencil icon — opens/closes the edit panel for this category.
						  stopPropagation prevents the click from also activating the tab.
						-->
						<span
							class="text-xs ml-1 {isEditing ? 'opacity-100' : 'opacity-40 hover:opacity-80'}"
							title="Edit category"
							role="button"
							tabindex="0"
							onclick={(e) => {
								e.stopPropagation();
								if (isEditing) editingTabId = null;
								else startEditTab(cat);
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.stopPropagation();
									if (isEditing) editingTabId = null;
									else startEditTab(cat);
								}
							}}
						>✎</span>
					</button>
				{/each}
			</div>

			<!-- Add category button — outside the DnD zone -->
			<button
				type="button"
				class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-dashed border-base-300 text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all"
				onclick={() => { showAddCategory = !showAddCategory; editingTabId = null; }}
			>+ Category</button>
		</div>

		<!-- Edit panel — appears below the tab row when a pencil icon is clicked -->
		{#if editingTabId !== null}
			{@const editCat = tabOrder.find((c) => c.id === editingTabId)}
			{#if editCat}
				<div class="mt-3 p-3 border border-base-200 rounded-xl bg-base-100 flex flex-col gap-3">

					<!-- Name input + Save/Cancel -->
					<form
						method="POST"
						action="?/updateCategory"
						use:enhance={() => {
							return async ({ update }) => { editingTabId = null; await update(); };
						}}
						class="flex gap-2 items-center"
					>
						<input type="hidden" name="id" value={editingTabId} />
						<!--
						  colorIndex is passed as a hidden input so both name and color
						  are saved in one form submission when the user clicks Save.
						-->
						<input type="hidden" name="colorIndex" value={editColorIndex} />
						<input
							type="text"
							name="name"
							bind:value={editTabName}
							class="input input-bordered input-sm flex-1"
							required
							autofocus
							oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
							oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
						/>
						<button type="submit" class="btn btn-sm btn-primary">Save</button>
						<button type="button" class="btn btn-sm btn-ghost" onclick={() => editingTabId = null}>Cancel</button>
					</form>

					<!-- Color swatches — clicking one updates editColorIndex (saved with the form above) -->
					<div class="flex gap-2 items-center">
						<span class="text-xs text-base-content/50 shrink-0">Color:</span>
						{#each PALETTE as swatchColor, idx}
							<button
								type="button"
								class="w-6 h-6 rounded-full transition-all"
								style="background-color: {swatchColor.bg};
								       outline: {editColorIndex === idx ? `2px solid ${swatchColor.dark}` : 'none'};
								       outline-offset: 2px;"
								title="Color {idx + 1}"
								onclick={() => editColorIndex = idx}
							></button>
						{/each}
					</div>

					<!--
					  Delete — only shown as active when the category is empty.
					  When pieces exist, show a message explaining why it's not possible.
					-->
					{#if editCat.pieces.length === 0}
						<form
							method="POST"
							action="?/deleteCategory"
							use:enhance={() => {
								return async ({ update }) => { editingTabId = null; await update(); };
							}}
						>
							<input type="hidden" name="id" value={editingTabId} />
							<button
								type="submit"
								class="btn btn-xs btn-ghost"
								style="color: #92400E;"
								onclick={(e) => {
									if (!confirm(`Delete category "${editCat.name}"?`)) e.preventDefault();
								}}
							>Delete category</button>
						</form>
					{:else}
						<p class="text-xs text-base-content/40">
							Can't delete — move or delete the {editCat.pieces.length} piece{editCat.pieces.length === 1 ? '' : 's'} first.
						</p>
					{/if}
				</div>
			{/if}
		{/if}

		<!-- Add category panel -->
		{#if showAddCategory}
			<form
				method="POST"
				action="?/addCategory"
				use:enhance={() => {
					return async ({ update }) => { showAddCategory = false; newColorIndex = 0; await update(); };
				}}
				class="mt-3 p-3 border border-base-200 rounded-xl bg-base-100 flex flex-col gap-3"
			>
				<input type="hidden" name="colorIndex" value={newColorIndex} />
				<div class="flex gap-2 items-center">
					<input
						type="text"
						name="name"
						placeholder="Category name…"
						class="input input-bordered input-sm flex-1"
						required
						autofocus
						oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
						oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
					/>
					<button type="submit" class="btn btn-sm btn-primary">Add</button>
					<button type="button" class="btn btn-sm btn-ghost" onclick={() => showAddCategory = false}>Cancel</button>
				</div>
				<!-- Color swatches for the new category -->
				<div class="flex gap-2 items-center">
					<span class="text-xs text-base-content/50 shrink-0">Color:</span>
					{#each PALETTE as swatchColor, idx}
						<button
							type="button"
							class="w-6 h-6 rounded-full transition-all"
							style="background-color: {swatchColor.bg};
							       outline: {newColorIndex === idx ? `2px solid ${swatchColor.dark}` : 'none'};
							       outline-offset: 2px;"
							title="Color {idx + 1}"
							onclick={() => newColorIndex = idx}
						></button>
					{/each}
				</div>
			</form>
		{/if}
	</div>

	<!-- Filter row — name search + key dropdown -->
	<div class="flex gap-2 mb-4 items-center">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Filter by name…"
			class="input input-bordered input-sm flex-1"
		/>
		<select bind:value={filterKey} class="select select-bordered select-sm w-28">
			<option value="">All keys</option>
			{#each KEY_OPTIONS as k}
				<option value={k}>{k}</option>
			{/each}
		</select>
		{#if searchQuery || filterKey}
			<button
				type="button"
				class="btn btn-sm btn-ghost"
				onclick={() => { searchQuery = ''; filterKey = ''; }}
			>✕</button>
		{/if}
	</div>

	<!-- Inline add form — creates a new piece in the active category -->
	<form method="POST" action="?/addPiece" use:enhance class="mb-4 flex gap-2 items-center">
		<input type="hidden" name="categoryId" value={activeTabId} />
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

	<!-- Piece list -->
	{#if activePieces.length === 0}
		{#if searchQuery || filterKey}
			<p class="text-base-content/50 text-sm">No pieces match this filter.</p>
		{:else if !activeCategory}
			<p class="text-base-content/50 text-sm">No categories yet. Add one above.</p>
		{:else}
			<p class="text-base-content/50 text-sm">No pieces yet. Add one above.</p>
		{/if}
	{:else}
		<div class="divide-y divide-base-200">
			{#each activePieces as p (p.id)}
				{#if editingId === p.id}
					<!-- EDIT ROW -->
					<div class="flex items-center gap-2 py-2 px-1 odd:bg-base-100 even:bg-base-200">
						<div class="flex-1 min-w-0">
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
						</div>
						<select name="key" form="edit-form-{p.id}" class="select select-bordered select-sm w-24 shrink-0">
							<option value="">—</option>
							{#each KEY_OPTIONS as k}
								<option value={k} selected={p.key === k}>{k}</option>
							{/each}
						</select>
						<div class="flex gap-1 shrink-0">
							<button type="submit" form="edit-form-{p.id}" class="btn btn-sm btn-primary">Save</button>
							<button type="button" class="btn btn-sm btn-ghost" onclick={() => editingId = null}>Cancel</button>
						</div>
					</div>
				{:else}
					<!-- VIEW ROW -->
					<div class="flex items-center gap-3 py-2.5 px-1 odd:bg-base-100 even:bg-base-200">
						<div class="flex-1 min-w-0">
							<!-- Music note icon: ♩ for top priority, ♫ for regular -->
							<a href="{base}/piece/{p.id}" class="font-medium text-base-content hover:text-primary">
								<span class="mr-1 text-amber-600">{p.topPriority ? '♩' : '♫'}</span>{p.name}
							</a>
							{#if p.info}
								<p class="text-xs text-base-content/50 truncate">{p.info}</p>
							{/if}
						</div>
						{#if p.key}
							<span class="badge badge-outline badge-sm font-mono shrink-0">{p.key}</span>
						{/if}
						<div class="flex items-center gap-1 shrink-0">
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								onclick={() => editingId = p.id}
							>Edit</button>
							<!-- Delete: confirm first, then submit a hidden form -->
							<form method="POST" action="?/deletePiece" use:enhance class="contents">
								<input type="hidden" name="id" value={p.id} />
								<button
									type="submit"
									class="btn btn-ghost btn-xs text-error"
									onclick={(e) => {
										if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
											e.preventDefault();
										}
									}}
								>Delete</button>
							</form>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

</main>

<!-- Footer -->
<div class="max-w-2xl mx-auto mt-8 shadow-xl">
	<img src="{base}/img/footer.png" alt="" class="w-full" />
</div>
