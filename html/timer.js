// ===============================
// TIMER SYSTEM
// ===============================

// Is the timer currently ticking?
let timerActive = false;

// Timestamp when timer ends (ms, performance.now())
let timerEnd = 0;

// Total duration (in seconds)
let timerDuration = 0;

// Border fill progress (0 → 1)
let borderProgress = 0;

// Has the puzzle already been solved?
let puzzleSolved = false;

// ===============================
// ACCESSORS FOR RENDER.JS
// ===============================

function updateBorderProgress(p) {
    borderProgress = Math.max(0, Math.min(1, p));
}

function getBorderProgress() {
    return borderProgress;
}

// ===============================
// TIMER CONTROL
// ===============================

// Called when puzzle is opened
function resetBorder() {
    borderProgress = 0;
    puzzleSolved = false;
}

// Called from Lua export: exports['cr-flow']:SetFlowTimer(seconds)
function startTimer(seconds) {
    seconds = Number(seconds) || 0;
    if (seconds <= 0) {
        timerActive = false;
        updateBorderProgress(0);
        return;
    }

    timerDuration = seconds;
    timerEnd = performance.now() + (seconds * 1000);
    timerActive = true;
    puzzleSolved = false;

    updateBorderProgress(0);
}

function stopTimer() {
    if (timerActive) {
    }
    timerActive = false;
}

// Called by logic.js on success
function markPuzzleSolved() {
    puzzleSolved = true;
    stopTimer();
}

// ===============================
// INTERNAL FAIL HANDLER
// ===============================

function timerFail() {
    // If puzzle is already solved, ignore any late timer
    if (puzzleSolved) {
        return;
    }

    timerActive = false;

    // 🔊 play fail sound (native)
    fetch(`https://${GetParentResourceName()}/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).catch(() => {});

    // ❌ close UI
    fetch(`https://${GetParentResourceName()}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).catch(() => {});
}

// ===============================
// CALLED EVERY FRAME (from render.js)
// ===============================

function updateTimerFrame() {
    if (!timerActive || timerDuration <= 0) return;

    const now = performance.now();
    const remaining = timerEnd - now;

    // Time up: fail
    if (remaining <= 0) {
        updateBorderProgress(1);
        timerFail();
        return;
    }

    // Calculate progress 0 → 1
    const elapsedMs = (timerDuration * 1000) - remaining;
    const elapsed = elapsedMs / 1000;
    const progress = elapsed / timerDuration;

    updateBorderProgress(progress);
}

