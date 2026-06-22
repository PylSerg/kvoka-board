<script>
    import { Board, Toolbar, Menu } from "$lib";
</script>

<main>
    <Board />
    <Toolbar />
    <Menu />
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
