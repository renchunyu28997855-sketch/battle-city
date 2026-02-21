import { Tank, Direction } from './Tank';
import { MapSystem, TileType } from '../systems/MapSystem';

export class PlayerTank extends Tank {
    private mapSystem: MapSystem;

    constructor(mapSystem: MapSystem) {
        super(3 * 64, 11 * 64);
        this.mapSystem = mapSystem;
        this.health = 3;
        this.speed = 128;
        this.bulletLevel = 2;
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
        return tileType === TileType.Brick || 
               tileType === TileType.Steel || 
               tileType === TileType.Water || 
               tileType === TileType.Base;
    }
}