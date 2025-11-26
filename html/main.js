// ===============================
// BOOT
// ===============================

function boot() {
    // Reset sounds (rising tone chain)
    if (typeof resetSound === "function") resetSound();

    // Reset timer values
    if (typeof stopTimer === "function") stopTimer();
    if (typeof updateBorderProgress === "function") updateBorderProgress(0);

    // Create a fresh new puzzle
    loadRandomLevel();

    // Ensure the animation + timer loops are running
    if (!window._flowAnimationStarted) {
        window._flowAnimationStarted = true;
        requestAnimationFrame(animationLoop);
    }
    if (!window._flowTimerStarted && typeof timerLoop === "function") {
        window._flowTimerStarted = true;
        requestAnimationFrame(timerLoop);
    }
}

boot();
