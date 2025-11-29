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
    "1": "#2F9BFF", // bright blue
    "2": "#FFD93B", // warm yellow
    "3": "#FF9E2C", // orange
    "4": "#FF4B4B", // red
    "5": "#2ECC71", // green
    "6": "#5DF2FF", // light cyan
    "7": "#FF5EDB", // pink / magenta
    "8": "#B57CFF", // purple
    "9": "#C65B4B"  // maroon / brown
};
