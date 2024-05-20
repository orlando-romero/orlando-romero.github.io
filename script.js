class Line2D {
    constructor(width, color) {
        this.width = width;
        this.color = color;
        this.points = [];
    }

    length() {
        return this.points.length;
    }

    addPoint(x, y) {
        this.points.push({x: x, y: y});
    }

    // draw(ctx) {
    //     if (this.points.length === 0) return;
    //     ctx.beginPath();
    //     ctx.moveTo(this.points[0].x, this.points[0].y);
    //     for (let i = 1; i < this.points.length; i++) {
    //         ctx.lineTo(this.points[i].x, this.points[i].y);
    //     }
    //     ctx.stroke();
    // }
    draw(ctx) {
        if (this.points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.lineWidth = this.width;  // Set the pen width
        ctx.strokeStyle = this.color;  // Set the stroke color
        ctx.stroke();
    }
}

// Get references
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const clearButton = document.getElementById('clearCanvas');
const penButton = document.getElementById('penButton');
const eraserButton = document.getElementById('eraserButton');

// Set initial line settings
let backgroundColor = "#272727";
let lineColor = "#ffffff";
let penWidth = 1;
let eraserWidth = 15;

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
    lastX = e.offsetX;
    lastY = e.offsetY;
    if (pointerDown && insideCanvas) {
        if (tool === 'pen') {
            lines[lines.length - 1].addPoint(e.offsetX, e.offsetY);            
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
        cursorRadius = Math.max(cursorRadiusMin, penWidth);
    } else {
        eraserWidth += amount;
        eraserWidth = Math.max(1, eraserWidth);
        lines[lines.length - 1].width = eraserWidth;
        cursorRadius = Math.max(cursorRadiusMin, eraserWidth);
    }
    draw();
}

//============== Event listeners ==============

document.addEventListener('keydown', (e) => {
    if (e.key === ']') {
        changeWidth(1);
    } else if (e.key === '[') {
        changeWidth(-1);
    }
});

canvas.addEventListener('pointerdown', () => pointerDown = true);
canvas.addEventListener('pointerup', () => {
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
