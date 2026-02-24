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
  brickPenetrationCount: number = 1;  // 打掉指定数量的砖块后消失
  canPenetrateTanks: boolean = false;  // 是否可以穿透坦克
  
  // 反弹相关属性（已禁用）
  isBounceBullet: boolean = false;      // 是否处于反弹状态（已禁用）
  bounceCount: number = 0;              // 当前反弹次数（已禁用）
  maxBounces: number = 0;               // 最大反弹次数（0=不反弹）
  speedVector: Vector2D;                // 速度向量 (像素/秒)
  previousX: number = 0;                // 上一帧位置 (用于碰撞检测)
  previousY: number = 0;
  brickDestroyedCount: number = 0;      // 已销毁的砖块数量
  
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
    
    this.currentCooldown = config.fireCooldown;
    this.brickPenetrationCount = config.brickPenetrationCount;
    // 反弹系统已禁用
    this.maxBounces = 0;
    
    this.speed = config.speed;
    
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
    
    // 反弹系统已禁用
    this.isBounceBullet = false;
    this.bounceCount = 0;
    
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
   * 设置反弹状态（已禁用）
   */
  setReflection(_reflectedVector: Vector2D): void {
    // 反弹系统已禁用，忽略此方法
    console.warn('反弹系统已禁用，setReflection 被忽略');
  }

  /**
   * 检查是否还能继续反弹（已禁用）
   */
  canStillBounce(): boolean {
    return false;
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
    if (this.x < -16 || this.x > 1040 || this.y < -16 || this.y > 1040) {
      this.active = false;
    }
  }

  reset(): void {
    this.active = false;
    this.x = 0;
    this.y = 0;
    // 重置所有属性,避免复用时属性残留
    this.brickPenetrationCount = 1;
    this.powerLevel = 0;
    this.brickDestroyedCount = 0;
    
    // 重置反弹相关属性
    this.isBounceBullet = false;
    this.bounceCount = 0;
    this.speedVector = new Vector2D(0, 0);
    this.previousX = 0;
    this.previousY = 0;
  }
}
