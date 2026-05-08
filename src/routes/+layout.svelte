<script>
	import { pwaInfo } from "virtual:pwa-info";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
	let webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : "";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Kvoka Board</title>
</svelte:head>

{@html webManifestLink}
{@render children()}
