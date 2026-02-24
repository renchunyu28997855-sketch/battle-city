import { getBulletConfig, SPECIAL_BULLET_COLORS } from '../config/BulletConfig';
import { Vector2D } from '../utils/Vector2D';

export enum BulletDirection {
  Up,
  Down,
  Left,
  Right
}

export class Bullet {
  x: number;
  y: number;
  width: number = 16;
  height: number = 16;
  direction: BulletDirection;
  speed: number;
  active: boolean;
  isEnemyBullet: boolean = false;
  powerLevel: number = 0;
  color: string = 'white';
  canPenetrateBrick: boolean = false;
  canPenetrateSteel: boolean = false;
  isSteel: boolean = false;
  brickPenetrationCount: number = 1;  // 一次能打掉的砖块数量
  canPenetrateTanks: boolean = false;  // 是否可以穿透坦克
  
  // 反弹相关属性
  isBounceBullet: boolean = false;      // 是否处于反弹状态
  bounceCount: number = 0;              // 当前反弹次数
  maxBounces: number = 3;               // 最大反弹次数
  speedVector: Vector2D;                // 速度向量 (像素/秒)
  previousX: number = 0;                // 上一帧位置 (用于碰撞检测)
  previousY: number = 0;
  bounceEnergyLoss: number = 1.0;       // 反弹能量损失 (1.0 = 无损失, 0.8 = 每次损失20%)
  
  private lastFiredTime: number = 0;
  private currentCooldown: number = 900;
  
  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = BulletDirection.Up;
    this.speed = 192; // Default from config
    this.active = false;
    this.speedVector = new Vector2D(0, 0);
  }

  init(x: number, y: number, direction: BulletDirection, currentTime: number, powerLevel: number = 0, specialType: string = ''): boolean {
    if (currentTime - this.lastFiredTime < this.currentCooldown) {
      return false;
    }

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.active = true;
    this.lastFiredTime = currentTime;
    this.powerLevel = powerLevel;
    
    // Use unified config
    const level = Math.min(Math.max(powerLevel, 1), 3);
    const config = getBulletConfig(level);
    
    this.speed = config.speed;
    this.currentCooldown = config.fireCooldown;
    this.canPenetrateBrick = config.canPenetrateBrick;
    this.canPenetrateSteel = config.canPenetrateSteel;
    this.isSteel = config.canPenetrateSteel;
    this.brickPenetrationCount = config.brickPenetrationCount;
    // Level 3 can penetrate tanks
    this.canPenetrateTanks = config.canPenetrateMultiple !== 0;
    
    // Override color for special power-ups
    if (specialType === 'star') {
      this.color = SPECIAL_BULLET_COLORS['star'];
    } else if (specialType === 'gun') {
      this.color = SPECIAL_BULLET_COLORS['gun'];
    } else {
      this.color = config.color;
    }
    
    // 初始化速度向量 (根据方向)
    this.initSpeedVector(direction);
    
    // 重置反弹状态
    this.isBounceBullet = false;
    this.bounceCount = 0;
    this.bounceEnergyLoss = 1.0;
    
    return true;
  }

  /**
   * 根据方向初始化速度向量
   */
  private initSpeedVector(direction: BulletDirection): void {
    switch (direction) {
      case BulletDirection.Up:
        this.speedVector = new Vector2D(0, -this.speed);
        break;
      case BulletDirection.Down:
        this.speedVector = new Vector2D(0, this.speed);
        break;
      case BulletDirection.Left:
        this.speedVector = new Vector2D(-this.speed, 0);
        break;
      case BulletDirection.Right:
        this.speedVector = new Vector2D(this.speed, 0);
        break;
    }
  }

  /**
   * 设置反弹状态，使用反射向量
   * @param reflectedVector 反射后的速度向量
   */
  setReflection(reflectedVector: Vector2D): void {
    this.isBounceBullet = true;
    this.bounceCount++;
    
    // 应用能量损失
    const damping = Math.pow(this.bounceEnergyLoss, this.bounceCount);
    this.speedVector = reflectedVector.multiply(damping);
    
    // 检查是否已达到最大反弹次数
    if (this.bounceCount >= this.maxBounces) {
      this.active = false;
    }
  }

  /**
   * 检查是否还能继续反弹
   */
  canStillBounce(): boolean {
    return this.bounceCount < this.maxBounces;
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    // 保存上一帧位置 (用于碰撞检测)
    this.previousX = this.x;
    this.previousY = this.y;

    // 使用速度向量更新位置
    this.x += this.speedVector.x * deltaTime;
    this.y += this.speedVector.y * deltaTime;

    // 出界检查
    if (this.x < -16 || this.x > 832 || this.y < -16 || this.y > 832) {
      this.active = false;
    }
  }

  reset(): void {
    this.active = false;
    this.x = 0;
    this.y = 0;
    // 重置所有穿透属性,避免复用时属性残留
    this.canPenetrateBrick = false;
    this.canPenetrateSteel = false;
    this.isSteel = false;
    this.brickPenetrationCount = 1;
    this.canPenetrateTanks = false;
    this.powerLevel = 0;
    
    // 重置反弹相关属性
    this.isBounceBullet = false;
    this.bounceCount = 0;
    this.speedVector = new Vector2D(0, 0);
    this.previousX = 0;
    this.previousY = 0;
  }
}
