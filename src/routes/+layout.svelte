<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

<footer class="fixed bottom-1 right-2 z-50">
	<a href="/privacy" class="text-[10px] text-gray-600 hover:text-gray-400">Privacy</a>
</footer>
