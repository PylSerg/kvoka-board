<script>
    import { Board, Toolbar, Menu, PdfExportPanel, PdfFrameOverlay, boardData } from "$lib";
</script>

<main>
    <Board />
    {#if !boardData.isPdfMode}
        <Toolbar />
        <Menu />
    {:else}
        <PdfExportPanel />
        <PdfFrameOverlay />
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #eef2f5;
        overflow: hidden;
        font-family: sans-serif;
    }
    main {
        display: flex;
        width: 100vw;
        height: 100vh;
    }
</style>
