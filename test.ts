import { PlayerTank } from './src/game/entities/PlayerTank';
import { MapSystem } from './src/game/systems/MapSystem';

const map = new MapSystem();
const player = new PlayerTank(map);

console.log('Player tank created successfully');
console.log('Position:', player.x, player.y);
console.log('Direction:', player.direction);
console.log('Speed:', player.speed);

player.move(0);
console.log('After moving up:', player.y);

player.move(2);
console.log('After moving left:', player.x);