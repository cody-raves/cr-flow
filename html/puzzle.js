// ===============================
// PUZZLE LOADING
// ===============================

function buildLevelFromGrid(grid) {
    gridSize = grid.length;
    pairs = [];
    const colorCells = {};

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const id = grid[y][x];
            if (id > 0) {
                const k = String(id);
                if (!colorCells[k]) colorCells[k] = [];
                colorCells[k].push({ x, y });
            }
        }
    }

    for (const [id, cells] of Object.entries(colorCells)) {
        if (cells.length >= 2) {
            pairs.push({
                color: id,
                a: cells[0],
                b: cells[1]
            });
        }
    }
}

function initState() {
    owner = [];
    paths = {};
    endpoints = {};
    locked = {};

    for (let y = 0; y < gridSize; y++) {
        owner[y] = [];
        for (let x = 0; x < gridSize; x++) {
            owner[y][x] = null;
        }
    }

    for (const p of pairs) {
        endpoints[key(p.a.x, p.a.y)] = p.color;
        endpoints[key(p.b.x, p.b.y)] = p.color;
    }
}

function resizeCanvas() {
    const size = Math.min(420, Math.min(window.innerWidth, window.innerHeight) * 0.8);
    cellSize = (size - margin * 2) / gridSize;

    canvas.width = size;
    canvas.height = size;
    originX = margin;
    originY = margin;
}

function loadRandomLevel() {
    const puzzle = generateRandomPuzzle6x6();
    buildLevelFromGrid(puzzle);
    resizeCanvas();
    initState();
    render();
}
