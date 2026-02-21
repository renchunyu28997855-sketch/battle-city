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
            magenta: '#FF00FF'
        };
    }

    clear(): void {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.ctx.fillStyle = this.palette[color] || color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawSprite(x: number, y: number, width: number, height: number, color: string): void {
        this.drawRect(x, y, width, height, color);
    }
}