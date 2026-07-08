<script>
    import { onMount, onDestroy } from "svelte";
    import { Board, Toolbar, Menu, PdfExportPanel, PdfFrameOverlay, boardData, loadBoardFromDB, saveBoardToDB, saveState } from "$lib";

    let autoSaveInterval;

    onMount(async () => {
        try {
            const savedBoard = await loadBoardFromDB();
            if (savedBoard && savedBoard.lines && savedBoard.lines.length > 0) {
                if (confirm("Знайдено збережену дошку після попереднього сеансу. Відновити її?")) {
                    saveState();
                    boardData.lines = savedBoard.lines;
                    if (typeof savedBoard.zoom === "number") boardData.zoom = savedBoard.zoom;
                    if (typeof savedBoard.offsetX === "number") boardData.offsetX = savedBoard.offsetX;
                    if (typeof savedBoard.offsetY === "number") boardData.offsetY = savedBoard.offsetY;
                }
            }
        } catch (err) {
            console.error("Failed to load board from IndexedDB", err);
        }

        autoSaveInterval = setInterval(() => {
            try {
                const dataToSave = JSON.parse(JSON.stringify({
                    version: 1,
                    lines: boardData.lines,
                    zoom: boardData.zoom,
                    offsetX: boardData.offsetX,
                    offsetY: boardData.offsetY,
                }));
                saveBoardToDB(dataToSave).catch(err => console.error("Failed to autosave board", err));
            } catch (err) {
                console.error("Failed to stringify board data for autosave", err);
            }
        }, 10000);
    });

    onDestroy(() => {
        if (autoSaveInterval) clearInterval(autoSaveInterval);
    });
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
