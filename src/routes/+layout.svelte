<script>
	import { pwaInfo } from "virtual:pwa-info";
	import { onMount } from "svelte";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import("virtual:pwa-register");
			registerSW({
				immediate: true,
				onRegistered(r) {
					console.log("SW Registered:", r);
				},
				onRegisterError(error) {
					console.log("SW Registration error:", error);
				},
			});
		}
	});

	let webManifestLink = pwaInfo ? pwaInfo.webManifestLink : "";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Kvoka Board</title>
	{@html webManifestLink}
</svelte:head>

{@render children()}
