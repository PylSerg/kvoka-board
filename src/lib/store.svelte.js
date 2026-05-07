// src/lib/store.svelte.js

export const brushSettings = $state({
    color: '#000000',
    width: 5,
    tool: 'brush' // 'brush', 'eraser', 'select' або 'move'
});

// Масив усіх намальованих ліній
export const boardData = $state({
    lines: [],            // Кожна лінія: { id, color, width, points: [{x, y}] }
    selectedLineIds: [],  // <--- Тепер це масив для множинного виділення!
    zoom: 1,
    offsetX: 0,
    offsetY: 0
});