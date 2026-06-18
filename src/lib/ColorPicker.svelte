<script>
    import { onMount } from "svelte";

    let {
        color = $bindable(),
        onChange,
        onStartEdit,
        disabled = false,
    } = $props();

    let isOpen = $state(false);
    let colorPickerElement;

    // 9 фіксованих кольорів
    const fixedColors = [
        "#000000",
        "#808080",
        "#ffffff",
        "#ff0000",
        "#ffa500",
        "#ffff00",
        "#0000ff",
        "#008000",
        "#800080",
    ];

    // 3 кастомних кольорів
    let customColors = $state(["", "", ""]);

    onMount(() => {
        const saved = localStorage.getItem("kvoka-custom-colors");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length === 3) {
                    customColors = parsed;
                }
            } catch (e) {
                console.error("Failed to parse custom colors", e);
            }
        }

        // Обробник кліку зовні для закриття
        const handleOutsideClick = (e) => {
            if (
                isOpen &&
                colorPickerElement &&
                !colorPickerElement.contains(e.target)
            ) {
                isOpen = false;
            }
        };

        window.addEventListener("pointerdown", handleOutsideClick);
        return () =>
            window.removeEventListener("pointerdown", handleOutsideClick);
    });

    function saveCustomColors() {
        localStorage.setItem(
            "kvoka-custom-colors",
            JSON.stringify(customColors),
        );
    }

    function selectColor(c) {
        if (!c) return;
        if (onStartEdit) onStartEdit();
        color = c;
        if (onChange) onChange(color);
        isOpen = false;
    }

    function togglePopup() {
        if (disabled) return;
        isOpen = !isOpen;
    }

    function handleNativeColorChange(e) {
        const newColor = e.target.value;
        if (onStartEdit) onStartEdit();
        color = newColor;
        if (onChange) onChange(color);

        // Додаємо в список кастомних (зсуваємо старі)
        if (!customColors.includes(newColor)) {
            customColors = [newColor, customColors[0], customColors[1]];
            saveCustomColors();
        }
        isOpen = false;
    }
</script>

<div class="color-picker-container" bind:this={colorPickerElement}>
    <button
        class="color-btn"
        style="background-color: {color};"
        onclick={togglePopup}
        {disabled}
        title="Вибрати колір"
        aria-label="Вибрати колір"
    ></button>

    {#if isOpen}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="popup" onpointerdown={(e) => e.stopPropagation()}>
            <div class="section-title">Основні кольори</div>
            <div class="color-grid">
                {#each fixedColors as c}
                    <button
                        class="color-swatch"
                        style="background-color: {c};"
                        class:selected={color === c}
                        onclick={() => selectColor(c)}
                        title={c}
                        aria-label="Вибрати {c}"
                    ></button>
                {/each}
            </div>

            <div class="section-title">Ваші кольори</div>
            <div class="custom-colors-grid">
                {#each customColors as c}
                    <button
                        class="color-swatch custom-swatch"
                        style="background-color: {c || 'transparent'};"
                        class:empty={!c}
                        class:selected={color === c && c !== ""}
                        onclick={() => selectColor(c)}
                        disabled={!c}
                        title={c || "Порожній слот"}
                    ></button>
                {/each}
            </div>

            <div class="native-picker">
                <label>
                    <span>Палітра...</span>
                    <input
                        type="color"
                        value={color}
                        onchange={handleNativeColorChange}
                    />
                </label>
            </div>
        </div>
    {/if}
</div>

<style>
    .color-picker-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .color-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ddd;
        cursor: pointer;
        padding: 0;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-btn:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.15),
            inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    .color-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .popup {
        position: absolute;
        top: 0;
        left: 100%;
        margin-left: 12px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        padding: 12px;
        z-index: 1010;
        width: 136px;
        border: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: default;
    }

    /* Якщо тулбар горизонтальний, попап має з'являтися зверху або знизу. */
    :global(.toolbar.horizontal) .popup {
        top: 100%;
        left: 50%;
        margin-left: 0;
        margin-top: 12px;
        transform: translateX(-50%);
    }

    .section-title {
        font-size: 11px;
        color: #777;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: -4px;
    }

    .color-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        justify-items: center;
    }

    .custom-colors-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        justify-items: center;
    }

    .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.15);
        cursor: pointer;
        padding: 0;
        transition: transform 0.1s;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .color-swatch:hover:not(:disabled) {
        transform: scale(1.15);
    }

    .color-swatch.selected {
        border: 2px solid #007bff;
        transform: scale(1.1);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
    }

    .custom-swatch {
        width: 24px;
        height: 24px;
    }

    .custom-swatch.empty {
        background: repeating-linear-gradient(
            45deg,
            #f0f0f0,
            #f0f0f0 4px,
            #e0e0e0 4px,
            #e0e0e0 8px
        );
        border: 1px dashed #ccc;
        box-shadow: none;
        cursor: default;
    }

    .native-picker {
        border-top: 1px solid #eee;
        padding-top: 12px;
    }

    .native-picker label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font-size: 13px;
        color: #333;
        font-weight: 500;
        margin: 0;
    }

    .native-picker label:hover span {
        color: #007bff;
    }

    .native-picker input[type="color"] {
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background: none;
    }

    .native-picker input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }
    .native-picker input[type="color"]::-webkit-color-swatch {
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }
</style>
