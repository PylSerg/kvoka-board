<script>
    import { onMount, tick } from "svelte";
    import clearIcon from "$lib/assets/broom.png";

    let {
        onConfirm,
        isVertical = true,
    } = $props();

    let isOpen = $state(false);
    let containerElement;
    let popupStyle = $state("top: 0; left: calc(100% + 12px); right: auto; bottom: auto;");

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

    function handleConfirm() {
        if (onConfirm) onConfirm();
        isOpen = false;
    }

    function handleCancel() {
        isOpen = false;
    }
</script>

<div class="clear-confirm-container" bind:this={containerElement}>
    <button
        onclick={togglePopup}
        title="Очистити дошку"
        class="action-btn delete-btn"
    >
        <img src={clearIcon} alt="Очистити дошку" class="icon" />
    </button>

    {#if isOpen}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div class="popup" style={popupStyle} onpointerdown={(e) => e.stopPropagation()}>
            <div class="popup-text">Очистити дошку?</div>
            <div class="popup-actions">
                <button class="confirm-btn" onclick={handleConfirm}>Так</button>
                <button class="cancel-btn" onclick={handleCancel}>Ні</button>
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    .clear-confirm-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button.action-btn {
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
        color: #333;
        font-weight: bold;

        &:hover {
            background-color: #c7dff9;
        }
        
        &:active {
            transform: scale(0.95);
        }

        &.delete-btn {
            color: #dc3545;
            &:hover {
                background-color: #f8d7da;
            }
        }

        .icon {
            width: 20px;
            height: 20px;
            object-fit: contain;
        }
    }

    .popup {
        position: absolute;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 160px;
        
        .popup-text {
            font-size: 14px;
            color: #333;
            text-align: center;
            font-weight: 500;
        }

        .popup-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            
            button {
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: background-color 0.2s;
                
                &.confirm-btn {
                    background-color: #ffebee;
                    color: #d32f2f;
                    
                    &:hover {
                        background-color: #ffcdd2;
                    }
                }
                
                &.cancel-btn {
                    background-color: #f5f5f5;
                    color: #333;
                    
                    &:hover {
                        background-color: #e0e0e0;
                    }
                }
            }
        }
    }
</style>
