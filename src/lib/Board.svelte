<script>
    import { onMount } from "svelte";
    import { brushSettings, boardData, saveState } from "$lib";

    let canvas;
    let ctx;

    // Стани малювання ліній
    let isDrawing = $state(false);
    let currentLineId = $state(null); // Запам'ятовуємо тільки ID поточної лінії

    // Стани для виділення та перетягування
    let isMoving = $state(false); // Переміщення ліній
    let isPanning = $state(false); // Переміщення всієї дошки
    let isSelectingArea = $state(false); // Малювання рамки виділення

    let startX = $state(0);
    let startY = $state(0);
    let currentX = $state(0);
    let currentY = $state(0);

    // Координати миші для кастомного курсора
    let mouseX = $state(-100);
    let mouseY = $state(-100);
    let showCursor = $state(false);

    let offscreenCanvas;
    let offscreenCtx;

    onMount(() => {
        ctx = canvas.getContext("2d");
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        canvas.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            canvas.removeEventListener("wheel", handleWheel);
        };
    });

    // Конвертація координат
    function toCanvas(x, y) {
        return {
            x: (x - boardData.offsetX) / boardData.zoom,
            y: (y - boardData.offsetY) / boardData.zoom,
        };
    }

    function toScreen(x, y) {
        return {
            x: x * boardData.zoom + boardData.offsetX,
            y: y * boardData.zoom + boardData.offsetY,
        };
    }

    $effect(() => {
        // Слідкуємо за змінами в даних дошки, щоб автоматично перемальовувати канвас
        boardData.lines;
        boardData.selectedLineIds;
        boardData.zoom;
        boardData.offsetX;
        boardData.offsetY;
        redraw();
    });

    function redraw() {
        if (!ctx) return;

        ctx.clearRect(0, 0, 10000, 10000);

        // 1. Малюємо білий фон
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 10000, 10000);

        // 2. Малюємо сітку
        drawGrid();

        // 3. Застосовуємо трансформації для ліній
        ctx.save();
        ctx.translate(boardData.offsetX, boardData.offsetY);
        ctx.scale(boardData.zoom, boardData.zoom);

        // 4. Малюємо всі лінії на офскрін канвасі для підтримки прозорої гумки
        if (offscreenCtx) {
            offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            
            // Застосовуємо ті ж трансформації до офскрін канвасу
            offscreenCtx.save();
            offscreenCtx.translate(boardData.offsetX, boardData.offsetY);
            offscreenCtx.scale(boardData.zoom, boardData.zoom);

            boardData.lines.forEach((line) => {
                if (!line.points || line.points.length === 0) return;

                offscreenCtx.beginPath();
                offscreenCtx.lineWidth = line.width;
                offscreenCtx.lineCap = "round";
                offscreenCtx.lineJoin = "round";

                const isEraser = line.tool === "eraser" || line.color === "#ffffff";

                if (isEraser) {
                    offscreenCtx.globalCompositeOperation = "destination-out";
                } else {
                    offscreenCtx.globalCompositeOperation = "source-over";
                }

                if (boardData.selectedLineIds.includes(line.id)) {
                    offscreenCtx.strokeStyle = "#ff3e00";
                    offscreenCtx.shadowColor = "rgba(255, 62, 0, 0.6)";
                    offscreenCtx.shadowBlur = 10 / boardData.zoom;
                } else {
                    offscreenCtx.strokeStyle = line.color;
                    offscreenCtx.shadowBlur = 0;
                }

                offscreenCtx.moveTo(line.points[0].x, line.points[0].y);

                if (line.points.length === 1) {
                    offscreenCtx.lineTo(line.points[0].x, line.points[0].y);
                } else {
                    for (let i = 1; i < line.points.length; i++) {
                        offscreenCtx.lineTo(line.points[i].x, line.points[i].y);
                    }
                }
                offscreenCtx.stroke();
            });

            offscreenCtx.restore();
            
            // Малюємо результат з офскрін канвасу на основний
            ctx.restore(); // Скидаємо трансформації перед drawImage, бо офскрін вже відрендерений з ними
            ctx.drawImage(offscreenCanvas, 0, 0);
        } else {
            ctx.restore();
        }

        // 5. Малюємо пунктирну рамку виділення (вона малюється в екранних координатах для зручності)
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
            ctx.setLineDash([]);
        }
    }

    function drawGrid() {
        const step = 40 * boardData.zoom;

        // Математика для "нескінченної" сітки
        const startXGrid = boardData.offsetX % step;
        const startYGrid = boardData.offsetY % step;

        ctx.beginPath();
        ctx.strokeStyle = "#f0f0f0"; // Світло-сірий для ліній клітинки
        ctx.lineWidth = 1;

        // Вертикальні лінії
        for (let x = startXGrid; x < canvas.width; x += step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }

        // Горизонтальні лінії
        for (let y = startYGrid; y < canvas.height; y += step) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }

        ctx.stroke();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (!offscreenCanvas) {
            offscreenCanvas = document.createElement("canvas");
        }
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        offscreenCtx = offscreenCanvas.getContext("2d");

        redraw();
    }

    function handleWheel(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Координати миші на канвасі ДО зуму
        const beforeZoom = toCanvas(mouseX, mouseY);

        const zoomSpeed = 0.001;
        let newZoom = boardData.zoom - e.deltaY * zoomSpeed;
        newZoom = Math.max(0.1, Math.min(10, newZoom));

        boardData.zoom = newZoom;

        // Координати миші на канвасі ПІСЛЯ зуму (мають збігатися з beforeZoom)
        // Новий offset = mouse - beforeZoom * zoom
        boardData.offsetX = mouseX - beforeZoom.x * boardData.zoom;
        boardData.offsetY = mouseY - beforeZoom.y * boardData.zoom;

        redraw();
    }

    // Перевірка, чи потрапила лінія в зону прямокутника
    function isLineInSelectArea(x1, y1, x2, y2, line) {
        // Конвертуємо рамку виділення (яка в екранних координатах) в координати канвасу
        const p1 = toCanvas(x1, y1);
        const p2 = toCanvas(x2, y2);

        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);

        // Якщо хоча б одна точка лінії лежить всередині рамки — лінія вважається виділеною
        return line.points.some(
            (p) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY,
        );
    }

    // Математика кліку мишкою по лінії (для поодинокого виділення)
    function isPointNearLine(px, py, line) {
        // px, py вже мають бути в координатах канвасу
        const threshold = (line.width + 10) / boardData.zoom; // Поріг теж залежить від зуму
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
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Конвертуємо в координати канвасу
        const canvasPos = toCanvas(screenX, screenY);

        startX = screenX; // Для рамки виділення та панорамування використовуємо екранні
        startY = screenY;
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (e.button === 1 || e.button === 2 || brushSettings.tool === "move") {
            // Середня, права кнопка або інструмент "move" — панорамування
            isPanning = true;
            return;
        }

        saveState();

        if (brushSettings.tool === "select") {
            // Перевіряємо, чи клікнули ми по якійсь лінії
            let clickedLine = null;
            for (let i = boardData.lines.length - 1; i >= 0; i--) {
                if (
                    isPointNearLine(
                        canvasPos.x,
                        canvasPos.y,
                        boardData.lines[i],
                    )
                ) {
                    clickedLine = boardData.lines[i];
                    break;
                }
            }

            if (clickedLine) {
                if (!boardData.selectedLineIds.includes(clickedLine.id)) {
                    boardData.selectedLineIds = [clickedLine.id];
                }
                isMoving = true;
            } else {
                boardData.selectedLineIds = [];
                isSelectingArea = true;
                currentX = screenX;
                currentY = screenY;
            }
            redraw();
        } else {
            isDrawing = true;
            boardData.selectedLineIds = [];

            const id = Date.now() + Math.random();
            currentLineId = id;

            boardData.lines = [
                ...boardData.lines,
                {
                    id: id,
                    color: brushSettings.color,
                    width: brushSettings.width,
                    tool: brushSettings.tool,
                    points: [{ x: canvasPos.x, y: canvasPos.y }],
                },
            ];
            redraw();
        }
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const canvasPos = toCanvas(screenX, screenY);

        mouseX = e.clientX;
        mouseY = e.clientY;
        showCursor = true;

        if (isPanning) {
            boardData.offsetX += screenX - startX;
            boardData.offsetY += screenY - startY;
            startX = screenX;
            startY = screenY;
            redraw();
        } else if (isDrawing && currentLineId) {
            boardData.lines = boardData.lines.map((line) => {
                if (line.id === currentLineId) {
                    return {
                        ...line,
                        points: [
                            ...line.points,
                            { x: canvasPos.x, y: canvasPos.y },
                        ],
                    };
                }
                return line;
            });
            redraw();
        } else if (isSelectingArea) {
            currentX = screenX;
            currentY = screenY;
            redraw();
        } else if (isMoving && boardData.selectedLineIds.length > 0) {
            const dx = (screenX - startX) / boardData.zoom;
            const dy = (screenY - startY) / boardData.zoom;

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

            startX = screenX;
            startY = screenY;
            redraw();
        }
    }

    function handleMouseUp(e) {
        if (isSelectingArea) {
            const rect = canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            let newlySelected = [];
            boardData.lines.forEach((line) => {
                if (
                    isLineInSelectArea(startX, startY, screenX, screenY, line)
                ) {
                    newlySelected.push(line.id);
                }
            });

            boardData.selectedLineIds = newlySelected;
            redraw();
        }

        isDrawing = false;
        isMoving = false;
        isPanning = false;
        isSelectingArea = false;
        currentLineId = null;
    }
</script>

<canvas
    bind:this={canvas}
    class={brushSettings.tool}
    class:panning={isPanning}
    onmousedown={handleMouseDown}
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
    onmouseenter={(e) => {
        showCursor = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    }}
    onmouseleave={(e) => {
        handleMouseUp(e);
        showCursor = false;
    }}
    oncontextmenu={(e) => e.preventDefault()}
></canvas>

{#if showCursor && (brushSettings.tool === "brush" || brushSettings.tool === "eraser")}
    <div
        class="custom-cursor"
        style="
            left: {mouseX}px; 
            top: {mouseY}px; 
            width: {brushSettings.width * boardData.zoom}px; 
            height: {brushSettings.width * boardData.zoom}px;
            background-color: {brushSettings.tool === 'eraser'
            ? 'rgba(255, 255, 255, 0.3)'
            : brushSettings.color};
            border: 1px solid {brushSettings.tool === 'eraser'
            ? '#000'
            : 'rgba(0,0,0,0.2)'};
        "
    ></div>
{/if}

<style>
    canvas {
        background: #ffffff;
        display: block;
    }

    canvas.brush,
    canvas.eraser {
        cursor: none;
    }

    canvas.select {
        cursor: default;
    }

    canvas.move {
        cursor: grab;
    }

    canvas.panning {
        cursor: grabbing !important;
    }

    .custom-cursor {
        position: fixed;
        pointer-events: none;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
    }
</style>
