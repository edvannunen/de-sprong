<!--
  Shows a key's actual sharps/flats as a small treble-clef image, sourced from
  Wikipedia's key signature table (static/img/key-signatures/). Renders nothing
  when no key is set.
-->
<script lang="ts">
	import { base } from '$app/paths';
	import { getRelativeMajor } from '$lib/keySignature';

	let { key, height = 20 }: { key: string | null | undefined; height?: number } = $props();

	const major = $derived(getRelativeMajor(key));
</script>

{#if major}
	<img
		src="{base}/img/key-signatures/{major}.jpg"
		alt="Key signature: {key}"
		style="height: {height}px; mix-blend-mode: multiply;"
		class="inline-block align-middle w-auto"
	/>
{/if}
