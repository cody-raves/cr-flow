// ===============================
// BOOT
// ===============================

function boot() {
    // Reset sounds (if any)
    if (typeof resetSound === "function") {
        resetSound();
    }

    // Reset timer values
    if (typeof stopTimer === "function") {
        stopTimer();
    }
    if (typeof updateBorderProgress === "function") {
        updateBorderProgress(0);
    }

    // IMPORTANT:
    // Do NOT call loadRandomLevel() here.
    // Puzzles are created fresh in events.js when we receive { action: "open" }.

    // Make sure animation loop is running (render.js already starts it,
    // but this guard keeps things safe if you ever change that).
    if (!window._flowAnimationStarted && typeof animationLoop === "function") {
        window._flowAnimationStarted = true;
        requestAnimationFrame(animationLoop);
    }

    // Timer loop is driven by timer.js / render.js (updateTimerFrame),
    // so we don't need a separate timerLoop here.
}

boot();
