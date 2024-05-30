export class Line2D {
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
        for (let i = 0; i < this.points.length - 1; i++) {
            this.drawSegment(ctx, i);
        }
    }
    
    drawSegment(ctx, i) {
        if (this.points.length <= 1) return;

        const minPenWidth = 0.2 * this.width;
        
        ctx.lineCap = "round";
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.points[i].x, this.points[i].y);
        ctx.lineTo(this.points[i+1].x, this.points[i+1].y);
        ctx.lineWidth = Math.max(minPenWidth, this.width * 2.0 * this.points[i+1].pressure);
        ctx.stroke();
    }
     
}