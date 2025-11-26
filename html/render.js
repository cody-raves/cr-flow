// ===============================
// RENDERING
// ===============================

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.13)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
        const gx = originX + i * cellSize;
        const gy = originY + i * cellSize;

        ctx.beginPath();
        ctx.moveTo(originX, gy);
        ctx.lineTo(originX + gridSize * cellSize, gy);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gx, originY);
        ctx.lineTo(gx, originY + gridSize * cellSize);
        ctx.stroke();
    }
}

function drawPaths() {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = cellSize * 0.7;

    for (const [color, pts] of Object.entries(paths)) {
        if (!pts || pts.length < 2) continue;

        ctx.strokeStyle = colorMap[color] || "#ffffff";
        ctx.beginPath();

        pts.forEach((c, idx) => {
            const cx = originX + c.x * cellSize + cellSize / 2;
            const cy = originY + c.y * cellSize + cellSize / 2;
            if (idx === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        });

        ctx.stroke();
    }
}

function drawEndpoint(x, y, color) {
    const cx = originX + x * cellSize + cellSize / 2;
    const cy = originY + y * cellSize + cellSize / 2;
    const r = cellSize * 0.28;

    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
}

function drawEndpoints() {
    for (const p of pairs) {
        const color = colorMap[p.color] || "#ffffff";
        drawEndpoint(p.a.x, p.a.y, color);
        drawEndpoint(p.b.x, p.b.y, color);
    }
}

// ===============================
// FX RENDERING
// ===============================

function drawPulse() {
    if (!activePulse) return;

    const now = performance.now();
    const t = (now - activePulse.time) / 1000;

    const scale = 0.8 + Math.sin(t * 4) * 0.2;

    const cx = originX + activePulse.x * cellSize + cellSize / 2;
    const cy = originY + activePulse.y * cellSize + cellSize / 2;
    const r = cellSize * 0.35 * scale;

    ctx.strokeStyle = colorMap[activePulse.color];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawCheckmarks() {
    const now = performance.now();

    for (const fx of endpointFX) {
        const t = (now - fx.start) / fx.duration;
        if (t >= 1) continue;

        const cx = originX + fx.x * cellSize + cellSize / 2;
        const cy = originY + fx.y * cellSize + cellSize / 2;

        ctx.save();
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(cx - 8, cy + 4);
        ctx.lineTo(cx - 2, cy + 10);
        ctx.lineTo(cx + 10, cy - 6);
        ctx.stroke();

        ctx.restore();
    }

    endpointFX = endpointFX.filter(fx => (now - fx.start) < fx.duration);
}

// ===============================
// TIMER BORDER (RECT AROUND PUZZLE)
// ===============================

// draw one half of the perimeter starting at bottom-center,
// going either clockwise (dir = 1) or counter-clockwise (dir = -1)
function drawBorderHalf(progress, dir) {
    if (progress <= 0) return;

    // rectangle slightly bigger than the grid
    const pad = 16;
    const w = gridSize * cellSize + pad * 2;
    const h = gridSize * cellSize + pad * 2;

    const left   = originX - pad;
    const top    = originY - pad;
    const right  = left + w;
    const bottom = top + h;

    const cx = (left + right) / 2;

    const perim = 2 * (w + h);        // full perimeter
    let remaining = progress * (perim / 2); // how far this half should go

    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    // helper to draw a partial segment
    function seg(fromX, fromY, toX, toY) {
        if (remaining <= 0) return { x: fromX, y: fromY };
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.hypot(dx, dy);
        if (len <= 0.0001) return { x: fromX, y: fromY };

        const use = Math.min(len, remaining);
        const t = use / len;
        const midX = fromX + dx * t;
        const midY = fromY + dy * t;

        ctx.lineTo(midX, midY);
        remaining -= use;

        return { x: midX, y: midY };
    }

    ctx.beginPath();

    if (dir === 1) {
        // clockwise: bottom-center → right → up → left → down
        let x = cx, y = bottom;
        ctx.moveTo(x, y);

        ({ x, y } = seg(x, y, right, bottom));  // to bottom-right
        ({ x, y } = seg(x, y, right, top));     // up right side
        ({ x, y } = seg(x, y, left, top));      // across top
        ({ x, y } = seg(x, y, left, bottom));   // down left side
        ({ x, y } = seg(x, y, cx, bottom));     // to bottom-center
    } else {
        // counter-clockwise: bottom-center → left → up → right → down
        let x = cx, y = bottom;
        ctx.moveTo(x, y);

        ({ x, y } = seg(x, y, left, bottom));   // to bottom-left
        ({ x, y } = seg(x, y, left, top));      // up left side
        ({ x, y } = seg(x, y, right, top));     // across top
        ({ x, y } = seg(x, y, right, bottom));  // down right side
        ({ x, y } = seg(x, y, cx, bottom));     // to bottom-center
    }

    ctx.stroke();
}

function drawTimerBorder() {
    if (typeof getBorderProgress !== "function") return;
    const p = getBorderProgress();
    if (p <= 0) return;

    // two mirrored strokes, both starting bottom-center
    drawBorderHalf(p, 1);   // clockwise
    drawBorderHalf(p, -1);  // counter-clockwise
}

// ===============================
// FULL FRAME
// ===============================

function render() {
    drawGrid();
    drawPaths();
    drawEndpoints();
    drawPulse();
    drawCheckmarks();

    // update timer (from timer.js)
    if (typeof updateTimerFrame === "function") {
        updateTimerFrame();
    }

    drawTimerBorder();
}

// ===============================
// ANIMATION LOOP
// ===============================

function animationLoop() {
    render();
    requestAnimationFrame(animationLoop);
}

requestAnimationFrame(animationLoop);
