// ===============================
// EVENT WIRES
// ===============================

// Default time limit (in seconds) if LUA doesn't override
const DEFAULT_TIMER_SECONDS = 10;

// NUI → JS messages
window.addEventListener("message", (event) => {
    const data = event.data || {};

    // ============================
    // OPEN FLOW
    // ============================
    if (data.action === "open") {
        // 🔁 Clear transient state from any previous puzzle
        activePulse = null;      // kill any old pulse ring
        endpointFX = [];         // clear checkmark animations
        mouseDown   = false;
        isDrawing   = false;
        activeColor = null;

        // Fresh puzzle
        loadRandomLevel();

        // Reset sound progression (if still used)
        if (typeof resetSound === "function") {
            resetSound();
        }

        // Reset border animation
        if (typeof resetBorder === "function") {
            resetBorder();
        }

        // Stop any old timer
        if (typeof stopTimer === "function") {
            stopTimer();
        }

        // 🔥 START TIMER HERE
        // Prefer a time sent in the open message (data.time),
        // otherwise fall back to a default value.
        const secs = Number(data.time || DEFAULT_TIMER_SECONDS);
        if (secs > 0 && typeof startTimer === "function") {
            startTimer(secs);
        }
    }

    // ============================
    // CLOSE
    // ============================
    if (data.action === "close") {
        if (typeof stopTimer === "function") {
            stopTimer();
        }

        // also clear transient FX so nothing lingers next open
        activePulse = null;
        endpointFX  = [];
        mouseDown   = false;
        isDrawing   = false;
        activeColor = null;
    }

    // ============================
    // SET TIMER (from LUA export)
    //   exports['cr-flow']:SetFlowTimer(25)
    // ============================
    if (data.action === "setTimer") {
        const secs = Number(data.time || 0);
        if (secs > 0 && typeof startTimer === "function") {
            startTimer(secs);
        }
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
