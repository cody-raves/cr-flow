// ===============================
// RANDOM PUZZLE GENERATION
// ===============================

function generateHamiltonianPath(size) {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const path = new Array(size * size);

    function dfs(x, y, depth) {
        visited[y][x] = true;
        path[depth] = { x, y };

        if (depth === size * size - 1) return true;

        const dirs = shuffle([
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ]);

        for (const d of dirs) {
            const nx = x + d.dx;
            const ny = y + d.dy;

            if (
                nx >= 0 && ny >= 0 &&
                nx < size && ny < size &&
                !visited[ny][nx]
            ) {
                if (dfs(nx, ny, depth + 1)) return true;
            }
        }

        visited[y][x] = false;
        return false;
    }

    const maxAttempts = 50;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                visited[y][x] = false;
            }
        }

        const sx = Math.floor(Math.random() * size);
        const sy = Math.floor(Math.random() * size);

        if (dfs(sx, sy, 0)) return path;
    }

    throw new Error("Failed to generate Hamiltonian path");
}

function buildSolutionAndEndpoints(path, size, numColors) {
    const total = size * size;
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    const endpointsByColor = {};

    let minSeg = 3;
    if (numColors * minSeg > total) minSeg = 2;

    const baseUsed = minSeg * numColors;
    const extra = total - baseUsed;

    function randomPartition(totalExtra, parts) {
        if (totalExtra === 0) return Array(parts).fill(0);
        const cuts = [];
        for (let i = 0; i < parts - 1; i++) cuts.push(Math.floor(Math.random() * (totalExtra + 1)));
        cuts.sort((a, b) => a - b);
        const res = [];
        let prev = 0;
        for (let c of cuts) {
            res.push(c - prev);
            prev = c;
        }
        res.push(totalExtra - prev);
        return res;
    }

    const extras = randomPartition(extra, numColors);
    const lengths = extras.map(e => e + minSeg);

    let offset = 0;
    for (let colorId = 1; colorId <= numColors; colorId++) {
        const len = lengths[colorId - 1];
        const startIndex = offset;
        const endIndex = offset + len - 1;

        for (let i = startIndex; i <= endIndex; i++) {
            const { x, y } = path[i];
            grid[y][x] = colorId;
        }

        endpointsByColor[colorId] = { startIndex, endIndex };
        offset = endIndex + 1;
    }

    return { grid, endpointsByColor };
}

function buildPuzzleFromEndpoints(path, size, endpointsByColor) {
    const puzzle = Array.from({ length: size }, () => Array(size).fill(0));

    for (let colorId = 1; colorId <= NUM_COLORS; colorId++) {
        const info = endpointsByColor[colorId];
        if (!info) continue;

        const start = path[info.startIndex];
        const end = path[info.endIndex];

        puzzle[start.y][start.x] = colorId;
        puzzle[end.y][end.x] = colorId;
    }

    return puzzle;
}

function generateRandomPuzzle6x6() {
    const size = GRID_SIZE;
    const numColors = NUM_COLORS;

    const path = generateHamiltonianPath(size);
    const { grid: solutionGrid, endpointsByColor } =
        buildSolutionAndEndpoints(path, size, numColors);

    solutionPaths = {};
    for (let colorId = 1; colorId <= numColors; colorId++) {
        const info = endpointsByColor[colorId];
        if (!info) continue;
        const pts = [];
        for (let i = info.startIndex; i <= info.endIndex; i++) {
            const cell = path[i];
            pts.push({ x: cell.x, y: cell.y });
        }
        solutionPaths[String(colorId)] = pts;
    }

    return buildPuzzleFromEndpoints(path, size, endpointsByColor);
}
