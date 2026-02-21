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
        this.grid[12][6] = TileType.Base;
    }

    getTile(x: number, y: number): TileType {
        if (x < 0 || x >= 13 || y < 0 || y >= 13) {
            return TileType.Empty;
        }
        return this.grid[y][x];
    }

    setTile(x: number, y: number, type: TileType): void {
        if (x < 0 || x >= 13 || y < 0 || y >= 13) {
            return;
        }
        this.grid[y][x] = type;
    }

    getDimensions(): { width: number; height: number } {
        return { width: 13, height: 13 };
    }

    getTileSize(): number {
        return 32;
    }

    getTotalSize(): { width: number; height: number } {
        return { width: 416, height: 416 };
    }
}