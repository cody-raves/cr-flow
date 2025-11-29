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
    let size = 6;
    let numColors = 6;

    if (typeof Config === "object") {
        const minG = Config.minGrid || 5;
        const maxG = Config.maxGrid || 9;
        const desired = Number(Config.gridSize) || 6;
        size = Math.max(minG, Math.min(maxG, desired));

        if (typeof ColorRules === "object") {
            const mapped = ColorRules[size];
            numColors = mapped || size;
        } else {
            numColors = size;
        }

        Config.gridSize = size;
        Config.numColors = numColors;
    }

    debugLog("loadRandomLevel_start", {
        size,
        numColors
    });

    let puzzle;
    try {
        puzzle = generateRandomPuzzle(size, numColors);
        debugLog("loadRandomLevel_after_generate", {
            size,
            numColors,
            puzzleRows: puzzle.length,
            puzzleCols: puzzle[0] && puzzle[0].length
        });
    } catch (e) {
        debugLog("loadRandomLevel_generate_error", { error: String(e) });
        return;
    }

    buildLevelFromGrid(puzzle);
    debugLog("loadRandomLevel_after_buildLevelFromGrid", {
        gridSize,
        pairs: pairs && pairs.length
    });

    resizeCanvas();
    initState();
    render();

    debugLog("loadRandomLevel_done", {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        cellSize
    });
}


