export enum TileType {
    Empty,
    Brick,
    Steel,
    Water,
    Base,
    Eagle,
    Forest,
    Floor,
    Ice
}

export class MapSystem {
    public grid: TileType[][];

    constructor(mapData?: number[][]) {
        this.grid = Array(13).fill(null).map(() => Array(13).fill(TileType.Floor));
        
        if (mapData && mapData.length > 0) {
            for (let y = 0; y < 13 && y < mapData.length; y++) {
                for (let x = 0; x < 13 && x < mapData[y].length; x++) {
                    this.grid[y][x] = mapData[y][x] as TileType;
                }
            }
            return;
        }
        
        this.setupDefaultMap();
    }

    private setupDefaultMap(): void {
        // Place eagle at bottom center (column 6, row 12)
        this.grid[12][6] = TileType.Eagle;
        
        // Clear spawn area at bottom for player (columns 4 and 8 only)
        this.grid[11][4] = TileType.Empty;
        this.grid[11][8] = TileType.Empty;
        
        // Surround eagle with bricks - directly adjacent (bottom edge, can't go below)
        const eagleWalls = [
            [5,12],[7,12],  // left, right (same row as eagle)
            [6,11],          // top (above eagle)
            [5,11],[7,11]   // top corners
        ];
        for (const [x,y] of eagleWalls) {
            this.grid[y][x] = TileType.Brick;
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
    getTileSize() { return 80; }
    getTotalSize() { return { width: 1040, height: 1040 }; }
}
