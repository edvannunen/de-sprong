<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>De Sprong</title>
</svelte:head>

<div class="min-h-screen bg-base-200 flex flex-col">
	<div class="max-w-3xl mx-auto px-4 py-0 flex-1 w-full">
		{@render children()}
	</div>
	<footer class="text-center text-xs opacity-60 px-4 py-6">
		<p>&copy; {new Date().getFullYear()} Ed van Nunen &middot; <a href="https://bier-en-brood.nl" class="link">bier-en-brood.nl</a></p>
		<p class="mt-1">Deze pagina bevat verwijzingen naar en/of embeds van content (video's, afbeeldingen, documenten) van derden. Alle rechten daarop liggen bij de respectievelijke eigenaren. Gebruikt voor persoonlijke, niet-commerciële doeleinden. Verzoek tot verwijdering? Neem contact op via edvannunen [at] gmail [dot] com.</p>
	</footer>
</div>
