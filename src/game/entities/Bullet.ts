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

  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = BulletDirection.Up;
    this.speed = 256;
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
    this.isSteel = powerLevel >= 3;
    
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