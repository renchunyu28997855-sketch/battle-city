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
import { PowerUpManager, PowerUpType } from './game/systems/PowerUpManager';
import { Vector2D } from './game/utils/Vector2D';
import levelData from './data/levels.json';

const currentLevelConfig = levelData.levels[0];

const inputManager = new InputManager();
const renderer = new Renderer(canvas);
const mapSystem = new MapSystem(currentLevelConfig.map_data);
const screens = new Screens(renderer);
const collisionSystem = new CollisionSystem(mapSystem);
const soundManager = SoundManager.getInstance();
const powerUpManager = new PowerUpManager();

// Power-up state variables
let playerInvincible = false;
let playerCanPassWater = false;
let enemiesFrozen = false;
let enemyFreezeTimer = 0;
let shovelTimer = 0;
let invincibleTimer = 0;
const INVINCIBLE_DURATION = 15000;
const CLOCK_DURATION = 10000;
const SHOVEL_DURATION = 20000;
void playerCanPassWater;

// Game state - start in Menu mode
let gameState: GameState = GameState.Menu;
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
let selectedLevel: number = 0;
let maxUnlockedLevel: number = 0;
let lKeyReleased: boolean = true;
let enterKeyReleased: boolean = true;
const TOTAL_LEVELS: number = 40;
let escKeyReleased: boolean = true;

// 爆炸效果数组
interface Explosion {
    x: number;
    y: number;
    size: number;
    startTime: number;
}
let explosions: Explosion[] = [];
const EXPLOSION_DURATION = 500; // 毫秒

// Initialize player tank
function initPlayerTank() {
    playerTank = new PlayerTank(mapSystem);
}

// Reset level
function resetLevel() {
    enemies = [];
    bullets.length = 0;
    enemiesSpawned = 0;
    enemySpawnTimer = 0;
    (window as any).eagleDestroyed = false;
    playerInvincible = false;
    playerCanPassWater = false;
    enemiesFrozen = false;
    enemyFreezeTimer = 0;
    shovelTimer = 0;
    invincibleTimer = 0;
    playerInvincible = false;
    playerCanPassWater = false;
    if (playerTank) {
        playerTank.canPassWater = false;
    }
}

// Load level by number (1-40)
function loadLevel(level: number) {
    const levelIndex = level - 1;
    if (levelIndex >= 0 && levelIndex < levelData.levels.length) {
        const config = levelData.levels[levelIndex];
        const newMapSystem = new MapSystem(config.map_data);
        mapSystem.grid = newMapSystem.grid;
        (window as any).MAX_ENEMIES_PER_LEVEL = config.enemy_config.total_count;
        (window as any).MAX_ON_SCREEN_ENEMIES = config.enemy_config.max_on_screen;
    }
}

// Apply power-up effect
function applyPowerUpEffect(type: PowerUpType) {
    if (!playerTank) return;
    
    switch (type) {
        case PowerUpType.HELMET:
            playerInvincible = true;
            invincibleTimer = INVINCIBLE_DURATION;
            break;
        case PowerUpType.STAR:
            if (playerTank.bulletLevel < 3) {
                playerTank.bulletLevel++;
            }
            break;
        case PowerUpType.BOMB:
            for (const enemy of enemies) {
                if (enemy.active) {
                    enemy.health = 0;
                    enemy.active = false;
                    explosions.push({
                        x: enemy.x,
                        y: enemy.y,
                        size: enemy.width,
                        startTime: Date.now()
                    });
                }
            }
            break;
        case PowerUpType.CLOCK:
            enemiesFrozen = true;
            enemyFreezeTimer = CLOCK_DURATION;
            break;
        case PowerUpType.SHOVEL:
            shovelTimer = SHOVEL_DURATION;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const x = 6 + dx;
                    const y = 12 + dy;
                    if (x >= 0 && x < 13 && y >= 0 && y < 13) {
                        const tile = mapSystem.getTile(x, y);
                        if (tile === TileType.Brick || tile === TileType.Floor) {
                            mapSystem.setTile(x, y, TileType.Steel);
                        }
                    }
                }
            }
            break;
        case PowerUpType.TANK:
            playerTank.health++;
            break;
        case PowerUpType.BOAT:
            playerCanPassWater = true;
            if (playerTank) playerTank.canPassWater = true;
            break;
        case PowerUpType.GUN:
            playerTank.bulletLevel = 3;
            break;
    }
}

// Game update function
function update(deltaTime: number) {
    // ESC to pause/resume
    if (inputManager.isPressed('Escape')) {
        if (escKeyReleased) {
            if (gameState === GameState.Playing) {
                gameState = GameState.Paused;
            } else if (gameState === GameState.Paused) {
                gameState = GameState.Playing;
            }
            escKeyReleased = false;
        }
    } else {
        escKeyReleased = true;
    }
    
    // R to restart
    if (inputManager.isPressed('KeyR') && (gameState === GameState.GameOver || gameState === GameState.LevelComplete)) {
        currentLevel = 1;
        resetLevel();
        initPlayerTank();
        gameState = GameState.Playing;
    }
    
    // Level select handling
    if (gameState === GameState.Menu) {
        if (inputManager.isPressed('Enter') && enterKeyReleased) {
            currentLevel = 1;
            loadLevel(currentLevel);
            resetLevel();
            initPlayerTank();
            gameState = GameState.Playing;
            enterKeyReleased = false;
        }
        if (inputManager.isPressed('KeyL') && lKeyReleased) {
            selectedLevel = 0;
            maxUnlockedLevel = 0;
            gameState = GameState.LevelSelect;
            lKeyReleased = false;
        }
        if (!inputManager.isPressed('Enter')) {
            enterKeyReleased = true;
        }
        if (!inputManager.isPressed('KeyL')) {
            lKeyReleased = true;
        }
    }
    
    if (gameState === GameState.LevelSelect) {
        if (inputManager.isPressed('Escape') && escKeyReleased) {
            gameState = GameState.Menu;
            escKeyReleased = false;
        }
        if (!inputManager.isPressed('Escape')) {
            escKeyReleased = true;
        }
        
        if (inputManager.isPressed('ArrowUp') || inputManager.isPressed('KeyW')) {
            if (selectedLevel > 0) selectedLevel--;
        }
        if (inputManager.isPressed('ArrowDown') || inputManager.isPressed('KeyS')) {
            if (selectedLevel < TOTAL_LEVELS - 1) selectedLevel++;
        }
        
        if (inputManager.isPressed('Enter') && enterKeyReleased) {
            if (selectedLevel <= maxUnlockedLevel) {
                currentLevel = selectedLevel + 1;
                loadLevel(currentLevel);
                resetLevel();
                initPlayerTank();
                gameState = GameState.Playing;
                enterKeyReleased = false;
            }
        }
        if (!inputManager.isPressed('Enter')) {
            enterKeyReleased = true;
        }
    }
    
    switch (gameState) {
        case GameState.Menu:
            break;
            
        case GameState.LevelSelect:
            break;
            
        case GameState.Playing:
            if (playerTank) {
                let moving = false;
                if (inputManager.isPressed('ArrowUp') || inputManager.isPressed('KeyW')) {
                    playerTank.move(Direction.Up);
                    moving = true;
                }
                if (inputManager.isPressed('ArrowDown') || inputManager.isPressed('KeyS')) {
                    playerTank.move(Direction.Down);
                    moving = true;
                }
                if (inputManager.isPressed('ArrowLeft') || inputManager.isPressed('KeyA')) {
                    playerTank.move(Direction.Left);
                    moving = true;
                }
                if (inputManager.isPressed('ArrowRight') || inputManager.isPressed('KeyD')) {
                    playerTank.move(Direction.Right);
                    moving = true;
                }
                
                // Only update position when moving
                if (moving) {
                    playerTank.update(deltaTime);
                }
                
                // Space bar to shoot (with cooldown)
                const now = Date.now();
                if (inputManager.isPressed('Space') && now - lastShotTime > 900) {
                    lastShotTime = now;
                    if (!bulletPool) {
                        bulletPool = BulletPool.getInstance();
                    }
                    const bullet = bulletPool.acquire();
                    if (bullet && playerTank) {
                        bullet.x = playerTank.x + 24;
                        bullet.y = playerTank.y + 24;
                        bullet.direction = playerTank.direction as unknown as BulletDirection;
                        bullet.active = true;
                        bullets.push(bullet);
                        soundManager.playShoot();
                    }
                }
                
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
            
            // Spawn enemies immediately after a kill (90 version), max 20 per level, max 4 on screen
            enemySpawnTimer += deltaTime;
            if (enemiesSpawned < MAX_ENEMIES_PER_LEVEL && enemies.length < MAX_ON_SCREEN_ENEMIES) {
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
                enemySpawnTimer = 0; // Reset immediately after spawning
            }
            
            // Spawn power-up occasionally (every ~15 seconds)
            powerUpManager.update();
            if (powerUpManager.getActivePowerUps().length < 2) {
                const spawnChance = Math.random();
                if (spawnChance < 0.01) { // ~1% chance per frame, roughly every 15 sec at 60fps
                    const validPositions: {x: number, y: number}[] = [];
                    for (let x = 0; x < 13; x++) {
                        for (let y = 0; y < 13; y++) {
                            const tile = mapSystem.getTile(x, y);
                            if (tile === TileType.Empty || tile === TileType.Floor || tile === TileType.Brick) {
                                validPositions.push({x: x * 64, y: y * 64});
                            }
                        }
                    }
                    if (validPositions.length > 0) {
                        const pos = validPositions[Math.floor(Math.random() * validPositions.length)];
                        powerUpManager.spawnPowerUp(new Vector2D(pos.x, pos.y));
                    }
                }
            }
            
            // Check player collecting power-ups
            if (playerTank) {
                const activePowerUps = powerUpManager.getActivePowerUps();
                for (const pu of activePowerUps) {
                    if (playerTank.x < pu.position.x + 64 &&
                        playerTank.x + playerTank.width > pu.position.x &&
                        playerTank.y < pu.position.y + 64 &&
                        playerTank.y + playerTank.height > pu.position.y) {
                        powerUpManager.activate(pu.id);
                        applyPowerUpEffect(pu.type);
                    }
                }
            }
            
            // Update power-up timers
            if (invincibleTimer > 0) {
                invincibleTimer -= deltaTime * 1000;
                if (invincibleTimer <= 0) {
                    playerInvincible = false;
                }
            }
            if (enemyFreezeTimer > 0) {
                enemyFreezeTimer -= deltaTime * 1000;
                if (enemyFreezeTimer <= 0) {
                    enemiesFrozen = false;
                }
            }
            if (shovelTimer > 0) {
                shovelTimer -= deltaTime * 1000;
                if (shovelTimer <= 0) {
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const x = 6 + dx;
                            const y = 12 + dy;
                            if (x >= 0 && x < 13 && y >= 0 && y < 13) {
                                const tile = mapSystem.getTile(x, y);
                                if (tile === TileType.Steel) {
                                    mapSystem.setTile(x, y, TileType.Brick);
                                }
                            }
                        }
                    }
                }
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
                        // 子弹击中墙壁时不播放爆炸声
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
                            explosions.push({
                                x: e.x,
                                y: e.y,
                                size: e.width,
                                startTime: Date.now()
                            });
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
                        if (!playerInvincible) {
                            playerTank.health--;
                            soundManager.playHit();
                            if (playerTank.health <= 0) {
                                soundManager.playExplosion();
                                gameState = GameState.GameOver;
                            }
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
                                // 子弹相撞时不播放爆炸声
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
                if (!enemiesFrozen) {
                    enemies[i].update(deltaTime);
                }
                
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
            
        case GameState.LevelSelect:
            const levelNames = levelData.levels.map((l: any) => l.level_name);
            screens.drawLevelSelect(selectedLevel, maxUnlockedLevel, levelNames);
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
            
            // Draw power-ups
            for (const pu of powerUpManager.getActivePowerUps()) {
                drawPowerUp(pu.position.x, pu.position.y, pu.type);
            }
            
            drawForestOverlay();
            
            // Draw explosions
            const now = Date.now();
            for (let i = explosions.length - 1; i >= 0; i--) {
                const exp = explosions[i];
                if (now - exp.startTime < EXPLOSION_DURATION) {
                    renderer.drawExplosion(exp.x, exp.y, exp.size);
                } else {
                    explosions.splice(i, 1);
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
                    renderer.drawWater(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Base:
                    renderer.drawBase(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Eagle:
                    renderer.drawEagle(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Forest:
                    break;
                case TileType.Floor:
                    renderer.drawFloor(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Ice:
                    renderer.drawIce(x * tileSize, y * tileSize, tileSize);
                    break;
                case TileType.Empty:
                default:
                    break;
            }
        }
    }
}

function drawForestOverlay() {
    const dimensions = mapSystem.getDimensions();
    const tileSize = mapSystem.getTileSize();
    
    for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
            const tileType = mapSystem.getTile(x, y);
            
            if (tileType === TileType.Forest) {
                renderer.drawForest(x * tileSize, y * tileSize, tileSize);
            }
        }
    }
}

function drawPowerUp(x: number, y: number, type: PowerUpType) {
    const size = 48;
    const offset = (64 - size) / 2;
    x += offset;
    y += offset;
    
    const ctx = renderer['ctx'];
    ctx.save();
    
    const colors: Record<PowerUpType, string> = {
        [PowerUpType.HELMET]: '#9B59B6',
        [PowerUpType.STAR]: '#F1C40F',
        [PowerUpType.BOMB]: '#E74C3C',
        [PowerUpType.CLOCK]: '#3498DB',
        [PowerUpType.SHOVEL]: '#E67E22',
        [PowerUpType.TANK]: '#2ECC71',
        [PowerUpType.BOAT]: '#1ABC9C',
        [PowerUpType.GUN]: '#95A5A6'
    };
    
    ctx.fillStyle = colors[type] || '#FFFFFF';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons: Record<PowerUpType, string> = {
        [PowerUpType.HELMET]: '🪖',
        [PowerUpType.STAR]: '⭐',
        [PowerUpType.BOMB]: '💣',
        [PowerUpType.CLOCK]: '⏱️',
        [PowerUpType.SHOVEL]: '⛏️',
        [PowerUpType.TANK]: '🎖️',
        [PowerUpType.BOAT]: '🚢',
        [PowerUpType.GUN]: '🔫'
    };
    
    ctx.fillText(icons[type] || '?', x + size/2, y + size/2);
    
    ctx.restore();
}

// Start the game loop
const gameLoop = new GameLoop(update, render);
gameLoop.start();

// Initialize the game
initPlayerTank();

console.log('Battle City game initialized');
