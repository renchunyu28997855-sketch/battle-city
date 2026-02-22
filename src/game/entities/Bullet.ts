import { getBulletConfig, SPECIAL_BULLET_COLORS } from '../config/BulletConfig';

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
  private lastFiredTime: number = 0;
  private currentCooldown: number = 900;
  
  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = BulletDirection.Up;
    this.speed = 192; // Default from config
    this.active = false;
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
    
    return true;
  }

  update(deltaTime: number): void {
    if (!this.active) return;

    switch (this.direction) {
      case BulletDirection.Up:
        this.y -= this.speed * deltaTime;
        break;
      case BulletDirection.Down:
        this.y += this.speed * deltaTime;
        break;
      case BulletDirection.Left:
        this.x -= this.speed * deltaTime;
        break;
      case BulletDirection.Right:
        this.x += this.speed * deltaTime;
        break;
    }

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
  }
}
