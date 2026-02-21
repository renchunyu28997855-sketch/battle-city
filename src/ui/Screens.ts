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
        
        // Draw title
        this.renderer.drawRect(200, 100, 400, 50, 'white');
        this.renderer.drawRect(210, 110, 380, 30, 'black');
        
        // Draw start instruction
        this.renderer.drawRect(200, 250, 400, 50, 'white');
        this.renderer.drawRect(210, 260, 380, 30, 'black');
        
        // Draw instructions
        this.renderer.drawRect(200, 350, 400, 200, 'white');
        this.renderer.drawRect(210, 360, 380, 180, 'black');
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
        
        this.renderer.drawRect(250, 200, 332, 120, 'white');
        this.renderer.drawRect(260, 210, 312, 100, 'black');
        this.renderer.drawText('暂停', 416, 250, 'white', 32);
        this.renderer.drawText('按 ESC 继续', 416, 290, 'white', 24);
    }

    /**
     * Draw the game over screen
     */
    drawGameOver(_score: number): void {
        this.renderer.clear();
        
        // Draw game over title
        this.renderer.drawRect(200, 100, 400, 60, 'white');
        this.renderer.drawRect(210, 110, 380, 40, 'black');
        this.renderer.drawText('游戏结束', 400, 130, 'white', 28);
        
        // Draw restart instruction
        this.renderer.drawRect(200, 300, 400, 60, 'white');
        this.renderer.drawRect(210, 310, 380, 40, 'black');
        this.renderer.drawText('按 R 重新开始', 400, 330, 'white', 24);
    }

    /**
     * Draw the level complete screen
     */
    drawLevelComplete(): void {
        this.renderer.clear();
        
        // Draw level complete title
        this.renderer.drawRect(200, 100, 400, 50, 'white');
        this.renderer.drawRect(210, 110, 380, 30, 'black');
        
        // Draw next level instruction
        this.renderer.drawRect(200, 250, 400, 50, 'white');
        this.renderer.drawRect(210, 260, 380, 30, 'black');
    }
}