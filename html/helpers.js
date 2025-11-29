// ===============================
// HELPERS
// ===============================

function key(x, y) {
    return `${x},${y}`;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ===============================
// DEBUG HELPER (JS → LUA)
// ===============================

function debugLog(tag, info) {
    const msg = `[cr-flow] ${tag} ${info ? JSON.stringify(info) : ""}`;

    // Browser-side console (NUI devtools)
    if (typeof console !== "undefined" && console.log) {
        console.log(msg);
    }

    // Send to Lua so it shows in F8
    try {
        const resName = typeof GetParentResourceName === "function"
            ? GetParentResourceName()
            : "cr-flow";

        fetch(`https://${resName}/debug`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: tag,
                info
            })
        }).catch(() => {});
    } catch (e) {
        // swallow, it's just debug
    }
}
