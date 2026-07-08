<script>
    import { onMount } from "svelte";
    import { boardData, bgSettings, saveBgSettings, saveState, deleteBoardFromDB } from "$lib";

    let isOpen = $state(false);
    let isBgOpen = $state(false);
    let menuContainer;
    let fileInput;

    function toggleMenu() {
        isOpen = !isOpen;
        if (!isOpen) isBgOpen = false;
    }

    function closeMenu() {
        isOpen = false;
        isBgOpen = false;
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
            const dataStr = JSON.stringify(
                {
                    version: 1,
                    lines: boardData.lines,
                    zoom: boardData.zoom,
                    offsetX: boardData.offsetX,
                    offsetY: boardData.offsetY,
                },
                null,
                2,
            );

            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            const date = new Date();
            const timestamp = date.toISOString().split("T")[0];
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

                if (typeof parsed.zoom === "number") {
                    boardData.zoom = parsed.zoom;
                } else {
                    boardData.zoom = 1;
                }

                if (typeof parsed.offsetX === "number") {
                    boardData.offsetX = parsed.offsetX;
                } else {
                    boardData.offsetX = 0;
                }

                if (typeof parsed.offsetY === "number") {
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
            const canvasX =
                (screenCenterX - boardData.offsetX) / boardData.zoom;
            const canvasY =
                (screenCenterY - boardData.offsetY) / boardData.zoom;
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
                    number: 1,
                },
            ];
        }
    }

    async function exitBoard() {
        if (confirm("Ви впевнені, що хочете вийти? Поточна дошка буде очищена і видалена зі збережених.")) {
            try {
                await deleteBoardFromDB();
                boardData.lines = [];
                boardData.zoom = 1;
                boardData.offsetX = 0;
                boardData.offsetY = 0;
                closeMenu();
            } catch (err) {
                console.error("Failed to exit and clear db:", err);
                alert("Помилка при виході.");
            }
        }
    }

    // --- Фон ---
    const overlayOptions = [
        { value: "none", label: "Немає", icon: "none" },
        { value: "grid", label: "Клітинка", icon: "grid" },
        { value: "lines", label: "Лінія", icon: "lines" },
        { value: "diagonal", label: "Коса лінія", icon: "diagonal" },
        { value: "dots", label: "Точки", icon: "dots" },
        { value: "draft", label: "Креслення", icon: "draft" },
    ];

    function handleOverlayColorChange(e) {
        bgSettings.overlayColor = e.target.value;
        saveBgSettings();
    }

    function handleBgColorChange(e) {
        bgSettings.bgColor = e.target.value;
        saveBgSettings();
    }

    function handleScaleInput(e) {
        bgSettings.scale = Number(e.target.value);
        saveBgSettings();
    }

    function selectOverlay(value) {
        bgSettings.overlay = value;
        saveBgSettings();
    }

    function resetBgSettings() {
        bgSettings.overlay = "none";
        bgSettings.scale = 40;
        bgSettings.overlayColor = "#d0d8e8";
        bgSettings.bgColor = "#ffffff";
        saveBgSettings();
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
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>

    {#if isOpen}
        <div id="menu-dropdown" class="dropdown-menu">
            <!-- Пункт Фон з підменю (першим) -->
            <div class="submenu-wrapper" class:submenu-open={isBgOpen}>
                <button
                    id="bg-option"
                    class="dropdown-item submenu-trigger"
                    class:active={isBgOpen}
                    onclick={() => (isBgOpen = !isBgOpen)}
                >
                    <svg
                        class="item-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
                        ></rect>
                        <path d="M3 9h18"></path>
                        <path d="M9 21V9"></path>
                    </svg>
                    <span>Фон</span>
                    <svg
                        class="chevron"
                        class:rotated={isBgOpen}
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>

                {#if isBgOpen}
                    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                    <div
                        id="bg-submenu"
                        class="bg-submenu"
                        onpointerdown={(e) => e.stopPropagation()}
                    >
                        <!-- Накладка -->
                        <div class="submenu-section">
                            <div class="submenu-label">Накладка</div>
                            <div class="overlay-grid">
                                {#each overlayOptions as opt}
                                    <button
                                        class="overlay-btn"
                                        class:selected={bgSettings.overlay ===
                                            opt.value}
                                        onclick={() => selectOverlay(opt.value)}
                                        title={opt.label}
                                        aria-label={opt.label}
                                    >
                                        <span class="overlay-icon">
                                            {#if opt.icon === "none"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><line
                                                        x1="5"
                                                        y1="17"
                                                        x2="17"
                                                        y2="5"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /></svg
                                                >
                                            {:else if opt.icon === "grid"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><line
                                                        x1="1"
                                                        y1="8"
                                                        x2="21"
                                                        y2="8"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="1"
                                                        y1="14"
                                                        x2="21"
                                                        y2="14"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="8"
                                                        y1="1"
                                                        x2="8"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="14"
                                                        y1="1"
                                                        x2="14"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /></svg
                                                >
                                            {:else if opt.icon === "lines"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><line
                                                        x1="1"
                                                        y1="7"
                                                        x2="21"
                                                        y2="7"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="1"
                                                        y1="11"
                                                        x2="21"
                                                        y2="11"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="1"
                                                        y1="15"
                                                        x2="21"
                                                        y2="15"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /></svg
                                                >
                                            {:else if opt.icon === "diagonal"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><line
                                                        x1="1"
                                                        y1="7"
                                                        x2="21"
                                                        y2="7"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="1"
                                                        y1="14"
                                                        x2="21"
                                                        y2="14"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="3"
                                                        y1="1"
                                                        x2="9"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="13"
                                                        y1="1"
                                                        x2="19"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /></svg
                                                >
                                            {:else if opt.icon === "dots"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><circle
                                                        cx="7"
                                                        cy="7"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    /><circle
                                                        cx="15"
                                                        cy="7"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    /><circle
                                                        cx="7"
                                                        cy="15"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    /><circle
                                                        cx="15"
                                                        cy="15"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    /><circle
                                                        cx="11"
                                                        cy="11"
                                                        r="1.5"
                                                        fill="currentColor"
                                                    /></svg
                                                >
                                            {:else if opt.icon === "draft"}
                                                <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 22 22"
                                                    ><rect
                                                        x="1"
                                                        y="1"
                                                        width="20"
                                                        height="20"
                                                        rx="3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        stroke-width="1.5"
                                                    /><line
                                                        x1="1"
                                                        y1="5"
                                                        x2="21"
                                                        y2="5"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="1"
                                                        y1="9"
                                                        x2="21"
                                                        y2="9"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="1"
                                                        y1="13"
                                                        x2="21"
                                                        y2="13"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="1"
                                                        y1="17"
                                                        x2="21"
                                                        y2="17"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="5"
                                                        y1="1"
                                                        x2="5"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="9"
                                                        y1="1"
                                                        x2="9"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="13"
                                                        y1="1"
                                                        x2="13"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="17"
                                                        y1="1"
                                                        x2="17"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="0.5"
                                                        opacity="0.5"
                                                    /><line
                                                        x1="1"
                                                        y1="1"
                                                        x2="21"
                                                        y2="21"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /><line
                                                        x1="1"
                                                        y1="21"
                                                        x2="21"
                                                        y2="1"
                                                        stroke="currentColor"
                                                        stroke-width="1"
                                                    /></svg
                                                >
                                            {/if}
                                        </span>
                                        <span class="overlay-label"
                                            >{opt.label}</span
                                        >
                                    </button>
                                {/each}
                            </div>
                        </div>

                        <!-- Масштаб накладки -->
                        <div class="submenu-section">
                            <div class="submenu-label">
                                Масштаб накладки
                                <span class="scale-value"
                                    >{bgSettings.scale} px</span
                                >
                            </div>
                            <div class="scale-row">
                                <span class="scale-hint">10</span>
                                <input
                                    id="bg-scale-slider"
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="5"
                                    value={bgSettings.scale}
                                    oninput={handleScaleInput}
                                    class="scale-slider"
                                    disabled={bgSettings.overlay === "none"}
                                />
                                <span class="scale-hint">200</span>
                            </div>
                        </div>

                        <!-- Колір накладки -->
                        <div class="submenu-section">
                            <div class="submenu-label">Колір накладки</div>
                            <div class="color-row">
                                <div
                                    class="color-swatch-preview"
                                    style="background: {bgSettings.overlayColor};"
                                ></div>
                                <label class="color-label">
                                    <span class="color-hex"
                                        >{bgSettings.overlayColor}</span
                                    >
                                    <input
                                        id="bg-overlay-color"
                                        type="color"
                                        value={bgSettings.overlayColor}
                                        oninput={handleOverlayColorChange}
                                        class="native-color-input"
                                        disabled={bgSettings.overlay === "none"}
                                    />
                                </label>
                            </div>
                        </div>

                        <!-- Колір фону -->
                        <div class="submenu-section">
                            <div class="submenu-label">Колір фону</div>
                            <div class="color-row">
                                <div
                                    class="color-swatch-preview"
                                    style="background: {bgSettings.bgColor}; border: 1px solid #ccc;"
                                ></div>
                                <label class="color-label">
                                    <span class="color-hex"
                                        >{bgSettings.bgColor}</span
                                    >
                                    <input
                                        id="bg-fill-color"
                                        type="color"
                                        value={bgSettings.bgColor}
                                        oninput={handleBgColorChange}
                                        class="native-color-input"
                                    />
                                </label>
                            </div>
                        </div>

                        <!-- Роздільник та кнопка Скинути -->
                        <div class="divider"></div>
                        <button class="reset-bg-btn" onclick={resetBgSettings}
                            >Скинути</button
                        >
                    </div>
                {/if}
            </div>

            <!-- Роздільник -->
            <div class="divider"></div>

            <button
                id="import-option"
                class="dropdown-item"
                onclick={triggerImport}
            >
                <svg
                    class="item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Завантажити дошку</span>
            </button>

            <button
                id="export-option"
                class="dropdown-item"
                onclick={exportBoard}
            >
                <svg
                    class="item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Зберегти дошку</span>
            </button>

            <button
                id="pdf-export-option"
                class="dropdown-item"
                onclick={enterPdfMode}
            >
                <svg
                    class="item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    ></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <circle cx="10" cy="9" r="1"></circle>
                </svg>
                <span>Експортувати як PDF</span>
            </button>

            <!-- Роздільник -->
            <div class="divider"></div>

            <button
                id="exit-option"
                class="dropdown-item"
                onclick={exitBoard}
                style="color: #dc3545;"
            >
                <svg
                    class="item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Вийти</span>
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
        bottom: 10px;
        right: 10px;
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
        box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05);
        color: #333333;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0;
        outline: none;
    }

    .menu-btn:hover {
        background: #ffffff;
        transform: scale(1.05);
        box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.12),
            0 2px 4px rgba(0, 0, 0, 0.06);
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
        bottom: 52px;
        right: 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.1),
            0 3px 10px rgba(0, 0, 0, 0.05);
        border-radius: 12px;
        padding: 6px;
        min-width: 210px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: bottom right;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
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

    .dropdown-item.active {
        background: rgba(0, 123, 255, 0.08);
        color: #007bff;
    }

    .item-icon {
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .dropdown-item:hover .item-icon {
        transform: translateY(1px);
    }

    .divider {
        height: 1px;
        background: rgba(0, 0, 0, 0.06);
        margin: 4px 8px;
        flex-shrink: 0;
    }

    /* Submenu trigger */
    .submenu-trigger {
        position: relative;
    }

    .submenu-trigger span:first-of-type {
        flex: 1;
    }

    .chevron {
        margin-left: auto;
        flex-shrink: 0;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0.5;
    }

    .chevron.rotated {
        transform: rotate(90deg);
        opacity: 1;
    }

    /* Bg Submenu panel */
    .submenu-wrapper {
        position: relative;
    }

    .bg-submenu {
        position: absolute;
        right: calc(100% + 8px);
        bottom: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow:
            0 12px 32px rgba(0, 0, 0, 0.12),
            0 3px 10px rgba(0, 0, 0, 0.06);
        border-radius: 14px;
        padding: 14px;
        width: 240px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: fadeInLeft 0.18s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: bottom right;
        z-index: 1100;
    }

    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(8px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }

    .submenu-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .submenu-label {
        font-size: 11px;
        font-weight: 700;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    /* Overlay picker grid */
    .overlay-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .overlay-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 6px 4px;
        background: transparent;
        border: 1.5px solid transparent;
        border-radius: 8px;
        cursor: pointer;
        color: #555;
        transition: all 0.18s ease;
        font-size: 10px;
        font-weight: 500;
    }

    .overlay-btn:hover {
        background: rgba(0, 123, 255, 0.07);
        color: #007bff;
        border-color: rgba(0, 123, 255, 0.2);
    }

    .overlay-btn.selected {
        background: rgba(0, 123, 255, 0.12);
        border-color: #007bff;
        color: #007bff;
    }

    .overlay-icon {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .overlay-label {
        line-height: 1.2;
        text-align: center;
    }

    /* Scale slider */
    .scale-row {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .scale-hint {
        font-size: 10px;
        color: #aaa;
        flex-shrink: 0;
        width: 24px;
        text-align: center;
    }

    .scale-slider {
        flex: 1;
        height: 4px;
        appearance: none;
        -webkit-appearance: none;
        background: linear-gradient(
            to right,
            #007bff 0%,
            #007bff calc((var(--val, 40) - 10) / 190 * 100%),
            #e0e0e0 calc((var(--val, 40) - 10) / 190 * 100%)
        );
        border-radius: 4px;
        outline: none;
        cursor: pointer;
    }

    .scale-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #007bff;
        border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0, 123, 255, 0.4);
        cursor: pointer;
        transition: transform 0.15s ease;
    }

    .scale-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .scale-slider:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .scale-value {
        font-size: 11px;
        color: #007bff;
        font-weight: 600;
    }

    /* Color row */
    .color-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 10px;
        background: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .color-swatch-preview {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.15);
    }

    .color-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex: 1;
        cursor: pointer;
        gap: 6px;
    }

    .color-hex {
        font-size: 12px;
        color: #555;
        font-family: monospace;
        flex: 1;
    }

    .native-color-input {
        width: 28px;
        height: 28px;
        padding: 0;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        background: none;
        flex-shrink: 0;
    }

    .native-color-input::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    .native-color-input::-webkit-color-swatch {
        border: 1.5px solid rgba(0, 0, 0, 0.15);
        border-radius: 6px;
    }

    .native-color-input:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    /* Reset button */
    .reset-bg-btn {
        width: 100%;
        padding: 8px;
        background: transparent;
        border: 1px solid rgba(255, 59, 48, 0.2);
        border-radius: 8px;
        color: #ff3b30;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 4px;
    }

    .reset-bg-btn:hover {
        background: rgba(255, 59, 48, 0.08);
        border-color: rgba(255, 59, 48, 0.4);
    }
</style>
