// src/lib/history.svelte.js
import { boardData } from './store.svelte.js';

let undoStack = [];
let redoStack = [];

// Функція, яка зберігає поточний стан дошки перед новою дією
export function saveState() {
    // Глибоке копіювання ліній та їхніх точок, щоб історія не мутувала разом із дошкою
    const stateCopy = boardData.lines.map((line) => ({
        ...line,
        points: line.points.map((p) => ({ ...p }))
    }));

    undoStack.push(stateCopy);
    redoStack = []; // Очищаємо redo, бо пішла нова гілка дій
}

export function undo() {
    if (undoStack.length === 0) return;

    // Зберігаємо поточний стан дошки у стек REDO перед тим як повернутися назад
    const currentState = boardData.lines.map((line) => ({
        ...line,
        points: line.points.map((p) => ({ ...p }))
    }));
    redoStack.push(currentState);

    // Дістаємо попередній стан
    const prevState = undoStack.pop();
    boardData.lines = prevState;
    boardData.selectedLineIds = []; // Скидаємо виділення про всяк випадок
}

export function redo() {
    if (redoStack.length === 0) return;

    // Повертаємо поточний стан у стек UNDO
    const currentState = boardData.lines.map((line) => ({
        ...line,
        points: line.points.map((p) => ({ ...p }))
    }));
    undoStack.push(currentState);

    // Беремо стан із майбутнього
    const nextState = redoStack.pop();
    boardData.lines = nextState;
    boardData.selectedLineIds = [];
}

export function clearAll() {
    if (boardData.lines.length === 0) return;

    saveState(); // Дозволяємо скасувати очищення дошки, якщо вчитель випадково на неї натиснув
    boardData.lines = [];
    boardData.selectedLineIds = [];
}