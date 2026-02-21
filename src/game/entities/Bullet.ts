export enum BulletDirection {
  Up,
  Down,
  Left,
  Right
}

export class Bullet {
  x: number;
  y: number;
  width: number = 8;
  height: number = 8;
  direction: BulletDirection;
  speed: number; // pixels per second
  active: boolean;
  private lastFiredTime: number = 0;
  private fireCooldown: number = 0.3; // seconds

  constructor() {
    this.x = 0;
    this.y = 0;
    this.direction = BulletDirection.Up;
    this.speed = 128; // 4 tiles/second = 128 pixels/second
    this.active = false;
  }

  /**
   * Initialize bullet with position and direction
   * @param x X position
   * @param y Y position
   * @param direction Direction to fire
   * @param currentTime Current timestamp
   */
  init(x: number, y: number, direction: BulletDirection, currentTime: number): boolean {
    // Check if enough time has passed since last fire
    if (currentTime - this.lastFiredTime < this.fireCooldown) {
      return false;
    }

    this.x = x;
    this.y = y;
    this.direction = direction;
    this.active = true;
    this.lastFiredTime = currentTime;
    
    return true;
  }

  /**
   * Update bullet position
   * @param deltaTime Time since last update in seconds
   */
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

    // Deactivate bullet if it goes off screen
    if (this.x < -8 || this.x > 416 || this.y < -8 || this.y > 416) {
      this.active = false;
    }
  }

  /**
   * Reset bullet to initial state
   */
  reset(): void {
    this.active = false;
    this.x = 0;
    this.y = 0;
  }
}