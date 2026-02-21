export enum TileType {
    Empty,
    Brick,
    Steel,
    Water,
    Base
}

export class MapSystem {
    private grid: TileType[][];

    constructor() {
        this.grid = Array(13).fill(null).map(() => Array(13).fill(TileType.Empty));
        this.grid[12][4] = TileType.Base;

        // Scattered walls in middle (leave spawn area clear)
        const walls = [
            [3,3],[6,3],[9,3],
            [4,5],[8,5],
            [3,7],[6,7],[9,7],
            [4,9],[8,9],
            [3,11],[9,11]
        ];
        for (const [x,y] of walls) {
            this.grid[y][x] = TileType.Brick;
        }
        
        // Clear large spawn area at bottom
        for (let x = 2; x <= 7; x++) {
            this.grid[11][x] = TileType.Empty;
            this.grid[10][x] = TileType.Empty;
            this.grid[12][x] = TileType.Empty;
        }
    }

    getTile(x: number, y: number): TileType {
        if (x < 0 || x >= 13 || y < 0 || y >= 13) return TileType.Empty;
        return this.grid[y][x];
    }

    setTile(x: number, y: number, type: TileType): void {
        if (x < 0 || x >= 13 || y < 0 || y >= 13) return;
        this.grid[y][x] = type;
    }

    getDimensions() { return { width: 13, height: 13 }; }
    getTileSize() { return 32; }
    getTotalSize() { return { width: 416, height: 416 }; }
}
