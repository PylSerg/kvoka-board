<script>
    import { onMount } from "svelte";
    import { brushSettings, boardData, saveState } from "$lib";

    let canvas;
    let ctx;

    // Стани малювання ліній
    let isDrawing = false;
    let currentLineId = null; // Запам'ятовуємо тільки ID поточної лінії

    // Стани для виділення та перетягування
    let isMoving = false; // Переміщення ліній
    let isSelectingArea = false; // Малювання рамки виділення

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    onMount(() => {
        ctx = canvas.getContext("2d");
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    });

    $effect(() => {
        // Слідкуємо за змінами в даних дошки, щоб автоматично перемальовувати канвас
        // Це особливо важливо для Undo/Redo, які змінюють стор ззовні компонента
        boardData.lines;
        boardData.selectedLineIds;
        redraw();
    });

    function redraw() {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Малюємо білий фон
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Малюємо всі лінії
        boardData.lines.forEach((line) => {
            if (!line.points || line.points.length === 0) return;

            ctx.beginPath();
            ctx.lineWidth = line.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            // Перевіряємо, чи входить ID лінії в масив виділених
            if (boardData.selectedLineIds.includes(line.id)) {
                ctx.strokeStyle = "#ff3e00"; // Червоний неон для виділених
                ctx.shadowColor = "rgba(255, 62, 0, 0.6)";
                ctx.shadowBlur = 10;
            } else {
                ctx.strokeStyle = line.color;
                ctx.shadowBlur = 0;
            }

            ctx.moveTo(line.points[0].x, line.points[0].y);

            if (line.points.length === 1) {
                ctx.lineTo(line.points[0].x, line.points[0].y);
            } else {
                for (let i = 1; i < line.points.length; i++) {
                    ctx.lineTo(line.points[i].x, line.points[i].y);
                }
            }
            ctx.stroke();
        });

        ctx.shadowBlur = 0; // Скидаємо тінь

        // 3. Малюємо пунктирну рамку виділення
        if (isSelectingArea) {
            ctx.beginPath();
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = "#007bff";
            ctx.lineWidth = 1;
            ctx.fillStyle = "rgba(0, 123, 255, 0.1)";

            const width = currentX - startX;
            const height = currentY - startY;

            ctx.fillRect(startX, startY, width, height);
            ctx.strokeRect(startX, startY, width, height);
            ctx.setLineDash([]); // Вертаємо суцільну лінію
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw();
    }

    // Перевірка, чи потрапила лінія в зону прямокутника
    function isLineInSelectArea(x1, y1, x2, y2, line) {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        // Якщо хоча б одна точка лінії лежить всередині рамки — лінія вважається виділеною
        return line.points.some(
            (p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY,
        );
    }

    // Математика кліку мишкою по лінії (для поодинокого виділення)
    function isPointNearLine(px, py, line) {
        const threshold = line.width + 10;
        for (let i = 0; i < line.points.length - 1; i++) {
            const p1 = line.points[i];
            const p2 = line.points[i + 1];
            const A = px - p1.x;
            const B = py - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = lenSq !== 0 ? dot / lenSq : -1;
            let xx, yy;
            if (param < 0) {
                xx = p1.x;
                yy = p1.y;
            } else if (param > 1) {
                xx = p2.x;
                yy = p2.y;
            } else {
                xx = p1.x + param * C;
                yy = p1.y + param * D;
            }
            if (Math.sqrt((px - xx) ** 2 + (py - yy) ** 2) < threshold)
                return true;
        }
        return false;
    }

    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        startX = x;
        startY = y;

        saveState();

        if (brushSettings.tool === "select") {
            // Перевіряємо, чи клікнули ми по якійсь лінії, що вже виділена або просто лежить на дошці
            let clickedLine = null;
            for (let i = boardData.lines.length - 1; i >= 0; i--) {
                if (isPointNearLine(x, y, boardData.lines[i])) {
                    clickedLine = boardData.lines[i];
                    break;
                }
            }

            if (clickedLine) {
                // Якщо ця лінія ще не була виділена — робимо її єдиною виділеною
                if (!boardData.selectedLineIds.includes(clickedLine.id)) {
                    boardData.selectedLineIds = [clickedLine.id];
                }
                isMoving = true;
            } else {
                // Клікнули в порожнечу — знімаємо виділення і починаємо малювати рамку
                boardData.selectedLineIds = [];
                isSelectingArea = true;
                currentX = x;
                currentY = y;
            }
            redraw();
        } else {
            // Режим малювання
            isDrawing = true;
            boardData.selectedLineIds = []; // Скидаємо виділення

            const id = Date.now() + Math.random();
            currentLineId = id;

            // Додаємо лінію безпосередньо в реактивний масив стору
            boardData.lines = [
                ...boardData.lines,
                {
                    id: id,
                    color:
                        brushSettings.tool === "eraser"
                            ? "#ffffff"
                            : brushSettings.color,
                    width: brushSettings.width,
                    points: [{ x, y }],
                },
            ];
            redraw();
        }
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isDrawing && currentLineId) {
            // Оновлюємо точки лінії прямо всередині реактивного масиву стору
            boardData.lines = boardData.lines.map((line) => {
                if (line.id === currentLineId) {
                    return { ...line, points: [...line.points, { x, y }] };
                }
                return line;
            });
            redraw();
        } else if (isSelectingArea) {
            currentX = x;
            currentY = y;
            redraw();
        } else if (isMoving && boardData.selectedLineIds.length > 0) {
            const dx = x - startX;
            const dy = y - startY;

            // Зсуваємо координати ОДРАЗУ ДЛЯ ВСІХ виділених ліній
            boardData.lines = boardData.lines.map((line) => {
                if (boardData.selectedLineIds.includes(line.id)) {
                    return {
                        ...line,
                        points: line.points.map((p) => ({
                            x: p.x + dx,
                            y: p.y + dy,
                        })),
                    };
                }
                return line;
            });

            startX = x;
            startY = y;
            redraw();
        }
    }

    function handleMouseUp(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isSelectingArea) {
            isSelectingArea = false;

            let newlySelected = [];
            // Проходимо по ВСІХ лініях і збираємо ті, що потрапили в рамку
            boardData.lines.forEach((line) => {
                if (isLineInSelectArea(startX, startY, x, y, line)) {
                    newlySelected.push(line.id);
                }
            });

            boardData.selectedLineIds = newlySelected;
            redraw();
        }

        isDrawing = false;
        isMoving = false;
        currentLineId = null;
    }
</script>

<canvas
    bind:this={canvas}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseleave={handleMouseUp}
></canvas>

<style>
    canvas {
        background: #ffffff;
        cursor: crosshair;
        display: block;
    }
</style>
