import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class FastTank extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        
        this.speed = 128;
        this.health = 1;
        this.scoreValue = 200;
    }
}