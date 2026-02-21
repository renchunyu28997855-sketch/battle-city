import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class LightTank extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        this.speed = 128;
        this.health = 1;
        this.width = 64;
        this.height = 64;
        this.scoreValue = 100;
        this.enemyType = "light";
        this.bulletLevel = 1;
    }
}
