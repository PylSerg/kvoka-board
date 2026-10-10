<script>
    let {
        x,
        y,
        menuX,
        menuY,
        isOpen = false,
        onToggle,
        onCopy,
        onDelete,
        isText = false,
        onEdit,
    } = $props();
</script>

<button
    class="selection-menu-trigger"
    style="left: {x}px; top: {y}px;"
    onclick={() => onToggle?.()}
    onpointerdown={(e) => e.stopPropagation()}
    title="Відкрити контекстне меню"
    aria-label="Відкрити контекстне меню"
    aria-expanded={isOpen}
    aria-haspopup="menu"
>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        aria-hidden="true"
    >
        <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
</button>

{#if isOpen}
    <div
        class="selection-menu"
        style="left: {menuX}px; top: {menuY}px;"
        onpointerdown={(e) => e.stopPropagation()}
        role="menu"
        aria-label="Контекстне меню виділення"
        tabindex="-1"
    >
        {#if isText}
            <button class="menu-item edit" onclick={onEdit}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Редагувати
            </button>
            <div class="divider"></div>
        {/if}
        <button class="menu-item copy" onclick={onCopy}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Копіювати
        </button>
        <div class="divider"></div>
        <button class="menu-item delete" onclick={onDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1.1 0-2-0.9-2-2V6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 0 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            Видалити
        </button>
    </div>
{/if}

<style>
    .selection-menu-trigger {
        position: fixed;
        z-index: 10001;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(255, 255, 255, 0.85);
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.94);
        color: #007bff;
        box-shadow: 0 5px 16px rgba(0, 0, 0, 0.16), 0 0 0 2px rgba(0, 123, 255, 0.12);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        animation: fadeInButton 0.15s ease-out;
    }

    .selection-menu-trigger:hover {
        background: #007bff;
        color: #ffffff;
        box-shadow: 0 7px 20px rgba(0, 123, 255, 0.3), 0 0 0 3px rgba(0, 123, 255, 0.14);
        transform: translate(-50%, -50%) scale(1.06);
    }

    .selection-menu-trigger:active {
        transform: translate(-50%, -50%) scale(0.94);
    }

    @keyframes fadeInButton {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .selection-menu {
        position: fixed;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        z-index: 10000;
        min-width: 140px;
        animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .menu-item {
        background: transparent;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }

    .menu-item svg {
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .menu-item:hover {
        background: rgba(0, 123, 255, 0.1);
        color: #007bff;
    }

    .menu-item:hover svg {
        opacity: 1;
        stroke: #007bff;
    }

    .menu-item.edit:hover {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
    }

    .menu-item.edit:hover svg {
        stroke: #16a34a;
    }

    .menu-item.delete:hover {
        background: rgba(255, 59, 48, 0.1);
        color: #ff3b30;
    }

    .menu-item.delete:hover svg {
        stroke: #ff3b30;
    }

    .divider {
        height: 1px;
        background: rgba(0, 0, 0, 0.05);
        margin: 4px 8px;
    }
</style>
