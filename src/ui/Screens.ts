import { Renderer } from '../core/Renderer';

/**
 * Game states for Battle City
 */
export enum GameState {
    Menu,
    ModeSelect,
    LevelSelect,
    Playing,
    Paused,
    GameOver,
    LevelComplete
}

/**
 * Game mode - single player or two player
 */
export enum GameMode {
    Single,
    TwoPlayer
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
        
        const centerX = 520;  // Center of 1040 width
        
        // Draw decorative brick border
        for (let i = 0; i < 13; i++) {
            this.renderer.drawBrick(220 + i * 48, 100, 48);
            this.renderer.drawBrick(220 + i * 48, 900, 48);
        }
        for (let i = 0; i < 17; i++) {
            this.renderer.drawBrick(220, 100 + i * 48, 48);
            this.renderer.drawBrick(772, 100 + i * 48, 48);
        }
        
        // Draw title with orange background and black text
        this.renderer.drawRect(centerX - 200, 180, 400, 50, 'orange');
        this.renderer.drawRect(centerX - 190, 190, 380, 30, 'black');
        this.renderer.drawText('BATTLE CITY', centerX, 205, 'white', 32);
        
        // Draw mode selection instruction
        this.renderer.drawRect(centerX - 200, 280, 400, 50, 'steel');
        this.renderer.drawRect(centerX - 190, 290, 380, 30, 'black');
        this.renderer.drawText('按 1 单人  |  按 2 双人', centerX, 305, 'white', 20);
        
        // Draw level select instruction
        this.renderer.drawRect(centerX - 200, 350, 400, 50, 'steel');
        this.renderer.drawRect(centerX - 190, 360, 380, 30, 'black');
        this.renderer.drawText('按 L 选择关卡', centerX, 375, 'white', 24);
        
        // Draw instructions with steel background and black text
        this.renderer.drawRect(centerX - 200, 500, 400, 200, 'steel');
        this.renderer.drawRect(centerX - 190, 510, 380, 180, 'black');
        this.renderer.drawText('操作说明:', centerX, 535, 'white', 22);
        this.renderer.drawText('玩家1: WASD 移动 | 空格 射击', centerX, 565, 'white', 18);
        this.renderer.drawText('玩家2: 方向键移动 | Enter 射击', centerX, 590, 'white', 18);
        this.renderer.drawText('ESC 键暂停', centerX, 615, 'white', 18);
        this.renderer.drawText('目标: 击败所有坦克', centerX, 645, 'white', 18);
        
        // Draw tank decoration
        this.renderer.drawTank(centerX - 150, 750, 48, 'up', 'blue');
        this.renderer.drawTank(centerX + 150, 750, 48, 'down', 'green');
    }

    /**
     * Draw the mode selection screen (1P or 2P)
     */
    drawModeSelect(): void {
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
        this.renderer.drawText('选择模式', 400, 125, 'white', 32);
        
        // Draw 1P option
        this.renderer.drawRect(200, 200, 400, 80, 'steel');
        this.renderer.drawRect(210, 210, 380, 60, 'black');
        this.renderer.drawText('单人游戏 (1P)', 400, 225, 'white', 24);
        this.renderer.drawText('WASD 移动 | 空格射击', 400, 250, '#AAA', 16);
        
        // Draw 2P option
        this.renderer.drawRect(200, 310, 400, 80, 'steel');
        this.renderer.drawRect(210, 320, 380, 60, 'black');
        this.renderer.drawText('双人游戏 (2P)', 400, 335, 'white', 24);
        this.renderer.drawText('P1: WASD+空格 | P2: 方向键+回车', 400, 360, '#AAA', 16);
        
        // Draw back option
        this.renderer.drawRect(200, 420, 400, 50, 'steel');
        this.renderer.drawRect(210, 430, 380, 30, 'black');
        this.renderer.drawText('按 ESC 返回', 400, 445, 'white', 20);
        
        // Draw navigation hint
        this.renderer.drawRect(200, 500, 400, 40, 'steel');
        this.renderer.drawRect(210, 510, 380, 20, 'black');
        this.renderer.drawText('↑↓ 选择 | ENTER 确认', 400, 522, 'white', 16);
    }

    
    /**
     * Draw the level selection screen
     */
    drawLevelSelect(selectedLevel: number, maxUnlockedLevel: number, levelNames: string[]): void {
        this.renderer.clear();
        
        // Draw background
        this.renderer.drawRect(0, 0, 832, 832, 'black');
        
        // Draw title
        this.renderer.drawRect(200, 20, 432, 50, 'orange');
        this.renderer.drawRect(210, 30, 412, 30, 'black');
        this.renderer.drawText('选择关卡', 416, 45, 'white', 28);
        
        // Draw navigation hint
        this.renderer.drawRect(200, 760, 432, 40, 'steel');
        this.renderer.drawRect(210, 770, 412, 20, 'black');
        this.renderer.drawText('↑↓ 选择 | ENTER 确认 | ESC 返回', 416, 782, 'white', 16);
        
        // Calculate visible page (8 levels per page)
        const page = Math.floor(selectedLevel / 8);
        const startLevel = page * 8;
        const endLevel = Math.min(startLevel + 8, 40);
        
        // Draw levels
        for (let i = startLevel; i < endLevel; i++) {
            const levelIndex = i;
            const row = i - startLevel;
            const x = 100;
            const y = 100 + row * 75;
            const width = 632;
            const height = 65;
            
            // Highlight selected level
            const isSelected = levelIndex === selectedLevel;
            const isUnlocked = levelIndex <= maxUnlockedLevel;
            
            if (isSelected) {
                this.renderer.drawRect(x - 10, y - 5, width + 20, height + 10, 'orange');
            } else if (isUnlocked) {
                this.renderer.drawRect(x, y, width, height, 'steel');
            } else {
                this.renderer.drawRect(x, y, width, height, '#333');
            }
            
            this.renderer.drawRect(x + 5, y + 5, width - 10, height - 10, 'black');
            
            // Level number and name
            const statusText = isUnlocked ? '✓ 已通关' : (levelIndex === 0 ? '✓ 可选' : '🔒 锁定');
            const levelText = `第 ${levelIndex + 1} 关: ${levelNames[levelIndex] || '未知'}`;
            
            this.renderer.drawText(levelText, x + 20, y + 25, isSelected ? 'orange' : (isUnlocked ? 'white' : '#666'), 20);
            this.renderer.drawText(statusText, x + 450, y + 25, isUnlocked ? '#4CAF50' : '#666', 18);
        }
        
        // Draw page indicator
        const totalPages = Math.ceil(40 / 8);
        const currentPage = page + 1;
        this.renderer.drawText(`第 ${currentPage}/${totalPages} 页`, 416, 740, 'white', 18);
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
        
        const centerX = 520;
        
        // Draw decorative brick border
        for (let i = 0; i < 13; i++) {
            this.renderer.drawBrick(220 + i * 48, 250, 48);
            this.renderer.drawBrick(220 + i * 48, 650, 48);
        }
        for (let i = 0; i < 9; i++) {
            this.renderer.drawBrick(220, 250 + i * 48, 48);
            this.renderer.drawBrick(772, 250 + i * 48, 48);
        }
        
        // Draw pause title with orange background and black text
        this.renderer.drawRect(centerX - 200, 350, 400, 50, 'orange');
        this.renderer.drawRect(centerX - 190, 360, 380, 30, 'black');
        this.renderer.drawText('暂停', centerX, 375, 'white', 32);
        
        // Draw continue instruction
        this.renderer.drawRect(centerX - 200, 430, 400, 50, 'steel');
        this.renderer.drawRect(centerX - 190, 440, 380, 30, 'black');
        this.renderer.drawText('按 ESC 继续', centerX, 455, 'white', 24);
    }

    /**
     * Draw the game over screen
     */
    drawGameOver(_score: number): void {
        this.renderer.clear();
        
        const centerX = 520;
        
        // Draw decorative brick border
        for (let i = 0; i < 13; i++) {
            this.renderer.drawBrick(220 + i * 48, 100, 48);
            this.renderer.drawBrick(220 + i * 48, 800, 48);
        }
        for (let i = 0; i < 15; i++) {
            this.renderer.drawBrick(220, 100 + i * 48, 48);
            this.renderer.drawBrick(772, 100 + i * 48, 48);
        }
        
        // Draw game over title with orange background and black text
        this.renderer.drawRect(centerX - 200, 180, 400, 50, 'orange');
        this.renderer.drawRect(centerX - 190, 190, 380, 30, 'black');
        this.renderer.drawText('游戏结束', centerX, 205, 'white', 32);
        
        // Draw score
        this.renderer.drawRect(centerX - 200, 270, 400, 50, 'steel');
        this.renderer.drawRect(centerX - 190, 280, 380, 30, 'black');
        this.renderer.drawText(`得分: ${_score}`, centerX, 295, 'white', 24);
        
        // Draw restart instruction
        this.renderer.drawRect(centerX - 200, 350, 400, 50, 'steel');
        this.renderer.drawRect(centerX - 190, 360, 380, 30, 'black');
        this.renderer.drawText('按 R 重新开始', centerX, 375, 'white', 24);
        
        // Draw tank decoration
        this.renderer.drawTank(centerX - 150, 500, 48, 'up', 'green');
        this.renderer.drawTank(centerX + 150, 500, 48, 'down', 'green');
    }

    /**
     * Draw the level complete screen
     */
    drawLevelComplete(): void {
        this.renderer.clear();
        
        // Draw decorative brick border (centered)
        for (let i = 0; i < 10; i++) {
            this.renderer.drawBrick(160 + i * 40, 60, 40);
            this.renderer.drawBrick(160 + i * 40, 500, 40);
        }
        for (let i = 0; i < 12; i++) {
            this.renderer.drawBrick(160, 60 + i * 40, 40);
            this.renderer.drawBrick(640, 60 + i * 40, 40);
        }
        
        // Draw level complete title with orange background and black text (centered)
        this.renderer.drawRect(180, 80, 440, 50, 'orange');
        this.renderer.drawRect(190, 90, 420, 30, 'black');
        this.renderer.drawText('关卡完成', 400, 105, 'white', 32);
        
        // Draw next level instruction with steel background and black text (centered)
        this.renderer.drawRect(200, 250, 400, 50, 'steel');
        this.renderer.drawRect(210, 260, 380, 30, 'black');
        this.renderer.drawText('进入下一关...', 400, 275, 'white', 24);
        
        // Draw tank decoration
        this.renderer.drawTank(300, 500, 40, 'up', 'green');
        this.renderer.drawTank(500, 500, 40, 'down', 'green');
    }
}