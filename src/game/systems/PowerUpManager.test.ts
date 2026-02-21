import { PowerUpManager, PowerUpType } from "./PowerUpManager";
import { Vector2D } from "../utils/Vector2D";

function testPowerUpManager() {
  const manager = new PowerUpManager();
  
  const position = new Vector2D(100, 100);
  
  console.log("Testing PowerUpManager...");
  
  const id1 = manager.spawnPowerUp(position, PowerUpType.HELMET);
  const id2 = manager.spawnPowerUp(position, PowerUpType.STAR);
  const id3 = manager.spawnPowerUp(position, PowerUpType.BOMB);
  
  console.log("Spawned 3 power-ups with IDs:", id1, id2, id3);
  
  const activePowerUps = manager.getActivePowerUps();
  console.log("Active power-ups:", activePowerUps.length);
  
  const activated = manager.activate(id1);
  console.log("Activated power-up:", activated);
  
  const remainingActive = manager.getActivePowerUps();
  console.log("Remaining active power-ups:", remainingActive.length);
  
  manager.update();
  console.log("After update, active power-ups:", manager.getActivePowerUps().length);
  
  console.log("PowerUpManager test completed successfully!");
}

testPowerUpManager();