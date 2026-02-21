import { Tank, Direction } from './Tank';
import { MapSystem } from '../systems/MapSystem';

export class PlayerTank extends Tank {
    private mapSystem: MapSystem;

    constructor(mapSystem: MapSystem) {
        super(6 * 32, 12 * 32);
        this.mapSystem = mapSystem;
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
}