<script>
    import { onMount, tick } from "svelte";

    let {
        width = $bindable(),
        onChange,
        onStartEdit,
        isVertical = true,
    } = $props();

    let isOpen = $state(false);
    let containerElement;
    let popupStyle = $state("top: 0; left: calc(100% + 12px); right: auto; bottom: auto;");

    const presetWidths = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 28, 30, 40, 50, 60];

    onMount(() => {
        const handleOutsideClick = (e) => {
            if (isOpen && containerElement && !containerElement.contains(e.target)) {
                isOpen = false;
            }
        };
        window.addEventListener("pointerdown", handleOutsideClick);
        return () => window.removeEventListener("pointerdown", handleOutsideClick);
    });

    async function computePopupStyle() {
        await tick();
        if (!containerElement) return;
        const rect = containerElement.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (isVertical) {
            if (rect.left < vw / 2) {
                popupStyle = "top: 0; bottom: auto; left: calc(100% + 12px); right: auto;";
            } else {
                popupStyle = "top: 0; bottom: auto; right: calc(100% + 12px); left: auto;";
            }
        } else {
            if (rect.top < vh / 2) {
                popupStyle = "top: calc(100% + 12px); bottom: auto; left: 50%; right: auto; transform: translateX(-50%);";
            } else {
                popupStyle = "bottom: calc(100% + 12px); top: auto; left: 50%; right: auto; transform: translateX(-50%);";
            }
        }
    }

    function togglePopup() {
        isOpen = !isOpen;
        if (isOpen) computePopupStyle();
    }

    function selectWidth(w) {
        if (onStartEdit) onStartEdit();
        width = w;
        if (onChange) onChange(width);
    }

    function handleSliderChange(e) {
        if (onStartEdit) onStartEdit();
        width = Number(e.target.value);
        if (onChange) onChange(width);
    }
</script>

<div class="stroke-picker-container" bind:this={containerElement}>
    <button
        class="stroke-btn"
        onclick={togglePopup}
        title="Товщина лінії: {width} px"
        aria-label="Вибрати товщину лінії"
    >
        <span class="stroke-value">{width}</span>
    </button>

    {#if isOpen}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="popup" style={popupStyle} onpointerdown={(e) => e.stopPropagation()}>
            <div class="section-title">Товщина лінії</div>
            <div class="width-grid">
                {#each presetWidths as w}
                    <button
                        class="width-swatch"
                        class:selected={width === w}
                        onclick={() => selectWidth(w)}
                        title="{w} px"
                    >
                        <div class="line-preview">
                            <div class="line-dot" style="width: {Math.min(w, 20)}px; height: {Math.min(w, 20)}px;"></div>
                        </div>
                        <span class="width-label">{w}</span>
                    </button>
                {/each}
            </div>

            <div class="slider-section">
                <div class="slider-header">
                    <span class="section-title" style="margin: 0;">Довільне значення</span>
                    <span class="slider-value">{width} px</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="60"
                    value={width}
                    oninput={handleSliderChange}
                    class="width-slider"
                />
            </div>
        </div>
    {/if}
</div>

<style>
    .stroke-picker-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stroke-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1.5px solid #ddd;
        background: #f8f8f8;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s, transform 0.1s;
    }

    .stroke-btn:hover {
        background: #c7dff9;
        border-color: #a0c8f0;
    }

    .stroke-btn:active {
        transform: scale(0.95);
    }

    .stroke-value {
        font-size: 11px;
        font-weight: 700;
        color: #333;
        line-height: 1;
        user-select: none;
    }

    .popup {
        position: absolute;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
        padding: 12px;
        z-index: 1010;
        width: 196px;
        border: 1px solid #eee;
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: default;
    }

    .section-title {
        font-size: 11px;
        color: #777;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .width-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
    }

    .width-swatch {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 6px 4px;
        border-radius: 8px;
        border: 1.5px solid transparent;
        background: #f5f5f5;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s, transform 0.1s;
        min-height: 44px;
    }

    .width-swatch:hover {
        background: #e8f0fe;
        border-color: #a0c8f0;
    }

    .width-swatch.selected {
        border-color: #007bff;
        background: #e8f4ff;
    }

    .width-swatch:active {
        transform: scale(0.93);
    }

    .line-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }

    .line-dot {
        border-radius: 50%;
        background: #333;
        flex-shrink: 0;
    }

    .width-label {
        font-size: 10px;
        font-weight: 600;
        color: #555;
        line-height: 1;
    }

    .width-swatch.selected .width-label {
        color: #007bff;
    }

    .slider-section {
        border-top: 1px solid #eee;
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .slider-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .slider-value {
        font-size: 12px;
        font-weight: 700;
        color: #007bff;
    }

    .width-slider {
        width: 100%;
        cursor: pointer;
        accent-color: #007bff;
    }
</style>
