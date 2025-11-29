// ===============================
// RANDOM PUZZLE GENERATION
// ===============================

// Small helper: safe debug logger
function debugLog(label, info) {
    try {
        console.log(`[cr-flow] ${label}`, info || {});
        fetch(`https://${GetParentResourceName()}/debug`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: label,
                info: info || {}
            })
        });
    } catch (e) {
        console.log("[cr-flow debugLog error]", e);
    }
}

// -------------------------------
// 1) DFS HAMILTONIAN (for 5–7)
// -------------------------------

function generateHamiltonianPathDFS(size, maxAttempts) {
    debugLog("hamiltonian_start", { size, maxAttempts });

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

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                visited[y][x] = false;
            }
        }

        const sx = Math.floor(Math.random() * size);
        const sy = Math.floor(Math.random() * size);

        if (dfs(sx, sy, 0)) {
            debugLog("hamiltonian_success", { size, attempt, pathLen: path.length });
            return path.slice();
        }
    }

    debugLog("hamiltonian_failed", { size, maxAttempts });
    return null;
}

// -------------------------------
// 2) SPIRAL HAMILTONIAN (for 8–9)
// -------------------------------

function generateSpiralPath(size) {
    debugLog("spiral_start", { size });

    const path = [];
    let left = 0;
    let top = 0;
    let right = size - 1;
    let bottom = size - 1;

    let x = 0;
    let y = 0;
    let dx = 1;
    let dy = 0;

    for (let k = 0; k < size * size; k++) {
        path.push({ x, y });

        let nx = x + dx;
        let ny = y + dy;

        if (dx === 1 && nx > right) {
            dx = 0; dy = 1;
            top++;
        } else if (dy === 1 && ny > bottom) {
            dx = -1; dy = 0;
            right--;
        } else if (dx === -1 && nx < left) {
            dx = 0; dy = -1;
            bottom--;
        } else if (dy === -1 && ny < top) {
            dx = 1; dy = 0;
            left++;
        }

        x += dx;
        y += dy;
    }

    debugLog("spiral_done", { size, pathLen: path.length });
    return path;
}

// -------------------------------
// 3) APPLY RANDOM SYMMETRY
// -------------------------------
//
// We take a base Hamiltonian path and randomly rotate/flip it so
// we don’t always get the same “lean”.
//

function applyRandomSymmetry(path, size) {
    const mode = Math.floor(Math.random() * 8); // 0..7
    debugLog("symmetry_mode", { size, mode });

    function transform(p) {
        let { x, y } = p;
        const max = size - 1;

        switch (mode) {
            case 0: // identity
                break;
            case 1: // rotate 90
                [x, y] = [y, max - x];
                break;
            case 2: // rotate 180
                x = max - x;
                y = max - y;
                break;
            case 3: // rotate 270
                [x, y] = [max - y, x];
                break;
            case 4: // flip H
                x = max - x;
                break;
            case 5: // flip V
                y = max - y;
                break;
            case 6: // flip diag
                [x, y] = [y, x];
                break;
            case 7: // flip anti-diag
                [x, y] = [max - y, max - x];
                break;
        }
        return { x, y };
    }

    return path.map(transform);
}

// -------------------------------
// 4) CHOOSE BASE PATH PER SIZE
// -------------------------------

function generateBaseHamiltonianPath(size) {
    // 5–7: use DFS (nice organic layouts)
    if (size <= 7) {
        const dfsPath = generateHamiltonianPathDFS(size, 200);
        if (dfsPath) {
            return applyRandomSymmetry(dfsPath, size);
        }
        // If DFS somehow fails, fall through to spiral
    }

    // 8–9: use spiral (fast, no delay) and random symmetry
    const spiral = generateSpiralPath(size);
    return applyRandomSymmetry(spiral, size);
}

// -------------------------------
// 5) BUILD SOLUTION + ENDPOINTS
// -------------------------------
//
// Give colors a *heavy-tailed* mix of lengths so we get
// some short, some medium, some long pipes.
//

function buildSolutionAndEndpoints(path, size, numColors) {
    const total = size * size;
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    const endpointsByColor = {};

    let minSeg = 3;
    if (numColors * minSeg > total) minSeg = 2;

    const baseUsed = minSeg * numColors;
    let extra = total - baseUsed;

    // Heavy-tailed random weights -> mixed lengths
    const weights = [];
    for (let i = 0; i < numColors; i++) {
        // 1 - r^2 biases some colors to be much larger
        const r = Math.random();
        weights.push(1 - r * r);
    }
    const wSum = weights.reduce((a, b) => a + b, 0) || 1;

    const lengths = new Array(numColors).fill(minSeg);
    let allocated = 0;

    for (let i = 0; i < numColors; i++) {
        let share;
        if (i === numColors - 1) {
            // Whatever is left goes to the last color
            share = extra - allocated;
        } else {
            share = Math.floor(extra * (weights[i] / wSum));
        }

        if (share < 0) share = 0;
        lengths[i] += share;
        allocated += share;
    }

    debugLog("buildSolutionAndEndpoints_done", {
        size,
        numColors,
        minSeg,
        baseUsed,
        extra,
        lengths
    });

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

// -------------------------------
// 6) PUZZLE FROM ENDPOINTS
// -------------------------------

function buildPuzzleFromEndpoints(path, size, endpointsByColor, numColors) {
    debugLog("buildPuzzleFromEndpoints_start", { size, numColors });

    const puzzle = Array.from({ length: size }, () => Array(size).fill(0));

    for (let colorId = 1; colorId <= numColors; colorId++) {
        const info = endpointsByColor[colorId];
        if (!info) continue;

        const start = path[info.startIndex];
        const end = path[info.endIndex];

        puzzle[start.y][start.x] = colorId;
        puzzle[end.y][end.x] = colorId;
    }

    debugLog("buildPuzzleFromEndpoints_done", { size, numColors });
    return puzzle;
}

// -------------------------------
// 7) DYNAMIC PUZZLE GENERATOR
// -------------------------------

function generateRandomPuzzle(size, numColors) {
    size = Number(size) || 6;
    numColors = Number(numColors) || size;

    debugLog("generateRandomPuzzle_start", { size, numColors });

    const path = generateBaseHamiltonianPath(size);

    const { grid: solutionGrid, endpointsByColor } =
        buildSolutionAndEndpoints(path, size, numColors);

    // Build full solution paths for each color so logic.js can verify
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

    debugLog("generateRandomPuzzle_done", {
        size,
        numColors,
        pathLen: path.length,
        colorsWithPaths: Object.keys(solutionPaths).length
    });

    return buildPuzzleFromEndpoints(path, size, endpointsByColor, numColors);
}
