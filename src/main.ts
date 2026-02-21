// Battle City main entry point
console.log('Battle City game initializing...');

// Canvas setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = 416;
canvas.height = 416;

// Import all game modules
import { GameLoop } from './core/GameLoop';
import { InputManager } from './core/InputManager';
import { Renderer } from './core/Renderer';
import { MapSystem, TileType } from './game/systems/MapSystem';
import { PlayerTank } from './game/entities/PlayerTank';
import { Screens, GameState } from './ui/Screens';
import { Direction } from './game/entities/Tank';
import { Bullet, BulletDirection } from './game/entities/Bullet';
import { BulletPool } from './game/entities/BulletPool';
import { EnemyTank } from './game/entities/EnemyTank';

// Initialize core systems
const inputManager = new InputManager();
const renderer = new Renderer(canvas);
const mapSystem = new MapSystem();
const screens = new Screens(renderer);

// Game state - start in Playing mode
let gameState: GameState = GameState.Playing;
let playerTank: PlayerTank | null = null;
let bullets: Bullet[] = [];
let enemies: EnemyTank[] = [];
let bulletPool: BulletPool;
let enemySpawnTimer: number = 0;
let lastShotTime: number = 0;
let enemiesSpawned: number = 0;
const MAX_ENEMIES_PER_LEVEL: number = 20;

// Initialize player tank
function initPlayerTank() {
    playerTank = new PlayerTank(mapSystem);
    playerTank.x = 4 * 32;
    playerTank.y = 11 * 32;
}

// Game update function
function update(deltaTime: number) {
    // ESC to pause/resume
    if (inputManager.isPressed('Escape')) {
        if (gameState === GameState.Playing) {
            gameState = GameState.Paused;
        } else if (gameState === GameState.Paused) {
            gameState = GameState.Playing;
        }
    }
    
    switch (gameState) {
        case GameState.Menu:
            break;
            
        case GameState.Playing:
            if (playerTank) {
                if (inputManager.isPressed('ArrowUp') || inputManager.isPressed('KeyW')) {
                    playerTank.move(Direction.Up);
                }
                if (inputManager.isPressed('ArrowDown') || inputManager.isPressed('KeyS')) {
                    playerTank.move(Direction.Down);
                }
                if (inputManager.isPressed('ArrowLeft') || inputManager.isPressed('KeyA')) {
                    playerTank.move(Direction.Left);
                }
                if (inputManager.isPressed('ArrowRight') || inputManager.isPressed('KeyD')) {
                    playerTank.move(Direction.Right);
                }
                
                // Space bar to shoot (with cooldown)
                const now = Date.now();
                if (inputManager.isPressed('Space') && now - lastShotTime > 300) {
                    lastShotTime = now;
                    if (!bulletPool) {
                        bulletPool = BulletPool.getInstance();
                    }
                    const bullet = bulletPool.acquire();
                    if (bullet) {
                        bullet.x = playerTank.x + 12;
                        bullet.y = playerTank.y + 12;
                        bullet.direction = playerTank.direction as unknown as BulletDirection;
                        bullet.active = true;
                        bullets.push(bullet);
                    }
                }
                
                playerTank.update(deltaTime);
            }
            
            // Spawn enemies every 3 seconds, max 20 per level
            enemySpawnTimer += deltaTime;
            if (enemySpawnTimer >= 3 && enemiesSpawned < MAX_ENEMIES_PER_LEVEL) {
                enemySpawnTimer = 0;
                
                // Create new enemy tank at a random position
                const newEnemy = new EnemyTank(0, 0, mapSystem);
                // Spawn at a random top position
                newEnemy.x = Math.random() * (mapSystem.getDimensions().width * mapSystem.getTileSize() - newEnemy.width);
                newEnemy.y = 0;
                newEnemy.direction = Direction.Down;
                enemies.push(newEnemy);
                enemiesSpawned++;
            }
            
            // Update bullets and enemies
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].update(deltaTime);
                
                // Check bullet-enemy collision
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const b = bullets[i];
                    const e = enemies[j];
                    if (b.active && e.active &&
                        b.x < e.x + e.width &&
                        b.x + b.width > e.x &&
                        b.y < e.y + e.height &&
                        b.y + b.height > e.y) {
                        // Hit! Remove both bullet and enemy
                        b.active = false;
                        e.active = false;
                        break;
                    }
                }
                
                if (!bullets[i].active) {
                    bullets.splice(i, 1);
                }
            }
            
            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update(deltaTime);
                // Remove enemies that are no longer active
                if (!enemies[i].active) {
                    enemies.splice(i, 1);
                }
            }
            break;
            
        case GameState.Paused:
            break;
            
        case GameState.GameOver:
            break;
            
        case GameState.LevelComplete:
            break;
    }
}

// Game render function
function render() {
    switch (gameState) {
        case GameState.Menu:
            screens.drawMenu();
            break;
            
        case GameState.Playing:
            renderer.clear();
            
            drawMap();
            
            if (playerTank) {
                const dir = playerTank.direction === 0 ? 'up' : 
                           playerTank.direction === 1 ? 'down' : 
                           playerTank.direction === 2 ? 'left' : 'right';
                renderer.drawTank(playerTank.x, playerTank.y, playerTank.width, dir, 'blue');
            }
            
            // Render bullets
            for (const bullet of bullets) {
                if (bullet.active) {
                    renderer.drawRect(bullet.x, bullet.y, bullet.width, bullet.height, 'yellow');
                }
            }
            
            // Render enemies
            for (const enemy of enemies) {
                if (enemy.active) {
                    const dir = enemy.direction === 0 ? 'up' : 
                               enemy.direction === 1 ? 'down' : 
                               enemy.direction === 2 ? 'left' : 'right';
                    renderer.drawTank(enemy.x, enemy.y, enemy.width, dir, 'red');
                }
            }
            break;
            
        case GameState.Paused:
            screens.drawPaused();
            break;
            
        case GameState.GameOver:
            screens.drawGameOver(0);
            break;
            
        case GameState.LevelComplete:
            screens.drawLevelComplete();
            break;
    }
}

// Draw the map
function drawMap() {
    const dimensions = mapSystem.getDimensions();
    const tileSize = mapSystem.getTileSize();
    
    for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
            const tileType = mapSystem.getTile(x, y);
            
            switch (tileType) {
                case TileType.Brick:
                    renderer.drawBrick(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Steel:
                    renderer.drawSteel(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Water:
                    renderer.drawRect(x * tileSize, y * tileSize, tileSize, tileSize, 'blue');
                    break;
                case TileType.Base:
                    renderer.drawBase(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Empty:
                default:
                    break;
            }
        }
    }
}

// Start the game loop
const gameLoop = new GameLoop(update, render);
gameLoop.start();

// Initialize the game
initPlayerTank();

console.log('Battle City game initialized');
