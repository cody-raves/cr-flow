// ===============================
// EVENT WIRES
// ===============================

// Default time limit (only used if Lua sends "open" with a time)
// (Most of the time you'll control this via SetFlowTimer export instead)
const DEFAULT_TIMER_SECONDS = 10;

// NUI → JS messages
window.addEventListener("message", (event) => {
    const data = event.data || {};

    // ============================
    // SET TIMER (from LUA export)
    // ============================
    if (data.action === "setTimer") {
        const secs = Number(data.time || 0);
        if (secs > 0 && typeof startTimer === "function") {
            startTimer(secs);
        }
    }

    // ============================
    // SET GRID SIZE (from LUA export)
    // ============================
    if (data.action === "setGridSize") {
        const raw = Number(data.size || 0);
        debugLog("setGridSize_received", { raw });

        if (!isNaN(raw) && typeof Config === "object") {
            const minG = Config.minGrid || 5;
            const maxG = Config.maxGrid || 9;
            let size = Math.max(minG, Math.min(maxG, raw));

            if (typeof ColorRules === "object") {
                const mapped = ColorRules[size];
                Config.numColors = mapped || size;
            } else {
                Config.numColors = size;
            }

            Config.gridSize = size;

            debugLog("setGridSize_applied", {
                gridSize: Config.gridSize,
                numColors: Config.numColors
            });
        }
    }

    // ============================
    // OPEN FLOW
    // ============================
    if (data.action === "open") {
        debugLog("open_received", {
            gridSize: Config && Config.gridSize,
            numColors: Config && Config.numColors,
            time: data.time
        });

        const app = document.getElementById("app");
        if (app) {
            app.style.display = "block";
            debugLog("open_app_visible", { display: app.style.display });
        }

        // Clear transient FX / input state
        activePulse = null;
        endpointFX = [];
        mouseDown   = false;
        isDrawing   = false;
        activeColor = null;

        // Reset sound progression (if still used)
        if (typeof resetSound === "function") {
            resetSound();
        }

        // Reset border animation / timer progress
        if (typeof resetBorder === "function") {
            resetBorder();
        }

        // Build a fresh puzzle using current Config.gridSize / Config.numColors
        try {
            loadRandomLevel();
            debugLog("open_after_loadRandomLevel", {
                gridSize,
                pairs: pairs && pairs.length
            });
        } catch (e) {
            debugLog("open_loadRandomLevel_error", { error: String(e) });
        }

        // Optional: honor a time passed with open
        if (typeof startTimer === "function") {
            const secs = Number(data.time || 0);
            if (secs > 0) {
                debugLog("open_startTimer", { secs });
                startTimer(secs);
            }
        }
    }

    // ============================
    // CLOSE
    // ============================
    if (data.action === "close") {
        const app = document.getElementById("app");
        if (app) {
            app.style.display = "none";
        }

        if (typeof stopTimer === "function") {
            stopTimer();
        }

        activePulse = null;
        endpointFX  = [];
        mouseDown   = false;
        isDrawing   = false;
        activeColor = null;
    }
});

// ------------------------------
// Mouse input
// ------------------------------
canvas.addEventListener("mousedown", (e) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    mouseDown = true;
    handleDown(cell);
});

canvas.addEventListener("mousemove", (e) => {
    if (!mouseDown) return;
    const cell = cellFromEvent(e);
    if (!cell) return;
    handleMove(cell);
});

window.addEventListener("mouseup", () => {
    mouseDown = false;
    isDrawing = false;
    activeColor = null;
});

// ------------------------------
// Resize
// ------------------------------
window.addEventListener("resize", () => {
    resizeCanvas();
    render();
});
