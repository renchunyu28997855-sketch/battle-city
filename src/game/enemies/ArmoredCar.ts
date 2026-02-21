import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class ArmoredCar extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        this.speed = 192;
        this.health = 1;
        this.width = 64;
        this.height = 64;
        this.scoreValue = 50;
        this.enemyType = "armored";
        this.bulletLevel = 0;
    }
}
