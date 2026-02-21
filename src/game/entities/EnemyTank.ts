import { Tank, Direction } from './Tank';
import { MapSystem, TileType } from '../systems/MapSystem';
import { Bullet, BulletDirection } from './Bullet';
import { BulletPool } from './BulletPool';

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
        this.speed = 128;
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
        const corners = [
            { x: this.x, y: this.y },
            { x: this.x + this.width - 1, y: this.y },
            { x: this.x, y: this.y + this.height - 1 },
            { x: this.x + this.width - 1, y: this.y + this.height - 1 }
        ];

        for (const corner of corners) {
            const tileX = Math.floor(corner.x / 64);
            const tileY = Math.floor(corner.y / 64);
            
            if (tileX < 0 || tileX >= 13 || tileY < 0 || tileY >= 13) {
                return true;
            }
            
            const tileType = this.mapSystem.getTile(tileX, tileY);
            if (this.isBlocking(tileType)) {
                return true;
            }
        }
        
        return false;
    }

    private isBlocking(tileType: TileType): boolean {
        return tileType === TileType.Brick || 
               tileType === TileType.Steel || 
               tileType === TileType.Water || 
               tileType === TileType.Base ||
               tileType === TileType.Eagle;
    }

    private shoot(): void {
        const bulletPool = BulletPool.getInstance();
        const bullet = bulletPool.acquire();
        if (!bullet) return;
        
        bullet.x = this.x + 24;
        bullet.y = this.y + 24;
        bullet.direction = this.convertDirection(this.direction);
        bullet.active = true;
        bullet.isEnemyBullet = true;
        bullet.powerLevel = this.bulletLevel;
        bullet.isSteel = this.bulletLevel >= 3;
        
        (window as any).bullets.push(bullet);
        
        // Fire second shot for level 2+
        if (this.bulletLevel >= 2) {
            const bullet2 = bulletPool.acquire();
            if (bullet2) {
                bullet2.x = this.x + 24;
                bullet2.y = this.y + 24;
                bullet2.direction = this.convertDirection(this.direction);
                bullet2.active = true;
                bullet2.isEnemyBullet = true;
                bullet2.powerLevel = this.bulletLevel;
                bullet2.isSteel = this.bulletLevel >= 3;
                (window as any).bullets.push(bullet2);
            }
        }
    }

    private convertDirection(dir: Direction): BulletDirection {
        switch (dir) {
            case Direction.Up: return BulletDirection.Up;
            case Direction.Down: return BulletDirection.Down;
            case Direction.Left: return BulletDirection.Left;
            case Direction.Right: return BulletDirection.Right;
            default: return BulletDirection.Up;
        }
    }

    public isInvincible(): boolean {
        return this.isSpawnInvincible;
    }
}