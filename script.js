// Get references
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearCanvas');
const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');

// Set initial line settings
const lineColor = "#ffffff";
const backgroundColor = "#272727";
const penWidth = 1;
const eraserWidth = 15;

// Initialize state
let lines = [[]];
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let tool = 'pen';
let cursorRadiusMin = 3;
let cursorRadius = Math.max(cursorRadiusMin, penWidth);
let cursorThickness = 1;
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;
ctx.lineCap = "round";
canvas.style.cursor = 'none';

let pointerDown = false;
let insideCanvas = false;

usePen();

function usePen() {
    tool = 'pen';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = penWidth;
    cursorRadius = Math.max(cursorRadiusMin, penWidth);
}

function useEraser() {
    tool = 'eraser';
    cursorRadius = Math.max(cursorRadiusMin, eraserWidth);
}        

function draw(e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pointerDown && insideCanvas) {
        if (tool === 'pen') {
            lines[lines.length - 1].push({x: e.offsetX, y: e.offsetY});
        }
    }            
    drawCursor(e.offsetX, e.offsetY, cursorRadius, cursorThickness);
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(lines[i][0].x, lines[i][0].y);
        for (let j = 1; j < lines[i].length; j++) {
            ctx.lineTo(lines[i][j].x, lines[i][j].y);
        }
        ctx.stroke();
    }
}

function clearCanvas() {
    lines = [[]];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
}

function drawCursor(x, y, radius, thickness) {
    if (insideCanvas) {
        // Outer circle (larger circle)
        ctx.beginPath();
        ctx.arc(x, y, radius + thickness, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();

        // Inner circle (smaller circle to create the hole)
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = backgroundColor;
        ctx.fill();
    }
}

// Event listeners

canvas.addEventListener('pointerdown', () => pointerDown = true);
canvas.addEventListener('pointerup', () => {
    pointerDown = false;
    if (insideCanvas) {
        lines.push([]);
    }
});

canvas.addEventListener('pointerover', () => insideCanvas = true);
canvas.addEventListener('pointerout', () => {
    insideCanvas = false;
    if (pointerDown) {
        lines.push([]);
    }
});

canvas.addEventListener('pointermove', draw);

clearButton.addEventListener('click', clearCanvas);
penButton.addEventListener('click', usePen);
eraserButton.addEventListener('click', useEraser);

window.addEventListener('resize', resizeCanvas);
