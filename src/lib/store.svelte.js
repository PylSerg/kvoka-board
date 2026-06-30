// src/lib/store.svelte.js

export const brushSettings = $state({
    color: '#000000',
    width: 5,
    tool: 'brush', // 'brush', 'eraser', 'select', 'move', 'shape', 'text'
    shapeType: 'rectangle' // default shape
});

// Масив усіх намальованих ліній
export const boardData = $state({
    lines: [],            // Кожна лінія: { id, color, width, points: [{x, y}] }
    selectedLineIds: [],  // <--- Тепер це масив для множинного виділення!
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    pdfFrames: [],        // Фрейми для експорту в PDF: { id, x, y, width, height, isVertical, number }
    isPdfMode: false      // Чи активний режим налаштування фреймів PDF
});