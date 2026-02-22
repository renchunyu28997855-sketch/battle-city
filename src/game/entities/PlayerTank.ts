import { Tank, Direction } from './Tank';
import { MapSystem, TileType } from '../systems/MapSystem';

const TILE_SIZE = 64;
const SNAP_THRESHOLD = 8;  // 超过这个偏移量才进行自动对齐

export class PlayerTank extends Tank {
    private mapSystem: MapSystem;
    canPassWater: boolean = false;

    constructor(mapSystem: MapSystem) {
        super(4 * 64, 12 * 64);
        this.mapSystem = mapSystem;
        this.health = 3;
        this.speed = 128;
        this.bulletLevel = 1;
    }

    update(deltaTime: number): void {
        const distance = this.speed * deltaTime;
        
        switch (this.direction) {
            case Direction.Up:
                this.y -= distance;
                break;
            case Direction.Down:
                this.y += distance;
                break;
            case Direction.Left:
                this.x -= distance;
                break;
            case Direction.Right:
                this.x += distance;
                break;
        }
        
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > 832) this.x = 832 - this.width;
        if (this.y + this.height > 832) this.y = 832 - this.height;
        
        if (this.checkCollision()) {
            switch (this.direction) {
                case Direction.Up:
                    this.y += distance;
                    break;
                case Direction.Down:
                    this.y -= distance;
                    break;
                case Direction.Left:
                    this.x += distance;
                    break;
                case Direction.Right:
                    this.x -= distance;
                    break;
            }
        }
    }

    checkCollision(): boolean {
        const margin = 4;
        const corners = [
            { x: this.x + margin, y: this.y + margin },
            { x: this.x + this.width - margin - 1, y: this.y + margin },
            { x: this.x + margin, y: this.y + this.height - margin - 1 },
            { x: this.x + this.width - margin - 1, y: this.y + this.height - margin - 1 }
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
        if (tileType === TileType.Water && this.canPassWater) {
            return false;
        }
        return tileType === TileType.Brick || 
               tileType === TileType.Steel || 
               tileType === TileType.Water || 
               tileType === TileType.Base;
    }
    
    // 停止移动时自动对齐到网格 - 避免卡在通道口
    public snapToGridWhenStopped(): void {
        // 检查x是否接近网格线
        const xMod = this.x % TILE_SIZE;
        const xNearGrid = xMod <= SNAP_THRESHOLD || xMod >= TILE_SIZE - SNAP_THRESHOLD;
        
        // 检查y是否接近网格线
        const yMod = this.y % TILE_SIZE;
        const yNearGrid = yMod <= SNAP_THRESHOLD || yMod >= TILE_SIZE - SNAP_THRESHOLD;
        
        // 如果x方向不在网格线上,且y已对齐,则对齐x(垂直移动时)
        if (!xNearGrid && yNearGrid) {
            const nearestX = Math.round(this.x / TILE_SIZE) * TILE_SIZE;
            this.x = nearestX;
        }
        // 如果y方向不在网格线上,且x已对齐,则对齐y(水平移动时)
        else if (!yNearGrid && xNearGrid) {
            const nearestY = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
            this.y = nearestY;
        }
        // 如果两者都不在网格线上,优先对齐偏离更大的方向
        else if (!xNearGrid && !yNearGrid) {
            // 对齐y(因为坦克通常需要纵向对齐才能水平移动)
            const nearestY = Math.round(this.y / TILE_SIZE) * TILE_SIZE;
            this.y = nearestY;
        }
    }
}