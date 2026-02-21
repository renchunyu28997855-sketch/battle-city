export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private palette: Record<string, string>;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.palette = {
            black: '#000000',
            white: '#FFFFFF',
            red: '#FF0000',
            green: '#00FF00',
            blue: '#0000FF',
            gray: '#808080',
            darkGray: '#404040',
            lightGray: '#C0C0C0',
            yellow: '#FFFF00',
            cyan: '#00FFFF',
            magenta: '#FF00FF',
            orange: '#FF8C00'
        };
    }

    clear(): void {
        this.ctx.fillStyle = '#404040';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = this.palette[color] || color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawSprite(x: number, y: number, width: number, height: number, color: string): void {
        this.drawRect(x, y, width, height, color);
    }

    drawTank(x: number, y: number, size: number, direction: string, color: string = 'green'): void {
        const ctx = this.ctx;
        const c = this.palette[color] || color;
        
        ctx.fillStyle = c;
        ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y + 2, 6, size - 4);
        ctx.fillRect(x + size - 6, y + 2, 6, size - 4);
        
        ctx.fillStyle = c;
        ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
        
        ctx.fillStyle = '#666666';
        const barrelLen = size / 2;
        const barrelW = 6;
        const cx = x + size / 2;
        const cy = y + size / 2;
        
        ctx.beginPath();
        switch (direction) {
            case 'up':
                ctx.rect(cx - barrelW/2, y - barrelLen + 4, barrelW, barrelLen);
                break;
            case 'down':
                ctx.rect(cx - barrelW/2, cy, barrelW, barrelLen - 4);
                break;
            case 'left':
                ctx.rect(x - barrelLen + 4, cy - barrelW/2, barrelLen, barrelW);
                break;
            case 'right':
                ctx.rect(cx, cy - barrelW/2, barrelLen - 4, barrelW);
                break;
        }
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBrick(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        const brickW = size / 2 - 2;
        const brickH = size / 4 - 2;
        
        ctx.fillStyle = '#CC5500';
        ctx.fillRect(x + 1, y + 1, brickW, brickH);
        ctx.fillRect(x + size/2 + 1, y + 1, brickW, brickH);
        ctx.fillRect(x + 1, y + size/4 + 1, brickW/2 - 1, brickH);
        ctx.fillRect(x + brickW/2 + 1, y + size/4 + 1, 1.5*brickW, brickH);
        ctx.fillRect(x + 1, y + size/2 + 1, brickW, brickH);
        ctx.fillRect(x + size/2 + 1, y + size/2 + 1, brickW, brickH);
        ctx.fillRect(x + 1, y + size * 0.75 + 1, brickW/2 - 1, brickH);
        ctx.fillRect(x + brickW/2 + 1, y + size * 0.75 + 1, 1.5*brickW, brickH);
    }

    drawSteel(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.fillStyle = '#888888';
        ctx.fillRect(x + 4, y + 4, size/2 - 4, size/2 - 4);
        ctx.fillRect(x + size/2 + 2, y + size/2 + 2, size/2 - 6, size/2 - 6);
    }

    drawWater(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#00CED1';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        ctx.fillStyle = '#20B2AA';
        ctx.fillRect(x + 4, y + size/4, size/3, 3);
        ctx.fillRect(x + size/2 + 2, y + size/2, size/3, 3);
        ctx.fillRect(x + 6, y + size*0.7, size/4, 3);
    }

    drawBase(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x + size/4, y + size/4, size/2, size/2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + size/2 - 2, y + size/4 + 2, 4, size/4);
        ctx.fillRect(x + size/4 + 2, y + size/2 - 2, size/4, 4);
    }

    drawEagle(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.5, y + size * 0.15);
        ctx.lineTo(x + size * 0.35, y + size * 0.4);
        ctx.lineTo(x + size * 0.5, y + size * 0.35);
        ctx.lineTo(x + size * 0.65, y + size * 0.4);
        ctx.closePath();
        ctx.fill();
    }

    drawForest(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#228B22';
        const treePositions = [
            { cx: 0.15, cy: 0.15, r: 0.25 },
            { cx: 0.4, cy: 0.2, r: 0.22 },
            { cx: 0.7, cy: 0.15, r: 0.24 },
            { cx: 0.25, cy: 0.4, r: 0.23 },
            { cx: 0.55, cy: 0.35, r: 0.21 },
            { cx: 0.8, cy: 0.4, r: 0.2 },
            { cx: 0.2, cy: 0.6, r: 0.22 },
            { cx: 0.45, cy: 0.55, r: 0.24 },
            { cx: 0.7, cy: 0.6, r: 0.21 },
            { cx: 0.9, cy: 0.55, r: 0.19 },
            { cx: 0.3, cy: 0.8, r: 0.2 },
            { cx: 0.6, cy: 0.75, r: 0.23 },
            { cx: 0.85, cy: 0.8, r: 0.18 },
            { cx: 0.1, cy: 0.9, r: 0.17 },
            { cx: 0.5, cy: 0.9, r: 0.19 },
            { cx: 0.75, cy: 0.92, r: 0.16 }
        ];
        for (const tree of treePositions) {
            ctx.beginPath();
            ctx.arc(x + size * tree.cx, y + size * tree.cy, size * tree.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawFloor(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#404040';
        ctx.fillRect(x, y, size, size);
    }

    drawText(text: string, x: number, y: number, color: string = 'white', fontSize: number = 24): void {
        const ctx = this.ctx;
        ctx.fillStyle = this.palette[color] || color;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    drawHeart(x: number, y: number, size: number = 20): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/4);
        ctx.bezierCurveTo(x + size/2, y, x, y, x, y + size/4);
        ctx.bezierCurveTo(x, y + size/2, x + size/2, y + size*0.75, x + size/2, y + size);
        ctx.bezierCurveTo(x + size/2, y + size*0.75, x + size, y + size/2, x + size, y + size/4);
        ctx.bezierCurveTo(x + size, y, x + size/2, y, x + size/2, y + size/4);
        ctx.fill();
    }
}
