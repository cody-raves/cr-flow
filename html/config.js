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
    "1": "#2e86de", // blue
    "2": "#f39c12", // orange
    "3": "#e74c3c", // red
    "4": "#219641", // green
    "5": "#9b59b6", // purple
    "6": "#1abc9c", // teal
    "7": "#e84393", // pink
    "8": "#00cec9", // cyan
    "9": "#6c5ce7"  // violet
};
