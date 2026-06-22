<script>
    import { onMount } from "svelte";
    import { boardData, saveState } from "$lib";

    let isOpen = $state(false);
    let menuContainer;
    let fileInput;

    function toggleMenu() {
        isOpen = !isOpen;
    }

    function closeMenu() {
        isOpen = false;
    }

    onMount(() => {
        const handleOutsideClick = (e) => {
            if (isOpen && menuContainer && !menuContainer.contains(e.target)) {
                closeMenu();
            }
        };
        window.addEventListener("pointerdown", handleOutsideClick);
        return () => {
            window.removeEventListener("pointerdown", handleOutsideClick);
        };
    });

    function exportBoard() {
        try {
            const dataStr = JSON.stringify({
                version: 1,
                lines: boardData.lines,
                zoom: boardData.zoom,
                offsetX: boardData.offsetX,
                offsetY: boardData.offsetY
            }, null, 2);

            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            const date = new Date();
            const timestamp = date.toISOString().split('T')[0];
            a.download = `kvoka-board-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeMenu();
        } catch (err) {
            console.error("Failed to export board:", err);
            alert("Помилка під час експортування дошки.");
        }
    }

    function triggerImport() {
        fileInput.click();
    }

    function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                
                if (!parsed || !Array.isArray(parsed.lines)) {
                    alert("Неправильний формат файлу дошки.");
                    return;
                }

                // Зберігаємо поточний стан дошки в історію перед перезаписом
                saveState();

                // Оновлюємо дані дошки
                boardData.lines = parsed.lines;
                
                if (typeof parsed.zoom === 'number') {
                    boardData.zoom = parsed.zoom;
                } else {
                    boardData.zoom = 1;
                }

                if (typeof parsed.offsetX === 'number') {
                    boardData.offsetX = parsed.offsetX;
                } else {
                    boardData.offsetX = 0;
                }

                if (typeof parsed.offsetY === 'number') {
                    boardData.offsetY = parsed.offsetY;
                } else {
                    boardData.offsetY = 0;
                }

                closeMenu();
            } catch (err) {
                console.error("Failed to import board:", err);
                alert("Помилка під час імпортування файлу.");
            } finally {
                fileInput.value = "";
            }
        };
        reader.readAsText(file);
    }

    function enterPdfMode() {
        boardData.isPdfMode = true;
        boardData.selectedLineIds = [];
        closeMenu();

        if (boardData.pdfFrames.length === 0) {
            const screenCenterX = window.innerWidth / 2;
            const screenCenterY = window.innerHeight / 2;
            const canvasX = (screenCenterX - boardData.offsetX) / boardData.zoom;
            const canvasY = (screenCenterY - boardData.offsetY) / boardData.zoom;
            const defWidth = 595; 
            const defHeight = 842; 

            boardData.pdfFrames = [
                {
                    id: Date.now() + Math.random(),
                    x: canvasX - defWidth / 2,
                    y: canvasY - defHeight / 2,
                    width: defWidth,
                    height: defHeight,
                    isVertical: true,
                    number: 1
                }
            ];
        }
    }
</script>

<div class="menu-container" bind:this={menuContainer}>
    <button
        id="menu-button"
        class="menu-btn"
        class:active={isOpen}
        onclick={toggleMenu}
        title="Меню"
        aria-label="Меню керування дошкою"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>

    {#if isOpen}
        <div id="menu-dropdown" class="dropdown-menu">
            <button
                id="import-option"
                class="dropdown-item"
                onclick={triggerImport}
            >
                <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Імпортувати дошку</span>
            </button>

            <button
                id="export-option"
                class="dropdown-item"
                onclick={exportBoard}
            >
                <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Експортувати дошку</span>
            </button>

            <button
                id="pdf-export-option"
                class="dropdown-item"
                onclick={enterPdfMode}
            >
                <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <circle cx="10" cy="9" r="1"></circle>
                </svg>
                <span>Експортувати як PDF</span>
            </button>
        </div>
    {/if}
</div>

<input
    type="file"
    bind:this={fileInput}
    accept=".json"
    onchange={handleImport}
    style="display: none;"
/>

<style>
    .menu-container {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1001;
        display: inline-block;
    }

    .menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
        color: #333333;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0;
        outline: none;
    }

    .menu-btn:hover {
        background: #ffffff;
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
        border-color: rgba(0, 123, 255, 0.3);
        color: #007bff;
    }

    .menu-btn:active {
        transform: scale(0.95);
    }

    .menu-btn.active {
        background: #007bff;
        color: #ffffff;
        border-color: #007bff;
        box-shadow: 0 0 12px rgba(0, 123, 255, 0.4);
    }

    .dropdown-menu {
        position: absolute;
        top: 52px;
        left: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        padding: 6px;
        min-width: 210px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        animation: slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: top left;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        background: transparent;
        border: none;
        border-radius: 8px;
        color: #333333;
        font-size: 14px;
        font-weight: 500;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }

    .dropdown-item:hover {
        background: rgba(0, 123, 255, 0.08);
        color: #007bff;
        padding-left: 18px;
    }

    .dropdown-item:active {
        background: rgba(0, 123, 255, 0.15);
    }

    .item-icon {
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .dropdown-item:hover .item-icon {
        transform: translateY(1px);
    }
</style>
