<script>
    import { onMount } from "svelte";
    import { brushSettings, boardData, undo, redo, clearAll, saveState, customPanelsData, savePanelsToDB } from "$lib";
    import orientationVerticalIcon from "$lib/assets/orientation-vertical.png";
    import orientationHorizontalIcon from "$lib/assets/orientation-horizontal.png";
    import moveIcon from "$lib/assets/hand-cursor.png";
    import pencilIcon from "$lib/assets/pencil.png";
    import eraserIcon from "$lib/assets/eraser.png";
    import selectionIcon from "$lib/assets/selection.png";
    import zoomInIcon from "$lib/assets/zoom-in.png";
    import zoomOutIcon from "$lib/assets/zoom-out.png";
    import zoom100Icon from "$lib/assets/zoom-100.png";
    import undoIcon from "$lib/assets/undo.png";
    import redoIcon from "$lib/assets/redo.png";
    import ClearConfirm from "./ClearConfirm.svelte";
    import ColorPicker from "./ColorPicker.svelte";
    import StrokeWidthPicker from "./StrokeWidthPicker.svelte";
    import ShapePicker from "./ShapePicker.svelte";

    let posX = $state(0);
    let posY = $state(0);
    let isVertical = $state(false);
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let toolbarEl;
    let initialized = $state(false);
    let isCollapsed = $state(false);

    onMount(() => {
        const saved = localStorage.getItem("kvoka-toolbar-settings");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed.posX === "number") posX = parsed.posX;
                if (typeof parsed.posY === "number") posY = parsed.posY;
                if (typeof parsed.isVertical === "boolean") isVertical = parsed.isVertical;
                if (typeof parsed.isCollapsed === "boolean") isCollapsed = parsed.isCollapsed;
            } catch (e) {
                console.error("Failed to parse toolbar settings", e);
            }
        } else {
            if (toolbarEl) {
                const rect = toolbarEl.getBoundingClientRect();
                posX = (window.innerWidth - rect.width) / 2;
                posY = window.innerHeight - rect.height - 10;
            }
        }
        initialized = true;

        const handleResize = () => clampPosition();
        window.addEventListener("resize", handleResize);
        requestAnimationFrame(clampPosition);

        return () => window.removeEventListener("resize", handleResize);
    });

    function saveToolbarSettings() {
        localStorage.setItem("kvoka-toolbar-settings", JSON.stringify({
            posX,
            posY,
            isVertical,
            isCollapsed,
        }));
    }

    function clampPosition() {
        if (!toolbarEl) return;

        const margin = 8;
        const maxX = Math.max(margin, window.innerWidth - toolbarEl.offsetWidth - margin);
        const maxY = Math.max(margin, window.innerHeight - toolbarEl.offsetHeight - margin);
        const nextX = Math.min(Math.max(posX, margin), maxX);
        const nextY = Math.min(Math.max(posY, margin), maxY);

        if (nextX !== posX) posX = nextX;
        if (nextY !== posY) posY = nextY;
    }

    function scheduleClamp() {
        requestAnimationFrame(clampPosition);
    }

    function startDrag(e) {
        if (
            e.target.tagName === "BUTTON" ||
            e.target.tagName === "INPUT" ||
            e.target.closest("button")
        ) {
            return;
        }
        isDragging = true;
        e.preventDefault(); // Запобігаємо виділенню тексту
        startX = e.clientX - posX;
        startY = e.clientY - posY;
        window.addEventListener("pointermove", handleDrag);
        window.addEventListener("pointerup", stopDrag);
        window.addEventListener("pointercancel", stopDrag);
    }

    function handleDrag(e) {
        if (!isDragging) return;
        posX = e.clientX - startX;
        posY = e.clientY - startY;
        clampPosition();
    }

    function stopDrag() {
        isDragging = false;
        window.removeEventListener("pointermove", handleDrag);
        window.removeEventListener("pointerup", stopDrag);
        window.removeEventListener("pointercancel", stopDrag);
        clampPosition();
        saveToolbarSettings();
    }

    function toggleOrientation() {
        isVertical = !isVertical;
        saveToolbarSettings();
        scheduleClamp();
    }

    function toggleCollapse() {
        isCollapsed = !isCollapsed;
        saveToolbarSettings();
        scheduleClamp();
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

    function applySettingsToSelected() {
        if (boardData.selectedLineIds.length > 0) {
            boardData.lines = boardData.lines.map((line) => {
                if (boardData.selectedLineIds.includes(line.id)) {
                    return {
                        ...line,
                        color: brushSettings.color,
                        width: brushSettings.width,
                        ...(line.tool === "shape" || line.tool === "brush"
                            ? { fillColor: brushSettings.fillColor }
                            : {}),
                    };
                }
                return line;
            });
        }
    }

    function handleInput() {
        applySettingsToSelected();
    }

    function handleStartEdit() {
        if (boardData.selectedLineIds.length > 0) {
            saveState();
        }
    }

    function closeToolbar() {
        customPanelsData.isMainToolbarVisible = false;
        savePanelsToDB({
            panels: $state.snapshot(customPanelsData.panels),
            isMainToolbarVisible: false
        }).catch(console.error);
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    bind:this={toolbarEl}
    class="toolbar"
    class:horizontal={!isVertical}
    class:collapsed={isCollapsed}
    onpointerdown={startDrag}
    style="left: {posX}px; top: {posY}px; {initialized ? '' : 'visibility: hidden;'}"
>
    <div class="drag-handle" title="Перетягнути панель">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="2"/>
            <circle cx="9" cy="12" r="2"/>
            <circle cx="9" cy="19" r="2"/>
            <circle cx="15" cy="5" r="2"/>
            <circle cx="15" cy="12" r="2"/>
            <circle cx="15" cy="19" r="2"/>
        </svg>
    </div>

    <button
        onclick={toggleOrientation}
        title="Змінити орієнтацію панелі"
        class="orientation-btn"
    >
        <img
            src={isVertical
                ? orientationHorizontalIcon
                : orientationVerticalIcon}
            alt="Змінити орієнтацію панелі"
            class="icon"
        />
    </button>

    {#if !isCollapsed}
        <hr />

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

    <ColorPicker 
        bind:color={brushSettings.color} 
        onChange={handleInput} 
        onStartEdit={handleStartEdit} 
        disabled={brushSettings.tool === "eraser"}
        {isVertical}
    />

    <StrokeWidthPicker
        bind:width={brushSettings.width}
        onChange={handleInput}
        onStartEdit={handleStartEdit}
        {isVertical}
    />

    <hr />

    <ShapePicker
        {isVertical}
        disabled={brushSettings.tool === "eraser"}
        onToolSelect={(tool) => (brushSettings.tool = tool)}
        onChange={handleInput}
        onStartEdit={handleStartEdit}
    />

    <button
        class={brushSettings.tool === "text" ? "active" : ""}
        onclick={() => (brushSettings.tool = "text")}
        title="Текст"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon text-icon">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
        </svg>
    </button>

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

        <ClearConfirm {isVertical} onConfirm={clearAll} />

        <hr />
    {/if}

    <button
        onclick={toggleCollapse}
        title={isCollapsed ? "Розгорнути панель" : "Згорнути панель"}
        aria-label={isCollapsed ? "Розгорнути панель" : "Згорнути панель"}
        class="action-btn collapse-btn"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
            {#if isCollapsed}
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            {:else}
                <line x1="5" y1="12" x2="19" y2="12"></line>
            {/if}
        </svg>
    </button>

    <button onclick={closeToolbar} title="Закрити панель (Сховати)" class="action-btn delete-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
</div>

<style lang="scss">
    .toolbar {
        position: fixed;
        width: auto;
        min-width: 36px;
        background: #ffffff;
        padding: 6px;
        box-sizing: border-box;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        z-index: 1000;
        cursor: grab;
        user-select: none;
        touch-action: auto;
        max-width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
        overflow: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;

        &:active {
            cursor: grabbing;
        }

        .drag-handle {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ccc;
            padding: 2px;
            touch-action: none;
            transition: color 0.2s;

            &:hover {
                color: #888;
            }
        }

        &.horizontal {
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-content: center;
            height: auto;
            min-height: 36px;
            overflow-x: auto;
            overflow-y: hidden;

            .drag-handle {
                transform: rotate(90deg);
            }

            hr {
                width: 1px;
                height: 24px;
                border-top: none;
                border-left: 1px solid #ddd;
                margin: 0 4px;
                flex: 0 0 auto;
            }

            label input[type="range"] {
                width: 60px;
            }
        }
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex: 0 0 36px;
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

        .text-icon {
            color: #333;
        }
    }

    button.active {
        background-color: #007bff;
        .icon {
            filter: invert(1);
        }
        .text-icon {
            color: #fff;
            filter: none;
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
        flex: 0 0 auto;
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

    @media (max-width: 520px) {
        .toolbar {
            gap: 4px;
            padding: 4px;
        }

        .toolbar.horizontal hr {
            margin: 0 2px;
        }

        button {
            width: 34px;
            height: 34px;
            flex-basis: 34px;
        }
    }
</style>
