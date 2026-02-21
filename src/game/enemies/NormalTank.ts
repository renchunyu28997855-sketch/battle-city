import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class NormalTank extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        
        this.speed = 64;
        this.health = 1;
        this.width = 64;
        this.height = 64;
        this.scoreValue = 100;
        this.enemyType = "normal";
        this.bulletLevel = 0;
    }
}