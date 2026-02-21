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
  isSteel: boolean = false;
  private lastFiredTime: number = 0;
  private fireCooldown: number = 0.3;
  
  // 子弹速度档位: 1=最慢, 2=中等, 3=最快
  private static readonly SPEED_LEVELS = [192, 256, 320];

  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = BulletDirection.Up;
    this.speed = Bullet.SPEED_LEVELS[0]; // 默认最慢档位
    this.active = false;
  }

  init(x: number, y: number, direction: BulletDirection, currentTime: number, powerLevel: number = 0): boolean {
    if (currentTime - this.lastFiredTime < this.fireCooldown) {
      return false;
    }

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.active = true;
    this.lastFiredTime = currentTime;
    this.powerLevel = powerLevel;
    // 只有 powerLevel >= 3 (4颗星/手枪) 才能穿透钢铁
    this.isSteel = powerLevel >= 3;
    
    // 根据 powerLevel 设置速度档位
    const speedIndex = Math.min(Math.max(powerLevel, 0), 2);
    this.speed = Bullet.SPEED_LEVELS[speedIndex];
    
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
  }
}