import { Renderer } from '../core/Renderer';

/**
 * Game states for Battle City
 */
export enum GameState {
    Menu,
    Playing,
    Paused,
    GameOver,
    LevelComplete
}

/**
 * Screens class handles rendering of different game screens
 */
export class Screens {
    private renderer: Renderer;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    /**
     * Draw the main menu screen
     */
    drawMenu(): void {
        this.renderer.clear();
        
        // Draw decorative brick border
        for (let i = 0; i < 10; i++) {
            this.renderer.drawBrick(180 + i * 40, 80, 40);
            this.renderer.drawBrick(180 + i * 40, 520, 40);
        }
        for (let i = 0; i < 12; i++) {
            this.renderer.drawBrick(180, 80 + i * 40, 40);
            this.renderer.drawBrick(780, 80 + i * 40, 40);
        }
        
        // Draw title with orange background and black text
        this.renderer.drawRect(200, 100, 400, 50, 'orange');
        this.renderer.drawRect(210, 110, 380, 30, 'black');
        this.renderer.drawText('BATTLE CITY', 400, 125, 'white', 32);
        
        // Draw start instruction with steel background and black text
        this.renderer.drawRect(200, 250, 400, 50, 'steel');
        this.renderer.drawRect(210, 260, 380, 30, 'black');
        this.renderer.drawText('按 ENTER 开始游戏', 400, 275, 'white', 24);
        
        // Draw instructions with steel background and black text
        this.renderer.drawRect(200, 350, 400, 200, 'steel');
        this.renderer.drawRect(210, 360, 380, 180, 'black');
        this.renderer.drawText('操作说明:', 400, 380, 'white', 24);
        this.renderer.drawText('WASD 键移动', 400, 410, 'white', 20);
        this.renderer.drawText('空格键射击', 400, 435, 'white', 20);
        this.renderer.drawText('ESC 键暂停', 400, 460, 'white', 20);
        this.renderer.drawText('目标: 击败所有坦克', 400, 485, 'white', 20);
        this.renderer.drawText('保护你的基地', 400, 510, 'white', 20);
        
        // Draw tank decoration
        this.renderer.drawTank(300, 500, 40, 'up', 'green');
        this.renderer.drawTank(500, 500, 40, 'down', 'green');
    }

    /**
     * Draw the playing screen
     */
    drawPlaying(): void {
        this.renderer.clear();
        // Game content will be drawn by other systems
        // This is just a placeholder for the playing state
    }

    /**
     * Draw the paused screen
     */
    drawPaused(): void {
        this.renderer.clear();
        
        // Draw semi-transparent overlay
        this.renderer.drawRect(0, 0, 800, 600, 'black');
        
        // Draw pause screen with decorative border
        for (let i = 0; i < 10; i++) {
            this.renderer.drawBrick(240 + i * 40, 180, 40);
            this.renderer.drawBrick(240 + i * 40, 420, 40);
        }
        for (let i = 0; i < 6; i++) {
            this.renderer.drawBrick(240, 180 + i * 40, 40);
            this.renderer.drawBrick(680, 180 + i * 40, 40);
        }
        
        this.renderer.drawRect(250, 200, 332, 120, 'orange');
        this.renderer.drawRect(260, 210, 312, 100, 'black');
        this.renderer.drawText('暂停', 416, 250, 'white', 32);
        this.renderer.drawText('按 ESC 继续', 416, 290, 'white', 24);
    }

    /**
     * Draw the game over screen
     */
    drawGameOver(_score: number): void {
        this.renderer.clear();
        
        // Draw decorative brick border
        for (let i = 0; i < 10; i++) {
            this.renderer.drawBrick(180 + i * 40, 80, 40);
            this.renderer.drawBrick(180 + i * 40, 520, 40);
        }
        for (let i = 0; i < 12; i++) {
            this.renderer.drawBrick(180, 80 + i * 40, 40);
            this.renderer.drawBrick(780, 80 + i * 40, 40);
        }
        
        // Draw game over title with orange background and black text
        this.renderer.drawRect(200, 100, 400, 60, 'orange');
        this.renderer.drawRect(210, 110, 380, 40, 'black');
        this.renderer.drawText('游戏结束', 400, 130, 'white', 28);
        
        // Draw score
        this.renderer.drawRect(200, 200, 400, 60, 'steel');
        this.renderer.drawRect(210, 210, 380, 40, 'black');
        this.renderer.drawText(`得分: ${_score}`, 400, 230, 'white', 24);
        
        // Draw restart instruction with steel background and black text
        this.renderer.drawRect(200, 300, 400, 60, 'steel');
        this.renderer.drawRect(210, 310, 380, 40, 'black');
        this.renderer.drawText('按 R 重新开始', 400, 330, 'white', 24);
        
        // Draw tank decoration
        this.renderer.drawTank(300, 500, 40, 'right', 'green');
        this.renderer.drawTank(500, 500, 40, 'left', 'green');
    }

    /**
     * Draw the level complete screen
     */
    drawLevelComplete(): void {
        this.renderer.clear();
        
        // Draw decorative brick border
        for (let i = 0; i < 10; i++) {
            this.renderer.drawBrick(180 + i * 40, 80, 40);
            this.renderer.drawBrick(180 + i * 40, 520, 40);
        }
        for (let i = 0; i < 12; i++) {
            this.renderer.drawBrick(180, 80 + i * 40, 40);
            this.renderer.drawBrick(780, 80 + i * 40, 40);
        }
        
        // Draw level complete title with orange background and black text
        this.renderer.drawRect(200, 100, 400, 50, 'orange');
        this.renderer.drawRect(210, 110, 380, 30, 'black');
        this.renderer.drawText('关卡完成', 400, 125, 'white', 32);
        
        // Draw next level instruction with steel background and black text
        this.renderer.drawRect(200, 250, 400, 50, 'steel');
        this.renderer.drawRect(210, 260, 380, 30, 'black');
        this.renderer.drawText('进入下一关...', 400, 275, 'white', 24);
        
        // Draw tank decoration
        this.renderer.drawTank(300, 500, 40, 'up', 'green');
        this.renderer.drawTank(500, 500, 40, 'down', 'green');
    }
}