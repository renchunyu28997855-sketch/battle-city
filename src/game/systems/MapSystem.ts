export enum TileType {
    Empty,
    Brick,
    Steel,
    Water,
    Base,
    Eagle,
    Forest,
    Floor
}

export class MapSystem {
    private grid: TileType[][];

    constructor() {
        this.grid = Array(13).fill(null).map(() => Array(13).fill(TileType.Floor));
        
        // Place eagle at bottom center (column 6, row 12)
        this.grid[12][6] = TileType.Eagle;
        
        // Surround eagle with bricks (only left and right, not blocking spawn)
        const eagleWalls = [
            [5,12],[7,12]
        ];
        for (const [x,y] of eagleWalls) {
            this.grid[y][x] = TileType.Brick;
        }

        // Clear spawn area at bottom for player (columns 4-8, rows 11-12)
        for (let x = 4; x <= 8; x++) {
            for (let y = 10; y <= 12; y++) {
                this.grid[y][x] = TileType.Empty;
            }
        }
        
        // Clear top left spawn area for enemies (columns 0-2, rows 0-1)
        for (let x = 0; x <= 2; x++) {
            this.grid[0][x] = TileType.Empty;
            this.grid[1][x] = TileType.Empty;
        }
        
        // Clear top right spawn area for enemies (columns 10-12, rows 0-1)
        for (let x = 10; x <= 12; x++) {
            this.grid[0][x] = TileType.Empty;
            this.grid[1][x] = TileType.Empty;
        }

        // Scattered walls in middle (leave spawn area clear)
        const walls = [
            [3,3],[6,3],[9,3],
            [4,5],[8,5],
            [3,7],[6,7],[9,7],
            [4,9],[8,9]
        ];
        for (const [x,y] of walls) {
            this.grid[y][x] = TileType.Brick;
        }

        // Add water tiles
        const waterTiles = [[1,1],[1,2],[2,1]];
        for (const [x,y] of waterTiles) {
            this.grid[y][x] = TileType.Water;
        }

        // Add forest tiles
        const forestTiles = [[5,1],[5,2],[6,1],[10,3],[10,4],[11,3]];
        for (const [x,y] of forestTiles) {
            this.grid[y][x] = TileType.Forest;
        }

        // Add steel walls
        const steelTiles = [[11,1],[11,2],[11,5]];
        for (const [x,y] of steelTiles) {
            this.grid[y][x] = TileType.Steel;
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
    getTileSize() { return 64; }
    getTotalSize() { return { width: 832, height: 832 }; }
}
