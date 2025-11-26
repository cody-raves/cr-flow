// ===============================
// INPUT (MOUSE)
// ===============================

function cellFromEvent(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left - originX;
    const y = e.clientY - r.top - originY;

    const cx = Math.floor(x / cellSize);
    const cy = Math.floor(y / cellSize);

    if (cx < 0 || cy < 0 || cx >= gridSize || cy >= gridSize) return null;
    return { x: cx, y: cy };
}

function handleDown(cell) {
    const k = key(cell.x, cell.y);
    const epColor = endpoints[k];
    const cellOwner = owner[cell.y][cell.x];

    // 🔵 Pulse the sister endpoint
    if (epColor) {
        for (const p of pairs) {
            if (p.color === epColor) {
                const target =
                    (p.a.x === cell.x && p.a.y === cell.y) ? p.b : p.a;

                activePulse = {
                    x: target.x,
                    y: target.y,
                    color: epColor,
                    time: performance.now()
                };
                break;
            }
        }
    }

    // Clicking a pipe segment to modify it
    if (cellOwner) {
        const color = cellOwner;
        const path = paths[color] || [];

        if (path.length > 0) {
            const idx = path.findIndex(c => c.x === cell.x && c.y === cell.y);
            if (idx !== -1) {

                // Locked pipe → clear entirely
                if (locked[color]) {
                    for (const c of path) owner[c.y][c.x] = null;
                    delete paths[color];
                    locked[color] = false;
                    render();
                    return;
                }

                // Trim tail after this point
                for (let i = idx + 1; i < path.length; i++) {
                    const c = path[i];
                    const ck = key(c.x, c.y);
                    if (!endpoints[ck]) owner[c.y][c.x] = null;
                }

                paths[color] = path.slice(0, idx + 1);
                activeColor = color;
                isDrawing = true;
                render();
                return;
            }
        }
    }

    // Must click an endpoint to start drawing
    if (!epColor || locked[epColor]) return;

    activeColor = epColor;
    isDrawing = true;

    // Remove old partial pipe for this color
    const old = paths[activeColor] || [];
    for (const c of old) {
        const ck = key(c.x, c.y);
        if (!endpoints[ck]) owner[c.y][c.x] = null;
    }

    paths[activeColor] = [{ x: cell.x, y: cell.y }];
    owner[cell.y][cell.x] = activeColor;

    render();
}

function stepToCell(x, y) {
    if (!isDrawing || !activeColor) return false;
    if (locked[activeColor]) return false;

    const path = paths[activeColor] || [];
    const last = path[path.length - 1];
    if (!last) return false;

    const dx = Math.abs(x - last.x);
    const dy = Math.abs(y - last.y);

    // must be 1-step orthogonal
    if (dx + dy !== 1) return false;

    const k = key(x, y);
    const epColor = endpoints[k];

    // can't enter other colors' endpoints
    if (epColor && epColor !== activeColor) return false;

    const pathHasCell = path.some(c => c.x === x && c.y === y);

    // 🔵 Completed the pipe (reached matching endpoint)
    if (epColor && epColor === activeColor) {

        if (!pathHasCell) {
            paths[activeColor].push({ x, y });
            owner[y][x] = activeColor;
        }

        locked[activeColor] = true;

        // FX checkmarks
        for (const p of pairs) {
            if (p.color === activeColor) {
                endpointFX.push({
                    x: p.a.x, y: p.a.y,
                    start: performance.now(), duration: 800
                });
                endpointFX.push({
                    x: p.b.x, y: p.b.y,
                    start: performance.now(), duration: 800
                });
                break;
            }
        }

        // 🔊 NATIVE SOUND: pair completed
        fetch(`https://${GetParentResourceName()}/pair`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        render();
        checkComplete();

        isDrawing = false;
        mouseDown = false;
        activeColor = null;
        activePulse = null;
        return false;
    }

    // Can't re-walk own pipe
    if (pathHasCell) return false;

    // ❌ If stepping on another pipe → delete it
    const existingOwner = owner[y][x];
    if (existingOwner && existingOwner !== activeColor) {
        const other = paths[existingOwner];
        if (other) {
            for (const c of other) {
                const ck = key(c.x, c.y);
                if (!endpoints[ck]) owner[c.y][c.x] = null;
            }
            delete paths[existingOwner];
            locked[existingOwner] = false;

            // 🔊 NATIVE SOUND: fail / overwrite (just sound, not full fail)
            fetch(`https://${GetParentResourceName()}/failsound`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // Add segment
    paths[activeColor].push({ x, y });
    owner[y][x] = activeColor;

    render();
    checkComplete();
    return true;
}

function handleMove(cell) {
    if (!isDrawing || !activeColor) return;
    if (locked[activeColor]) return;

    const path = paths[activeColor] || [];
    const last = path[path.length - 1];
    if (!last) return;

    let dx = cell.x - last.x;
    let dy = cell.y - last.y;

    if (dx === 0 && dy === 0) return;
    if (dx !== 0 && dy !== 0) return;

    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);

    let curX = last.x;
    let curY = last.y;

    while (curX !== cell.x || curY !== cell.y) {
        curX += stepX;
        curY += stepY;

        const cont = stepToCell(curX, curY);
        if (!cont) break;
    }
}
