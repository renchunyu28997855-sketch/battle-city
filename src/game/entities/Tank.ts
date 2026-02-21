export enum Direction {
    Up,
    Down,
    Left,
    Right
}

export class Tank {
    x: number;
    y: number;
    direction: Direction;
    speed: number;
    width: number;
    height: number;
    health: number;
    scoreValue: number;
    bulletLevel: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.direction = Direction.Up;
        this.speed = 64;
        this.width = 32;
        this.height = 32;
        this.health = 1;
        this.scoreValue = 0;
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
    }

    move(direction: Direction): void {
        this.direction = direction;
    }

    checkCollision(mapSystem: any): boolean {
        const tileX = Math.floor(this.x / 32);
        const tileY = Math.floor(this.y / 32);
        
        const cornerTiles = [
            {x: tileX, y: tileY},
            {x: tileX + 1, y: tileY},  
            {x: tileX, y: tileY + 1},
            {x: tileX + 1, y: tileY + 1}
        ];

        for (const tile of cornerTiles) {
            const tileType = mapSystem.getTile(tile.x, tile.y);
            if (tileType !== undefined && tileType !== null && tileType !== 0) {
                return true;
            }
        }
        
        return false;
    }
}
