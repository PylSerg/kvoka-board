<script>
    import { brushSettings, undo, redo, clearAll } from "$lib"; // Імпортуємо методи історії
    import pencilIcon from "$lib/assets/pencil.png";
    import eraserIcon from "$lib/assets/eraser.png";
    import selectionIcon from "$lib/assets/selection.png";

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
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="toolbar"
    onmousedown={startDrag}
    style="left: {posX}px; top: {posY}px;"
>
    <button
        class={brushSettings.tool === "select" ? "active" : ""}
        onclick={() => (brushSettings.tool = "select")}
        title="Виділення"
    >
        <img src={selectionIcon} alt="Виділення" class="icon" />
    </button>

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

    <button onclick={undo} title="Назад (Undo)" class="action-btn">
        <span style="font-size: 18px;">⤺</span>
    </button>

    <button onclick={redo} title="Вперед (Redo)" class="action-btn">
        <span style="font-size: 18px;">⤻</span>
    </button>

    <button
        onclick={clearAll}
        title="Очистити дошку"
        class="action-btn delete-btn"
    >
        <span style="font-size: 18px;">🗑</span>
    </button>
</div>

<style lang="scss">
    .toolbar {
        position: fixed;
        width: 44px;
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
        width: 44px;
        height: 44px;
        background-color: transparent;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
            background-color: #f0f0f0;
        }

        .icon {
            width: 24px;
            height: 24px;
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
