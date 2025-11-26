// ===============================
// COMPLETION LOGIC
// ===============================

function checkComplete() {
    // 1) Ensure all colors connect their endpoints
    for (const p of pairs) {
        const color = p.color;
        const path = paths[color];
        if (!path || path.length < 2) return;

        const first = path[0];
        const last = path[path.length - 1];
        const isEp = (c, ep) => c.x === ep.x && c.y === ep.y;

        const firstIsA = isEp(first, p.a);
        const firstIsB = isEp(first, p.b);
        const lastIsA = isEp(last, p.a);
        const lastIsB = isEp(last, p.b);

        const connects =
            (firstIsA && lastIsB) ||
            (firstIsB && lastIsA);

        if (!connects) return;
    }

    // 2) Ensure the grid is fully filled
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!owner[y][x]) return;
        }
    }

    // 🧠 Tell timer system the puzzle is solved
    if (typeof markPuzzleSolved === "function") {
        markPuzzleSolved();
    } else if (typeof stopTimer === "function") {
        // fallback if markPuzzleSolved not found
        stopTimer();
    }

    // 🔊 GTA final success sound
    fetch(`https://${GetParentResourceName()}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).catch(() => {});

    // ⭐ Wait 2s before closing with success
    setTimeout(() => {
        fetch(`https://${GetParentResourceName()}/success`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        }).catch(() => {});
    }, 2000);
}
