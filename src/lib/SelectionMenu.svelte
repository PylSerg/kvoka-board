<script>
    let { x, y, onCopy, onDelete } = $props();
</script>

<div 
    class="selection-menu" 
    style="left: {x + 15}px; top: {y}px;"
    onmousedown={(e) => e.stopPropagation()}
    role="menu"
    aria-label="Контекстне меню виділення"
    tabindex="-1"
>
    <button class="menu-item copy" onclick={onCopy}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        Копіювати
    </button>
    <div class="divider"></div>
    <button class="menu-item delete" onclick={onDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        Видалити
    </button>
</div>

<style>
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
