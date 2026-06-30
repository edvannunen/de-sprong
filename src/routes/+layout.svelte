<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>De Sprong</title>
</svelte:head>

{@render children()}
