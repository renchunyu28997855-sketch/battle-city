import { Vector2D } from "../utils/Vector2D";

export enum PowerUpType {
  HELMET = "helmet",
  STAR = "star",
  BOMB = "bomb",
  CLOCK = "clock",
  SHOVEL = "shovel",
  TANK = "tank"
}

export class PowerUpManager {
  private powerUps: Array<{
    id: string;
    type: PowerUpType;
    position: Vector2D;
    expirationTime: number;
    active: boolean;
  }> = [];

  private powerUpTypes: PowerUpType[] = [
    PowerUpType.HELMET,
    PowerUpType.STAR,
    PowerUpType.BOMB,
    PowerUpType.CLOCK,
    PowerUpType.SHOVEL,
    PowerUpType.TANK
  ];

  private static POWER_UP_DURATION = 15000;

  constructor() {}

  spawnPowerUp(position: Vector2D, type?: PowerUpType): string {
    const powerUpType = type || this.getRandomPowerUpType();
    const id = this.generateId();

    this.powerUps.push({
      id,
      type: powerUpType,
      position,
      expirationTime: Date.now() + PowerUpManager.POWER_UP_DURATION,
      active: true
    });

    return id;
  }

  getActivePowerUps(): Array<{
    id: string;
    type: PowerUpType;
    position: Vector2D;
    expirationTime: number;
  }> {
    return this.powerUps
      .filter(powerUp => powerUp.active)
      .map(({ id, type, position, expirationTime }) => ({
        id,
        type,
        position,
        expirationTime
      }));
  }

  activate(id: string): boolean {
    const powerUpIndex = this.powerUps.findIndex(p => p.id === id && p.active);
    
    if (powerUpIndex === -1) {
      return false;
    }

    const powerUp = this.powerUps[powerUpIndex];
    
    this.applyPowerUpEffect(powerUp.type);
    
    this.powerUps[powerUpIndex].active = false;
    
    return true;
  }

  update() {
    const now = Date.now();
    
    this.powerUps = this.powerUps.filter(powerUp => {
      return powerUp.active || now < powerUp.expirationTime;
    });
  }

  private applyPowerUpEffect(type: PowerUpType) {
    switch (type) {
      case PowerUpType.HELMET:
        console.log("Helmet power-up activated - Player gets 10 seconds invincibility");
        break;
      case PowerUpType.STAR:
        console.log("Star power-up activated - Firepower upgraded");
        break;
      case PowerUpType.BOMB:
        console.log("Bomb power-up activated - All enemies on screen die");
        break;
      case PowerUpType.CLOCK:
        console.log("Clock power-up activated - Enemies freeze for 10 seconds");
        break;
      case PowerUpType.SHOVEL:
        console.log("Shovel power-up activated - Base protected with steel for 15 seconds");
        break;
      case PowerUpType.TANK:
        console.log("Tank power-up activated - Player gets +1 life");
        break;
    }
  }

  private getRandomPowerUpType(): PowerUpType {
    const randomIndex = Math.floor(Math.random() * this.powerUpTypes.length);
    return this.powerUpTypes[randomIndex];
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}