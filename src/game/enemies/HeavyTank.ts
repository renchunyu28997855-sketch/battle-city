import { EnemyTank } from '../entities/EnemyTank';
import { MapSystem } from '../systems/MapSystem';

export class HeavyTank extends EnemyTank {
    constructor(x: number, y: number, mapSystem: MapSystem) {
        super(x, y, mapSystem);
        
        this.speed = 64;
        this.health = 4;
        this.scoreValue = 300;
    }
}