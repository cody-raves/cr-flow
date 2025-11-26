// ===============================
// STATE
// ===============================

let gridSize;
let pairs = [];

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let cellSize = 60;
let margin = 20;
let originX = margin;
let originY = margin;

let owner = [];
let paths = {};
let endpoints = {};
let locked = {};

let mouseDown = false;
let isDrawing = false;
let activeColor = null;

let solutionPaths = {};

// ===============================
// FX / ANIMATION STATE
// ===============================
let endpointFX = [];        // Array of checkmark effects
let activePulse = null;     // Pulse target endpoint
