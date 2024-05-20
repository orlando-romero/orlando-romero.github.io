class Line2D {
    constructor(width, color) {
        this.width = width;
        this.color = color;
        this.points = [];
    }

    length() {
        return this.points.length;
    }

    addPoint(x, y, pressure = 1) {
        this.points.push({x: x, y: y, pressure: pressure});
    }

    draw(ctx) {
        // parseFloat(p.pressure.toFixed(precision))
        if (this.points.length <= 1) return;
        // let pressureAll = this.points.map(p => p.pressure).slice(-10);;
        const precision = 2;
        let pressureAll = this.points.map(p => parseFloat(p.pressure.toFixed(precision))).slice(-10);
        for (let i = 0; i < this.points.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(this.points[i].x, this.points[i].y);
            ctx.lineTo(this.points[i+1].x, this.points[i+1].y);
            ctx.lineWidth = Math.max(minPenWidth, this.width * 2.0 * this.points[i].pressure);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        updateDebugText(`Pen pressure: ${pressureAll}`);
    }
}

// Get references
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearCanvas');
const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');
const debugText = document.getElementById('debugText');

// Set initial line settings
let backgroundColor = "#272727";
let lineColor = "white";
let penWidth = 1;
let eraserWidth = 15;
const minPenWidth = 0.2;

// Initialize state
let lastX = 300;
let lastY = 300;
let lines = [new Line2D(penWidth, lineColor)];
let tool = 'pen';
let cursorRadiusMin = 1;
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

function onPointerMove(e) {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    lastX = e.offsetX;
    lastY = e.offsetY;
    if (pointerDown && insideCanvas) {
        if (tool === 'pen') {
            lines[lines.length - 1].addPoint(e.offsetX, e.offsetY, e.pressure);
        }
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);            
    drawCursor(lastX, lastY, cursorRadius, cursorThickness);
    for (let i = 0; i < lines.length; i++) {
        lines[i].draw(ctx);
    }
}

function clearCanvas() {
    lines = [new Line2D(penWidth, lineColor)];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;
    draw();
}

function updateDebugText(text) {
    debugText.textContent = text;
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

function changeWidth(amount) {
    if (tool === 'pen') {
        penWidth += amount;
        penWidth = Math.max(1, penWidth);
        lines[lines.length - 1].width = penWidth;
        // cursorRadius = Math.max(cursorRadiusMin, penWidth);
        cursorRadius = penWidth * 0.6;
    } else {
        eraserWidth += amount;
        eraserWidth = Math.max(1, eraserWidth);
        lines[lines.length - 1].width = eraserWidth;
        cursorRadius = Math.max(cursorRadiusMin, eraserWidth);
    }
    draw();
}

function changeColor(color) {
    lineColor = color;
    lines[lines.length - 1].color = lineColor;
    draw();
}

//============== Event listeners ==============

const keyActions = {
    ']': () => changeWidth(1),
    '[': () => changeWidth(-1),
    'r': () => changeColor('red'),
    'g': () => changeColor('green'),
    'b': () => changeColor('blue'),
    'w': () => changeColor('white'),
};

document.addEventListener('keydown', (e) => {
    const action = keyActions[e.key];
    if (action) {
        action();
    }
});

canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointerDown = true
});
canvas.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointerDown = false;
    if (lines[lines.length - 1].length() <= 1){
        lines.pop();
    }
    lines.push(new Line2D(penWidth, lineColor));
});

canvas.addEventListener('pointerover', () => insideCanvas = true);
canvas.addEventListener('pointerout', () => {
    insideCanvas = false;
    if (lines[lines.length - 1].length() <= 1){
        lines.pop();
    }
    lines.push(new Line2D(penWidth, lineColor));
});

// canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointermove', onPointerMove);

clearButton.addEventListener('click', clearCanvas);
penButton.addEventListener('click', usePen);
eraserButton.addEventListener('click', useEraser);

window.addEventListener('resize', resizeCanvas);

// Prevent touch events
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => e.preventDefault());