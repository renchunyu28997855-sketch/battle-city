import { Vector2D } from "../utils/Vector2D";

export enum PowerUpType {
  HELMET = "helmet",   // 头盔 - 暂时无敌 15秒
  STAR = "star",       // 星星 - 火力+1级 永久
  BOMB = "bomb",       // 手雷 - 敌全灭 即时
  CLOCK = "clock",     // 时钟 - 敌人暂停 10秒
  SHOVEL = "shovel",   // 铁锹 - 基地变钢板 20秒
  TANK = "tank",       // 坦克 - 奖励1条命 永久
  BOAT = "boat",       // 船 - 能过海水 永久
  GUN = "gun"          // 钢枪 - 直接3级火力 永久
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
    PowerUpType.TANK,
    PowerUpType.BOAT,
    PowerUpType.GUN
  ];

  // 道具闪烁时间（过期前3秒开始闪烁）
  private static readonly FLASH_TIME = 3000;
  // 道具总存活时间 15秒
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

  // 获取活跃道具，包含闪烁状态
  getActivePowerUps(): Array<{
    id: string;
    type: PowerUpType;
    position: Vector2D;
    expirationTime: number;
    isFlashing: boolean;  // 是否处于闪烁状态
  }> {
    const now = Date.now();
    return this.powerUps
      .filter(powerUp => {
        // 过滤掉：未激活的 或 已过期的
        if (!powerUp.active) return false;
        if (now >= powerUp.expirationTime) return false;
        return true;
      })
      .map(({ id, type, position, expirationTime }) => {
        // 计算是否处于闪烁状态（过期前3秒）
        const isFlashing = (expirationTime - now) <= PowerUpManager.FLASH_TIME;
        return {
          id,
          type,
          position,
          expirationTime,
          isFlashing
        };
      });
  }

  // 获取道具剩余时间（毫秒）
  getTimeRemaining(id: string): number {
    const powerUp = this.powerUps.find(p => p.id === id);
    if (!powerUp) return 0;
    return Math.max(0, powerUp.expirationTime - Date.now());
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
    // 移除所有已过期且未激活的道具
    const now = Date.now();
    this.powerUps = this.powerUps.filter(powerUp => {
      // 保留：激活的 或 未过期的
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