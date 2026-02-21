export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private palette: Record<string, string>;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d')!;
        this.palette = {
            black: '#000000',
            white: '#FFFFFF',
            red: '#E74C3C',        // 更柔和的红
            green: '#2ECC71',      // 更现代的绿
            blue: '#3498DB',       // 更现代的蓝
            gray: '#95A5A6',
            darkGray: '#34495E',
            lightGray: '#BDC3C7',
            yellow: '#F1C40F',
            cyan: '#1ABC9C',
            magenta: '#9B59B6',
            orange: '#E67E22'
        };
    }

    // --- 私有辅助方法：绘制带光影的单个美化砖块 ---
    private drawRealisticBrickShape(bx: number, by: number, bw: number, bh: number, baseH: number, baseS: number, baseL: number) {
        const ctx = this.ctx;
        ctx.save();
        
        // 固定颜色，移除随机变化，使砖块一致
        ctx.fillStyle = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;

        // 2. 绘制圆角矩形
        const radius = 2;
        ctx.beginPath();
        // @ts-ignore - roundRect 是较新的 API
        if ('roundRect' in ctx) {
            ctx.roundRect(bx, by, bw, bh, radius);
        } else {
            // Use rect for compatibility
            (ctx as any).rect(bx, by, bw, bh);
        }
        ctx.fill();

        // 3. 微弱描边增加缝隙感
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    clear(): void {
        this.ctx.fillStyle = '#555555';
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
        const mainColor = this.palette[color] || color;
        
        ctx.save();

        // 1. 履带 (Tracks) - 增加细节刻画
        ctx.fillStyle = '#2c3e50'; // 履带底色
        const trackWidth = size * 0.2;
        const trackHeight = size;
        
        // 左履带
        ctx.fillRect(x, y, trackWidth, trackHeight);
        // 右履带
        ctx.fillRect(x + size - trackWidth, y, trackWidth, trackHeight);

        // 履带纹理 (横条)
        ctx.fillStyle = '#1a252f';
        const segments = 8;
        for(let i=0; i<segments; i++) {
            const segY = y + (i * (size/segments));
            ctx.fillRect(x, segY + 2, trackWidth, 1);
            ctx.fillRect(x + size - trackWidth, segY + 2, trackWidth, 1);
        }

        // 2. 车身 (Body) - 带倒角的方块
        const bodyPad = size * 0.15;
        ctx.fillStyle = mainColor;
        // 主体
        ctx.fillRect(x + bodyPad, y + bodyPad, size - bodyPad*2, size - bodyPad*2);
        
        // 车身隆起部分 (更有立体感)
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; // 高光层
        ctx.fillRect(x + bodyPad + 2, y + bodyPad + 2, size - bodyPad*2 - 4, size/2);
        
        // 3. 炮塔 (Turret)
        const turretSize = size * 0.35;
        const tx = x + size/2;
        const ty = y + size/2;
        
        // 炮管 (Barrel)
        ctx.fillStyle = '#95a5a6'; // 银灰色炮管
        ctx.strokeStyle = '#7f8c8d';
        const barrelLen = size * 0.55;
        const barrelW = size * 0.12;
        
        ctx.beginPath();
        if (direction === 'up') ctx.rect(tx - barrelW/2, ty - barrelLen, barrelW, barrelLen);
        else if (direction === 'down') ctx.rect(tx - barrelW/2, ty, barrelW, barrelLen);
        else if (direction === 'left') ctx.rect(tx - barrelLen, ty - barrelW/2, barrelLen, barrelW);
        else if (direction === 'right') ctx.rect(tx, ty - barrelW/2, barrelLen, barrelW);
        ctx.fill();
        ctx.stroke();
        
        // 炮管末端黑色开口
        ctx.fillStyle = '#000';
        const muzzleLen = 4;
        ctx.beginPath();
        if (direction === 'up') ctx.rect(tx - barrelW/2, ty - barrelLen, barrelW, muzzleLen);
        else if (direction === 'down') ctx.rect(tx - barrelW/2, ty + barrelLen - muzzleLen, barrelW, muzzleLen);
        else if (direction === 'left') ctx.rect(tx - barrelLen, ty - barrelW/2, muzzleLen, barrelW);
        else if (direction === 'right') ctx.rect(tx + barrelLen - muzzleLen, ty - barrelW/2, muzzleLen, barrelW);
        ctx.fill();

        // 炮塔主体 (圆形带圈)
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.arc(tx, ty, turretSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 炮塔顶盖细节
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.arc(tx, ty, turretSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawBrick(x: number, y: number, size: number): void {
        // Draw floor base first
        this.ctx.fillStyle = '#555555'; // Dark gray floor
        this.ctx.fillRect(x, y, size, size);
        
        // 使用改良后的 Realistic 逻辑，但适配 Grid 大小
        // 一个 Grid 单元格绘制 2行 x 2列 的砖块，模仿坦克大战的经典布局
        const gap = 1;
        const rows = 2;
        const cols = 2;
        const bW = (size - gap * (cols - 1)) / cols;
        const bH = (size - gap * (rows - 1)) / rows;

        // 砖块基准色：红褐色 HSL(15, 60%, 45%)
        const baseH = 15, baseS = 60, baseL = 45;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // 简单的错位效果：第二行稍微偏一点（如果是更多行的话效果更明显，2x2保持对齐更像原版）
                const bx = x + c * (bW + gap);
                const by = y + r * (bH + gap);
                this.drawRealisticBrickShape(bx, by, bW, bH, baseH, baseS, baseL);
            }
        }
    }

    drawSteel(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        
        // Draw floor base first
        ctx.fillStyle = '#555555'; // Dark gray floor
        ctx.fillRect(x, y, size, size);
        
        // 1. 基础金属块
        ctx.fillStyle = '#BDC3C7'; // 银白
        ctx.fillRect(x, y, size, size);

        // 2. 内部矩形 (增加厚度)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        ctx.fillStyle = '#95A5A6'; // 稍暗的灰
        ctx.fillRect(x + 6, y + 6, size - 12, size - 12);

        // 3. 经典的高光“X”交叉线 (模拟反光)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size);
        ctx.moveTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.stroke();

        // 4. 铆钉细节
        ctx.fillStyle = '#7F8C8D';
        const dot = 3;
        ctx.fillRect(x + 2, y + 2, dot, dot);
        ctx.fillRect(x + size - 2 - dot, y + 2, dot, dot);
        ctx.fillRect(x + 2, y + size - 2 - dot, dot, dot);
        ctx.fillRect(x + size - 2 - dot, y + size - 2 - dot, dot, dot);
    }

    drawWater(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        
        // Draw floor base first
        ctx.fillStyle = '#555555'; // Dark gray floor
        ctx.fillRect(x, y, size, size);
        
        // 底色
        ctx.fillStyle = '#3498DB';
        ctx.fillRect(x, y, size, size);

        // 波纹效果
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        
        // 画三条波浪线
        for (let i = 1; i <= 3; i++) {
            const yOffset = y + (size / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, yOffset);
            // 贝塞尔曲线模拟波浪
            ctx.bezierCurveTo(
                x + size / 3, yOffset - 5, 
                x + size * 2 / 3, yOffset + 5, 
                x + size, yOffset
            );
            ctx.stroke();
        }
    }

    drawForest(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        
        // Draw floor base first
        ctx.fillStyle = '#555555'; // Dark gray floor
        ctx.fillRect(x, y, size, size);
        
        // 绘制茂密的树叶簇
        const leafSize = size / 3;
        const positions = [
            {x: 0.2, y: 0.2}, {x: 0.8, y: 0.2}, 
            {x: 0.5, y: 0.5}, 
            {x: 0.2, y: 0.8}, {x: 0.8, y: 0.8},
            {x: 0.1, y: 0.5}, {x: 0.9, y: 0.5}, {x: 0.5, y: 0.1}, {x: 0.5, y: 0.9}
        ];

        // 两种绿色交替
        positions.forEach((pos, index) => {
            ctx.fillStyle = index % 2 === 0 ? '#27AE60' : '#2ECC71'; 
            ctx.beginPath();
            ctx.arc(x + pos.x * size, y + pos.y * size, leafSize, 0, Math.PI*2);
            ctx.fill();
        });

        // 中心的深色阴影，增加层次
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/4, 0, Math.PI*2);
        ctx.fill();
    }
    
    // 冰面 - 坦克会滑行
    drawIce(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        
        ctx.fillStyle = '#555555';
        ctx.fillRect(x, y, size, size);
        
        // 冰面底色 - 浅蓝色
        ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
        
        // 冰面反光线条
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(x + 5, y + size - 8);
        ctx.lineTo(x + size - 8, y + 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + 10, y + size - 4);
        ctx.lineTo(x + size - 4, y + 10);
        ctx.stroke();
    }

    // 这里原本是 Floor，在坦克大战中通常对应“冰面”
    drawFloor(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        
        // 1. 修改底色：使用 solid gray #555555
        ctx.fillStyle = '#555555'; 
        ctx.fillRect(x, y, size, size);
    }

    drawBase(x: number, y: number, size: number): void {
        this.drawEagle(x, y, size); // 复用 Eagle 绘制逻辑，或者你可以单独写
        // 简单的外墙保护示意
        // 这里仅仅是标识基地位置，如果需要画墙，应该由 Map 数据决定调用 drawBrick
    }

    drawEagle(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        const cx = x + size / 2;
        const cy = y + size / 2;

        // 1. 灰色底座
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(x, y, size, size);
        
        // 2. 徽章背景 (深蓝色盾牌)
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + size - 2, y + 2);
        ctx.lineTo(x + size - 2, y + size * 0.7);
        ctx.lineTo(cx, y + size - 2);
        ctx.lineTo(x + 2, y + size * 0.7);
        ctx.closePath();
        ctx.fill();

        // 3. 几何化老鹰 (金色) - 简化为几何图形以适应小尺寸
        ctx.fillStyle = '#F1C40F'; // 金色
        
        // 翅膀
        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.2);
        ctx.lineTo(x + 4, cy - size * 0.2); // 左翼尖
        ctx.lineTo(x + size - 4, cy - size * 0.2); // 右翼尖
        ctx.fill();

        // 身体和头
        ctx.beginPath();
        ctx.ellipse(cx, cy - size * 0.1, size * 0.15, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - size * 0.15, 1, 0, Math.PI * 2); // 左眼
        ctx.arc(cx + 2, cy - size * 0.15, 1, 0, Math.PI * 2); // 右眼
        ctx.fill();
    }

    drawText(text: string, x: number, y: number, color: string = 'white', fontSize: number = 24): void {
        const ctx = this.ctx;
        ctx.fillStyle = this.palette[color] || color;
        // 添加文字阴影，更有游戏感
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = `bold ${fontSize}px "Courier New", monospace`; // 使用等宽字体更有复古感
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    drawHeart(x: number, y: number, size: number = 20): void {
        const ctx = this.ctx;
        ctx.fillStyle = '#E74C3C';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x + size / 2, y + size / 5);
        ctx.bezierCurveTo(
          x + size / 2, y, 
          x, y, 
          x, y + topCurveHeight
        );
        ctx.bezierCurveTo(
          x, y + (size + topCurveHeight) / 2, 
          x + size / 2, y + (size + topCurveHeight) / 2, 
          x + size / 2, y + size
        );
        ctx.bezierCurveTo(
          x + size / 2, y + (size + topCurveHeight) / 2, 
          x + size, y + (size + topCurveHeight) / 2, 
          x + size, y + topCurveHeight
        );
        ctx.bezierCurveTo(
          x + size, y, 
          x + size / 2, y, 
          x + size / 2, y + size / 5
        );
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
    }
    
    // 爆炸效果 - 绘制爆炸粒子
    drawExplosion(x: number, y: number, size: number): void {
        const ctx = this.ctx;
        const cx = x + size / 2;
        const cy = y + size / 2;
        
        // 爆炸中心 - 亮黄色
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 内圈 - 橙色
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // 外圈 - 红色
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 火花粒子
        ctx.fillStyle = '#FFFFCC';
        const sparks = 8;
        for (let i = 0; i < sparks; i++) {
            const angle = (Math.PI * 2 / sparks) * i;
            const dist = size * 0.35;
            const sx = cx + Math.cos(angle) * dist;
            const sy = cy + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(sx, sy, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 爆炸光芒
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}