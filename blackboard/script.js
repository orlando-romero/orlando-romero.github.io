import { Line2D } from './Line2D.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('toolbar');
const colorFields = document.querySelectorAll('.color-field');
const penRange = document.getElementById('penRange');

const toolbarColor = window.getComputedStyle(toolbar).backgroundColor;
const canvasColor = window.getComputedStyle(canvas).backgroundColor;

canvas.width = window.innerWidth - 30;
canvas.height = window.innerHeight - 75;

let penThickness = 1;
let penColor = "white";

let lines = [];
let pointerDown = false;
let insideCanvas = false;

function update(e) {
    if (pointerDown && insideCanvas) {
        let lastLine = lines[lines.length - 1];
        lastLine.addPoint(e.offsetX, e.offsetY, e.pressure);
        // draw();
        if (lines.length > 0 && lastLine.length() >= 3) {
            lastLine.drawSegment(ctx, lastLine.length() - 2);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let line of lines) {
        line.draw(ctx);
    }
}

function clear() {
    lines = [];
    draw();
}

canvas.addEventListener('pointermove', update);

canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointerDown = true
    if (insideCanvas){
        lines.push(new Line2D(penThickness, penColor));
    }
});
canvas.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    pointerDown = false;
});

canvas.addEventListener('pointerover', () => insideCanvas = true);

let selectedField = colorFields[0];
const avg = averageColor(toolbarColor, selectedField.style.backgroundColor);
selectedField.style.border = `6px solid ${avg}`;
colorFields.forEach(field => {
    field.addEventListener('click', (event) => {      
        selectedField.style.border = `6px solid ${toolbarColor}`;

        selectedField = event.target;
        const avg = averageColor(toolbarColor, selectedField.style.backgroundColor);
        selectedField.style.border = `6px solid ${avg}`;
        
        penColor = window.getComputedStyle(selectedField).backgroundColor;

    });
    
    field.addEventListener('mouseover', (event) => {
        if (selectedField !== event.target) {
            const avg = averageColor(toolbarColor, window.getComputedStyle(event.target).backgroundColor);
            event.target.style.border = `6px solid ${avg}`;
        }
    });

    field.addEventListener('mouseout', (event) => {
        if (selectedField !== event.target) {
            event.target.style.border = `6px solid ${toolbarColor}`;
        }
    });
});

function getRGBColor(color) {
    const dummyDiv = document.createElement("div");
    dummyDiv.style.color = color;
    document.body.appendChild(dummyDiv);
    const computedColor = window.getComputedStyle(dummyDiv).color;
    document.body.removeChild(dummyDiv);
    return computedColor;
}

function parseRGB(color) {
    const result = /rgb\((\d+), (\d+), (\d+)\)/.exec(color);
    return result ? [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])] : [0, 0, 0];
}

function rgbToString(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function averageColor(color1, color2) {
    const rgb1 = parseRGB(getRGBColor(color1));
    const rgb2 = parseRGB(getRGBColor(color2));
    const avg = [
        Math.floor((rgb1[0] + rgb2[0]) / 2),
        Math.floor((rgb1[1] + rgb2[1]) / 2),
        Math.floor((rgb1[2] + rgb2[2]) / 2)
    ];
    return rgbToString(avg);
}

penRange.addEventListener('input', (event) => {
    penThickness = event.target.value;
});

document.getElementById('clearButton').addEventListener('click', clear);


const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', (event) => {
    penColor = event.target.value;
});

document.querySelectorAll('.slider-container input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
        console.log(`Selected option: ${event.target.value}`);
        // Add your logic to handle the option change here
    });
});
