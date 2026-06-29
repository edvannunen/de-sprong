<!--
  Piece detail page — view/edit piece info and its list of sources.
  Default mode is view. Edit button at the bottom switches to edit mode.
  Sources can be reordered via drag-and-drop at any time.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { KEY_OPTIONS, PALETTE } from '$lib/constants';
	import { detectLink } from '$lib/linkDetector';
	import { dndzone } from 'svelte-dnd-action';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Whether the page is in edit mode (piece fields + source fields become editable)
	let editing = $state(false);

	// Local copy of sources used for drag-and-drop reordering.
	// Kept in sync with data.sources whenever the page data refreshes.
	let sources = $state([...data.sources]);
	$effect(() => { sources = [...data.sources]; });

	// Whether the "add source" form is visible (only in edit mode)
	let showAddSource = $state(false);

	// When the user clicks "Save" while the add-source form is open and confirms
	// they want to save the new source too, we set this flag. The add-source form's
	// enhance callback checks it and submits the piece form once the source is saved.
	let pendingPieceSave = $state(false);

	// References to the piece edit form and add-source form, used for programmatic submit.
	let pieceFormEl: HTMLFormElement;
	let addSourceFormEl: HTMLFormElement;

	// Hidden form element used to submit the reorder action after a drag
	let reorderForm: HTMLFormElement;
	let reorderIds = $state('');

	// PALETTE is imported from $lib/constants — single source of truth for both pages.
	// Each source card rotates through the palette by its position index.

	function handleConsider(e: CustomEvent) {
		// Update local array order while dragging (gives visual feedback)
		sources = e.detail.items;
	}

	async function handleFinalize(e: CustomEvent) {
		// Update local array, then persist the new order to the server
		sources = e.detail.items;
		reorderIds = sources.map((s) => s.id).join(',');
		// Wait for next tick so reorderIds is bound before submit
		await Promise.resolve();
		reorderForm.requestSubmit();
	}
</script>

<!-- Source page banner — shadow gives it depth; opacity toned down so it doesn't overpower the content -->
<div class="max-w-2xl mx-auto border-y shadow-md" style="background-color: #FEF3C7; border-color: #D97706;">
	<img src="/img/banner_source.png" alt="De Sprong" class="w-full opacity-50" />
</div>

<main class="max-w-2xl mx-auto px-4 py-6">

	<!-- Back link -->
	<a href="/" class="btn btn-sm btn-ghost mb-4">← Back to list</a>

	<!-- ── PIECE HEADER ── -->
	{#if editing}
		<!-- Edit mode: piece fields are inputs -->
		<form id="piece-form" bind:this={pieceFormEl} method="POST" action="?/editPiece" use:enhance={() => {
			return async ({ update }) => {
				editing = false;
				await update();
			};
		}}>
			<div class="flex gap-3 items-start mb-2">
				<input
					type="text"
					name="name"
					value={data.piece.name}
					class="input input-bordered text-xl font-bold flex-1"
					required
					autofocus
					oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
					oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
				/>
				<select name="key" class="select select-bordered w-24">
					<option value="">Key</option>
					{#each KEY_OPTIONS as k}
						<option value={k} selected={data.piece.key === k}>{k}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					name="topPriority"
					id="topPriority"
					class="checkbox checkbox-sm"
					checked={data.piece.topPriority}
				/>
				<label for="topPriority" class="text-sm">Top priority</label>
			</div>
			<textarea
				name="info"
				class="textarea textarea-bordered w-full mb-4"
				rows="2"
				placeholder="Notes about this piece…"
			>{data.piece.info ?? ''}</textarea>
		</form>
	{:else}
		<!-- View mode: piece fields are plain text -->
		<div class="flex justify-between items-start mb-1">
			<h1 class="text-2xl font-bold">
				<span class="text-amber-600 mr-1">{data.piece.topPriority ? '♩' : '♫'}</span>
				{data.piece.name}
			</h1>
			{#if data.piece.key}
				<span class="text-xl font-semibold text-base-content/70">{data.piece.key}</span>
			{/if}
		</div>
		<!-- Top priority toggle — always visible in view mode, saves immediately on change -->
		<form method="POST" action="?/toggleTopPriority" use:enhance class="flex items-center gap-2 mb-2">
			<input
				type="checkbox"
				name="topPriority"
				id="topPriority-view"
				class="checkbox checkbox-sm"
				checked={data.piece.topPriority}
				onchange={(e) => e.currentTarget.form?.requestSubmit()}
			/>
			<label for="topPriority-view" class="text-sm">Top priority</label>
		</form>
		{#if data.piece.info}
			<p class="text-base-content/70 mb-4 whitespace-pre-wrap">{data.piece.info}</p>
		{:else}
			<div class="mb-4"></div>
		{/if}
	{/if}

	<!-- ── SOURCE LIST ── -->
	<!-- "Sources: x" shows the count at a glance — sources.length reflects the current (possibly reordered) list -->
	<h2 class="text-lg font-semibold mb-3 border-b pb-1">Sources: {sources.length}</h2>

	<!-- Hidden form to submit reorder action after drag-and-drop -->
	<form
		bind:this={reorderForm}
		method="POST"
		action="?/reorderSources"
		use:enhance={() => {
			return async ({ update }) => { await update({ invalidateAll: false }); };
		}}
	>
		<input type="hidden" name="ids" bind:value={reorderIds} />
	</form>

	<!-- Drag-and-drop source list -->
	<div
		use:dndzone={{ items: sources, flipDurationMs: 150 }}
		onconsider={handleConsider}
		onfinalize={handleFinalize}
		class="flex flex-col gap-4"
	>
		{#each sources as src, i (src.id)}
			<!-- Each source card gets the next pastel color from the palette (wrapping around) -->
			{@const color = PALETTE[i % PALETTE.length]}
			<div class="card border border-base-200 shadow-sm p-4" style="background-color: {color.bg}">
				{#if editing}
					<!-- SOURCE EDIT MODE -->
					<!-- Edit and delete forms are siblings (not nested) — nested forms are invalid HTML -->
					<!-- enctype="multipart/form-data" is required for file uploads -->
					<form
						id="edit-source-{src.id}"
						method="POST"
						action="?/editSource"
						enctype="multipart/form-data"
						use:enhance={() => {
							return async ({ update }) => { await update(); };
						}}
					>
						<input type="hidden" name="id" value={src.id} />
						<div class="flex gap-2 items-center mb-2">
							<input
								type="text"
								name="name"
								value={src.name}
								class="input input-bordered input-sm font-bold flex-1"
								required
								oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
								oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
							/>
							<select name="key" class="select select-bordered select-sm w-24">
								<option value="">Key</option>
								{#each KEY_OPTIONS as k}
									<option value={k} selected={src.key === k}>{k}</option>
								{/each}
							</select>
						</div>
						<textarea
							name="info"
							class="textarea textarea-bordered textarea-sm w-full mb-2"
							rows="1"
							placeholder="Notes…"
						>{src.info ?? ''}</textarea>
						<input
							type="text"
							name="link"
							value={src.link ?? ''}
							class="input input-bordered input-sm w-full mb-2"
							placeholder="YouTube, Spotify, or URL…"
						/>
						<!-- File upload — leave empty to keep the existing attachment -->
						<input
							type="file"
							name="attachment"
							accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
							class="file-input file-input-bordered file-input-sm w-full mb-2"
						/>
					</form>

					<!-- Show current attachment with a Remove option (separate form so it can submit independently) -->
					{#if src.attachmentPath}
						<div class="flex items-center gap-2 mb-2 text-sm text-base-content/70">
							{#if src.attachmentType === 'image'}
								<img src="/uploads/{src.attachmentPath}" alt="" class="h-8 w-8 object-cover rounded border border-base-200" />
							{/if}
							<span class="truncate">{src.attachmentFilename}</span>
							<form method="POST" action="?/deleteAttachment" use:enhance class="inline ml-auto shrink-0">
								<input type="hidden" name="id" value={src.id} />
								<button
									type="submit"
									class="btn btn-xs btn-ghost" style="color: #92400E;"
									onclick={(e) => {
										if (!confirm('Remove this attachment?')) e.preventDefault();
									}}
								>Remove</button>
							</form>
						</div>
					{/if}

					<div class="flex justify-between items-center mt-1">
						<button type="submit" form="edit-source-{src.id}" class="btn btn-sm btn-primary">Save source</button>

						<form method="POST" action="?/deleteSource" use:enhance class="inline">
							<input type="hidden" name="id" value={src.id} />
							<button
								type="submit"
								class="btn btn-sm btn-ghost" style="color: #92400E;"
								onclick={(e) => {
									if (!confirm(`Delete source "${src.name}"?`)) e.preventDefault();
								}}
							>Delete</button>
						</form>
					</div>
				{:else}
					<!-- SOURCE VIEW MODE -->
					<div class="flex justify-between items-start">
						<span class="font-bold text-lg">{src.name}</span>
						{#if src.key}
							<span class="font-bold text-lg text-base-content/70">{src.key}</span>
						{/if}
					</div>

					{#if src.info}
						<p class="text-sm mt-1 whitespace-pre-wrap">{src.info}</p>
					{:else}
						<div class="h-4"></div>
					{/if}

					<!-- Link: render embed or plain link depending on URL type -->
					{@const link = detectLink(src.link)}
					{#if link.type === 'youtube'}
						<div class="mt-2">
							<iframe
								src={link.embedUrl}
								width="100%"
								height="315"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								title={src.name}
							></iframe>
						</div>
					{:else if link.type === 'spotify'}
						<div class="mt-2">
							<iframe
								src={link.embedUrl}
								width="100%"
								height="80"
								frameborder="0"
								allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
								title={src.name}
							></iframe>
						</div>
					{:else if link.type === 'link'}
						<div class="mt-2">
							<a href={link.url} target="_blank" rel="noopener noreferrer" class="link link-primary text-sm">{link.url}</a>
						</div>
					{:else}
						<div class="h-4"></div>
					{/if}

					<!-- Attachment: image shows as a clickable thumbnail; PDF shows as a filename link -->
					{#if src.attachmentType === 'image'}
						<div class="mt-2">
							<a href="/uploads/{src.attachmentPath}" target="_blank" rel="noopener noreferrer">
								<img
									src="/uploads/{src.attachmentPath}"
									alt={src.attachmentFilename ?? 'Attachment'}
									class="max-h-32 rounded border border-base-200 hover:opacity-80 transition-opacity"
								/>
							</a>
						</div>
					{:else if src.attachmentType === 'pdf'}
						<div class="mt-2">
							<a
								href="/uploads/{src.attachmentPath}"
								target="_blank"
								rel="noopener noreferrer"
								class="link link-primary text-sm"
							>{src.attachmentFilename}</a>
						</div>
					{/if}
				{/if}
			</div>
		{/each}
	</div>

	<!-- Add source form (only visible in edit mode) -->
	{#if editing}
		<div class="mt-4">
			{#if showAddSource}
				<form
					bind:this={addSourceFormEl}
					method="POST"
					action="?/addSource"
					enctype="multipart/form-data"
					use:enhance={() => {
						return async ({ update }) => {
							showAddSource = false;
							await update();
							// If the user clicked the bottom "Save" while this form was open
							// and confirmed they wanted to save the source first, now submit the piece form.
							if (pendingPieceSave) {
								pendingPieceSave = false;
								pieceFormEl.requestSubmit();
							}
						};
					}}
					class="card border border-base-200 p-4 bg-base-50"
				>
					<p class="font-semibold mb-2 text-sm">New source</p>
					<div class="flex gap-2 items-center mb-2">
						<input
							type="text"
							name="name"
							class="input input-bordered input-sm flex-1"
							placeholder="Name"
							required
							autofocus
							oninvalid={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field'); }}
							oninput={(e) => { (e.currentTarget as HTMLInputElement).setCustomValidity(''); }}
						/>
						<select name="key" class="select select-bordered select-sm w-24">
							<option value="">Key</option>
							{#each KEY_OPTIONS as k}
								<option value={k}>{k}</option>
							{/each}
						</select>
					</div>
					<textarea
						name="info"
						class="textarea textarea-bordered textarea-sm w-full mb-2"
						rows="1"
						placeholder="Notes…"
					></textarea>
					<input
						type="text"
						name="link"
						class="input input-bordered input-sm w-full mb-2"
						placeholder="YouTube, Spotify, or URL…"
					/>
					<input
						type="file"
						name="attachment"
						accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
						class="file-input file-input-bordered file-input-sm w-full mb-2"
					/>
					<div class="flex gap-2">
						<button type="submit" class="btn btn-sm btn-primary">Add source</button>
						<button type="button" class="btn btn-sm btn-ghost" onclick={() => showAddSource = false}>Cancel</button>
					</div>
				</form>
			{:else}
				<button class="btn btn-sm btn-outline" onclick={() => showAddSource = true}>+ Add source</button>
			{/if}
		</div>
	{/if}

	<!-- ── BOTTOM BUTTONS ── -->
	<div class="flex gap-2 mt-8 pt-4 border-t">
		{#if editing}
			<button
				type="button"
				class="btn btn-primary"
				onclick={() => {
					if (showAddSource) {
						// The add-source form is open — ask whether to save it first.
						if (confirm('Do you also want to save the new source?')) {
							// Submit the add-source form; its enhance callback will then
							// submit the piece form once the source has been saved.
							pendingPieceSave = true;
							addSourceFormEl.requestSubmit();
						} else {
							// User chose not to save the new source — just save the piece.
							pieceFormEl.requestSubmit();
						}
					} else {
						pieceFormEl.requestSubmit();
					}
				}}
			>Save</button>
			<button type="button" class="btn btn-ghost" onclick={() => { editing = false; showAddSource = false; }}>Cancel</button>
		{:else}
			<button type="button" class="btn btn-primary" onclick={() => editing = true}>Edit</button>

			<!-- Delete piece (with confirmation) -->
			<form method="POST" action="?/deletePiece" use:enhance class="inline">
				<button
					type="submit"
					class="btn btn-ghost" style="color: #92400E;"
					onclick={(e) => {
						if (!confirm(`Delete "${data.piece.name}"? All sources will also be deleted.`)) {
							e.preventDefault();
						}
					}}
				>Delete piece</button>
			</form>
		{/if}
	</div>

</main>

<!-- Footer -->
<div class="max-w-2xl mx-auto mt-8 border-y" style="background-color: #FEF3C7; border-color: #D97706;">
	<img src="/img/footer.png" alt="" class="w-full opacity-50" />
</div>
