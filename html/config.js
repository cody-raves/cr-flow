// ===============================
// CONFIG (DYNAMIC)
// ===============================

// Grid size → number of colors
// 5x5 = 5 colors
// 6x6 = 6 colors
// 7x7 = 7 colors   <-- changed from 6 to 7
// 8x8 = 8 colors
// 9x9 = 9 colors
const ColorRules = {
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9
};

// Main runtime config for the puzzle
const Config = {
    // Default grid size (can be overridden by NUI "setGridSize" message)
    gridSize: 6,

    // Default number of colors (derived from grid size)
    numColors: ColorRules[6],

    // Allowed grid size range
    minGrid: 5,
    maxGrid: 9
};

// Color mapping for each pipe id (string keys)
const colorMap = {
    "1": "#4e79a7", // blue
    "2": "#f28e2b", // orange
    "3": "#e15759", // red
    "4": "#59a14f", // green
    "5": "#edc948", // yellow
    "6": "#b07aa1", // purple
    "7": "#ff9da7", // pink
    "8": "#9c755f", // brown
    "9": "#ffffff" // white
};