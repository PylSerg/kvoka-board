<script>
    import { brushSettings, boardData, undo, redo, clearAll } from "$lib";
    import moveIcon from "$lib/assets/hand-cursor.png";
    import pencilIcon from "$lib/assets/pencil.png";
    import eraserIcon from "$lib/assets/eraser.png";
    import selectionIcon from "$lib/assets/selection.png";
    import zoomInIcon from "$lib/assets/zoom-in.png";
    import zoomOutIcon from "$lib/assets/zoom-out.png";
    import zoom100Icon from "$lib/assets/zoom-100.png";
    import undoIcon from "$lib/assets/undo.png";
    import redoIcon from "$lib/assets/redo.png";
    import clearIcon from "$lib/assets/broom.png";

    let posX = $state(10);
    let posY = $state(10);
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    function startDrag(e) {
        if (
            e.target.tagName === "BUTTON" ||
            e.target.tagName === "INPUT" ||
            e.target.closest("button")
        ) {
            return;
        }
        isDragging = true;
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        window.addEventListener("mousemove", handleDrag);
        window.addEventListener("mouseup", stopDrag);
    }

    function handleDrag(e) {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener("mousemove", handleDrag);
        window.removeEventListener("mouseup", stopDrag);
    }

    function zoomIn() {
        boardData.zoom = Math.min(10, boardData.zoom + 0.1);
    }

    function zoomOut() {
        boardData.zoom = Math.max(0.1, boardData.zoom - 0.1);
    }

    function resetZoom() {
        boardData.zoom = 1;
        boardData.offsetX = 0;
        boardData.offsetY = 0;
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="toolbar"
    onmousedown={startDrag}
    style="left: {posX}px; top: {posY}px;"
>
    <button
        class={brushSettings.tool === "move" ? "active" : ""}
        onclick={() => (brushSettings.tool = "move")}
        title="Переміщення"
    >
        <img src={moveIcon} alt="Переміщення" class="icon" />
    </button>

    <button
        class={brushSettings.tool === "select" ? "active" : ""}
        onclick={() => (brushSettings.tool = "select")}
        title="Виділення"
    >
        <img src={selectionIcon} alt="Виділення" class="icon" />
    </button>

    <hr />

    <button
        class={brushSettings.tool === "brush" ? "active" : ""}
        onclick={() => (brushSettings.tool = "brush")}
        title="Пензель"
    >
        <img src={pencilIcon} alt="Пензель" class="icon" />
    </button>

    <button
        class={brushSettings.tool === "eraser" ? "active" : ""}
        onclick={() => (brushSettings.tool = "eraser")}
        title="Гумка"
    >
        <img src={eraserIcon} alt="Гумка" class="icon" />
    </button>

    <hr />

    <label title="Колір">
        <input
            type="color"
            bind:value={brushSettings.color}
            disabled={brushSettings.tool === "eraser"}
        />
    </label>

    <label title="Товщина">
        <input type="range" min="1" max="50" bind:value={brushSettings.width} />
    </label>

    <hr />

    <button onclick={zoomIn} title="Збільшити" class="action-btn">
        <img src={zoomInIcon} alt="Збільшити" class="icon" />
    </button>

    <button onclick={zoomOut} title="Зменшити" class="action-btn">
        <img src={zoomOutIcon} alt="Зменшити" class="icon" />
    </button>

    <button onclick={resetZoom} title="100%" class="action-btn">
        <img src={zoom100Icon} alt="100%" class="icon" />
    </button>

    <hr />

    <button onclick={undo} title="Назад" class="action-btn">
        <img src={undoIcon} alt="Назад" class="icon" />
    </button>

    <button onclick={redo} title="Вперед" class="action-btn">
        <img src={redoIcon} alt="Вперед" class="icon" />
    </button>

    <hr />

    <button
        onclick={clearAll}
        title="Очистити дошку"
        class="action-btn delete-btn"
    >
        <img src={clearIcon} alt="Очистити дошку" class="icon" />
    </button>
</div>

<style lang="scss">
    .toolbar {
        position: fixed;
        width: 36px;
        background: #ffffff;
        padding: 6px;
        border-radius: 10px;
        box-shadow: 2px 2px 10px #555555;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 10;
        cursor: grab;

        &:active {
            cursor: grabbing;
        }
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background-color: transparent;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
            background-color: #c7dff9;
        }

        .icon {
            width: 20px;
            height: 20px;
            object-fit: contain;
        }
    }

    button.active {
        background-color: #007bff;
        .icon {
            filter: invert(1);
        }
        &:hover {
            background-color: #0056b3;
        }
    }

    .action-btn {
        color: #333;
        font-weight: bold;

        &:active {
            transform: scale(0.95);
        }
    }

    .delete-btn {
        color: #dc3545;
        &:hover {
            background-color: #f8d7da;
        }
    }

    hr {
        width: 100%;
        border: none;
        border-top: 1px solid #ddd;
        margin: 2px 0;
    }

    label {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;

        input[type="color"] {
            border: none;
            width: 32px;
            height: 32px;
            cursor: pointer;
            background: none;
        }

        input[type="range"] {
            width: 38px;
        }
    }
</style>
