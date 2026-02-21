export interface EnemyConfig {
    type: string;
    count: number;
}

export class LevelManager {
    private currentLevel: number;
    private levels: EnemyConfig[][];
    private enemiesSpawned: number[];
    private enemiesRemaining: number[];

    constructor() {
        this.currentLevel = 1;
        this.levels = this.initializeLevels();
        this.enemiesSpawned = Array(10).fill(0);
        this.enemiesRemaining = Array(10).fill(0);
        this.initializeLevel(1);
    }

    private initializeLevels(): EnemyConfig[][] {
        return [
            // Level 1: 20 Normal enemies
            [
                { type: 'Normal', count: 20 }
            ],
            
            // Level 2: 15 Normal + 5 Fast
            [
                { type: 'Normal', count: 15 },
                { type: 'Fast', count: 5 }
            ],
            
            // Level 3: 10 Normal + 5 Fast + 5 Heavy
            [
                { type: 'Normal', count: 10 },
                { type: 'Fast', count: 5 },
                { type: 'Heavy', count: 5 }
            ],
            
            // Level 4: 5 Fast + 10 Heavy + 5 Super
            [
                { type: 'Fast', count: 5 },
                { type: 'Heavy', count: 10 },
                { type: 'Super', count: 5 }
            ],
            
            // Level 5: 10 Normal + 10 Fast + 5 Heavy + 5 Super
            [
                { type: 'Normal', count: 10 },
                { type: 'Fast', count: 10 },
                { type: 'Heavy', count: 5 },
                { type: 'Super', count: 5 }
            ],
            
            // Level 6: 15 Normal + 10 Fast + 10 Heavy + 5 Super
            [
                { type: 'Normal', count: 15 },
                { type: 'Fast', count: 10 },
                { type: 'Heavy', count: 10 },
                { type: 'Super', count: 5 }
            ],
            
            // Level 7: 5 Normal + 15 Fast + 10 Heavy + 10 Super
            [
                { type: 'Normal', count: 5 },
                { type: 'Fast', count: 15 },
                { type: 'Heavy', count: 10 },
                { type: 'Super', count: 10 }
            ],
            
            // Level 8: 10 Normal + 10 Fast + 15 Heavy + 10 Super
            [
                { type: 'Normal', count: 10 },
                { type: 'Fast', count: 10 },
                { type: 'Heavy', count: 15 },
                { type: 'Super', count: 10 }
            ],
            
            // Level 9: 5 Normal + 15 Fast + 15 Heavy + 15 Super
            [
                { type: 'Normal', count: 5 },
                { type: 'Fast', count: 15 },
                { type: 'Heavy', count: 15 },
                { type: 'Super', count: 15 }
            ],
            
            // Level 10: 20 Normal + 20 Fast + 20 Heavy + 10 Super
            [
                { type: 'Normal', count: 20 },
                { type: 'Fast', count: 20 },
                { type: 'Heavy', count: 20 },
                { type: 'Super', count: 10 }
            ]
        ];
    }

    private initializeLevel(level: number): void {
        const levelIndex = level - 1;
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            let totalEnemies = 0;
            for (const enemyConfig of this.levels[levelIndex]) {
                totalEnemies += enemyConfig.count;
            }
            this.enemiesRemaining[levelIndex] = totalEnemies;
            this.enemiesSpawned[levelIndex] = 0;
        }
    }

    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    public getNextLevel(): number {
        return this.currentLevel + 1;
    }

    public incrementLevel(): void {
        if (this.currentLevel < 10) {
            this.currentLevel++;
            this.initializeLevel(this.currentLevel);
        }
    }

    public getEnemiesForLevel(level: number): EnemyConfig[] {
        const levelIndex = level - 1;
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            return this.levels[levelIndex];
        }
        return [];
    }

    public getEnemiesRemaining(): number {
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < this.enemiesRemaining.length) {
            return this.enemiesRemaining[levelIndex];
        }
        return 0;
    }

    public spawnEnemy(): void {
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < this.enemiesSpawned.length) {
            this.enemiesSpawned[levelIndex]++;
            this.enemiesRemaining[levelIndex]--;
        }
    }

    public levelComplete(): boolean {
        const levelIndex = this.currentLevel - 1;
        if (levelIndex >= 0 && levelIndex < this.enemiesRemaining.length) {
            return this.enemiesRemaining[levelIndex] <= 0;
        }
        return false;
    }

    public reset(): void {
        this.currentLevel = 1;
        this.initializeLevel(1);
    }
}