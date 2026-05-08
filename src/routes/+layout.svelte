<script>
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Kvoka Board v1.0.0</title>
</svelte:head>

{@render children()}
