import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class AntiTankGun extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        this.speed = 96;
        this.health = 1;
        this.width = 64;
        this.height = 64;
        this.scoreValue = 150;
        this.enemyType = "anti";
        this.bulletLevel = 2;
    }
}
