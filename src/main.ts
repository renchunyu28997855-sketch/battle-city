// Battle City main entry point
console.log('Battle City game initializing...');

// Canvas setup
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
canvas.width = 832;
canvas.height = 832;

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
import { ArmoredCar } from './game/enemies/ArmoredCar';
import { LightTank } from './game/enemies/LightTank';
import { AntiTankGun } from './game/enemies/AntiTankGun';
import { HeavyTank } from './game/enemies/HeavyTank';
import { NormalTank } from './game/enemies/NormalTank';
import { CollisionSystem } from './game/systems/CollisionSystem';
import { SoundManager } from './core/SoundManager';

// Initialize core systems
const inputManager = new InputManager();
const renderer = new Renderer(canvas);
const mapSystem = new MapSystem();
const screens = new Screens(renderer);
const collisionSystem = new CollisionSystem(mapSystem);
const soundManager = SoundManager.getInstance();

// Game state - start in Playing mode
let gameState: GameState = GameState.Playing;
let playerTank: PlayerTank | null = null;
let bullets: Bullet[] = [];
(window as any).bullets = bullets;
let enemies: EnemyTank[] = [];
let bulletPool: BulletPool;
let enemySpawnTimer: number = 0;
let lastShotTime: number = 0;
let enemiesSpawned: number = 0;
const MAX_ENEMIES_PER_LEVEL: number = 20;
const MAX_ON_SCREEN_ENEMIES: number = 4;
let currentLevel: number = 1;
const TOTAL_LEVELS: number = 50;

// Initialize player tank
function initPlayerTank() {
    playerTank = new PlayerTank(mapSystem);
    playerTank.x = 5 * 64;
    playerTank.y = 11 * 64;
}

// Reset level
function resetLevel() {
    enemies = [];
    bullets.length = 0;
    enemiesSpawned = 0;
    enemySpawnTimer = 0;
    (window as any).eagleDestroyed = false;
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
    
    // R to restart
    if (inputManager.isPressed('KeyR') && (gameState === GameState.GameOver || gameState === GameState.LevelComplete)) {
        currentLevel = 1;
        resetLevel();
        initPlayerTank();
        gameState = GameState.Playing;
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
                        bullet.x = playerTank.x + 24;
                        bullet.y = playerTank.y + 24;
                        bullet.direction = playerTank.direction as unknown as BulletDirection;
                        bullet.active = true;
                        bullets.push(bullet);
                        soundManager.playShoot();
                    }
                }
                
                playerTank.update(deltaTime);
                
                // Check player-enemy collision - block like wall
                if (playerTank) {
                    for (const enemy of enemies) {
                        if (playerTank.x < enemy.x + enemy.width &&
                            playerTank.x + playerTank.width > enemy.x &&
                            playerTank.y < enemy.y + enemy.height &&
                            playerTank.y + playerTank.height > enemy.y) {
                            const distance = playerTank.speed * deltaTime;
                            switch (playerTank.direction) {
                                case Direction.Up: playerTank.y += distance; break;
                                case Direction.Down: playerTank.y -= distance; break;
                                case Direction.Left: playerTank.x += distance; break;
                                case Direction.Right: playerTank.x -= distance; break;
                            }
                        }
                    }
                }
            }
            
            // Spawn enemies every 3 seconds, max 20 per level, max 4 on screen
            enemySpawnTimer += deltaTime;
            if (enemySpawnTimer >= 3 && enemiesSpawned < MAX_ENEMIES_PER_LEVEL) {
                enemySpawnTimer = 0;
                
                const enemyTypes = [ArmoredCar, LightTank, AntiTankGun, HeavyTank, NormalTank];
                const EnemyClass = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                const newEnemy = new EnemyClass(0, 0, mapSystem);
                
                // Spawn at top left or top right corner
                const spawnLeft = Math.random() < 0.5;
                if (spawnLeft) {
                    newEnemy.x = 0;
                } else {
                    newEnemy.x = (mapSystem.getDimensions().width * mapSystem.getTileSize()) - newEnemy.width;
                }
                newEnemy.y = 0;
                newEnemy.direction = Direction.Down;
                enemies.push(newEnemy);
                enemiesSpawned++;
            }
            
            const activeEnemies = enemies.filter(e => e.active).length;
            
            // Check win/lose conditions
            if ((window as any).eagleDestroyed) {
                gameState = GameState.GameOver;
            }
            
            if (!playerTank || playerTank.health <= 0) {
                gameState = GameState.GameOver;
            }
            
            // Check level complete (all enemies defeated)
            if (enemiesSpawned >= MAX_ENEMIES_PER_LEVEL && activeEnemies === 0) {
                if (currentLevel >= TOTAL_LEVELS) {
                    gameState = GameState.LevelComplete;
                } else {
                    currentLevel++;
                    resetLevel();
                }
            }
            
            // Update bullets and enemies
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].update(deltaTime);
                
                // Check bullet-wall collision
                if (bullets[i].active) {
                    const wasActive = bullets[i].active;
                    collisionSystem.handleBulletCollisions(bullets[i]);
                    if (wasActive && !bullets[i].active) {
                        soundManager.playExplosion();
                    }
                }
                
                // Check bullet-enemy collision (only player bullets can damage enemies)
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const b = bullets[i];
                    const e = enemies[j];
                    if (b.active && e.active && !b.isEnemyBullet &&
                        b.x < e.x + e.width &&
                        b.x + b.width > e.x &&
                        b.y < e.y + e.height &&
                        b.y + b.height > e.y) {
                        b.active = false;
                        e.health--;
                        if (e.health > 0) {
                            soundManager.playMetalHit();
                        } else {
                            soundManager.playHit();
                        }
                        if (e.health <= 0) {
                            e.active = false;
                            soundManager.playExplosion();
                        }
                        break;
                    }
                }
                
                // Check enemy bullet vs player tank
                if (playerTank && bullets[i].active && bullets[i].isEnemyBullet) {
                    const b = bullets[i];
                    if (b.x < playerTank.x + playerTank.width &&
                        b.x + b.width > playerTank.x &&
                        b.y < playerTank.y + playerTank.height &&
                        b.y + b.height > playerTank.y) {
                        b.active = false;
                        playerTank.health--;
                        soundManager.playHit();
                        if (playerTank.health <= 0) {
                            gameState = GameState.GameOver;
                        }
                    }
                }
                
                // Check bullet-bullet collision (bullets can cancel each other)
                if (bullets[i] && bullets[i].active) {
                    for (let k = i + 1; k < bullets.length; k++) {
                        if (bullets[k] && bullets[k].active) {
                            const b1 = bullets[i];
                            const b2 = bullets[k];
                            if (b1.x < b2.x + b2.width &&
                                b1.x + b1.width > b2.x &&
                                b1.y < b2.y + b2.height &&
                                b1.y + b1.height > b2.y) {
                                b1.active = false;
                                b2.active = false;
                                soundManager.playExplosion();
                                break;
                            }
                        }
                    }
                }
                
                if (!bullets[i].active) {
                    bullets.splice(i, 1);
                }
            }
            
            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].update(deltaTime);
                
                // Check enemy-player collision - block like wall
                if (playerTank && enemies[i].active) {
                    if (playerTank.x < enemies[i].x + enemies[i].width &&
                        playerTank.x + playerTank.width > enemies[i].x &&
                        playerTank.y < enemies[i].y + enemies[i].height &&
                        playerTank.y + playerTank.height > enemies[i].y) {
                        const distance = enemies[i].speed * deltaTime;
                        switch (enemies[i].direction) {
                            case Direction.Up: enemies[i].y += distance; break;
                            case Direction.Down: enemies[i].y -= distance; break;
                            case Direction.Left: enemies[i].x += distance; break;
                            case Direction.Right: enemies[i].x -= distance; break;
                        }
                    }
                }
                
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
                    let color = 'white';
                    if (bullet.isSteel || bullet.powerLevel >= 3) {
                        color = 'cyan';
                    } else if (bullet.powerLevel >= 2) {
                        color = 'orange';
                    } else if (bullet.powerLevel >= 1) {
                        color = 'lightGray';
                    }
                    renderer.drawRect(bullet.x, bullet.y, bullet.width, bullet.height, color);
                }
            }
            
            // Render enemies
            for (const enemy of enemies) {
                if (enemy.active) {
                    const dir = enemy.direction === 0 ? 'up' : 
                               enemy.direction === 1 ? 'down' : 
                               enemy.direction === 2 ? 'left' : 'right';
                    let color = 'red';
                    switch (enemy.enemyType) {
                        case 'armored': color = 'yellow'; break;
                        case 'light': color = 'white'; break;
                        case 'anti': color = 'green'; break;
                        case 'heavy': color = 'red'; break;
                        default: color = 'red';
                    }
                    renderer.drawTank(enemy.x, enemy.y, enemy.width, dir, color);
                }
            }
            
            // Draw HUD - Player health as hearts
            if (playerTank) {
                for (let i = 0; i < playerTank.health; i++) {
                    renderer.drawHeart(20 + i * 25, 20);
                }
            }
            
            // Draw HUD - Level
            renderer.drawText(`关卡: ${currentLevel}`, 750, 30, 'white', 20);
            
            // Draw HUD - Remaining enemies
            const remainingEnemies = MAX_ENEMIES_PER_LEVEL - enemiesSpawned + enemies.filter(e => e.active).length;
            renderer.drawText(`敌人: ${remainingEnemies}`, 750, 60, 'white', 20);
            
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
                    renderer.drawRect(x * tileSize, y * tileSize, tileSize, tileSize, 'cyan');
                    break;
                case TileType.Base:
                    renderer.drawBase(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Eagle:
                    renderer.drawEagle(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Forest:
                    renderer.drawForest(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Floor:
                    renderer.drawFloor(x * tileSize, y * tileSize, tileSize);
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
