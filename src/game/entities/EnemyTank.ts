import { Tank, Direction } from './Tank';
import { MapSystem } from '../systems/MapSystem';

export class EnemyTank extends Tank {
    private mapSystem: MapSystem;
    private lastDirectionChange: number;
    private directionChangeInterval: number;
    private lastShotTime: number;
    private spawnTime: number;
    private isSpawnInvincible: boolean;
    active: boolean = true;
    
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y);
        this.mapSystem = mapSystem;
        this.speed = 64;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = this.getRandomDirectionChangeInterval();
        this.lastShotTime = 0;
        this.spawnTime = Date.now();
        this.isSpawnInvincible = true;
        
        this.direction = this.getRandomDirection();
    }

    update(deltaTime: number): void {
        if (this.isSpawnInvincible && Date.now() - this.spawnTime > 3000) {
            this.isSpawnInvincible = false;
        }
        
        this.lastDirectionChange += deltaTime;
        if (this.lastDirectionChange >= this.directionChangeInterval) {
            this.changeDirection();
            this.lastDirectionChange = 0;
            this.directionChangeInterval = this.getRandomDirectionChangeInterval();
        }
        
        super.update(deltaTime);
        
        if (this.checkCollision()) {
            this.revertMovement();
            this.changeDirection();
        }
        
        this.lastShotTime += deltaTime;
        if (this.lastShotTime >= 1.0 && Math.random() < 0.5) {
            this.shoot();
            this.lastShotTime = 0;
        }
    }

    private getRandomDirection(): Direction {
        const directions: Direction[] = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
        return directions[Math.floor(Math.random() * directions.length)];
    }

    private getRandomDirectionChangeInterval(): number {
        return 1 + Math.random() * 2;
    }

    private changeDirection(): void {
        this.direction = this.getRandomDirection();
    }

    private revertMovement(): void {
        switch (this.direction) {
            case Direction.Up:
                this.y += this.speed;
                break;
            case Direction.Down:
                this.y -= this.speed;
                break;
            case Direction.Left:
                this.x += this.speed;
                break;
            case Direction.Right:
                this.x -= this.speed;
                break;
        }
    }

    checkCollision(): boolean {
        const tileX = Math.floor(this.x / 32);
        const tileY = Math.floor(this.y / 32);
        
        if (tileX < 0 || tileX >= 13 || tileY < 0 || tileY >= 13) {
            return true;
        }
        
        const cornerTiles = [
            {x: tileX, y: tileY},
            {x: tileX + 1, y: tileY},  
            {x: tileX, y: tileY + 1},
            {x: tileX + 1, y: tileY + 1}
        ];

        for (const tile of cornerTiles) {
            const tileType = this.mapSystem.getTile(tile.x, tile.y);
            if (tileType !== undefined && tileType !== null && tileType !== 0) {
                return true;
            }
        }
        
        return false;
    }

    private shoot(): void {
    }

    public isInvincible(): boolean {
        return this.isSpawnInvincible;
    }
}