export interface TileData {
    x: number;
    y: number;
    type: number;
}

export interface LevelData {
    name: string;
    data: TileData[];
    base: { x: number; y: number }[];
    author: string;
    description: string;
}

export interface LevelPackage {
    version: string;
    levels: LevelData[];
}
